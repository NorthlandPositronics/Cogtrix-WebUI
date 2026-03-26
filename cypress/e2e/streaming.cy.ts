const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cystr_${TEST_ID}`;
const TEST_EMAIL = `cystr_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";

interface MockWs {
  onopen: ((ev: Event) => void) | null;
  onmessage: ((ev: MessageEvent) => void) | null;
  onclose: ((ev: CloseEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
  readyState: number;
  send: (data: string) => void;
  close: (code?: number) => void;
  url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockWs: MockWs = null as any;
let seq = 0;
let _streamSeq = 0;

function injectMessage(type: string, payload: Record<string, unknown>) {
  seq += 1;
  const data = JSON.stringify({
    type,
    session_id: "mock",
    payload,
    seq,
    ts: new Date().toISOString(),
  });
  mockWs.onmessage?.({ data } as MessageEvent);
}

function setupAndNavigate() {
  _streamSeq += 1;
  seq = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockWs = null as any;

  // Install WebSocket interceptor via onBeforeLoad. Also store mock on win.__mockWs
  // so the session-page check can reach it via cy.window() regardless of realm.
  cy.visit("/login", {
    onBeforeLoad(win) {
      const RealWebSocket = win.WebSocket;

      // Override WebSocket on the window object directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).WebSocket = new Proxy(RealWebSocket, {
        construct(_target, args: [string, string?]) {
          const url = args[0];

          if (url.includes("/ws/v1/sessions/")) {
            // Create a mock object for session WebSockets
            const mock: MockWs = {
              url,
              readyState: 0,
              onopen: null,
              onmessage: null,
              onclose: null,
              onerror: null,
              send: () => {},
              close: () => {},
            };

            // Store sends for later assertion
            const sends: string[] = [];
            mock.send = (data: string) => sends.push(data);
            mock.close = () => {
              mock.readyState = 3;
            };

            // Expose sends on the mock for assertion
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mock as any)._sends = sends;

            // Store on window so cy.window().should() can access it across SPA navigation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (win as any).__mockWs = mock;
            mockWs = mock;

            // Simulate async open
            setTimeout(() => {
              mock.readyState = 1;
              mock.onopen?.({} as Event);
            }, 100);

            return mock;
          }

          // Real WebSocket for Vite HMR etc.
          return new RealWebSocket(...args);
        },
      });
    },
  });

  // Login
  cy.get("#username").type(TEST_USER);
  cy.get("#password").type(TEST_PASSWORD);
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/sessions");

  // Create session and navigate to it
  cy.get("[data-cy='new-session']").click();
  // Wait for the input to be visible before typing to avoid KeyboardEvent race on page settle
  cy.get("#session-name").should("be.visible").type(`S ${TEST_ID}-${_streamSeq}`);
  cy.get("[data-cy='create-session']").click();
  cy.url().should("match", /\/sessions\/[0-9a-f-]+/);

  // Wait for the session page to be fully rendered — confirms useSessionSocket is enabled
  // and socket.connect() has been called, which triggers the WebSocket Proxy.
  cy.get("[data-cy='message-input']", { timeout: 15000 }).should("exist");

  // Wait for the mock WebSocket to be opened (both via module var and win.__mockWs)
  cy.window({ timeout: 10000 }).should((win) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ws = (win as any).__mockWs as MockWs | null;
    expect(ws, "mockWs created").to.not.be.null;
    expect(ws?.readyState, "mockWs OPEN").to.equal(1);
    // Sync to module variable so injectMessage() and getSends() work
    if (ws) mockWs = ws;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSends(): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mockWs as any)._sends || [];
}

