import React from "react";
import { StatusBar } from "../../src/pages/chat/StatusBar";
import { useStreamingStore } from "../../src/lib/stores/streaming-store";
import type { StatusEntry } from "../../src/lib/stores/streaming-store";
import { mountWithProviders } from "../support/mount";

function makeEntry(overrides: Partial<StatusEntry> = {}): StatusEntry {
  return {
    id: "call-001",
    timestamp: Date.now(),
    tool: "search_web",
    done: false,
    error: null,
    durationMs: null,
    ...overrides,
  };
}

describe("StatusBar", () => {
  beforeEach(() => {
    useStreamingStore.setState({ statusLog: [] });
  });

  it("renders nothing when statusLog is empty", () => {
    mountWithProviders(<StatusBar />);
    cy.get("[role='log']").should("not.exist");
    cy.get("button[aria-label='Expand tool history']").should("not.exist");
  });

  it("renders latest tool entry in summary row", () => {
    const entry = makeEntry({ tool: "read_file", done: true, durationMs: 420 });
    useStreamingStore.setState({ statusLog: [entry] });
    mountWithProviders(<StatusBar />);
    cy.contains("read_file").should("be.visible");
  });

  it("shows running indicator for in-progress tool", () => {
    const entry = makeEntry({ done: false });
    useStreamingStore.setState({ statusLog: [entry] });
    mountWithProviders(<StatusBar />);
    cy.get("[data-cy='running-dot']").should("exist");
  });

  it("shows check icon for completed tool", () => {
    const entry = makeEntry({ done: true, durationMs: 300 });
    useStreamingStore.setState({ statusLog: [entry] });
    mountWithProviders(<StatusBar />);
    cy.contains("0.30s").should("exist");
  });

  it("expand button toggles the history panel", () => {
    const entry = makeEntry({ tool: "list_dir", done: true, durationMs: 150 });
    useStreamingStore.setState({ statusLog: [entry] });
    mountWithProviders(<StatusBar />);

    cy.get("[role='log']").should("exist");
    cy.get("button[aria-label='Expand tool history']").should("exist").click();

    cy.get("button[aria-label='Collapse tool history']").should("exist");
    cy.get("button[aria-expanded='true']").should("exist");
  });

  it("summary row expand button is collapsed by default", () => {
    const entry = makeEntry({ tool: "run_tests", done: false });
    useStreamingStore.setState({ statusLog: [entry] });
    mountWithProviders(<StatusBar />);
    cy.get("button[aria-label='Expand tool history']")
      .should("exist")
      .and("have.attr", "aria-expanded", "false");
  });
});
