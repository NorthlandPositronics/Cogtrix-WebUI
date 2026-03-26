declare global {
  namespace Cypress {
    interface Chainable {
      /** Register a new test user and log in via the API, storing tokens. */
      apiLogin(username: string, password: string): Chainable<void>;
      /** Register a new user via the API. */
      apiRegister(username: string, email: string, password: string): Chainable<void>;
    }
  }
}

const API = (Cypress.env("API_BASE") as string | undefined) ?? "http://localhost:8000/api/v1";

Cypress.Commands.add("apiRegister", (username: string, email: string, password: string) => {
  cy.request({
    method: "POST",
    url: `${API}/auth/register`,
    body: { username, email, password },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("apiLogin", (username: string, password: string) => {
  cy.request({
    method: "POST",
    url: `${API}/auth/login`,
    body: { username, password },
  }).then((res) => {
    const tokens = res.body.data;
    // Store tokens in localStorage-like mechanism so the app can pick them up.
    // Since the app uses in-memory tokens, we'll use the UI login flow instead
    // for most tests. This command is for API-level setup.
    cy.wrap(tokens).as("tokens");
  });
});

export {};