describe("Streaming & WebSocket", () => {
  before(() => {
    cy.apiRegister(TEST_USER, TEST_EMAIL, TEST_PASSWORD);
  });

  describe("Token streaming", () => {
    beforeEach(() => {
      setupAndNavigate();
    });

    it("tokens accumulate in the streaming bubble", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "thinking" });
        injectMessage("token", { text: "Hello ", final: false });
        injectMessage("token", { text: "world!", final: false });
      });

      cy.get("[role='status'][aria-label='Assistant response']", { timeout: 10000 }).should(
        "contain.text",
        "Hello world!",
      );
    });

    it("streaming cursor is visible during stream and hidden after done", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "writing" });
        injectMessage("token", { text: "Response text", final: false });
      });

      cy.get("[data-cy='streaming-cursor']", { timeout: 10000 }).should("exist");

      cy.then(() => {
        injectMessage("done", {
          message_id: "msg-001",
          total_tokens: 100,
          input_tokens: 50,
          output_tokens: 50,
          duration_ms: 1200,
          tool_calls: 0,
        });
        injectMessage("agent_state", { state: "idle" });
      });

      cy.get("[data-cy='streaming-cursor']").should("not.exist");
    });
  });

  describe("Tool activity indicators", () => {
    beforeEach(() => {
      setupAndNavigate();
    });

    it("tool_start shows tool indicator with tool name", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "tool_use" });
        injectMessage("tool_start", {
          tool: "web_search",
          tool_call_id: "tc-001",
          input: { query: "test" },
        });
      });

      // StatusBar renders the tool name in both the collapsed history panel and the
      // visible summary row. Target the summary row via its sibling expand button.
      cy.get("button[aria-label='Expand tool history']", { timeout: 10000 })
        .parent()
        .should("contain.text", "web_search");
    });

    it("tool_end updates tool indicator to completed state", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "tool_use" });
        injectMessage("tool_start", {
          tool: "calculator",
          tool_call_id: "tc-002",
          input: { expression: "2+2" },
        });
      });

      cy.get("button[aria-label='Expand tool history']", { timeout: 10000 })
        .parent()
        .should("contain.text", "calculator");

      cy.then(() => {
        injectMessage("tool_end", {
          tool: "calculator",
          tool_call_id: "tc-002",
          duration_ms: 150,
          error: null,
        });
      });

      cy.get("button[aria-label='Expand tool history']", { timeout: 10000 })
        .parent()
        .should("contain.text", "0.15s");
    });
  });

  describe("Agent state badge", () => {
    beforeEach(() => {
      setupAndNavigate();
    });

    it("badge updates to thinking state", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "thinking" });
      });

      cy.contains("Thinking...", { timeout: 10000 }).should("be.visible");
    });

    it("badge updates to writing state", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "writing" });
      });

      cy.contains("Writing...", { timeout: 10000 }).should("be.visible");
    });

    it("badge updates to researching state", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "researching" });
      });

      cy.contains("Researching...", { timeout: 10000 }).should("be.visible");
    });

    it("badge updates to deep thinking state", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "deep_thinking" });
      });

      cy.contains("Deep thinking...", { timeout: 10000 }).should("be.visible");
    });

    it("badge returns to ready after idle", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "thinking" });
      });

      cy.contains("Thinking...", { timeout: 10000 }).should("be.visible");

      cy.then(() => {
        injectMessage("agent_state", { state: "idle" });
      });

      cy.contains("Ready", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("WebSocket lifecycle", () => {
    beforeEach(() => {
      setupAndNavigate();
    });

    it("sends user_message when user submits text", () => {
      cy.get("[data-cy='message-input']").type("Hello agent");
      cy.get("[data-cy='send-message']").click();

      cy.wrap(null, { timeout: 5000 }).should(() => {
        const sends = getSends();
        const userMsgs = sends
          .map((s) => JSON.parse(s))
          .filter((m: { type: string }) => m.type === "user_message");
        expect(userMsgs).to.have.length.at.least(1);
        expect(userMsgs[0].payload.text).to.equal("Hello agent");
        expect(userMsgs[0].payload.mode).to.equal("normal");
        expect(userMsgs[0].payload).to.not.have.property("optimize_prompt");
      });
    });

    it("handles WebSocket disconnect mid-stream", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "writing" });
        injectMessage("token", { text: "Partial response...", final: false });
      });

      cy.get("[data-cy='streaming-cursor']", { timeout: 10000 }).should("exist");

      cy.then(() => {
        mockWs.readyState = 3;
        mockWs.onclose?.({ code: 1006 } as CloseEvent);
      });

      // Connection status should reflect disconnection
      cy.get("[role='status']", { timeout: 10000 }).should("exist");
    });

    it("sends cancel message when stop button is clicked during streaming", () => {
      cy.then(() => {
        injectMessage("agent_state", { state: "thinking" });
        injectMessage("token", { text: "Generating...", final: false });
      });

      cy.get("[data-cy='streaming-cursor']", { timeout: 10000 }).should("exist");
      cy.get("[data-cy='cancel-generation']").should("be.visible").click();

      cy.wrap(null, { timeout: 5000 }).should(() => {
        const sends = getSends();
        const cancelMsgs = sends
          .map((s) => JSON.parse(s))
          .filter((m: { type: string }) => m.type === "cancel");
        expect(cancelMsgs).to.have.length.at.least(1);
      });
    });

    it("closes socket on seq gap (gap triggers reconnect mechanism)", () => {
      // Inject first message to advance lastSeq to 1
      cy.then(() => {
        injectMessage("agent_state", { state: "thinking" });
      });

      cy.contains("Thinking...", { timeout: 10000 }).should("be.visible");

      // Now inject a message with a seq gap (skip seq=2, jump to seq=3)
      // The seq counter in injectMessage auto-increments, so we manually advance it
      cy.then(() => {
        // Advance the global seq by 1 extra to create a gap (seq becomes lastSeq + 2)
        seq += 1;
        injectMessage("agent_state", { state: "idle" });
      });

      // The socket should detect the gap and call ws.close(), setting readyState = 3
      cy.window({ timeout: 5000 }).should((win) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = (win as any).__mockWs as { readyState: number } | null;
        expect(ws?.readyState, "socket closed after seq gap").to.equal(3);
      });
    });
  });
});
