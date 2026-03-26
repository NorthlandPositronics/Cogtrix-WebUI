import React from "react";
import { SessionBulkBar } from "../../src/pages/sessions/SessionBulkBar";
import { mountWithProviders } from "../support/mount";

describe("SessionBulkBar", () => {
  it("returns null when selectedCount is 0", () => {
    mountWithProviders(
      <SessionBulkBar
        selectedCount={0}
        totalCount={10}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.get("[data-cy='bulk-bar']").should("not.exist");
  });

  it("shows N selected text when selectedCount > 0", () => {
    mountWithProviders(
      <SessionBulkBar
        selectedCount={3}
        totalCount={10}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.get("[data-cy='bulk-bar']").should("be.visible");
    cy.contains("3 selected").should("be.visible");
  });

  it("shows Select all link when not all sessions are selected", () => {
    mountWithProviders(
      <SessionBulkBar
        selectedCount={3}
        totalCount={10}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.contains("Select all").should("be.visible");
    cy.contains("Deselect all").should("not.exist");
  });

  it("shows Deselect all link when selectedCount equals totalCount", () => {
    mountWithProviders(
      <SessionBulkBar
        selectedCount={5}
        totalCount={5}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.contains("Deselect all").should("be.visible");
    cy.contains("Select all").should("not.exist");
  });

  it("Archive button calls onArchive", () => {
    const onArchive = cy.stub().as("onArchive");
    mountWithProviders(
      <SessionBulkBar
        selectedCount={2}
        totalCount={10}
        onArchive={onArchive}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.get("[data-cy='bulk-archive']").click();
    cy.get("@onArchive").should("have.been.calledOnce");
  });

  it("Delete button calls onDelete", () => {
    const onDelete = cy.stub().as("onDelete");
    mountWithProviders(
      <SessionBulkBar
        selectedCount={2}
        totalCount={10}
        onArchive={cy.stub()}
        onDelete={onDelete}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.get("[data-cy='bulk-delete']").click();
    cy.get("@onDelete").should("have.been.calledOnce");
  });

  it("Clear button calls onClear", () => {
    const onClear = cy.stub().as("onClear");
    mountWithProviders(
      <SessionBulkBar
        selectedCount={2}
        totalCount={10}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={onClear}
        isPending={false}
      />,
    );
    cy.get("[data-cy='bulk-clear']").click();
    cy.get("@onClear").should("have.been.calledOnce");
  });

  it("Select all link calls onSelectAll when not all selected", () => {
    const onSelectAll = cy.stub().as("onSelectAll");
    mountWithProviders(
      <SessionBulkBar
        selectedCount={2}
        totalCount={10}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={onSelectAll}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.contains("Select all").click();
    cy.get("@onSelectAll").should("have.been.calledOnce");
  });

  it("Deselect all link calls onClear when all selected", () => {
    const onClear = cy.stub().as("onClear");
    mountWithProviders(
      <SessionBulkBar
        selectedCount={5}
        totalCount={5}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={onClear}
        isPending={false}
      />,
    );
    cy.contains("Deselect all").click();
    cy.get("@onClear").should("have.been.calledOnce");
  });

  it("all action buttons are disabled when isPending is true", () => {
    mountWithProviders(
      <SessionBulkBar
        selectedCount={3}
        totalCount={10}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={true}
      />,
    );
    cy.get("[data-cy='bulk-archive']").should("be.disabled");
    cy.get("[data-cy='bulk-delete']").should("be.disabled");
    cy.get("[data-cy='bulk-clear']").should("be.disabled");
  });

  it("toolbar has role=toolbar with accessible label", () => {
    mountWithProviders(
      <SessionBulkBar
        selectedCount={1}
        totalCount={5}
        onArchive={cy.stub()}
        onDelete={cy.stub()}
        onSelectAll={cy.stub()}
        onClear={cy.stub()}
        isPending={false}
      />,
    );
    cy.get("[role='toolbar']")
      .invoke("attr", "aria-label")
      .should("eq", "Bulk session actions");
  });
});
