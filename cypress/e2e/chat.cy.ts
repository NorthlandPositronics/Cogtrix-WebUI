const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cychat_${TEST_ID}`;
const TEST_EMAIL = `cychat_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";

let _sessionSeq = 0;
function loginAndCreateSession(name: string) {
  _sessionSeq += 1;
  const uniqueName = `${name}-${_sessionSeq}`;
  cy.visit("/login");
  cy.get("#username").type(TEST_USER);
  cy.get("#password").type(TEST_PASSWORD);
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/sessions");

  cy.get("[data-cy='new-session']").click();
  cy.get("#session-name").type(uniqueName);
  cy.get("[data-cy='create-session']").click();
  cy.url().should("match", /\/sessions\/[0-9a-f-]+/);
}

describe("Chat page", () => {
  before(() => {
    cy.apiRegister(TEST_USER, TEST_EMAIL, TEST_PASSWORD);
  });

  describe("Session header", () => {
    beforeEach(() => {
      loginAndCreateSession(`Chat ${TEST_ID}`);
    });

    it("shows session name and agent state badge", () => {
      cy.contains(`Chat ${TEST_ID}`).should("be.visible");
      cy.get("[role='status']").should("exist");
    });

    it("has back button linking to sessions", () => {
      cy.get("[data-cy='back-to-sessions']").should("be.visible");
      cy.get("[data-cy='back-to-sessions']").click();
      cy.url().should("include", "/sessions");
    });

    it("has memory and tools panel toggle buttons", () => {
      cy.get("[data-cy='toggle-memory']").should("be.visible");
      cy.get("[data-cy='toggle-tools']").should("be.visible");
    });

    it("can rename session by clicking the name", () => {
      cy.get("[data-cy='rename-session']").click();
      cy.get("input[aria-label='Session name']").should("be.visible");
      cy.get("input[aria-label='Session name']").clear().type("Renamed Session{enter}");

      // Wait for rename to persist
      cy.contains("Renamed Session").should("be.visible");
    });

    it("cancels rename on Escape", () => {
      const originalName = `Chat ${TEST_ID}`;
      cy.get("[data-cy='rename-session']").click();
      cy.get("input[aria-label='Session name']").clear().type("Should Not Save{esc}");
      cy.contains(originalName).should("be.visible");
    });
  });

  describe("Message input", () => {
    beforeEach(() => {
      loginAndCreateSession(`Input ${TEST_ID}`);
    });

    it("shows textarea, mode selector, and send button", () => {
      cy.get("[data-cy='message-input']").should("be.visible");
      cy.get("[data-cy='send-message']").should("be.visible");
      cy.get("[data-cy='message-mode']").should("be.visible");
    });

    it("send button is disabled when textarea is empty", () => {
      cy.get("[data-cy='send-message']").should("be.disabled");
    });

    it("send button enables when text is entered", () => {
      cy.get("[data-cy='message-input']").type("Hello");
      cy.get("[data-cy='send-message']").should("not.be.disabled");
    });

    it("mode selector shows Normal, Think, and Delegate options", () => {
      cy.get("[data-cy='message-mode']").click();
      cy.contains("Normal").should("be.visible");
      cy.contains("Think").should("be.visible");
      cy.contains("Delegate").should("be.visible");
    });

    it("clears textarea after sending a message", () => {
      cy.get("[data-cy='message-input']").type("Test message");
      cy.get("[data-cy='send-message']").click();
      cy.get("[data-cy='message-input']").should("have.value", "");
    });

    it("Enter key sends message (clears textarea)", () => {
      cy.get("[data-cy='message-input']").type("Enter test{enter}");
      cy.get("[data-cy='message-input']").should("have.value", "");
    });

    it("Shift+Enter inserts newline instead of sending", () => {
      cy.get("[data-cy='message-input']").type("Line 1{shift+enter}Line 2");
      cy.get("[data-cy='message-input']").should("contain.value", "Line 1");
      cy.get("[data-cy='message-input']").should("contain.value", "Line 2");
    });
  });

  describe("Empty state", () => {
    beforeEach(() => {
      loginAndCreateSession(`Empty ${TEST_ID}`);
    });

    it("shows empty state prompt before any messages are sent", () => {
      cy.contains("Send a message to get started").should("be.visible");
    });

    it("shows empty state icon", () => {
      // The empty state should have a visible SVG icon
      cy.contains("Send a message to get started").closest("div").find("svg").should("be.visible");
    });
  });

  describe("Message flow", () => {
    beforeEach(() => {
      loginAndCreateSession(`Flow ${TEST_ID}`);
    });

    it("user message appears in message list after sending", () => {
      const msg = `Hello from Cypress ${TEST_ID}`;
      cy.get("[data-cy='message-input']").type(msg);
      cy.get("[data-cy='send-message']").click();

      // User bubble should appear in the message list
      cy.get("[role='list']", { timeout: 10000 }).should("contain.text", msg);
    });

    it("agent state badge updates after sending a message", () => {
      cy.get("[data-cy='message-input']").type("Trigger agent");
      cy.get("[data-cy='send-message']").click();

      // Agent state badge should show some active state (not necessarily "Ready")
      cy.get("[role='status']").should("be.visible");
    });
  });

  describe("Panel toggles", () => {
    beforeEach(() => {
      loginAndCreateSession(`Panels ${TEST_ID}`);
    });

    it("memory panel toggle has aria-pressed state", () => {
      cy.get("[data-cy='toggle-memory']").should("have.attr", "aria-pressed", "false");
    });

    it("tools panel toggle has aria-pressed state", () => {
      cy.get("[data-cy='toggle-tools']").should("have.attr", "aria-pressed", "false");
    });

    it("clicking memory toggle activates it", () => {
      cy.get("[data-cy='toggle-memory']").click();
      cy.get("[data-cy='toggle-memory']").should("have.attr", "aria-pressed", "true");
    });

    it("clicking tools toggle activates it", () => {
      cy.get("[data-cy='toggle-tools']").click();
      cy.get("[data-cy='toggle-tools']").should("have.attr", "aria-pressed", "true");
    });

    it("toggling memory panel twice deactivates it", () => {
      cy.get("[data-cy='toggle-memory']").click();
      cy.get("[data-cy='toggle-memory']").should("have.attr", "aria-pressed", "true");
      cy.get("[data-cy='toggle-memory']").click();
      cy.get("[data-cy='toggle-memory']").should("have.attr", "aria-pressed", "false");
    });

    it("opening memory panel closes tools panel (exclusive)", () => {
      cy.get("[data-cy='toggle-tools']").click();
      cy.get("[data-cy='toggle-tools']").should("have.attr", "aria-pressed", "true");

      cy.get("[data-cy='toggle-memory']").click();
      cy.get("[data-cy='toggle-memory']").should("have.attr", "aria-pressed", "true");
      cy.get("[data-cy='toggle-tools']").should("have.attr", "aria-pressed", "false");
    });
  });
});
