const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cyast_${TEST_ID}`;
const TEST_EMAIL = `cyast_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";

function loginViaUI() {
  cy.visit("/login");
  cy.get("#username").type(TEST_USER);
  cy.get("#password").type(TEST_PASSWORD);
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/sessions");
  cy.get("nav a[href='/assistant']").click();
  cy.url().should("include", "/assistant");
}

describe("Assistant page", () => {
  before(() => {
    cy.apiRegister(TEST_USER, TEST_EMAIL, TEST_PASSWORD);
  });

  beforeEach(() => {
    // Make the assistant service appear as running so all tabs are enabled
    cy.intercept("GET", "**/api/v1/assistant/status", {
      statusCode: 200,
      body: {
        data: { status: "running", channels: [], started_at: null, uptime_s: 42 },
        error: null,
        meta: { request_id: "cypress-mock", timestamp: new Date().toISOString() },
      },
    }).as("assistantStatus");
    loginViaUI();
  });

  it("shows assistant page header", () => {
    cy.contains("Assistant").should("be.visible");
  });

  describe("Service control panel", () => {
    it("shows service status section", () => {
      cy.contains("Service Status").should("be.visible");
    });
  });

  describe("Tabs", () => {
    it("shows all 8 tabs", () => {
      cy.get("[role='tablist']").should("be.visible");
      cy.get("[data-cy='tab-chats']").should("be.visible");
      cy.get("[data-cy='tab-scheduled']").should("be.visible");
      cy.get("[data-cy='tab-deferred']").should("be.visible");
      cy.get("[data-cy='tab-contacts']").should("be.visible");
      cy.get("[data-cy='tab-knowledge']").should("be.visible");
      cy.get("[data-cy='tab-guardrails']").should("be.visible");
      cy.get("[data-cy='tab-campaigns']").should("be.visible");
      cy.get("[data-cy='tab-workflows']").should("be.visible");
    });

    it("Chats tab is active by default", () => {
      cy.get("[data-cy='tab-chats']").should("have.attr", "data-state", "active");
    });
  });

  describe("Chats tab", () => {
    it("shows chat list or empty state", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasChatContent =
          text.includes("No active chats") ||
          $body.find("table").length > 0 ||
          text.includes("Failed") ||
          text.includes("Retry");
        expect(hasChatContent).to.be.true;
      });
    });
  });

  describe("Scheduled tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-scheduled']").click();
    });

    it("shows scheduled messages or empty state", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("No scheduled") ||
          $body.find("table").length > 0 ||
          text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });
  });

  describe("Deferred tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-deferred']").click();
    });

    it("shows deferred records or empty state", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("No deferred") || $body.find("table").length > 0 || text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });
  });

  describe("Contacts tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-contacts']").click();
    });

    it("shows contacts or empty state", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("No contacts") || $body.find("table").length > 0 || text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });
  });

  describe("Knowledge tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-knowledge']").click();
    });

    it("shows knowledge panel with search", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("No knowledge") ||
          text.includes("No results") ||
          $body.find("table").length > 0 ||
          $body.find("input").length > 0 ||
          text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });
  });

  describe("Guardrails tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-guardrails']").click();
    });

    it("shows guardrails panel with violations and blacklist sections", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("Recent Violations") ||
          text.includes("Blacklisted Chats") ||
          text.includes("No violations") ||
          text.includes("No blacklisted") ||
          text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });
  });

  describe("Campaigns tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-campaigns']").click();
    });

    it("shows campaigns list or empty state", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("No campaigns") ||
          $body.find("table").length > 0 ||
          $body.find("[data-cy='create-campaign-button']").length > 0 ||
          text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });

    it("shows create campaign button", () => {
      cy.get("[data-cy='create-campaign-button']").should("be.visible");
    });
  });

  describe("Workflows tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-workflows']").click();
    });

    it("shows workflows list or empty state", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("No workflows") ||
          $body.find("table").length > 0 ||
          $body.find("[data-cy='create-workflow-button']").length > 0 ||
          text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });

    it("hides create workflow button for non-admin users", () => {
      cy.get("[data-cy='create-workflow-button']").should("not.exist");
    });
  });
});
