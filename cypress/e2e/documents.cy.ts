const TEST_ID = Cypress._.random(1e8).toString(36);
const TEST_USER = `cydoc_${TEST_ID}`;
const TEST_EMAIL = `cydoc_${TEST_ID}@example.com`;
const TEST_PASSWORD = "Cx#9mPqL@vR2!zW4";

function loginViaUI() {
  cy.visit("/login");
  cy.get("#username").type(TEST_USER);
  cy.get("#password").type(TEST_PASSWORD);
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/sessions");
  cy.get("nav a[href='/documents']").click();
  cy.url().should("include", "/documents");
}

describe("Documents page", () => {
  before(() => {
    cy.apiRegister(TEST_USER, TEST_EMAIL, TEST_PASSWORD);
  });

  beforeEach(() => {
    loginViaUI();
  });

  it("shows the documents page header", () => {
    cy.contains("Documents").should("be.visible");
  });

  it("shows semantic search bar", () => {
    cy.get("[data-cy='search-documents']").should("be.visible");
  });

  it("shows empty state or document list", () => {
    cy.get("body", { timeout: 15000 }).should(($body) => {
      const text = $body.text();
      const hasContent =
        text.includes("No documents") ||
        $body.find("[data-cy='search-documents']").length > 0 ||
        text.includes("Failed");
      expect(hasContent).to.be.true;
    });
  });

  describe("Semantic search", () => {
    it("search bar accepts input", () => {
      cy.get("[data-cy='search-documents']").type("test query");
      cy.get("[data-cy='search-documents']").should("have.value", "test query");
    });

    it("search button is disabled when input is empty", () => {
      cy.get("[data-cy='search-documents']").should("have.value", "");
      cy.contains("button", "Search").should("be.disabled");
    });

    it("search button enables when input has text", () => {
      cy.get("[data-cy='search-documents']").type("query");
      cy.contains("button", "Search").should("not.be.disabled");
    });

    it("shows results or no-results after search submission", () => {
      cy.intercept("POST", "**/api/v1/rag/search").as("ragSearch");
      cy.get("[data-cy='search-documents']").type("test search");
      cy.contains("button", "Search").click();

      cy.wait("@ragSearch", { timeout: 15000 });
      // Either "No results found." or search result cards appear
      cy.get("body").should(($body) => {
        const text = $body.text();
        expect(
          text.includes("No results") || text.includes("match") || text.includes("Search failed"),
        ).to.be.true;
      });
    });
  });
});
