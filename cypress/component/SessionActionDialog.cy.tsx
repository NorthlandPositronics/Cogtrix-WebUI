import React from "react";
import { SessionActionDialog } from "../../src/pages/sessions/SessionActionDialog";
import { mountWithProviders } from "../support/mount";

describe("SessionActionDialog", () => {
  it("renders the dialog title with session name", () => {
    mountWithProviders(
      <SessionActionDialog
        open={true}
        onOpenChange={cy.stub()}
        onArchive={cy.stub()}
        onDeletePermanently={cy.stub()}
        isPending={false}
        sessionName="My Chat Session"
      />,
    );
    cy.contains("Remove session: My Chat Session").should("be.visible");
  });

  it("renders a fallback title without session name", () => {
    mountWithProviders(
      <SessionActionDialog
        open={true}
        onOpenChange={cy.stub()}
        onArchive={cy.stub()}
        onDeletePermanently={cy.stub()}
        isPending={false}
      />,
    );
    cy.contains("Remove session").should("be.visible");
  });

  it("Cancel button calls onOpenChange with false", () => {
    const onOpenChange = cy.stub().as("onOpenChange");
    mountWithProviders(
      <SessionActionDialog
        open={true}
        onOpenChange={onOpenChange}
        onArchive={cy.stub()}
        onDeletePermanently={cy.stub()}
        isPending={false}
        sessionName="My Session"
      />,
    );
    cy.contains("button", "Cancel").click();
    cy.get("@onOpenChange").should("have.been.calledOnceWith", false);
  });

  it("Archive button calls onArchive", () => {
    const onArchive = cy.stub().as("onArchive");
    mountWithProviders(
      <SessionActionDialog
        open={true}
        onOpenChange={cy.stub()}
        onArchive={onArchive}
        onDeletePermanently={cy.stub()}
        isPending={false}
        sessionName="My Session"
      />,
    );
    cy.contains("button", "Archive").click();
    cy.get("@onArchive").should("have.been.calledOnce");
  });

  it("Delete permanently button calls onDeletePermanently", () => {
    const onDeletePermanently = cy.stub().as("onDeletePermanently");
    mountWithProviders(
      <SessionActionDialog
        open={true}
        onOpenChange={cy.stub()}
        onArchive={cy.stub()}
        onDeletePermanently={onDeletePermanently}
        isPending={false}
        sessionName="My Session"
      />,
    );
    cy.contains("button", "Delete permanently").click();
    cy.get("@onDeletePermanently").should("have.been.calledOnce");
  });

  it("all action buttons are disabled when isPending is true", () => {
    mountWithProviders(
      <SessionActionDialog
        open={true}
        onOpenChange={cy.stub()}
        onArchive={cy.stub()}
        onDeletePermanently={cy.stub()}
        isPending={true}
        sessionName="My Session"
      />,
    );
    cy.contains("button", "Cancel").should("be.disabled");
    cy.contains("button", "Archive").should("be.disabled");
    cy.contains("button", "Delete permanently").should("be.disabled");
  });

  it("shows both Archive and Delete permanently option blocks", () => {
    mountWithProviders(
      <SessionActionDialog
        open={true}
        onOpenChange={cy.stub()}
        onArchive={cy.stub()}
        onDeletePermanently={cy.stub()}
        isPending={false}
        sessionName="My Session"
      />,
    );
    cy.contains("The session is hidden but kept").should("be.visible");
    cy.contains("All messages and data are erased").should("be.visible");
  });

  it("does not render dialog content when open is false", () => {
    mountWithProviders(
      <SessionActionDialog
        open={false}
        onOpenChange={cy.stub()}
        onArchive={cy.stub()}
        onDeletePermanently={cy.stub()}
        isPending={false}
        sessionName="My Session"
      />,
    );
    cy.contains("Remove session").should("not.exist");
  });
});
