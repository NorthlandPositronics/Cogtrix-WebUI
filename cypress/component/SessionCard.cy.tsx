import React from "react";
import { SessionCard, SessionRow } from "../../src/components/SessionCard";
import { mountWithProviders } from "../support/mount";
import type { SessionOut } from "../../src/lib/api/types/session";
import type { ModelOut } from "../../src/lib/api/types/config";

const SESSION: SessionOut = {
  id: "sess-001",
  name: "Test Session",
  owner_id: "user-001",
  state: "idle",
  config: { model: "claude-3" },
  token_counts: { input_tokens: 0, output_tokens: 0, context_window: 0 },
  active_tools: [],
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  archived_at: null,
};

const ARCHIVED_SESSION: SessionOut = {
  ...SESSION,
  id: "sess-002",
  name: "Archived Session",
  archived_at: new Date(Date.now() - 86400000).toISOString(),
};

const MODELS: ModelOut[] = [
  { alias: "claude-3", provider: "anthropic", model_name: "claude-3-5-sonnet", is_active: true, num_ctx: null, temperature: null, max_tokens: null },
  { alias: "gpt-4o", provider: "openai", model_name: "gpt-4o", is_active: false, num_ctx: null, temperature: null, max_tokens: null },
];

describe("SessionCard — grid view", () => {
  it("mounts and shows the session name", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.get("[data-cy='session-card']").should("exist");
    cy.contains("Test Session").should("be.visible");
  });

  it("delete button exists with aria-label containing the session name", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.get("[data-cy='delete-session']").should("exist");
    cy.get("[data-cy='delete-session']")
      .invoke("attr", "aria-label")
      .should("include", "Test Session");
  });

  it("delete button carries the text-zinc-500 class from the DesignForge fix", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.get("[data-cy='delete-session']").should("have.class", "text-zinc-500");
  });

  it("AgentStateBadge renders with role=status for idle state", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.get("[role='status']").should("exist");
    cy.get("[role='status']").invoke("attr", "aria-label").should("include", "Ready");
  });

  it("card has role=button and tabIndex=0 for keyboard navigation", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.get("[data-cy='session-card']").should("have.attr", "role", "button");
    cy.get("[data-cy='session-card']").should("have.attr", "tabindex", "0");
  });

  it("card has aria-label for screen readers", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.get("[data-cy='session-card']")
      .invoke("attr", "aria-label")
      .should("eq", "Open session: Test Session");
  });

  it("calls onDelete with session id when delete button is clicked", () => {
    const onDelete = cy.stub().as("onDelete");
    mountWithProviders(<SessionCard session={SESSION} onDelete={onDelete} />);
    cy.get("[data-cy='delete-session']").click();
    cy.get("@onDelete").should("have.been.calledOnceWith", "sess-001");
  });

  it("shows relative time in the card footer", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.contains("just now").should("be.visible");
  });

  it("model name is shown as plain text when no models/onEditModel provided", () => {
    mountWithProviders(<SessionCard session={SESSION} onDelete={cy.stub()} />);
    cy.contains("claude-3").should("be.visible");
  });

  it("checkbox is rendered when onSelect prop is provided", () => {
    mountWithProviders(
      <SessionCard
        session={SESSION}
        onDelete={cy.stub()}
        onSelect={cy.stub()}
        selected={false}
      />,
    );
    cy.get("[data-cy='session-checkbox']").should("exist");
  });

  it("calls onSelect with session id and true when checkbox is checked", () => {
    const onSelect = cy.stub().as("onSelect");
    mountWithProviders(
      <SessionCard
        session={SESSION}
        onDelete={cy.stub()}
        onSelect={onSelect}
        selected={false}
      />,
    );
    cy.get("[data-cy='session-card']").trigger("mouseenter");
    cy.get("[data-cy='session-checkbox']").click();
    cy.get("@onSelect").should("have.been.calledWith", "sess-001", true);
  });

  it("selected card exposes data-selected=true attribute", () => {
    mountWithProviders(
      <SessionCard
        session={SESSION}
        onDelete={cy.stub()}
        onSelect={cy.stub()}
        selected={true}
      />,
    );
    cy.get("[data-cy='session-card']").should("have.attr", "data-selected", "true");
  });
});

describe("SessionCard — archived state", () => {
  it("shows Archived badge for an archived session", () => {
    mountWithProviders(
      <SessionCard session={ARCHIVED_SESSION} onDelete={cy.stub()} />,
    );
    cy.get("[data-cy='archived-badge']").should("be.visible").and("contain.text", "Archived");
  });

  it("shows ArchiveRestore button when onUnarchive is provided", () => {
    mountWithProviders(
      <SessionCard
        session={ARCHIVED_SESSION}
        onDelete={cy.stub()}
        onUnarchive={cy.stub()}
      />,
    );
    cy.get(`[aria-label='Unarchive session: Archived Session']`).should("exist");
  });

  it("calls onUnarchive with session id when ArchiveRestore button is clicked", () => {
    const onUnarchive = cy.stub().as("onUnarchive");
    mountWithProviders(
      <SessionCard
        session={ARCHIVED_SESSION}
        onDelete={cy.stub()}
        onUnarchive={onUnarchive}
      />,
    );
    cy.get(`[aria-label='Unarchive session: Archived Session']`).click();
    cy.get("@onUnarchive").should("have.been.calledOnceWith", "sess-002");
  });

  it("does not show ArchiveRestore button for non-archived session", () => {
    mountWithProviders(
      <SessionCard session={SESSION} onDelete={cy.stub()} onUnarchive={cy.stub()} />,
    );
    cy.get(`[aria-label='Unarchive session: Test Session']`).should("not.exist");
  });
});

