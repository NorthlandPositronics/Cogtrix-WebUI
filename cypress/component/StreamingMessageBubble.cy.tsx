import React from "react";
import { StreamingMessageBubble } from "../../src/pages/chat/StreamingMessageBubble";
import { useStreamingStore } from "../../src/lib/stores/streaming-store";
import { mountWithProviders } from "../support/mount";

describe("StreamingMessageBubble", () => {
  beforeEach(() => {
    useStreamingStore.setState({ streamingBuffer: "" });
  });

  it("renders nothing when buffer is empty", () => {
    mountWithProviders(<StreamingMessageBubble />);
    cy.get("[role='status']").should("not.exist");
  });

  it("renders streaming content from buffer", () => {
    useStreamingStore.setState({ streamingBuffer: "Hello from the stream" });
    mountWithProviders(<StreamingMessageBubble />);
    cy.contains("Hello from the stream").should("be.visible");
  });

  it("does not render a blinking cursor during streaming", () => {
    useStreamingStore.setState({ streamingBuffer: "Streaming..." });
    mountWithProviders(<StreamingMessageBubble />);
    cy.get("[data-cy='streaming-cursor']").should("not.exist");
  });
});
