import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "../../src/components/MarkdownComponents";
import { mountWithProviders } from "../support/mount";

function Render({ md }: { md: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {md}
    </ReactMarkdown>
  );
}

describe("MarkdownComponents", () => {
  describe("CodeBlock", () => {
    it("renders a fenced code block with a Copy code button", () => {
      mountWithProviders(<Render md={"```typescript\nconst x = 1;\n```"} />);
      cy.get("button[aria-label='Copy code']").should("exist");
    });

    it("shows Copied label after clicking the copy button", () => {
      cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, "writeText").resolves();
      });
      mountWithProviders(<Render md={"```typescript\nconst x = 1;\n```"} />);
      cy.get("button[aria-label='Copy code']").click();
      cy.get("button[aria-label='Copied']").should("exist");
    });
  });

  describe("blockquote", () => {
    it("renders two blockquote elements for nested markdown", () => {
      mountWithProviders(<Render md={"> outer\n> > inner"} />);
      cy.get("blockquote").should("have.length.at.least", 2);
    });

    it("inner blockquote is nested inside the outer blockquote element", () => {
      mountWithProviders(<Render md={"> outer\n> > inner"} />);
      // The DesignForge fix adds [blockquote_&]:border-teal-100 so the inner
      // blockquote picks up a lighter border. Structurally it must be a descendant.
      cy.get("blockquote blockquote").should("exist");
    });
  });

  describe("inline code", () => {
    it("renders backtick code as a <code> element", () => {
      mountWithProviders(<Render md={"Use `npm install` to install."} />);
      cy.get("code").should("exist").and("contain.text", "npm install");
    });
  });

  describe("GFM table", () => {
    it("renders a markdown table as a <table> element", () => {
      const tableMarkdown = [
        "| Header A | Header B |",
        "| --- | --- |",
        "| Cell 1 | Cell 2 |",
      ].join("\n");
      mountWithProviders(<Render md={tableMarkdown} />);
      cy.get("table").should("exist");
      cy.get("th").first().should("contain.text", "Header A");
      cy.get("td").first().should("contain.text", "Cell 1");
    });
  });
});
