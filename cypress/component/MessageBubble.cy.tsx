import React from "react";
import { MessageBubble } from "../../src/pages/chat/MessageBubble";
import type { MessageOut } from "../../src/lib/api/types/message";
import { mountWithProviders } from "../support/mount";

function makeUserMsg(overrides: Partial<MessageOut> = {}): MessageOut {
  return {
    id: "msg-1",
    session_id: "s1",
    role: "user",
    content: "Hello world",
    tool_calls: [],
    token_counts: null,
    created_at: "2026-01-01T12:00:00Z",
    ...overrides,
  };
}

function makeAssistantMsg(overrides: Partial<MessageOut> = {}): MessageOut {
  return {
    id: "msg-2",
    session_id: "s1",
    role: "assistant",
    content: "Hi there",
    tool_calls: [],
    token_counts: null,
    created_at: "2026-01-01T12:00:01Z",
    ...overrides,
  };
}

describe("MessageBubble", () => {
  describe("user bubble", () => {
    it("renders message content", () => {
      mountWithProviders(<MessageBubble message={makeUserMsg()} />);
      cy.contains("Hello world").should("be.visible");
    });

    it("shows no mode icon when mode is not set", () => {
      mountWithProviders(<MessageBubble message={makeUserMsg()} />);
      cy.get("[aria-label*='mode']").should("not.exist");
    });

    it("shows Normal mode icon when mode is normal", () => {
      mountWithProviders(<MessageBubble message={makeUserMsg({ mode: "normal" })} />);
      cy.get("[aria-label='Sent in Normal mode']").should("exist");
    });

    it("shows Think mode icon when mode is think", () => {
      mountWithProviders(<MessageBubble message={makeUserMsg({ mode: "think" })} />);
      cy.get("[aria-label='Sent in Think mode']").should("exist");
    });

    it("shows Delegate mode icon when mode is delegate", () => {
      mountWithProviders(<MessageBubble message={makeUserMsg({ mode: "delegate" })} />);
      cy.get("[aria-label='Sent in Delegate mode']").should("exist");
    });

    it("mode icon has tooltip via title attribute", () => {
      mountWithProviders(<MessageBubble message={makeUserMsg({ mode: "think" })} />);
      cy.get("[title='Think']").should("exist");
    });
  });

  describe("assistant bubble", () => {
    it("renders assistant message content", () => {
      mountWithProviders(<MessageBubble message={makeAssistantMsg()} />);
      cy.contains("Hi there").should("be.visible");
    });

    it("does not show mode icon on assistant messages", () => {
      mountWithProviders(<MessageBubble message={makeAssistantMsg()} />);
      cy.get("[aria-label*='mode']").should("not.exist");
    });
  });
});
