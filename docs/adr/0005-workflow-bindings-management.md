# 0005 — Workflow Bindings Management

**Date**: 2026-03-09
**Status**: Accepted

## Context

The backend exposes three endpoints for managing workflow-to-chat bindings:

- `GET /api/v1/assistant/workflows/bindings` — list all bindings (`CursorPage<WorkflowBindingOut>`)
- `PUT /api/v1/assistant/workflows/bindings/{session_key}` — bind a chat to a workflow (admin only)
- `DELETE /api/v1/assistant/workflows/bindings/{session_key}` — unbind (admin only)

The WebUI already has:
- `WorkflowBindingOut` and `BindWorkflowRequest` defined in `src/lib/api/types/workflow.ts`
- `keys.workflows.bindings()` defined in `src/lib/api/keys.ts`
- `WorkflowsPanel` in `src/pages/assistant/WorkflowsPanel.tsx` that owns workflow CRUD and documents
- `useAssistantChatsQuery` hook in `src/hooks/useAssistantChatsQuery.ts` that fetches `ChatSessionOut[]`

The design must fit the existing patterns established in `WorkflowsPanel` (inline mutations, `ConfirmDialog`, dialog-per-action) and must not introduce any new Zustand stores or route-level changes.

---

## Options Considered

### Q1 — Where do bindings live within `WorkflowsPanel`: per-row collapsible, separate section, or separate dialog?

**Option A — Collapsible per-row sub-table**
Each workflow row expands to reveal its bound chats. The `Collapsible` component is already imported and used in the workflow form fields.
Pros: bindings are immediately visually associated with the workflow they belong to; no extra navigation step.
Cons: the binding list is workflow-scoped, but the list API returns all bindings globally — per-row expansion requires client-side filtering by `workflow_id`, which is fine since the full list is bounded and static. However, a row-level collapsible in a `Table` conflicts with standard table row semantics — expanding a row inside a `<tbody>` requires a second `<TableRow>` immediately after the parent, creating a non-trivial layout pattern. The workflow table already has 7 columns including a dropdown actions cell; adding a toggle column makes the row visually busy.

**Option B — "Bindings" entry in the per-row `DropdownMenu`**
Clicking "Bindings" in the existing `MoreHorizontal` dropdown opens a `BindingsDialog` that shows the bound chat for that workflow and allows binding or unbinding. This mirrors the exact same pattern used by "Documents" for `DocumentsDialog`.
Pros: identical component shape to the already-approved `DocumentsDialog` pattern; zero new column, zero row layout change; the workflow context (`wf.id`, `wf.name`) is available as props; the dialog can host both the current binding display and the "Bind to chat" form. Cons: the binding relationship is one-to-one (one workflow per `session_key`, one active binding per chat at a time), so the dialog will typically show either zero or one row — a full table inside a dialog for a single row is a bit heavy but is consistent.

**Option C — Flat "Bindings" section below the workflow table, as a second table within `WorkflowsPanel`**
A second `<Table>` showing all bindings with columns: session_key / workflow_id / assigned_at / assigned_by / unbind action. An "Add binding" button above it opens a form (workflow select + chat select).
Pros: the global view is immediately visible without drilling into individual workflows; the section would be the most discoverable for operators who want to audit all bindings.
Cons: breaks the established single-domain-per-section pattern; the bindings table has no natural grouping key visible at a glance; workflow names are not in `WorkflowBindingOut` — a join against the workflow list is required for display; this section introduces a second independent query into a panel that currently has one.

**Decision for Q1**: Option B. The `BindingsDialog` pattern exactly mirrors `DocumentsDialog`, which means the implementation shape is already proven in the same file. The dialog shows the current binding for the selected workflow (one row or empty state), and hosts the bind/unbind actions. The per-workflow scope is sufficient because the typical admin workflow is "I want to change what this workflow is bound to", not "show me a global binding audit table" — the latter can be addressed in a future ADR if the need arises.

---

### Q2 — Chat selection UX: `<Select>` populated from `useAssistantChatsQuery`, or free-text `<Input>`?

**Option A — Free-text `<Input>` for `session_key`**
Pros: zero additional query; matches the raw API shape directly; no dependency on the chats query being populated.
Cons: `session_key` is an opaque `channel::chat_id` string. Requiring an operator to type or paste it is error-prone and provides a poor user experience. It also requires the operator to look up the key from a different tab.

**Option B — `<Select>` populated from `useAssistantChatsQuery`**
The same hook already used by `AssistantChatList` can be called inside `BindingsDialog`. The select renders `chat.display_name ?? chat.chat_id` as the label and `chat.session_key` as the value.
Pros: operator-friendly; prevents malformed keys; reuses an existing cached query — `keys.assistant.chats()` will already be populated if the user visited the Chats tab.
Cons: if the assistant has no active chats, the select is empty; the dialog must handle this gracefully with an explanatory empty state. The `useAssistantChatsQuery` call inside the dialog fires the query on dialog open — this is acceptable; TanStack Query deduplicates and caches.

**Option C — Combobox with search**
Pros: handles large chat lists gracefully.
Cons: the existing panel has no combobox pattern; introducing one here is premature given that chat lists are not expected to be large enough to require search filtering. A shadcn `<Select>` is sufficient.

**Decision for Q2**: Option B. The `<Select>` from shadcn (already installed) populated from `useAssistantChatsQuery` is the correct approach. The hook call inside `BindingsDialog` is bounded to dialog-open time and benefits from TanStack Query's cache. If the select is empty, render: "No active chats available. Start the assistant and wait for chats to appear."

