import React from "react";
import { TypingIndicator } from "../../src/pages/chat/TypingIndicator";
import { useStreamingStore } from "../../src/lib/stores/streaming-store";
import { mountWithProviders } from "../support/mount";

describe("TypingIndicator", () => {
  beforeEach(() => {
    useStreamingStore.setState({ currentMode: null });
  });

  it("renders three animated dots", () => {
    mountWithProviders(<TypingIndicator />);
    cy.get("[role='status']").find("[data-cy='typing-dot']").should("have.length", 3);
  });

  it("has role status with correct aria-label", () => {
    mountWithProviders(<TypingIndicator />);
    cy.get("[role='status']")
      .should("exist")
      .invoke("attr", "aria-label")
      .should("eq", "Assistant is typing");
  });

  it("shows no mode label when currentMode is null", () => {
    useStreamingStore.setState({ currentMode: null });
    mountWithProviders(<TypingIndicator />);
    cy.contains("Normal").should("not.exist");
    cy.contains("Think").should("not.exist");
    cy.contains("Delegate").should("not.exist");
  });

  it("shows Normal label when mode is normal", () => {
    useStreamingStore.setState({ currentMode: "normal" });
    mountWithProviders(<TypingIndicator />);
    cy.contains("Normal").should("be.visible");
  });

  it("shows Think label when mode is think", () => {
    useStreamingStore.setState({ currentMode: "think" });
    mountWithProviders(<TypingIndicator />);
    cy.contains("Think").should("be.visible");
  });

  it("shows Delegate label when mode is delegate", () => {
    useStreamingStore.setState({ currentMode: "delegate" });
    mountWithProviders(<TypingIndicator />);
    cy.contains("Delegate").should("be.visible");
  });

  it("mode label is aria-hidden", () => {
    useStreamingStore.setState({ currentMode: "think" });
    mountWithProviders(<TypingIndicator />);
    cy.contains("Think").closest("[aria-hidden='true']").should("exist");
  });
});
