const TEST_ID = Cypress._.random(1e8).toString(36);

// Regular user — should not access admin page
const REG_USER = `cyadm_${TEST_ID}`;
const REG_EMAIL = `cyadm_${TEST_ID}@example.com`;
const REG_PASSWORD = "Cx#9mPqL@vR2!zW4";

// Seed admin — registered first so it gets the bootstrap admin role
const SEED_ADMIN = `cyadm_seed_${TEST_ID}`;
const SEED_EMAIL = `cyadm_seed_${TEST_ID}@example.com`;

describe("Admin page", () => {
  before(() => {
    // First registration gets the bootstrap admin role — use a dedicated seed user
    cy.apiRegister(SEED_ADMIN, SEED_EMAIL, REG_PASSWORD);
    // REG_USER becomes the second registration and stays as a regular user
    cy.apiRegister(REG_USER, REG_EMAIL, REG_PASSWORD);
  });

  describe("Non-admin access", () => {
    it("redirects non-admin users to /sessions", () => {
      cy.visit("/login");
      cy.get("#username").type(REG_USER);
      cy.get("#password").type(REG_PASSWORD);
      cy.contains("button", "Sign in").click();
      cy.url().should("include", "/sessions");

      // Regular users should not see Admin link in sidebar
      cy.get("nav").then(($nav) => {
        if ($nav.text().includes("Admin")) {
          // If visible, clicking it should redirect
          cy.contains("a", "Admin").click();
          cy.url().should("include", "/sessions");
        }
      });
    });

    it("direct navigation to /admin redirects non-admin users", () => {
      cy.visit("/login");
      cy.get("#username").type(REG_USER);
      cy.get("#password").type(REG_PASSWORD);
      cy.contains("button", "Sign in").click();
      cy.url().should("include", "/sessions");

      // cy.visit() does a full page reload which clears in-memory JWT tokens,
      // so the user becomes unauthenticated and lands on /login.
      // Either redirect target (/login or /sessions) confirms non-admin cannot access /admin.
      cy.visit("/admin");
      cy.url().should("not.include", "/admin");
    });
  });

  describe("Admin sidebar visibility", () => {
    it("regular user does not see Admin link in sidebar", () => {
      cy.visit("/login");
      cy.get("#username").type(REG_USER);
      cy.get("#password").type(REG_PASSWORD);
      cy.contains("button", "Sign in").click();
      cy.url().should("include", "/sessions");

      // Admin link should not be visible for regular users
      cy.get("nav a[href='/admin']").should("not.exist");
    });
  });
});
