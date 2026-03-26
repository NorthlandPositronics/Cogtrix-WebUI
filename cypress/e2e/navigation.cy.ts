const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cynav_${TEST_ID}`;
const TEST_EMAIL = `cynav_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";

function loginViaUI() {
  cy.visit("/login");
  cy.get("#username").type(TEST_USER);
  cy.get("#password").type(TEST_PASSWORD);
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/sessions");
}

describe("Navigation & Layout", () => {
  before(() => {
    cy.apiRegister(TEST_USER, TEST_EMAIL, TEST_PASSWORD);
  });

  beforeEach(() => {
    loginViaUI();
  });

  describe("Sidebar", () => {
    it("shows all navigation links", () => {
      cy.get("nav a[href='/sessions']").should("be.visible");
      cy.get("nav a[href='/documents']").should("be.visible");
      cy.get("nav a[href='/assistant']").should("be.visible");
      cy.get("nav a[href='/settings']").should("be.visible");
    });

    it("shows user info with username and role badge", () => {
      cy.contains(TEST_USER).should("be.visible");
      cy.contains("user").should("be.visible");
    });

    it("shows Cogtrix logo", () => {
      cy.contains("Cogtrix").should("be.visible");
    });

    it("highlights active nav item", () => {
      cy.get("nav a[href='/sessions']").should("have.attr", "aria-current", "page");
    });

    it("has sign out button", () => {
      cy.get("[data-cy='sign-out']").should("be.visible");
    });
  });

  describe("Page navigation", () => {
    it("navigates to sessions", () => {
      cy.get("nav a[href='/settings']").click();
      cy.get("nav a[href='/sessions']").click();
      cy.url().should("include", "/sessions");
    });

    it("navigates to documents", () => {
      cy.get("nav a[href='/documents']").click();
      cy.url().should("include", "/documents");
    });

    it("navigates to assistant", () => {
      cy.get("nav a[href='/assistant']").click();
      cy.url().should("include", "/assistant");
    });

    it("navigates to settings", () => {
      cy.get("nav a[href='/settings']").click();
      cy.url().should("include", "/settings");
    });
  });

  describe("404 page", () => {
    it("shows 404 for unknown routes", () => {
      cy.visit("/nonexistent-page-xyz", { failOnStatusCode: false });
      cy.contains("404").should("be.visible");
      cy.contains("h1", "Page not found").should("be.visible");
      cy.contains("Go home").should("be.visible");
    });

    it("Go home button works", () => {
      cy.visit("/nonexistent-page-xyz", { failOnStatusCode: false });
      cy.contains("Go home").click();
      // cy.visit() reloads the page, clearing in-memory JWT tokens.
      // The ProtectedRoute may redirect to /login if tokens are lost.
      cy.url().should(
        "satisfy",
        (url: string) => url.includes("/sessions") || url.includes("/login"),
      );
    });
  });

  describe("Root redirect", () => {
    it("/ redirects to /sessions when authenticated", () => {
      cy.visit("/");
      cy.url().should("include", "/sessions");
    });
  });
});
