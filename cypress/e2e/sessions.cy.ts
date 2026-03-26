const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cyses_${TEST_ID}`;
const TEST_EMAIL = `cyses_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";
const SESSION_NAME = `Sess ${TEST_ID}`;

function loginViaUI() {
  cy.visit("/login");
  cy.get("#username").type(TEST_USER);
  cy.get("#password").type(TEST_PASSWORD);
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/sessions");
}

describe("Sessions page", () => {
  before(() => {
    cy.apiRegister(TEST_USER, TEST_EMAIL, TEST_PASSWORD);
  });

  beforeEach(() => {
    loginViaUI();
  });

  it("shows the sessions page header and New Session button", () => {
    cy.contains("Sessions").should("be.visible");
    cy.get("[data-cy='new-session']").should("be.visible");
  });

  describe("New session dialog", () => {
    it("opens dialog with all form fields", () => {
      cy.get("[data-cy='new-session']").click();
      cy.get("[role='dialog']").should("be.visible");
      cy.get("#session-name").should("be.visible");
      cy.get("#session-model").should("be.visible");
      cy.get("#session-memory").should("be.visible");
      cy.get("[data-cy='cancel-session']").should("be.visible");
      cy.get("[data-cy='create-session']").should("be.visible");
    });

    it("creates a session with a name", () => {
      cy.get("[data-cy='new-session']").click();
      cy.get("#session-name").type(SESSION_NAME);
      cy.get("[data-cy='create-session']").click();
      cy.url().should("match", /\/sessions\/[0-9a-f-]+/);
    });

    it("creates a session without a name (uses default)", () => {
      cy.get("[data-cy='new-session']").click();
      cy.get("[data-cy='create-session']").click();
      cy.url().should("match", /\/sessions\/[0-9a-f-]+/);
    });

    it("cancels session creation and closes dialog", () => {
      cy.get("[data-cy='new-session']").click();
      cy.get("[role='dialog']").should("be.visible");
      cy.get("[data-cy='cancel-session']").click();
      cy.get("[role='dialog']").should("not.exist");
    });
  });

  describe("Session list", () => {
    it("shows created sessions as cards", () => {
      cy.contains(SESSION_NAME).should("be.visible");
    });

    it("session cards are clickable links", () => {
      cy.contains(SESSION_NAME).click();
      cy.url().should("match", /\/sessions\/[0-9a-f-]+/);
    });
  });

  describe("Error handling", () => {
    it("shows error state when sessions API fails", () => {
      cy.intercept("GET", "**/api/v1/sessions*", {
        statusCode: 500,
        body: {
          data: null,
          error: { code: "INTERNAL_ERROR", message: "Server error" },
          meta: { request_id: "test", timestamp: new Date().toISOString() },
        },
      }).as("sessionsFail");

      cy.visit("/sessions");
      // Re-login since visit clears in-memory tokens
      cy.url().then((url) => {
        if (url.includes("/login")) {
          cy.get("#username").type(TEST_USER);
          cy.get("#password").type(TEST_PASSWORD);
          cy.contains("button", "Sign in").click();
          cy.url().should("include", "/sessions");
        }
      });

      // Should show error state or "Try again" button
      cy.get("body", { timeout: 10000 }).should(($body) => {
        const text = $body.text();
        expect(text.includes("Failed") || text.includes("Try again") || text.includes("error")).to
          .be.true;
      });
    });
  });

  describe("Session deletion", () => {
    let deleteSessionName: string;

    before(() => {
      deleteSessionName = `Del ${TEST_ID}`;
    });

    it("creates and deletes a session permanently", () => {
      // Create a session to delete
      cy.get("[data-cy='new-session']").click();
      cy.get("#session-name").type(deleteSessionName);
      cy.get("[data-cy='create-session']").click();
      cy.url().should("match", /\/sessions\/[0-9a-f-]+/);

      // Go back to sessions list
      cy.get("[data-cy='back-to-sessions']").click();
      cy.url().should("include", "/sessions");

      // Click the delete button on the card
      cy.contains(deleteSessionName)
        .closest("[data-cy='session-card']")
        .find("[data-cy='delete-session']")
        .click();

      // Confirm in the removal dialog (3-option: Archive / Delete permanently / Cancel)
      cy.get("[role='dialog']").should("be.visible");
      cy.contains("Remove session").should("be.visible");
      cy.contains("button", "Delete permanently").click();

      // Session should be removed
      cy.contains(deleteSessionName).should("not.exist");
    });
  });
});
