# Provider CRUD — Design Brief

**Sprint**: API-Sync-Sprint (2026-03-26)
**Author**: web_designer
**DS version**: 3.14
**Status**: Approved — ready for implementation

---

## Context

The backend now exposes full provider CRUD:

- `POST /api/v1/config/providers` — create provider (admin, 201)
- `PATCH /api/v1/config/providers/{name}` — update base_url / api_key (admin, 200)
- `DELETE /api/v1/config/providers/{name}` — remove provider; 409 `PROVIDER_IN_USE` if any model references it (admin, 200)

The existing `ProviderList.tsx` shows a read-only providers table with a wizard redirect callout for admins. That callout was a stub for the missing backend API and must be replaced with real inline CRUD controls.

---

## Design Rules (DS §3.14)

- Ghost-row add pattern (§5 BUG-09): `tfoot` row, `border-t border-dashed border-zinc-300`, `text-zinc-500 hover:text-zinc-900`, same as Models table add-model row.
- Table action column: `w-10` trailing column, icon-only ghost buttons (`h-11 w-11` per DS §5).
  - Edit: Pencil icon, `text-zinc-500 hover:bg-zinc-100` — opens inline expand below the row.
  - Delete: Trash icon, `text-zinc-500 hover:text-red-700 hover:bg-red-50` — opens `ConfirmDialog` (GUARDRAIL-002).
- Inline expand form (below the action row): same `rounded-lg border border-zinc-200 bg-zinc-50 p-4` surface as the add-model form.
- Add-provider inline form: appears below the providers table when ghost row is clicked, same pattern as add-model.
- All inputs: `min-h-11` (DS §4 touch targets).
- Error display: inline `text-xs text-red-600` below the relevant field for `PROVIDER_EXISTS`; toast for `PROVIDER_IN_USE` on delete (already handled by `handleApiError`).

---

## Providers Table Changes

### New "Actions" column

Add a trailing `Actions` `TableHead` (right-aligned, `w-20 text-right`).

Each provider row gets two icon buttons in the actions cell:

```
[Pencil icon, ghost, h-11 w-11, aria-label="Edit {name}"]
[Trash icon, ghost, h-11 w-11, text-zinc-500 hover:text-red-700, aria-label="Delete {name}"]
```

Delete is gated behind `isAdmin`. Edit is also admin-only.

### Remove the wizard callout

The `isAdmin` callout block at the bottom of the providers section (currently showing "To add or modify providers, use the Setup Wizard") is removed entirely. The wizard tab still exists in Settings for initial setup, but the inline CRUD makes the callout redundant and misleading.

---

## Add Provider Inline Form

Triggered by clicking the ghost row "Add provider" at the bottom of the providers table.

Fields (left-to-right on ≥sm, stacked on mobile):

| Field | Control | Notes |
|-------|---------|-------|
| Name | `Input`, `min-h-11`, `font-mono text-sm` | Required; pattern `^[a-zA-Z0-9][a-zA-Z0-9_-]*$`; show inline error for `PROVIDER_EXISTS` |
| Type | `Select`, `min-h-11`, `w-36` | Options: openai / ollama / anthropic / google |
| Base URL | `Input`, `min-h-11`, placeholder "https://…" | Optional |
| API key | `Input`, `min-h-11`, `type="password"` | Optional |
| Add button | Primary, `min-h-11 shrink-0` | Disabled until `name` is non-empty and valid slug |

On submit:
- Pending: spinner in button, inputs disabled.
- Success: form closes, `PROVIDER_EXISTS` error cleared, providers query invalidated, toast "Provider added".
- `PROVIDER_EXISTS` (409): show inline `text-xs text-red-600` below the Name field: "A provider with this name already exists."
- `CONFIG_INVALID` (422): toast the error message.

---

## Edit Provider Inline Form

Triggered by clicking the pencil icon on a provider row.

Shown as an expand panel below the row (same `rounded-lg border border-zinc-200 bg-zinc-50 p-4` surface).

Fields:

| Field | Control | Notes |
|-------|---------|-------|
| Base URL | `Input`, `min-h-11`, pre-filled | null clears the override |
| API key | `Input`, `min-h-11`, `type="password"`, placeholder "Leave blank to keep current" | Empty string removes the key |
| Save button | Primary, `min-h-11 shrink-0` | |
| Cancel button | Ghost/outline | Closes the expand |

Only one provider row may be in edit mode at a time. Opening edit on a second row closes the first.

On success: form closes, providers query invalidated, toast "Provider updated".

---

## Delete Provider

`ConfirmDialog` with:
- Title: `Delete provider "{name}"?`
- Description: "This will remove the provider from the configuration. This action cannot be undone."
- Confirm button: `variant="destructive"`, label "Delete"
- If `PROVIDER_IN_USE` (409): close the dialog, show toast "Provider is referenced by one or more models and cannot be deleted."

---

## Ghost Row — "Add provider"

At the bottom of the providers table footer (`TableFooter`), the same pattern as Models:

```jsx
<tfoot>
  <tr role="button" tabIndex={0} aria-label="Add provider"
      className="cursor-pointer border-t border-dashed border-zinc-300 hover:bg-zinc-50"
      onClick={() => setAddProviderOpen(v => !v)}>
    <td colSpan={6} className="py-3 text-center text-sm text-zinc-500 hover:text-zinc-900">
      <span className="flex items-center justify-center gap-1.5">
        <Plus className="h-4 w-4" />
        Add provider
      </span>
    </td>
  </tr>
</tfoot>
```

---

## State

All state is local to `ProviderList.tsx`:

- `addProviderOpen: boolean` — show/hide add form
- `editingProvider: string | null` — which provider name is being edited
- `deleteTarget: ProviderOut | null` — provider pending delete confirmation
- `addProviderError: string | null` — inline PROVIDER_EXISTS error for the add form

No Zustand changes needed.

---

## Cache Invalidation

After every successful mutation, invalidate:
- `keys.providers()`
- `keys.config()`

This ensures the embedded providers list in `ConfigOut` stays consistent.
