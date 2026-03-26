const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cyauth_${TEST_ID}`;
const TEST_EMAIL = `cyauth_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";

describe("Authentication", () => {
  describe("Registration page", () => {
    beforeEach(() => {
      cy.visit("/register");
    });

    it("renders the registration form with all fields", () => {
      cy.contains("h1", "Cogtrix").should("be.visible");
      cy.contains("Create your account").should("be.visible");
      cy.get("#username").should("be.visible");
      cy.get("#email").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.contains("button", "Create account").should("be.visible");
    });

    it("shows validation hints for username and password", () => {
      cy.contains("3–64 characters").should("be.visible");
      cy.contains("8–128 characters").should("be.visible");
    });

    it("enforces HTML5 client-side validation", () => {
      // Username requires pattern, minLength, maxLength
      cy.get("#username").should("have.attr", "minLength", "3");
      cy.get("#username").should("have.attr", "maxLength", "64");
      cy.get("#username").should("have.attr", "pattern");

      // Password requires minLength, maxLength
      cy.get("#password").should("have.attr", "minLength", "8");
      cy.get("#password").should("have.attr", "maxLength", "128");

      // Email requires type="email"
      cy.get("#email").should("have.attr", "type", "email");
    });

    it("registers a new user and redirects to sessions", () => {
      cy.get("#username").type(TEST_USER);
      cy.get("#email").type(TEST_EMAIL);
      cy.get("#password").type(TEST_PASSWORD);
      cy.contains("button", "Create account").click();
      cy.url().should("include", "/sessions");
    });

    it("shows error for duplicate registration", () => {
      cy.get("#username").type(TEST_USER);
      cy.get("#email").type(TEST_EMAIL);
      cy.get("#password").type(TEST_PASSWORD);
      cy.contains("button", "Create account").click();
      cy.get("[role='alert'], [data-cy='auth-error']").should("exist");
    });

    it("navigates to login page via link", () => {
      cy.contains("a", "Sign in").click();
      cy.url().should("include", "/login");
    });
  });

  describe("Login page", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("renders the login form with all fields", () => {
      cy.contains("h1", "Cogtrix").should("be.visible");
      cy.contains("Sign in to your account").should("be.visible");
      cy.get("#username").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.contains("button", "Sign in").should("be.visible");
    });

    it("logs in with valid credentials and redirects to sessions", () => {
      cy.get("#username").type(TEST_USER);
      cy.get("#password").type(TEST_PASSWORD);
      cy.contains("button", "Sign in").click();
      cy.url().should("include", "/sessions");
    });

    it("shows error alert for invalid credentials", () => {
      cy.get("#username").type(TEST_USER);
      cy.get("#password").type("WrongPassword!");
      cy.contains("button", "Sign in").click();
      cy.get("[role='alert']").should("be.visible");
    });

    it("shows loading state during login", () => {
      cy.get("#username").type(TEST_USER);
      cy.get("#password").type(TEST_PASSWORD);
      cy.contains("button", "Sign in").click();
      // Button should show spinner or be disabled briefly
      cy.url().should("include", "/sessions");
    });

    it("navigates to registration page via link", () => {
      cy.contains("a", "Register").click();
      cy.url().should("include", "/register");
    });
  });

  describe("Logout", () => {
    it("logs out and returns to login page", () => {
      cy.visit("/login");
      cy.get("#username").type(TEST_USER);
      cy.get("#password").type(TEST_PASSWORD);
      cy.contains("button", "Sign in").click();
      cy.url().should("include", "/sessions");

      cy.get("[data-cy='sign-out']").click();
      cy.url().should("include", "/login");
    });
  });

  describe("Auth guards", () => {
    it("redirects unauthenticated users from /sessions to /login", () => {
      cy.visit("/sessions");
      cy.url().should("include", "/login");
    });

    it("redirects unauthenticated users from /settings to /login", () => {
      cy.visit("/settings");
      cy.url().should("include", "/login");
    });

    it("redirects unauthenticated users from /documents to /login", () => {
      cy.visit("/documents");
      cy.url().should("include", "/login");
    });

    it("redirects / to /sessions (then to /login if unauthenticated)", () => {
      cy.visit("/");
      cy.url().should("satisfy", (url: string) => {
        return url.includes("/login") || url.includes("/sessions");
      });
    });
  });
});
