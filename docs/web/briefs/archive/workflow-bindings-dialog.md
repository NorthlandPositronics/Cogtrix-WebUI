# Layout Brief: BindingsDialog

**Component**: `BindingsDialog`
**Location**: `src/pages/assistant/WorkflowsPanel.tsx` (new dialog component, same file)
**Triggered by**: "Bindings" `DropdownMenuItem` in the workflow row actions menu (admin and non-admin both see it; mutation controls inside are admin-gated)
**Pattern reference**: `DocumentsDialog` in the same file — structure, spacing, and state handling must match exactly.

---

## 1. Dialog Structure

```
Dialog
└── DialogContent  max-w-2xl
    ├── DialogHeader
    │   ├── DialogTitle        "Workflow bindings"
    │   └── DialogDescription  "Chat sessions currently bound to this workflow."
    ├── body  div.space-y-4
    │   ├── [Bind form — admin only]
    │   ├── [Rebind warning — conditional]
    │   └── [Bindings table / empty state / loading / error]
    └── DialogFooter
        └── Button variant="outline"  "Close"
```

The dialog does not scroll its outer shell. The body `div.space-y-4` is the layout container. If the table grows tall, add `overflow-y-auto max-h-96` to the table wrapper only — never to `DialogContent`.

---

## 2. Component Hierarchy

```
BindingsDialog (props: workflowId: string | null, onOpenChange)
├── [internal state]
│   ├── selectedChatId: string         — controlled Select value
│   ├── deleteTarget: string | null    — session_key of binding pending removal
├── useQuery  — GET /assistant/workflows/bindings?workflow_id={workflowId}
│             — produces WorkflowBindingOut[]
├── useQuery  — GET /assistant/chats (or equivalent chat list endpoint)
│             — produces AssistantChatOut[] (needed to populate Select)
│             — enabled only when isAdmin
├── bindMutation    — POST /assistant/workflows/{id}/bindings
├── unbindMutation  — DELETE /assistant/workflows/{id}/bindings/{session_key}
├── [Bind form section]         — renders only when isAdmin
├── [Rebind warning]            — renders when selectedChatId is already bound to a different workflow
├── [Bindings table]            — renders when bindings.length > 0
├── [Empty state]               — renders when bindings.length === 0 and not loading
├── [Loading state]             — renders while useQuery isLoading
├── [Error state]               — renders when useQuery isError
└── ConfirmDialog               — unbind confirmation
```

---

## 3. Bind Form Section (admin only)

The form sits at the top of the body, above the table. It follows the same layout as the upload row in `DocumentsDialog`: a `flex justify-between items-end gap-3` row so the Select grows to fill available width and the button stays right-aligned.

```
div.flex.items-end.gap-3          — full width
├── div.flex-1.space-y-1.5
│   ├── Label htmlFor="binding-chat-select"   "Bind a chat"
│   └── Select (id="binding-chat-select")
│       ├── SelectTrigger  className="w-full"
│       │   └── SelectValue  placeholder="Select a chat session..."
│       └── SelectContent
│           └── SelectItem × N   value={chat.session_key}   {chat.title or chat.session_key}
└── Button type="button" size="sm" className="gap-1.5" disabled={!selectedChatId || bindMutation.isPending}
    ├── [pending]  Loader2 className="h-4 w-4 animate-spin"
    └── [idle]     Link className="h-4 w-4"  +  "Bind"
```

**Spacing**: `space-y-1.5` between label and select mirrors all other form fields in `WorkflowFormFields`. The `Label` uses `text-sm font-medium` (shadcn default).

**Select population**: options are the chat list filtered to exclude chats already bound to this workflow. Chats already bound appear as selected in the table and should not be re-selectable from the same dialog context; they are simply excluded from the `SelectItem` list.

**Submit behavior**: on click, call `bindMutation.mutate({ workflowId, sessionKey: selectedChatId })`. On success, clear `selectedChatId` to empty string, invalidate the bindings query, and show `toast.success("Chat bound to workflow")`. On error, show `toast.error(...)`.

---

## 4. Rebind Warning