---

### Q3 — Should `useWorkflowBindingsQuery` be a standalone hook file?

The project has two data-fetching patterns in `WorkflowsPanel`:
1. `useQuery` called inline at the top of `DocumentsDialog` (a dialog with a single, narrowly scoped query).
2. `useQuery` called inline at the top of `WorkflowsPanel` itself (the primary list query).

A standalone hook file is warranted when: (a) the same query is used in two or more places, or (b) the query involves non-trivial transform logic.

The bindings query (`keys.workflows.bindings()`) is called in one place only: `BindingsDialog`. The existing `useAssistantChatsQuery` hook exists as a standalone because it is shared between `AssistantChatList` and will now be shared with `BindingsDialog`. No new hook file is needed for the bindings query itself — it follows the `DocumentsDialog` inline pattern.

**Decision for Q3**: Inline `useQuery` inside `BindingsDialog`, matching `DocumentsDialog`. No new hook file.

---

## Decision

### Component structure

Add one new internal component to `src/pages/assistant/WorkflowsPanel.tsx`:

```
BindingsDialog
  props: workflowId: string | null, workflowName: string, onOpenChange: (open: boolean) => void
  internal queries:
    - useQuery({ queryKey: keys.workflows.bindings(), queryFn: ... })  // full list, filter by workflowId client-side
    - useAssistantChatsQuery()  // for the chat select
  internal mutations:
    - bindMutation: PUT /assistant/workflows/bindings/{session_key}
    - unbindMutation: DELETE /assistant/workflows/bindings/{session_key}
  internal state:
    - selectedChatKey: string — controlled value of the <Select>
    - unbindTarget: string | null — session_key staged for ConfirmDialog
```

`WorkflowsPanel` gains one additional piece of state: `bindingsWorkflow: { id: string; name: string } | null` mirroring the `docsWorkflowId: string | null` pattern. The `MoreHorizontal` dropdown gains a "Bindings" item between "Documents" and "Delete", visible to all users for reading (the bind/unbind buttons are gated by `isAdmin` inside the dialog).

### State management

No Zustand involvement. All state is:
- Server state: TanStack Query cache at `keys.workflows.bindings()` and `keys.assistant.chats()`
- Dialog-local state: `selectedChatKey` (controlled select value), `unbindTarget` (confirm gate)
- Panel-local state: `bindingsWorkflow` (which workflow's dialog is open)

Mutation `onSuccess` handlers call:
- `queryClient.invalidateQueries({ queryKey: keys.workflows.bindings() })` after bind and unbind

No invalidation of `keys.assistant.chats()` is needed — a binding operation does not change the chat list.

### API call patterns

```
// List (all bindings, filter client-side)
GET /api/v1/assistant/workflows/bindings
queryKey: keys.workflows.bindings()
queryFn: () => api.get<CursorPage<WorkflowBindingOut>>("/assistant/workflows/bindings")
             .then(page => page.items)
enabled: workflowId !== null

// Bind
PUT /api/v1/assistant/workflows/bindings/{session_key}
mutationFn: ({ sessionKey, workflowId }) =>
  api.put<WorkflowBindingOut>(
    `/assistant/workflows/bindings/${encodeURIComponent(sessionKey)}`,
    { workflow_id: workflowId }
  )

// Unbind
DELETE /api/v1/assistant/workflows/bindings/{session_key}
mutationFn: (sessionKey: string) =>
  api.delete(`/assistant/workflows/bindings/${encodeURIComponent(sessionKey)}`)
```

Note: `PUT` reuses the `api.put` method added in the sprint covered by ADR-0004. No new client method is required.

### File organization

All changes are confined to two existing files:

| File | Change |
|---|---|
| `src/pages/assistant/WorkflowsPanel.tsx` | Add `BindingsDialog` internal component; add `bindingsWorkflow` state to `WorkflowsPanel`; add "Bindings" dropdown item |
| No other files need changes | `keys.workflows.bindings()` and `WorkflowBindingOut` / `BindWorkflowRequest` are already defined |

No new files. No new hook files. No new route or tab.

---

## Consequences

- The `WorkflowsPanel` file grows but remains structured as a single-file panel following the established convention for `CampaignsPanel` and the document-heavy settings panels.
- `useAssistantChatsQuery` is now consumed in two locations (`AssistantChatList` and `BindingsDialog`). The hook already exists as a shared file — this is the expected usage pattern.
- The bindings list query (`keys.workflows.bindings()`) has no per-workflow scoping key. This means all bindings are fetched and filtered client-side per workflow. This is acceptable for the expected data volume (one binding per active chat; bounded by the number of active chats). If the list grows beyond a few hundred entries, a future ADR should add a `?workflow_id=` query param to the backend and a new `keys.workflows.bindingsFor(workflowId)` key.
- The `BindingsDialog` UI for a given workflow will show at most one current binding (one `session_key` can only be bound to one workflow at a time per the PUT-overwrite semantics). The dialog should present this clearly: "Currently bound to: [chat name]" with an unbind button, and a separate "Bind to a different chat" form below, rather than a table of multiple rows.
- Re-binding (calling PUT with a different `session_key` while one binding exists) is not a supported UI flow — the PUT path param is the `session_key`, so to re-assign a workflow to a different chat, the operator first unbinds the old `session_key`, then binds the new one. The dialog should make this two-step flow explicit in its layout.
