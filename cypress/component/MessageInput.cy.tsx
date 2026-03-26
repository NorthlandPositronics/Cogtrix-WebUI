import React from "react";
import { MessageInput } from "../../src/pages/chat/MessageInput";
import { mountWithProviders } from "../support/mount";

describe("MessageInput", () => {
  it("renders textarea and send button", () => {
    mountWithProviders(
      <MessageInput onSend={cy.stub()} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-input']").should("exist");
    cy.get("[data-cy='send-message']").should("exist");
  });

  it("send button is disabled when input is empty", () => {
    mountWithProviders(
      <MessageInput onSend={cy.stub()} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='send-message']").should("be.disabled");
  });

  it("send button enables when text is entered", () => {
    mountWithProviders(
      <MessageInput onSend={cy.stub()} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-input']").type("Hello");
    cy.get("[data-cy='send-message']").should("not.be.disabled");
  });

  it("calls onSend with text when send button clicked", () => {
    const onSend = cy.stub().as("onSend");
    mountWithProviders(
      <MessageInput onSend={onSend} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-input']").type("Test message");
    cy.get("[data-cy='send-message']").click();
    cy.get("@onSend").should("have.been.calledOnce");
    cy.get("@onSend").should("have.been.calledWith", "Test message", "normal");
  });

  it("clears input after send", () => {
    mountWithProviders(
      <MessageInput onSend={cy.stub()} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-input']").type("Clear me");
    cy.get("[data-cy='send-message']").click();
    cy.get("[data-cy='message-input']").should("have.value", "");
  });

  it("Enter key sends the message", () => {
    const onSend = cy.stub().as("onSend");
    mountWithProviders(
      <MessageInput onSend={onSend} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-input']").type("Enter send{enter}");
    cy.get("@onSend").should("have.been.calledOnce");
    cy.get("@onSend").should("have.been.calledWith", "Enter send", "normal");
  });

  it("Shift+Enter inserts newline instead of sending", () => {
    const onSend = cy.stub().as("onSend");
    mountWithProviders(
      <MessageInput onSend={onSend} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-input']").type("Line one{shift+enter}Line two");
    cy.get("@onSend").should("not.have.been.called");
    cy.get("[data-cy='message-input']").should("contain.value", "Line one");
    cy.get("[data-cy='message-input']").should("contain.value", "Line two");
  });

  it("mode selector button is visible and shows Normal by default", () => {
    mountWithProviders(
      <MessageInput onSend={cy.stub()} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-mode']").should("be.visible");
    cy.get("[data-cy='message-mode']").should("have.attr", "aria-label", "Message mode: Normal");
  });

  it("selecting Think mode changes the mode label", () => {
    mountWithProviders(
      <MessageInput onSend={cy.stub()} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    cy.get("[data-cy='message-mode']").click();
    cy.contains("[role='menuitemradio']", "Think").click();
    cy.get("[data-cy='message-mode']").should("have.attr", "aria-label", "Message mode: Think");
  });

  it("sends with the selected mode", () => {
    const onSend = cy.stub().as("onSend");
    mountWithProviders(
      <MessageInput onSend={onSend} onCancel={cy.stub()} disabled={false} isAgentRunning={false} />,
    );
    // Select Think mode
    cy.get("[data-cy='message-mode']").click();
    cy.contains("[role='menuitemradio']", "Think").click();
    // Type and send
    cy.get("[data-cy='message-input']").type("Deep thought");
    cy.get("[data-cy='send-message']").click();
    cy.get("@onSend").should("have.been.calledWith", "Deep thought", "think");
  });
});
