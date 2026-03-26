# 0006 — SESSION_NAME_DUPLICATE inline field error

**Date**: 2026-03-09
**Status**: Accepted

## Context

The backend now returns HTTP 409 with `code: "SESSION_NAME_DUPLICATE"` on two surfaces:

- `POST /sessions` — when a new session is created with a name that already belongs to the user.
- `PATCH /sessions/{id}` — when a session is renamed to a name that already belongs to the user.

Both surfaces are controlled by form inputs that accept a user-typed name. The two components involved are:

- `src/pages/sessions/NewSessionDialog.tsx` — a modal dialog with an explicit name `<Input>`.
- `src/pages/chat/SessionHeader.tsx` — an inline edit that replaces the session name button with an `<Input>` on click.

Both components currently route all `onError` outcomes to `toast.error(error.message)`. A toast is a transient, positionally distant notification. For a field-level conflict error the toast disappears before the user has finished re-typing, and it does not visually anchor the problem to the offending field. This degrades UX compared to the pattern already used for `VALIDATION_ERROR` (see `ApiError.getFieldErrors()`).

The `ApiError` class (`src/lib/api/types/common.ts`) already carries a `.code` string property populated directly from the backend `APIError` envelope. `SessionPage.tsx` already demonstrates branching on `error.code === "SESSION_NOT_FOUND"` within a TanStack Query error handler, establishing a precedent for code-specific error routing.

## Options Considered

### Option A — Keep toast-only, no code branching

Pros: zero component changes; consistent with the current default pattern.

Cons: poor field-level UX — the toast disappears, leaves the field in an ambiguous state, and provides no visual anchor. The name field is the direct cause of the error; the user must re-read the toast and then re-focus the field manually.

### Option B — Inline field error for SESSION_NAME_DUPLICATE; toast for all other errors

Branch inside `onError` on `error instanceof ApiError && error.code === "SESSION_NAME_DUPLICATE"`. When true, set a local `nameError: string | null` state variable instead of (or in addition to) toasting. Render the error as a `<p className="text-sm text-destructive">` immediately below the name `<Input>`. Clear `nameError` when the user next modifies the field. For all other error codes, fall back to `toast.error`.

Pros:
- Error anchored directly to the offending field — no positional ambiguity.
- Consistent with how other shadcn form implementations render field-level feedback.
- The `nameError` state is purely local (`useState`) — correct per architecture invariants; it does not model server data, only transient UI feedback from a mutation.
- No new abstractions required; the `ApiError.code` branch is two lines.
- Does not block submission; user can immediately start re-typing without dismissing anything.

Cons:
- Minor divergence from the current uniform `toast.error` fallback pattern — intentional and scoped.

### Option C — Adopt React Hook Form + Zod for both components

Use `setError("name", { message })` from React Hook Form to propagate server errors into a form schema.

Pros: principled; works well across large forms.

Cons: introduces RHF as a new dependency not used elsewhere in the project; over-engineered for two small, largely unrelated forms; the additional abstraction weight is not justified by two fields.

## Decision

**Option B** — inline field error via local `nameError: string | null` state, branching on `error.code === "SESSION_NAME_DUPLICATE"`.

Rationale: the error is causally and visually tied to a single input field. Local `useState` is the correct ownership for transient mutation-response UI feedback that does not need to survive a re-render cycle or be shared outside the component. The pattern is already implicitly supported by `ApiError.code` and requires no new abstractions or dependencies.

## Implementation Specification

### NewSessionDialog

1. Add `const [nameError, setNameError] = useState<string | null>(null)` alongside the existing `form` state.
2. In `createMutation.onError`: check `error instanceof ApiError && error.code === "SESSION_NAME_DUPLICATE"`. If true, call `setNameError(error.message)` and do not toast. Otherwise call `toast.error(error.message)` as before.
3. Clear `nameError` in the `onChange` handler for the name `<Input>`: `setNameError(null)` alongside the existing `setForm(...)` call.
4. Also clear `nameError` inside `handleOpenChange` when the dialog closes (already resets `form` to `INITIAL_FORM`).
5. Render below the name `<Input>`, inside the existing `div.space-y-1.5`:
   ```tsx
   {nameError && <p className="text-sm text-destructive">{nameError}</p>}
   ```
6. Add `aria-describedby="session-name-error"` to the `<Input>` when `nameError` is non-null, and `id="session-name-error"` on the `<p>` for screen-reader association.

### SessionHeader

The inline-edit pattern is more constrained: the input is in the header bar with no surrounding form layout. The approach is the same but the visual placement differs.

1. Add `const [renameError, setRenameError] = useState<string | null>(null)` alongside `editing` and `draftName`.
2. In `renameMutation.onError`: branch on `SESSION_NAME_DUPLICATE` — set `setRenameError(error.message)` and keep `editing` open (remove the `setEditing(false)` from `onSettled` when the error is a duplicate — i.e., move `setEditing(false)` from `onSettled` into `onSuccess` only). For all other errors, toast and dismiss as before.
3. Clear `renameError` in the `onChange` handler for `draftName` and when `Escape` is pressed (`handleKeyDown` Escape branch already calls `setEditing(false)` and resets `draftName`; also call `setRenameError(null)` there).
4. Render `renameError` as an absolutely-positioned or below-field `<p>` beneath the `<Input>` in the editing branch. Because the header layout is `flex h-14`, the error text should appear in a wrapping element. The existing structure wraps the input in a `<div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">`; the error `<p>` fits naturally below the input inside that column, replacing or supplementing the `AgentStateBadge` row while editing is active.
5. Add matching `aria-describedby` / `id` pairing as in the dialog.

### No new files, hooks, or query keys are required.

The `nameError` / `renameError` state is local to each component. No Zustand store changes. No TanStack Query involvement. The `ApiError` class and `SESSION_NAME_DUPLICATE` string constant do not require additions to `common.ts` — the code arrives as a plain string from the server and is compared inline.

If `SESSION_NAME_DUPLICATE` is referenced in more than two places in the future, extract it to a named constant in `src/lib/api/types/common.ts` (e.g., `export const ERROR_SESSION_NAME_DUPLICATE = "SESSION_NAME_DUPLICATE" as const`). At two call sites, inline comparison is preferred over premature extraction.

## Consequences

- Both session-naming forms provide field-anchored duplicate-name feedback without toasts.
- The `onSettled` usage in `SessionHeader.renameMutation` is split: `setEditing(false)` moves to `onSuccess`; the duplicate-name branch keeps the edit open so the user can correct the name in place.
- All other error codes in both components continue to route to `toast.error` — no regression.
- No new abstractions, dependencies, or files are introduced.
- The OpenAPI spec discrepancy (change 2 in the review) is a documentation/tooling concern, not a structural frontend concern. It does not require an ADR; the recommended action is for the backend to auto-generate `openapi.yaml` from FastAPI and treat that as the single source of truth, then copy the result into `docs/api/` in both repositories as a post-deploy step.
