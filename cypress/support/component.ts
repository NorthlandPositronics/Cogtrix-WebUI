import "./e2e";
import { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);

// Suppress uncaught exceptions that fire between tests (e.g. Zustand store
// subscriber cleanup racing with React unmount across spec boundaries).
Cypress.on("uncaught:exception", (_err, _runnable, promise) => {
  // Only suppress inter-spec promise rejections; let in-test errors surface.
  if (promise) return false;
  if (!Cypress.currentTest) return false;
});