describe("SessionCard — model popover", () => {
  it("renders model chip as popover trigger button when models and onEditModel provided", () => {
    mountWithProviders(
      <SessionCard
        session={SESSION}
        onDelete={cy.stub()}
        models={MODELS}
        onEditModel={cy.stub()}
      />,
    );
    cy.get(`[aria-label*='Change model for session']`).should("exist");
  });

  it("opening model popover shows available models", () => {
    mountWithProviders(
      <SessionCard
        session={SESSION}
        onDelete={cy.stub()}
        models={MODELS}
        onEditModel={cy.stub()}
      />,
    );
    cy.get(`[aria-label*='Change model for session']`).click();
    cy.contains("gpt-4o").should("be.visible");
  });

  it("clicking a different model calls onEditModel with session id and alias", () => {
    const onEditModel = cy.stub().as("onEditModel");
    mountWithProviders(
      <SessionCard
        session={SESSION}
        onDelete={cy.stub()}
        models={MODELS}
        onEditModel={onEditModel}
      />,
    );
    cy.get(`[aria-label*='Change model for session']`).click();
    cy.contains("gpt-4o").click();
    cy.get("@onEditModel").should("have.been.calledWith", "sess-001", "gpt-4o");
  });

  it("current model button is aria-pressed=true in popover", () => {
    mountWithProviders(
      <SessionCard
        session={SESSION}
        onDelete={cy.stub()}
        models={MODELS}
        onEditModel={cy.stub()}
      />,
    );
    cy.get(`[aria-label*='Change model for session']`).click();
    cy.get("button[aria-pressed='true']").should("exist");
  });
});

describe("SessionRow — list view", () => {
  function mountRow(props: Partial<Parameters<typeof SessionRow>[0]> = {}) {
    return mountWithProviders(
      <table>
        <tbody>
          <SessionRow session={SESSION} onDelete={cy.stub()} {...props} />
        </tbody>
      </table>,
    );
  }

  it("renders the session row with name and state badge", () => {
    mountRow();
    cy.get("[data-cy='session-row']").should("exist");
    cy.contains("Test Session").should("be.visible");
    cy.get("[role='status']").should("exist");
  });

  it("calls onDelete with session id when delete button is clicked", () => {
    const onDelete = cy.stub().as("onDelete");
    mountRow({ onDelete });
    cy.get("[data-cy='delete-session-row']").click();
    cy.get("@onDelete").should("have.been.calledOnceWith", "sess-001");
  });

  it("checkbox is rendered in row when onSelect is provided", () => {
    mountRow({ onSelect: cy.stub(), selected: false });
    cy.get("[data-cy='session-checkbox']").should("exist");
  });

  it("calls onSelect with session id and true when row checkbox is checked", () => {
    const onSelect = cy.stub().as("onSelect");
    mountRow({ onSelect, selected: false });
    cy.get("[data-cy='session-checkbox']").click();
    cy.get("@onSelect").should("have.been.calledWith", "sess-001", true);
  });

  it("shows Archived badge in row for archived session", () => {
    mountWithProviders(
      <table>
        <tbody>
          <SessionRow session={ARCHIVED_SESSION} onDelete={cy.stub()} />
        </tbody>
      </table>,
    );
    cy.get("[data-cy='archived-badge']").should("be.visible");
  });

  it("calls onUnarchive with session id when row unarchive button is clicked", () => {
    const onUnarchive = cy.stub().as("onUnarchive");
    mountWithProviders(
      <table>
        <tbody>
          <SessionRow
            session={ARCHIVED_SESSION}
            onDelete={cy.stub()}
            onUnarchive={onUnarchive}
          />
        </tbody>
      </table>,
    );
    cy.get(`[aria-label='Unarchive session: Archived Session']`).click();
    cy.get("@onUnarchive").should("have.been.calledOnceWith", "sess-002");
  });

  it("renders model chip in row when models and onEditModel provided", () => {
    mountRow({ models: MODELS, onEditModel: cy.stub() });
    cy.get(`[aria-label*='Change model for session']`).should("exist");
  });

  it("clicking model in row popover calls onEditModel", () => {
    const onEditModel = cy.stub().as("onEditModel");
    mountRow({ models: MODELS, onEditModel });
    cy.get(`[aria-label*='Change model for session']`).click();
    cy.contains("gpt-4o").click();
    cy.get("@onEditModel").should("have.been.calledWith", "sess-001", "gpt-4o");
  });
});