Renders between the bind form and the table when the selected chat is already bound to a **different** workflow (detectable because the full bindings list from the chat's current binding record would reference a different `workflow_id`). The warning uses the same amber alert pattern established in `GuardrailsPanel` and `ServiceControlPanel`.

```
div.flex.items-start.gap-2.rounded-lg.border.border-amber-200.bg-amber-50.px-4.py-3
├── AlertTriangle  className="h-4 w-4 mt-0.5 shrink-0 text-amber-700"
└── p.text-sm.text-amber-700
    "This chat is already bound to workflow <strong>{other workflow id}</strong>.
     Binding it here will replace the existing assignment."
```

**Color rationale**: amber-700 on amber-50 meets WCAG AA (§1 of design system). `text-amber-500` must not be used for this inline paragraph text per §1 WCAG note.

**Visibility rule**: only rendered when `selectedChatId` is non-empty AND the chat appears in the bindings list for a different workflow (the coder will need to query `GET /assistant/workflows/bindings` without the `workflow_id` filter, or derive it from a cross-reference; the brief does not prescribe the data fetching strategy — that is an implementation decision).

---

## 5. Bindings Table

Uses the same `rounded-xl border border-zinc-200` wrapper established as the settings-page table containment pattern (design system §1.9) and applied throughout `WorkflowsPanel`.

```
div.overflow-x-auto.rounded-xl.border.border-zinc-200
└── Table
    ├── TableHeader
    │   └── TableRow
    │       ├── TableHead  "SESSION KEY"     text-xs font-medium tracking-wide text-zinc-500 uppercase
    │       ├── TableHead  "WORKFLOW"         same
    │       ├── TableHead  "ASSIGNED AT"      same
    │       ├── TableHead  "ASSIGNED BY"      same
    │       └── TableHead  w-12              (actions column, no label)
    └── TableBody
        └── TableRow × N  className="hover:bg-zinc-50"
            ├── TableCell  session_key    font-mono text-sm text-zinc-900
            ├── TableCell  workflow_id    text-sm text-zinc-900
            ├── TableCell  assigned_at    text-sm text-zinc-500   (formatted via formatDate())
            ├── TableCell  assigned_by    text-sm text-zinc-500   (username string)
            └── TableCell
                └── [admin only] Button variant="ghost" size="sm" className="h-11 w-11 text-red-600 hover:bg-red-50 hover:text-red-700"
                              aria-label="Unbind {session_key}"
                              onClick → setDeleteTarget(session_key)
                    └── Trash2 className="h-4 w-4"
```

**Column width guidance**: `SESSION KEY` and `WORKFLOW` columns take natural width. `ASSIGNED AT` and `ASSIGNED BY` are narrower — no explicit `w-` class needed; the table distributes space. The actions column is `w-12` (fixed), matching `DocumentsDialog`.

**Non-admin view**: the actions column header cell (`w-12`) and the `Trash2` button cell are both omitted when `!isAdmin`. Do not render an empty column. The table simply has four data columns.

---

## 6. Empty State

```
div.flex.flex-col.items-center.gap-3.py-12.text-center
├── Link2Off  className="h-10 w-10 text-zinc-400"  strokeWidth={1.5}
└── p  className="text-sm text-zinc-500"   "No chats are bound to this workflow."
```

Icon: `Link2Off` from `lucide-react` (communicates the absence of bindings). Icon color `text-zinc-400` per design system §10 empty-state rule. Vertical padding `py-12` matches `DocumentsDialog` empty state.

---

## 7. Loading State

```
div.space-y-2
└── Skeleton × 3   className="h-10 w-full"
```

Identical to `DocumentsDialog` loading state. Three rows covers the typical case without over-promising data volume.

---

## 8. Error State

```
div.flex.flex-col.items-center.gap-3.py-12.text-center
├── AlertTriangle  className="h-10 w-10 text-red-600"  strokeWidth={1.5}
└── p  className="text-sm text-red-600"   "Failed to load bindings."
```

`text-red-600` required for both icon and text per design system §1 WCAG note (not `text-red-500`). No retry button — consistent with `DocumentsDialog` error state which also omits retry.

---

## 9. Unbind Confirmation

Uses `ConfirmDialog` rendered as a sibling outside the main `Dialog`, matching the pattern in `DocumentsDialog`.

```
ConfirmDialog
  open={deleteTarget !== null}
  onOpenChange={(open) => !open && setDeleteTarget(null)}
  title="Unbind chat"
  description="Remove the binding between this chat and the workflow? The chat will revert to the default workflow."
  confirmLabel="Unbind"
  isPending={unbindMutation.isPending}
  onConfirm={() => deleteTarget && unbindMutation.mutate({ workflowId, sessionKey: deleteTarget })}
```

On unbind success: `toast.success("Chat unbound")`, invalidate bindings query. On error: `toast.error(...)`.

---

## 10. Admin vs Non-Admin Rules

| Element | Admin | Non-admin |
|---|---|---|
| Bind form (Select + Button) | Visible | Hidden (not rendered) |
| Chat list query | Fired | Not fired |
| Rebind warning | Visible when applicable | Hidden |
| Actions column in table | Visible (Trash2 per row) | Column omitted entirely |
| ConfirmDialog (unbind) | Rendered | Not rendered |
| Bindings table (read-only) | Visible | Visible |
| DialogFooter Close button | Visible | Visible |

The dialog is accessible to non-admin users as a read-only view of which chats are assigned to the workflow. The `isAdmin` gate from `useAuthStore` controls all mutation-adjacent UI.

---

## 11. Integration in WorkflowsPanel

Add `"Bindings"` as a new `DropdownMenuItem` in the workflow row actions menu, positioned between `"Documents"` and `"Delete"`. Both admin and non-admin users see this item. Wire it to a new `bindingsWorkflowId: string | null` state variable (same pattern as `docsWorkflowId`).

```tsx
<DropdownMenuItem onClick={() => setBindingsWorkflowId(wf.id)}>
  Bindings
</DropdownMenuItem>
```

Render `BindingsDialog` unconditionally (same as `DocumentsDialog`) so non-admins can view bindings:

```tsx
<BindingsDialog
  workflowId={bindingsWorkflowId}
  onOpenChange={(open) => !open && setBindingsWorkflowId(null)}
/>
```
