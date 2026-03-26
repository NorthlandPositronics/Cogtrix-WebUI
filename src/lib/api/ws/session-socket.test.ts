import { vi } from "vitest";
import { SessionSocket, type SessionSocketHandlers } from "./session-socket";
import { setTokens, clearTokens } from "../tokens";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(_code?: number) {
    this.readyState = MockWebSocket.CLOSED;
    // Trigger onclose if set
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateMessage(data: object) {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
  }

  simulateClose(code: number, reason = "") {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code, reason }));
  }
}

let lastCreatedWs: MockWebSocket | null = null;

function trackWebSocket(ws: MockWebSocket) {
  lastCreatedWs = ws;
}

beforeAll(() => {
  vi.stubGlobal(
    "WebSocket",
    class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        trackWebSocket(this);
      }
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

function createHandlers(): SessionSocketHandlers {
  return {
    onToken: vi.fn(),
    onToolStart: vi.fn(),
    onToolEnd: vi.fn(),
    onToolConfirmRequest: vi.fn(),
    onAgentState: vi.fn(),
    onMemoryUpdate: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
    onOpen: vi.fn(),
    onDisconnect: vi.fn(),
    onReconnecting: vi.fn(),
    onReconnectFailed: vi.fn(),
    onAuthError: vi.fn(),
    onForbidden: vi.fn(),
    onSessionNotFound: vi.fn(),
    onServerShutdown: vi.fn(),
  };
}

describe("SessionSocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    lastCreatedWs = null;
    setTokens({
      access_token: "test-token",
      refresh_token: "test-refresh",
      token_type: "bearer",
      expires_in: 3600,
    });
  });

  afterEach(() => {
    clearTokens();
    vi.useRealTimers();
  });

  it("calls onAuthError when no token is available", () => {
    clearTokens();
    const handlers = createHandlers();
    const socket = new SessionSocket("session-1", handlers);

    socket.connect();

    expect(handlers.onAuthError).toHaveBeenCalledOnce();
    expect(lastCreatedWs).toBeNull();
  });

  it("connects with token and session id in URL", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("session-1", handlers);

    socket.connect();

    expect(lastCreatedWs).not.toBeNull();
    expect(lastCreatedWs!.url).toContain("session-1");
    expect(lastCreatedWs!.url).toContain("token=test-token");
  });

  it("calls onOpen when connection opens", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();

    expect(handlers.onOpen).toHaveBeenCalledOnce();
  });

  it("routes token messages to onToken", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateMessage({
      type: "token",
      session_id: "s1",
      payload: { text: "Hello", final: true },
      seq: 0,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(handlers.onToken).toHaveBeenCalledWith("Hello", true);
  });

  it("routes agent_state messages", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateMessage({
      type: "agent_state",
      session_id: "s1",
      payload: { state: "thinking" },
      seq: 1,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(handlers.onAgentState).toHaveBeenCalledWith("thinking");
  });

  it("routes tool_start and tool_end messages", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();

    lastCreatedWs!.simulateMessage({
      type: "tool_start",
      session_id: "s1",
      payload: { tool_name: "search", tool_call_id: "tc-1", input: { query: "test" } },
      seq: 1,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(handlers.onToolStart).toHaveBeenCalledWith("search", "tc-1", { query: "test" });

    lastCreatedWs!.simulateMessage({
      type: "tool_end",
      session_id: "s1",
      payload: { tool_name: "search", tool_call_id: "tc-1", duration_ms: 150, error: null },
      seq: 2,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(handlers.onToolEnd).toHaveBeenCalledWith("search", "tc-1", 150, null);
  });

  it("routes error messages", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateMessage({
      type: "error",
      session_id: "s1",
      payload: { code: "PROVIDER_UNREACHABLE", message: "Provider is offline" },
      seq: 1,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(handlers.onError).toHaveBeenCalledWith("PROVIDER_UNREACHABLE", "Provider is offline");
  });

  it("routes done messages", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateMessage({
      type: "done",
      session_id: "s1",
      payload: {
        message_id: "m1",
        total_tokens: 1000,
        input_tokens: 500,
        output_tokens: 500,
        duration_ms: 2000,
        tool_calls: 3,
      },
      seq: 10,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(handlers.onDone).toHaveBeenCalledWith(
      expect.objectContaining({ message_id: "m1", total_tokens: 1000 }),
    );
  });

  it("passes done.text to onDone when backend includes it (think/delegate mode)", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateMessage({
      type: "done",
      session_id: "s1",
      payload: {
        message_id: "m2",
        total_tokens: 1200,
        input_tokens: 600,
        output_tokens: 600,
        duration_ms: 8000,
        tool_calls: 0,
        text: "Refined think-mode answer",
      },
      seq: 10,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(handlers.onDone).toHaveBeenCalledWith(
      expect.objectContaining({ message_id: "m2", text: "Refined think-mode answer" }),
    );
  });

  it("tracks lastSeq from received messages", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    expect(socket.lastSeq).toBe(-1);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateMessage({
      type: "token",
      session_id: "s1",
      payload: { text: "Hi", final: true },
      seq: 5,
      ts: "2026-01-01T00:00:00Z",
    });

    expect(socket.lastSeq).toBe(5);
  });

  it("sends user messages when connected", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    socket.sendMessage("Hello world");

    expect(lastCreatedWs!.sentMessages).toHaveLength(1);
    const sent = JSON.parse(lastCreatedWs!.sentMessages[0]!);
    expect(sent.type).toBe("user_message");
    expect(sent.payload.text).toBe("Hello world");
    expect(sent.payload.mode).toBe("normal");
  });

  it("sends messages with specified mode", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    socket.sendMessage("Think about this", "think");

    const sent = JSON.parse(lastCreatedWs!.sentMessages[0]!);
    expect(sent.payload.mode).toBe("think");
  });

  it("sends cancel command", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    socket.cancel();

    const sent = JSON.parse(lastCreatedWs!.sentMessages[0]!);
    expect(sent.type).toBe("cancel");
  });

  it("sends tool confirmation", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    socket.confirmTool("conf-1", "allow");

    const sent = JSON.parse(lastCreatedWs!.sentMessages[0]!);
    expect(sent.type).toBe("tool_confirm");
    expect(sent.payload.confirmation_id).toBe("conf-1");
    expect(sent.payload.action).toBe("allow");
  });

  it("starts ping timer on open", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();

    // Advance 30 seconds for the first ping
    vi.advanceTimersByTime(30_000);

    expect(lastCreatedWs!.sentMessages.length).toBeGreaterThanOrEqual(1);
    const pingSent = lastCreatedWs!.sentMessages.some((m) => JSON.parse(m).type === "ping");
    expect(pingSent).toBe(true);
  });

  it("handles close code 4001 (auth error)", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateClose(4001);

    expect(handlers.onAuthError).toHaveBeenCalledOnce();
    expect(handlers.onDisconnect).toHaveBeenCalledOnce();
  });

  it("handles close code 4003 (forbidden)", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateClose(4003);

    expect(handlers.onForbidden).toHaveBeenCalledOnce();
  });

  it("handles close code 4004 (session not found)", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateClose(4004);

    expect(handlers.onSessionNotFound).toHaveBeenCalledOnce();
  });

  it("handles close code 1001 (server shutdown)", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateClose(1001);

    expect(handlers.onServerShutdown).toHaveBeenCalledOnce();
  });

  it("handles close code 4000 (registry unavailable) with reconnect", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateClose(4000);

    expect(handlers.onReconnecting).toHaveBeenCalledWith(1);
  });

  it("schedules reconnect on unexpected close", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    lastCreatedWs!.simulateClose(1006); // Abnormal closure

    expect(handlers.onReconnecting).toHaveBeenCalledWith(1);
  });

  it("disconnects cleanly without triggering reconnect", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();
    socket.disconnect();

    expect(handlers.onReconnecting).not.toHaveBeenCalled();
  });

  it("reports connected state", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    expect(socket.connected).toBe(false);

    socket.connect();
    lastCreatedWs!.simulateOpen();

    expect(socket.connected).toBe(true);
  });

  it("ignores malformed messages", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();
    lastCreatedWs!.simulateOpen();

    // Send raw non-JSON message
    lastCreatedWs!.onmessage?.(new MessageEvent("message", { data: "not json" }));

    expect(handlers.onToken).not.toHaveBeenCalled();
    expect(handlers.onError).not.toHaveBeenCalled();
  });

  it("includes last_seq=-1 in the initial connection URL", () => {
    const handlers = createHandlers();
    const socket = new SessionSocket("s1", handlers);

    socket.connect();

    expect(lastCreatedWs!.url).toContain("last_seq=-1");
  });

  describe("seq deduplication and gap detection", () => {
    it("silently skips a replayed message with seq equal to lastSeq", () => {
      const handlers = createHandlers();
      const socket = new SessionSocket("s1", handlers);

      socket.connect();
      const ws = lastCreatedWs!;
      vi.spyOn(ws, "close");
      ws.simulateOpen();

      ws.simulateMessage({
        type: "token",
        session_id: "s1",
        payload: { text: "Hello", final: false },
        seq: 0,
        ts: "2026-01-01T00:00:00Z",
      });
      expect(handlers.onToken).toHaveBeenCalledOnce();
      expect(socket.lastSeq).toBe(0);

      // Replay of seq=0 — must be silently skipped
      ws.simulateMessage({
        type: "token",
        session_id: "s1",
        payload: { text: "World", final: false },
        seq: 0,
        ts: "2026-01-01T00:00:00Z",
      });

      expect(handlers.onToken).toHaveBeenCalledOnce(); // still only once
      expect(ws.close).not.toHaveBeenCalled(); // socket NOT closed
      expect(socket.lastSeq).toBe(0);
    });

    it("silently skips messages with seq strictly below lastSeq", () => {
      const handlers = createHandlers();
      const socket = new SessionSocket("s1", handlers);

      socket.connect();
      const ws = lastCreatedWs!;
      vi.spyOn(ws, "close");
      ws.simulateOpen();

      for (let seq = 0; seq <= 2; seq++) {
        ws.simulateMessage({
          type: "token",
          session_id: "s1",
          payload: { text: `t${seq}`, final: false },
          seq,
          ts: "2026-01-01T00:00:00Z",
        });
      }
      expect(handlers.onToken).toHaveBeenCalledTimes(3);
      expect(socket.lastSeq).toBe(2);

      // Stale replay at seq=1
      ws.simulateMessage({
        type: "token",
        session_id: "s1",
        payload: { text: "stale", final: false },
        seq: 1,
        ts: "2026-01-01T00:00:00Z",
      });

      expect(handlers.onToken).toHaveBeenCalledTimes(3); // unchanged
      expect(ws.close).not.toHaveBeenCalled();
      expect(socket.lastSeq).toBe(2);
    });

    it("closes the socket on a true forward gap", () => {
      const handlers = createHandlers();
      const socket = new SessionSocket("s1", handlers);

      socket.connect();
      const ws = lastCreatedWs!;
      vi.spyOn(ws, "close");
      ws.simulateOpen();

      ws.simulateMessage({
        type: "token",
        session_id: "s1",
        payload: { text: "Hello", final: false },
        seq: 0,
        ts: "2026-01-01T00:00:00Z",
      });
      expect(socket.lastSeq).toBe(0);

      // seq=2 when seq=1 was expected — true gap
      ws.simulateMessage({
        type: "token",
        session_id: "s1",
        payload: { text: "gap", final: false },
        seq: 2,
        ts: "2026-01-01T00:00:00Z",
      });

      expect(handlers.onToken).toHaveBeenCalledOnce(); // gap message NOT routed
      expect(ws.close).toHaveBeenCalledOnce(); // socket closed for replay
      expect(socket.lastSeq).toBe(0); // lastSeq unchanged so replay starts from 0
    });

    it("does not treat the first message as a gap regardless of seq value", () => {
      const handlers = createHandlers();
      const socket = new SessionSocket("s1", handlers);

      socket.connect();
      const ws = lastCreatedWs!;
      vi.spyOn(ws, "close");
      ws.simulateOpen();

      // First message arrives at seq=5 (resuming mid-history)
      ws.simulateMessage({
        type: "token",
        session_id: "s1",
        payload: { text: "Resume", final: false },
        seq: 5,
        ts: "2026-01-01T00:00:00Z",
      });

      expect(handlers.onToken).toHaveBeenCalledOnce();
      expect(ws.close).not.toHaveBeenCalled();
      expect(socket.lastSeq).toBe(5);
    });

    it("does not loop when backend replays seq=0 after reconnect with last_seq=0", () => {
      // Regression test for the reconnect loop bug:
      // 1. Connect → receive seq=0 → lastSeq=0
      // 2. Socket closes → scheduleReconnect → reconnect with last_seq=0
      // 3. Backend replays seq=0 (inclusive) → must NOT trigger gap close
      const handlers = createHandlers();
      const socket = new SessionSocket("s1", handlers);

      socket.connect();
      const firstWs = lastCreatedWs!;
      firstWs.simulateOpen();

      firstWs.simulateMessage({
        type: "agent_state",
        session_id: "s1",
        payload: { state: "idle" },
        seq: 0,
        ts: "2026-01-01T00:00:00Z",
      });
      expect(socket.lastSeq).toBe(0);
      expect(handlers.onAgentState).toHaveBeenCalledOnce();

      // Backend closes the connection (e.g. idle session normal close)
      firstWs.simulateClose(1000);
      expect(handlers.onReconnecting).toHaveBeenCalledWith(1);

      // Advance past backoff delay — new socket created
      vi.advanceTimersByTime(1100);
      const secondWs = lastCreatedWs!;
      expect(secondWs).not.toBe(firstWs);
      expect(secondWs.url).toContain("last_seq=0");

      vi.spyOn(secondWs, "close");
      secondWs.simulateOpen();

      // Backend replays seq=0 — must be silently skipped, socket stays open
      secondWs.simulateMessage({
        type: "agent_state",
        session_id: "s1",
        payload: { state: "idle" },
        seq: 0,
        ts: "2026-01-01T00:00:00Z",
      });

      expect(secondWs.close).not.toHaveBeenCalled(); // no gap-triggered close
      expect(handlers.onAgentState).toHaveBeenCalledOnce(); // replay not re-delivered
      expect(handlers.onReconnecting).toHaveBeenCalledOnce(); // no second reconnect

      // New messages after replay are processed normally
      secondWs.simulateMessage({
        type: "agent_state",
        session_id: "s1",
        payload: { state: "thinking" },
        seq: 1,
        ts: "2026-01-01T00:00:00Z",
      });
      expect(handlers.onAgentState).toHaveBeenCalledTimes(2);
      expect(socket.lastSeq).toBe(1);
    });
  });
});
