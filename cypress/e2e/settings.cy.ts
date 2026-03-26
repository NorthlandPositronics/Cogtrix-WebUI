const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cyset_${TEST_ID}`;
const TEST_EMAIL = `cyset_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";

function loginViaUI() {
  cy.visit("/login");
  cy.get("#username").type(TEST_USER);
  cy.get("#password").type(TEST_PASSWORD);
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/sessions");
  cy.get("nav a[href='/settings']").click();
  cy.url().should("include", "/settings");
}

describe("Settings page", () => {
  before(() => {
    cy.apiRegister(TEST_USER, TEST_EMAIL, TEST_PASSWORD);
  });

  beforeEach(() => {
    loginViaUI();
  });

  describe("Tabs", () => {
    it("shows all 5 tabs", () => {
      cy.get("[role='tablist']").should("be.visible");
      cy.get("[data-cy='tab-general']").should("be.visible");
      cy.get("[data-cy='tab-providers']").should("be.visible");
      cy.get("[data-cy='tab-mcp']").should("be.visible");
      cy.get("[data-cy='tab-apikeys']").should("be.visible");
      cy.get("[data-cy='tab-wizard']").should("be.visible");
    });

    it("General tab is active by default", () => {
      cy.get("[data-cy='tab-general']").should("have.attr", "data-state", "active");
    });
  });

  describe("General tab (ConfigFlags)", () => {
    it("shows active model and memory mode info", () => {
      cy.contains("Active model").should("be.visible");
      cy.contains("Memory mode").should("be.visible");
    });

    it("shows configuration flag toggles", () => {
      cy.contains("Prompt optimizer").should("be.visible");
      cy.contains("Parallel tool execution").should("be.visible");
      cy.contains("Context compression").should("be.visible");
    });

    it("flags have switch toggles", () => {
      cy.get("[role='switch']").should("have.length.at.least", 3);
    });

    it("config flags are disabled for non-admin users", () => {
      cy.get("[role='switch']").each(($switch) => {
        cy.wrap($switch).should("be.disabled");
      });
    });
  });

  describe("Providers & Models tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-providers']").click();
    });

    it("shows providers section", () => {
      cy.contains("Providers").should("be.visible");
    });

    it("shows a table or empty state for providers", () => {
      cy.contains("Providers").should("be.visible");
      cy.get("body", { timeout: 10000 }).should(($body) => {
        const hasContent =
          $body.find("table").length > 0 ||
          $body.text().includes("No providers configured") ||
          $body.find("[role='status']").length > 0;
        expect(hasContent).to.be.true;
      });
    });
  });

  describe("MCP Servers tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-mcp']").click();
    });

    it("shows MCP servers content or empty state", () => {
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        const hasContent =
          text.includes("No MCP servers") ||
          $body.find("table").length > 0 ||
          text.includes("Failed");
        expect(hasContent).to.be.true;
      });
    });
  });

  describe("API Keys tab", () => {
    beforeEach(() => {
      cy.get("[data-cy='tab-apikeys']").click();
    });

    it("shows Create key button", () => {
      cy.contains("button", "Create key").should("be.visible");
    });

    it("opens create key dialog", () => {
      cy.contains("button", "Create key").click();
      cy.get("[role='dialog']").should("be.visible");
      cy.contains("Create API key").should("be.visible");
      cy.get("#key-label").should("be.visible");
      cy.get("#key-expires").should("be.visible");
    });

    it("can cancel key creation", () => {
      cy.contains("button", "Create key").click();
      cy.get("[role='dialog']").should("be.visible");
      cy.get("[data-cy='cancel-create-key']").click();
      cy.get("[role='dialog']").should("not.exist");
    });

    it("creates an API key, shows it, and revokes it", () => {
      const keyLabel = `test-key-${TEST_ID}`;

      cy.intercept("POST", "**/api/v1/auth/api-keys").as("createKey");
      cy.intercept("GET", "**/api/v1/auth/api-keys").as("listKeys");

      // Create a key
      cy.contains("button", "Create key").click();
      cy.get("[role='dialog']").should("be.visible");
      cy.get("#key-label").type(keyLabel);
      // Wait for dialog animation to settle, then click via data-cy
      cy.get("[data-cy='confirm-create-key']").should("be.visible").click();

      // Wait for the create API call to complete
      cy.wait("@createKey").its("response.statusCode").should("be.lessThan", 300);

      // Should show the created key
      cy.contains("Key created").should("be.visible");
      cy.contains("Copy this key now").should("be.visible");
      cy.get("[data-cy='api-key-value']").should("be.visible");

      // Close dialog via data-cy
      cy.get("[data-cy='close-create-key']").should("be.visible").click();
      cy.get("[role='dialog']").should("not.exist");

      // Wait for the list refetch triggered by invalidation
      cy.wait("@listKeys", { timeout: 15000 });

      // Key should appear in the table
      cy.contains("td", keyLabel, { timeout: 10000 }).should("be.visible");

      // Revoke the key
      cy.contains(keyLabel).closest("tr").find("button[aria-label*='Revoke']").click();

      // Confirm in dialog via data-cy
      cy.get("[role='dialog']").should("be.visible");
      cy.contains("Revoke API key").should("be.visible");
      cy.get("[data-cy='confirm-revoke-key']").should("be.visible").click();

      // Key should be removed
      cy.contains(keyLabel).should("not.exist");
    });
  });

  describe("Setup Wizard tab", () => {
    it("shows wizard start screen", () => {
      cy.get("[data-cy='tab-wizard']").click();
      cy.contains("Setup Wizard").should("be.visible");
      cy.contains("button", "Start new configuration").should("be.visible");
    });
  });
});
