import React from "react";
import { AgentStateBadge } from "../../src/components/AgentStateBadge";
import { mountWithProviders } from "../support/mount";
import type { AgentState } from "../../src/lib/api/types/session";

describe("AgentStateBadge", () => {
  it("renders with role=status for accessibility", () => {
    mountWithProviders(<AgentStateBadge state="idle" />);
    cy.get("[role='status']").should("exist");
  });

  it("shows Ready label for idle state", () => {
    mountWithProviders(<AgentStateBadge state="idle" />);
    cy.get("[role='status']").should("contain.text", "Ready");
  });

  it("shows Thinking label for thinking state", () => {
    mountWithProviders(<AgentStateBadge state="thinking" />);
    cy.get("[role='status']").should("contain.text", "Thinking...");
  });

  it("shows active dot for all active states", () => {
    const activeStates: AgentState[] = [
      "thinking",
      "analyzing",
      "researching",
      "deep_thinking",
      "writing",
      "delegating",
    ];
    activeStates.forEach((state) => {
      mountWithProviders(<AgentStateBadge state={state} />);
      cy.get("[data-cy='state-dot']").should("have.attr", "data-active", "true");
    });
  });

  it("shows inactive dot for idle state", () => {
    mountWithProviders(<AgentStateBadge state="idle" />);
    cy.get("[data-cy='state-dot']").should("have.attr", "data-active", "false");
  });

  it("shows inactive dot for done state", () => {
    mountWithProviders(<AgentStateBadge state="done" />);
    cy.get("[data-cy='state-dot']").should("have.attr", "data-active", "false");
  });

  it("shows inactive dot for error state", () => {
    mountWithProviders(<AgentStateBadge state="error" />);
    cy.get("[data-cy='state-dot']").should("have.attr", "data-active", "false");
  });

  it("aria-label reflects the current state label", () => {
    mountWithProviders(<AgentStateBadge state="writing" />);
    cy.get("[role='status']")
      .invoke("attr", "aria-label")
      .should("include", "Writing...");
  });

  it("shows Done label for done state", () => {
    mountWithProviders(<AgentStateBadge state="done" />);
    cy.get("[role='status']").should("contain.text", "Done");
  });

  it("shows Error label for error state", () => {
    mountWithProviders(<AgentStateBadge state="error" />);
    cy.get("[role='status']").should("contain.text", "Error");
  });
});
