# Sessions & Settings UX Brief — v1

**Date**: 2026-03-25
**Author**: web_designer
**Status**: Active — graphic_designer must produce mockups before web_coder implements
**Design system version**: 3.14
**Bugs addressed**: BUG-01 through BUG-10

---

## Overview

This brief covers 10 UX pattern definitions for the Sessions page and Settings page. Each section defines the exact component hierarchy, DS tokens, interaction states, accessibility requirements, mobile behavior, and mockup instructions.

The graphic_designer must produce SVG mockups for the bugs marked "Mockup required". Bugs marked "Mockup NOT required" are precisely specified enough for direct implementation.

---

## BUG-01 — Models: row-selection active state (replaces "Switch to" button)

**Mockup required**: YES — `docs/web/mockups/settings-models-v2.svg`

### Problem

The current "Switch to" `Button variant="outline" size="sm"` in each inactive model row's Action column is an action verb sitting idle in a data table. Rows with many models produce a column of identical buttons, which creates visual noise and makes the active state unclear. The button implies the user is executing a distinct operation rather than simply choosing which model is active.

### UX pattern: row-level radio selection

Remove the Action column entirely. Replace with a row-selection paradigm:

- Each row gets a `RadioGroupItem` (invisible — communicated via row styling, not a visible radio circle) controlled by a shared `RadioGroup value={activeModelAlias}`.
- The active row reads as "selected" via visual row treatment (see tokens below).
- Clicking any inactive row fires the `switchModelMutation`. The cursor is `cursor-pointer` on the row.
- Admin-only gate is preserved: non-admin users see the table in read-only mode (no cursor change, no click handler). The active row is still visually distinguished.

### Component hierarchy

```
<section aria-labelledby="models-heading">
  <h2 id="models-heading" />    ← "Models" heading + Add model button (see BUG-09)
  <div class="overflow-x-auto rounded-xl border border-zinc-200">
    <RadioGroup value={activeAlias} onValueChange={handleSwitch}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />  ← "Alias"
            <TableHead />  ← "Provider"
            <TableHead />  ← "Model name"
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map(m =>
            <TableRow
              key={m.alias}
              data-active={m.is_active}
              aria-selected={m.is_active}
              role="row"
              onClick={handleRowClick(m.alias)}   ← admin only
              className={rowClass(m.is_active, isAdmin)}
            >
              <TableCell>
                <RadioGroupItem value={m.alias} className="sr-only" />
                <span class="font-mono text-sm font-medium text-zinc-900">{m.alias}</span>
                {m.is_active && <CircleCheck class="h-4 w-4 text-teal-600 ml-2 inline-flex shrink-0" aria-hidden />}
              </TableCell>
              <TableCell class="text-sm text-zinc-600">{m.provider}</TableCell>
              <TableCell class="text-sm text-zinc-600">{m.model_name}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </RadioGroup>
  </div>
</section>
```

Note: `shadcn/ui RadioGroup` must be installed (`pnpm dlx shadcn@latest add radio-group`) if not already present. The `RadioGroupItem` renders as visually hidden (`sr-only`) — its role is purely semantic (announces selected state to screen readers). The visual active state is communicated by row styling.

### DS tokens

| State | Row classes |
|---|---|
| Active (this model is the system's active model) | `bg-teal-50 border-l-2 border-l-teal-600` |
| Inactive, admin hover | `hover:bg-zinc-50 cursor-pointer` |
| Inactive, non-admin | `cursor-default` (no hover) |
| Loading (switch mutation pending, this row clicked) | `opacity-60 cursor-wait` |

**Active row accent bar**: The `border-l-2 border-l-teal-600` left border is applied at the `TableRow` level using a `[&>td:first-child]:border-l-2 [&>td:first-child]:border-l-teal-600` approach or a wrapper technique. The visual result must be a 2px teal left edge on the active row — consistent with the sidebar active nav item pattern (§4 Sidebar active nav).

**CircleCheck icon**: Lucide `CircleCheck`, `h-4 w-4 text-teal-600`, rendered inline next to the alias text in the first cell. This provides a redundant visual cue (color + icon) for the active state. Icon must have `aria-hidden="true"` — the radio group semantic communicates selection to screen readers.

**Action column removal**: The "Status" column (green/zinc dot) is also removed. The row's visual treatment (teal background + CircleCheck) makes the status self-evident. The "Action" column disappears entirely. This reduces the column count from 5 to 3 (Alias / Provider / Model name).

### Interaction states

| State | Treatment |
|---|---|
| Default (inactive row) | White background, standard row height |
| Default (active row) | `bg-teal-50`, left teal accent, CircleCheck in alias cell |
| Hover (inactive row, admin only) | `bg-zinc-50` |
| Hover (active row) | `bg-teal-50` (no change — already selected) |
| Click (admin, inactive row) | Fires mutation. Pending: row goes `opacity-60`, active row stays teal until mutation succeeds |
| Mutation success | New row becomes teal, old active row reverts to white |
| Mutation error | Toast error via sonner. Row reverts to white. |
| Non-admin | Table is display-only. No hover, no click handler. Active row still shows teal + icon. |

### Accessibility

- `RadioGroup` with `aria-label="Select active model"` wraps the entire table body.
- Each `RadioGroupItem` has `value={m.alias}` and is visually hidden via `sr-only` but announced by screen readers as "selected" or "not selected."
- `TableRow` gets `aria-selected={m.is_active}` for screen readers that navigate tables.
- The CircleCheck icon has `aria-hidden="true"`.
- Keyboard: Tab cycles through rows; Space/Enter on a focused row fires the switch (via the hidden radio input's native behavior).

### Mobile behavior (390px)

- Single table wraps in `overflow-x-auto` container (existing pattern).
- At 390px, the Provider and Model name columns may be narrow. The Alias column is primary — never truncated.
- Provider and Model name columns use `truncate` with `max-w-[6rem]` on mobile, `max-w-none` at `md:`.
- The active row visual treatment (teal background + left border) is preserved at all widths.

### Mockup instructions for graphic_designer

Produce `docs/web/mockups/settings-models-v2.svg` at 1440px viewport width, zoomed to the Providers & Models tab content only (no full page frame needed — just the Models section). Show:
1. Three model rows. First row is the active model (teal-50 background, teal left border, CircleCheck icon). Second and third rows are inactive.
2. Admin state: hover on second row shows zinc-50 background with pointer cursor annotation.
3. Loading state overlay: third row at opacity-60 with "switching..." annotation.
4. No "Switch to" button anywhere. No Status column. No Action column. Three columns only: Alias / Provider / Model name.

---

## BUG-02 — Sessions page: grid/list view toggle

**Mockup required**: YES — `docs/web/mockups/sessions-view-toggle.svg`

### UX pattern: icon toggle pair in page header

Add a two-button icon group to the page header, between the "Show archived" switch and the "New session" button. The group uses a visual button-group treatment.

### Component hierarchy

```
<PageHeader title="Sessions">
  <div class="flex items-center gap-4">
    <!-- Show archived switch (existing) -->
    <div class="flex items-center gap-2"> ... </div>

    <!-- View toggle (NEW) -->
    <div class="flex items-center rounded-lg border border-zinc-200 p-0.5" role="group" aria-label="View layout">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        className={cn("h-8 w-8", view === "grid" && "bg-zinc-100")}
        onClick={() => setView("grid")}
      >
        <LayoutGrid class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="List view"
        aria-pressed={view === "list"}
        className={cn("h-8 w-8", view === "list" && "bg-zinc-100")}
        onClick={() => setView("list")}
      >
        <LayoutList class="h-4 w-4" />
      </Button>
    </div>

    <!-- New session (existing) -->
    <NewSessionDialog />
  </div>
</PageHeader>
```

### DS tokens

| Element | Classes |
|---|---|
| Toggle group container | `flex items-center rounded-lg border border-zinc-200 p-0.5` |
| Toggle button (inactive) | `h-8 w-8 text-zinc-500 hover:bg-zinc-100` (ghost variant) |
| Toggle button (active) | `h-8 w-8 bg-zinc-100 text-zinc-900` |
| Transition | `transition-colors duration-150` |

**Why `h-8 w-8` (not `h-9 w-9` or `h-11 w-11`)**: This toggle sits in the page header's right-hand controls area, not in a sticky bar or table row. The `h-8` matches the compact filter control height (§5 Panel Filter Controls) and is appropriate for a page-level view control that is not a primary CTA. WCAG 2.5.5 (44px touch target) applies to Success Criterion level AAA; the AA requirement (2.5.8, 24x24px) is met. A `Tooltip` on each button provides additional discoverability.

**Icon color**: Active button uses `text-zinc-900` (not `text-teal-600`). Rationale: this is a display preference toggle, not a primary action or AI state. Using teal here would dilute the accent's meaning. The `bg-zinc-100` fill is the selected-state signal; teal is reserved for the actual active session, navigation, and AI states.

### List view layout

When `view === "list"`, replace the card grid with a table-style list:

```
<div class="overflow-x-auto rounded-xl border border-zinc-200">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Model</TableHead>
        <TableHead>State</TableHead>
        <TableHead>Updated</TableHead>
        <TableHead />   ← actions
      </TableRow>
    </TableHeader>
    <TableBody>
      {sessions.map(s =>
        <TableRow key={s.id} onClick={() => navigate(...)} className="cursor-pointer hover:bg-zinc-50">
          <TableCell class="font-medium text-zinc-900">{s.name}</TableCell>
          <TableCell class="text-sm text-zinc-600">{s.config.model ?? "Default"}</TableCell>
          <TableCell><AgentStateBadge state={s.state} /></TableCell>
          <TableCell class="text-xs text-zinc-500 tabular-nums whitespace-nowrap">{formatRelativeTime(s.updated_at)}</TableCell>
          <TableCell class="text-right">
            {/* Actions: same ghost buttons as tile view — see BUG-04 */}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</div>
```

### Interaction states

| State | Treatment |
|---|---|
| Grid view active | LayoutGrid button: `bg-zinc-100 text-zinc-900` |
| List view active | LayoutList button: `bg-zinc-100 text-zinc-900` |
| Toggle hover (inactive button) | `hover:bg-zinc-100` |
| List row hover | `hover:bg-zinc-50 cursor-pointer` |
| List row keyboard | `tabIndex={0}`, `onKeyDown` Enter/Space navigates |

### Persistence

Store the view preference in `useUIStore` (Zustand). Key: `sessionsView: "grid" | "list"`. Default: `"grid"`. This persists across page navigations within a session but does not persist across browser restarts (Zustand is in-memory).

### Accessibility

- Toggle group container: `role="group"` with `aria-label="View layout"`.
- Each button: `aria-pressed={active}` to communicate selected state.
- Icon buttons: `aria-label="Grid view"` / `aria-label="List view"`.
- List view rows: `role="row"`, `tabIndex={0}`, keyboard navigation via Enter/Space.

### Mobile behavior (390px)

- Toggle group remains in the header at all widths. At 390px the header may wrap — `flex-wrap` on the header controls row.
- List view at 390px: Model column hidden (`hidden sm:table-cell`). Only Name, State, and Actions columns are visible.
- Grid view remains the default and is the more space-efficient layout at mobile.

### Mockup instructions for graphic_designer

Produce `docs/web/mockups/sessions-view-toggle.svg` showing two frames side by side:
1. Left frame (grid view, 1440px): page header with toggle group, LayoutGrid button active (bg-zinc-100). Card grid (3 columns) below.
2. Right frame (list view, 1440px): LayoutList button active. Table-style list below with 5 columns.
Add a third frame (390px, list view) showing 3 columns only (Name, State, Actions) with the toggle group in a wrapped header.

---

## BUG-03 — Session removal: 3-option dialog

**Mockup required**: YES — `docs/web/mockups/session-remove-dialog.svg`

### Problem

The current `ConfirmDialog` has a single "Delete" destructive action. Archive (recoverable) and permanent delete (irreversible) are fundamentally different operations. The dialog must distinguish them.

### UX pattern: custom 3-button dialog

This is not a `ConfirmDialog` extension — it is a custom `Dialog` layout. The `ConfirmDialog` component is not modified.

### Component hierarchy

```
<Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Remove session</DialogTitle>
      <DialogDescription>
        Archiving keeps the session recoverable. Permanent deletion removes all messages and cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
      <Button variant="outline" onClick={handleCancel} disabled={isPending} className="min-h-11">
        Cancel
      </Button>
      <div class="flex gap-2">
        <Button
          variant="outline"
          onClick={handleArchive}
          disabled={isPending}
          className="min-h-11 gap-2"
        >
          {archivePending ? <Loader2 class="size-4 animate-spin" /> : <Archive class="h-4 w-4" />}
          Archive
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
          className="min-h-11 gap-2"
        >
          {deletePending ? <Loader2 class="size-4 animate-spin" /> : <Trash2 class="h-4 w-4" />}
          Delete permanently
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### DS tokens

| Element | Classes |
|---|---|
| Dialog | `max-w-md` |
| Cancel button | `variant="outline" min-h-11` |
| Archive button | `variant="outline" min-h-11 gap-2` with Archive icon |
| Delete permanently button | `variant="destructive" min-h-11 gap-2` with Trash2 icon |
| Footer layout (mobile) | `flex-col-reverse gap-2` — Cancel on bottom, action buttons stacked above |
| Footer layout (sm+) | `flex-row justify-between` — Cancel left, Archive + Delete right |

**Icon choices**: Archive icon (`Archive` from lucide) on the Archive button. `Trash2` on Delete permanently. Both at `h-4 w-4`.

**Button order rationale**: Cancel is leftmost (sm+) or bottommost (mobile) — the safest exit is the easiest to reach. Archive is the middle option — recoverable, relatively safe. Delete permanently is rightmost/topmost — highest consequence, red destructive. This ordering follows standard "safe → moderate → destructive" left-to-right / bottom-to-top convention.

**"Delete permanently" label**: This label is intentionally verbose. "Delete" alone is ambiguous when "Archive" is adjacent. "Permanently" adds the consequence without being inflammatory.

### Interaction states

| State | Treatment |
|---|---|
| Default | All three buttons enabled |
| Archive mutation pending | Archive button shows spinner, disabled. Delete permanently also disabled. Cancel enabled. |
| Delete mutation pending | Delete button shows spinner, disabled. Archive also disabled. Cancel enabled. |
| Success | Dialog closes, toast success ("Session archived" / "Session deleted") |
| Error | Toast error. Dialog remains open. Buttons re-enable. |

### Accessibility

- `DialogTitle`: "Remove session"
- `DialogDescription`: explains the difference between archive and delete
- Focus on dialog open: first interactive element (Cancel button)
- Keyboard: Tab cycles through Cancel → Archive → Delete permanently. Escape closes dialog (same as Cancel)
- `aria-label` on icon buttons within the footer is not needed — the buttons have text labels

### Mobile behavior (390px)

- At 390px: `DialogFooter` switches to `flex-col-reverse`. Stack order (top to bottom): "Delete permanently" → "Archive" → "Cancel". The most destructive action is farthest from natural thumb resting position.
- At sm+ (640px+): horizontal row, Cancel left-aligned, Archive + Delete right-aligned.

### API calls

- Archive: `PATCH /sessions/{id}` with `{ archived_at: new Date().toISOString() }` — or whichever endpoint the backend exposes for archiving. Confirm with client-contract.md. If the API uses a dedicated archive endpoint, use that.
- Delete: `DELETE /sessions/{id}` (existing mutation).

### Mockup instructions for graphic_designer

Produce `docs/web/mockups/session-remove-dialog.svg` showing:
1. Desktop state (640px+ footer layout): dialog at `max-w-md` centered. Cancel left. Archive + Delete permanently right. Show all three buttons' default states.
2. Mobile state (390px footer layout): same dialog, stacked footer (Delete permanently top, Archive middle, Cancel bottom).
3. Loading state annotation: Archive button mid-mutation (spinner visible, Delete disabled).

---

## BUG-04 — Archived sessions: different action set

**Mockup required**: NO — fully specified here.

### UX pattern: conditional action set on SessionCard

The `SessionCard` component receives `session.archived_at`. When `isArchived === true`, replace the single trash icon with two icon buttons.

### Non-archived card actions

Clicking the trash icon opens the 3-option dialog (BUG-03). No change to current icon or position.

```
<!-- Non-archived: single trash button (opens 3-option dialog) -->
<div class="absolute top-3 right-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
  <Button
    variant="ghost"
    size="icon"
    aria-label="Remove session: {name}"
    className="h-11 w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
    onClick={handleRemoveClick}
  >
    <Trash2 class="h-4 w-4" />
  </Button>
</div>
```

### Archived card actions

Two buttons: Unarchive and Delete permanently.

```
<!-- Archived: two buttons always visible (no hover reveal) -->
<div class="absolute top-3 right-3 flex items-center gap-1">
  <Button
    variant="ghost"
    size="icon"
    aria-label="Unarchive session: {name}"
    className="h-11 w-11 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    onClick={handleUnarchive}
  >
    <ArchiveRestore class="h-4 w-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    aria-label="Delete session permanently: {name}"
    className="h-11 w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
    onClick={handleDeleteClick}   ← opens ConfirmDialog (single "Delete permanently" option — no archive option since already archived)
  >
    <Trash2 class="h-4 w-4" />
  </Button>
</div>
```

**Always visible on archived cards**: The hover-reveal opacity behavior is removed for archived cards. The two actions are always visible because archived cards have reduced navigability (opacity-60 per current implementation) and the action set is the primary way to interact with them. Users who see the "Archived" badge will immediately want to unarchive — hiding the button behind hover increases friction.

**Icon choice**: `ArchiveRestore` from lucide for the Unarchive action. This icon is a box with an upward arrow — universally communicates "restore from archive."

**DS tokens for archived actions**:
- Unarchive button rest: `text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900` — neutral, not destructive.
- Delete button rest: `text-zinc-500 hover:bg-red-50 hover:text-red-700` — GUARDRAIL-001 pattern.

**ConfirmDialog for permanent delete on archived card**: A single standard `ConfirmDialog` with:
- Title: "Delete session"
- Description: "This archived session and all its messages will be permanently deleted. This action cannot be undone."
- Confirm label: "Delete permanently"
- Variant: `destructive`

This is the standard `ConfirmDialog` because there is no archive option when the session is already archived.

**List view (BUG-02)**: In list view, the archived row renders the same two icon buttons in the Actions cell, always visible (no hover reveal, matching the card behavior).

### API call for Unarchive

`PATCH /sessions/{id}` with `{ archived_at: null }`. Verify with backend contract. On success: invalidate `keys.sessions.all`. Toast: "Session restored."

### Accessibility

- Both buttons have `aria-label` with the session name.
- Tab order: Unarchive → Delete.
- Both buttons are always keyboard-reachable on archived cards (no opacity-0 hidden state that could trap focus).

### Mobile behavior

Archived card two-button group: visible at all widths. No hover reveal.
Non-archived card trash: always visible on mobile (current behavior preserved — `sm:opacity-0 sm:group-hover:opacity-100` is the existing pattern; on mobile the button is always visible).

---

## BUG-05 — Bulk session selection and group operations

**Mockup required**: YES — `docs/web/mockups/sessions-bulk-select.svg`

### UX pattern: checkbox per card/row + sticky bottom action bar

### Checkbox placement

**Grid view (tile)**: Checkbox appears in the top-left corner of the card, overlapping the card border. It is visible only on hover (desktop) or when any session is selected (touch / always-on mode).

```
<!-- Checkbox overlay on SessionCard -->
<div class="absolute top-2 left-2 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100"
     style shown when isAnySelected>
  <Checkbox
    checked={isSelected}
    onCheckedChange={(checked) => handleSelect(session.id, checked)}
    aria-label="Select session: {name}"
    className="border-zinc-400 bg-white data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
    onClick={(e) => e.stopPropagation()}
  />
</div>
```

When `isSelected === true`, the card gets a selection ring:
- `ring-2 ring-teal-600 ring-offset-2` applied to the `Card` component

Card opacity when selected: no dimming. The ring is the selection signal. Do not use `opacity-75` — it makes the selected state read as "diminished" rather than "chosen."

**List view (row)**: Checkbox is always visible in the leftmost column (before the Name column).

```
<TableHead class="w-10">
  <Checkbox
    checked={allSelected}
    onCheckedChange={handleSelectAll}
    aria-label="Select all sessions"
  />
</TableHead>
...
<TableCell class="w-10">
  <Checkbox
    checked={isSelected(s.id)}
    onCheckedChange={(checked) => handleSelect(s.id, checked)}
    aria-label="Select session: {s.name}"
    onClick={(e) => e.stopPropagation()}
  />
</TableCell>
```

### Bulk action bar

A sticky bar that appears at the bottom of the page (above the viewport bottom edge) when ≥1 session is selected.

```
<!-- Sticky bulk action bar — conditionally rendered -->
{selectedIds.size > 0 && (
  <div class="fixed bottom-0 left-0 right-0 lg:left-[220px] z-20 flex items-center justify-between gap-4 border-t border-zinc-200 bg-white px-6 py-3 shadow-md">
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-zinc-900">{selectedIds.size} selected</span>
      <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-700" onClick={handleClearSelection}>
        Clear
      </Button>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="min-h-9 gap-1.5"
        onClick={handleBulkArchive}
        disabled={bulkMutationPending}
      >
        {bulkArchivePending ? <Loader2 class="size-3.5 animate-spin" /> : <Archive class="h-3.5 w-3.5" />}
        Archive
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="min-h-9 gap-1.5"
        onClick={handleBulkDeleteConfirm}
        disabled={bulkMutationPending}
      >
        <Trash2 class="h-3.5 w-3.5" />
        Delete permanently
      </Button>
    </div>
  </div>
)}
```

**Bar positioning**: `fixed bottom-0`. On desktop (`lg:left-[220px]`) to account for the 220px sidebar. The sidebar width is a fixed known value — this is an accepted layout hardcode consistent with how the app shell works.

**"Select all"**: Handled by the list view checkbox in the TableHead. In grid view, add a "Select all" link-style button inside the bulk bar left side, after the count:

```
<Button variant="link" size="sm" className="text-teal-600 h-auto p-0" onClick={handleSelectAll}>
  Select all
</Button>
```

### DS tokens

| Element | Classes |
|---|---|
| Checkbox (unselected) | shadcn default — `border-zinc-400` override |
| Checkbox (selected) | `data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600` |
| Card selection ring | `ring-2 ring-teal-600 ring-offset-2` |
| Bulk bar container | `fixed bottom-0 left-0 right-0 lg:left-[220px] z-20 border-t border-zinc-200 bg-white px-6 py-3 shadow-md` |
| Count text | `text-sm font-medium text-zinc-900` |
| Clear button | `variant="ghost" size="sm" text-zinc-500 hover:text-zinc-700` |
| Archive bulk button | `variant="outline" size="sm" min-h-9 gap-1.5` |
| Delete bulk button | `variant="destructive" size="sm" min-h-9 gap-1.5` |

### Interaction states

| State | Treatment |
|---|---|
| No selection | Checkboxes hidden on hover (grid) / visible but unchecked (list). Bulk bar absent. |
| 1+ selected (grid) | Checkboxes remain visible on all cards. Bulk bar appears. Selected cards: teal ring. |
| Select all | All checkboxes checked. Count shows total. |
| Bulk archive pending | Archive button shows spinner. Delete disabled. Clear enabled. |
| Bulk archive success | Deselect all. Invalidate query. Toast: "N sessions archived." |
| Bulk delete pending | ConfirmDialog appears first. On confirm: Delete button shows spinner. Archive disabled. |
| Bulk delete success | Deselect all. Invalidate query. Toast: "N sessions deleted." |

**Bulk delete confirmation**: Before executing bulk delete, show a standard `ConfirmDialog`:
- Title: "Delete {N} sessions"
- Description: "These sessions and all their messages will be permanently deleted. This action cannot be undone."
- Confirm label: "Delete {N} sessions"
- Variant: `destructive`

### State management

Add to `useUIStore` (Zustand):
- `selectedSessionIds: Set<string>` (or `string[]`)
- `toggleSessionSelection(id: string): void`
- `clearSessionSelection(): void`
- `selectAllSessions(ids: string[]): void`

Reset `selectedSessionIds` on session delete/archive success and on page unmount.

### Accessibility

- All checkboxes have `aria-label` including the session name.
- "Select all" checkbox in list view header: `aria-label="Select all sessions"`.
- Bulk bar: `role="toolbar"` with `aria-label="Bulk session actions"`.
- When bulk bar appears: focus remains on the last interacted checkbox. Do not shift focus to the bar automatically.
- `aria-live="polite"` region announces "{N} sessions selected" updates to screen readers.

### Mobile behavior (390px)

- Grid view: checkboxes are always visible (no hover reveal) when any session is selected. The card tap target remains the card body; checkbox tap is separate (stopPropagation).
- Bulk bar at 390px: stacks vertically. Count + Clear on first row, Archive + Delete on second row.
- List view checkbox column is always visible at all widths.

### Mockup instructions for graphic_designer

Produce `docs/web/mockups/sessions-bulk-select.svg` showing:
1. Grid view (1440px): 3 sessions selected — checkboxes visible, teal ring on selected cards, bulk bar at bottom.
2. List view (1440px): 2 rows selected (checkbox column visible), bulk bar at bottom.
3. Mobile (390px): grid view with 1 card selected, bulk bar stacked layout.

---

## BUG-06 — Edit session model via inline popover

**Mockup required**: YES — `docs/web/mockups/session-model-popover.svg`

### Part A: SessionCard model chip (tile and list view)

The current model subtitle text is plain `text-sm text-zinc-500`. Make it interactive — clicking it opens a `Popover` with a model `Select`.

```
<!-- In SessionCard, replace the subtitle span -->
<Popover>
  <PopoverTrigger asChild>
    <button
      class="flex items-center gap-1 rounded px-1 -mx-1 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors duration-150 cursor-pointer"
      aria-label="Change model for session: {name}"
      onClick={(e) => e.stopPropagation()}
    >
      {model}
      <ChevronDown class="h-3 w-3" />
    </button>
  </PopoverTrigger>
  <PopoverContent class="w-56 p-2" align="start">
    <p class="mb-1.5 px-1 text-xs font-medium text-zinc-500">Change model</p>
    <Select value={currentModel} onValueChange={handleModelChange}>
      <SelectTrigger class="min-h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__default__">Default</SelectItem>
        {models.map(m => <SelectItem key={m.alias} value={m.alias}>{m.alias}</SelectItem>)}
      </SelectContent>
    </Select>
    <p class="mt-2 px-1 text-xs text-zinc-500">Save on select</p>
  </PopoverContent>
</Popover>
```

Install `Popover` via `pnpm dlx shadcn@latest add popover` if not present.

**Save on select**: `onValueChange` fires immediately when user picks a model. No explicit "Save" button. The mutation runs immediately. On success: close popover, toast "Model updated." On error: toast error, popover remains open.

**DS tokens for model chip button**:
- Rest: `text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded px-1 -mx-1`
- ChevronDown: `h-3 w-3` (smaller than standard to match the `text-sm` context)
- Popover: `w-56 p-2` — compact, not a full dialog

### Part B: List view row model cell

Same pattern — the model cell in the list view becomes the same `Popover`-triggered button.

### Part C: General tab — Default model select field

In `ConfigFlagsForm`, add a "Default model" Select field above the feature-flag divided list. This maps to `ConfigOut.model` / `ConfigPatchRequest.model`.

```
<!-- Inside ConfigFlagsForm, above the divide-y list -->
<div class="space-y-1.5 pb-4">
  <Label htmlFor="default-model">Default model</Label>
  <p class="text-xs text-zinc-500">New sessions without a specified model will use this.</p>
  <Select value={config?.model ?? "__default__"} onValueChange={handleDefaultModelChange} disabled={!isAdmin}>
    <SelectTrigger id="default-model" className="min-h-11 w-full sm:w-64">
      <SelectValue placeholder="System default" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="__default__">System default</SelectItem>
      {models.map(m => <SelectItem key={m.alias} value={m.alias}>{m.alias}</SelectItem>)}
    </SelectContent>
  </Select>
</div>
<hr class="border-zinc-200 mb-4" />
<!-- divide-y list continues below -->
```

**Admin gate**: `disabled={!isAdmin}` — non-admin users see the field but cannot change it.

**Save on select**: Same as Part A — immediate mutation on `onValueChange`. API: `PATCH /config` with `{ model: newAlias }` or `{ model: null }` for "System default". Toast on success/error.

### DS tokens (Part C)

| Element | Classes |
|---|---|
| Label | `text-sm font-medium text-zinc-900` |
| Help text | `text-xs text-zinc-500` |
| Select trigger | `min-h-11 w-full sm:w-64` |
| Section separator | `border-zinc-200` `<hr>` |

### Interaction states (model chip)

| State | Treatment |
|---|---|
| Rest | `text-zinc-500` — looks like subtitle text with subtle ChevronDown hint |
| Hover | `bg-zinc-100 text-zinc-900` |
| Popover open | Popover visible. Card click propagation stopped. |
| Mutation pending | Select trigger shows `opacity-60 cursor-wait`. Close button hidden temporarily. |
| Mutation success | Popover closes. Model subtitle updates. Toast success. |
| Mutation error | Popover remains. Select reverts. Toast error. |

### Accessibility

- Model chip button: `aria-label="Change model for session: {name}"`.
- Popover content: role is implicitly `dialog` via Popover component.
- Select has `id` and associated `Label` inside popover.
- `e.stopPropagation()` on the button prevents card navigation click from firing.

### Mobile behavior (390px)

- SessionCard tile: model chip is always visible as tappable element (not hover-only).
- Popover: `align="start"` ensures popover opens downward from the chip without clipping viewport edge.
- `PopoverContent`: `w-56` — sufficient for model alias display without overflowing 390px.

### Mockup instructions for graphic_designer

Produce `docs/web/mockups/session-model-popover.svg` showing:
1. SessionCard tile with model chip hovered (zinc-100 bg, visible ChevronDown).
2. Same card with Popover open — popover positioned below the chip with model Select expanded.
3. List view row with model cell popover open.
4. General tab Settings showing Default model Select field above the divided list.

---

## BUG-07 — Provider health check: fixed-width result slot

**Mockup required**: NO — fully specified here.

### Problem

When a health check result appears (`CheckCircle2`/`XCircle` + latency text), it is rendered in a `flex items-center gap-2` div inside the Health table cell, after the Check button. This causes the cell to expand horizontally when the result appears.

### UX pattern: fixed-width result slot

Reserve `min-w-[7rem]` for the result display area, adjacent to the Check button. The slot is always present — it shows nothing initially, then shows the result after the check.

```
<TableCell>
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      className="min-h-11 gap-1.5"
      onClick={() => healthCheckMutation.mutate(provider.name)}
      disabled={isChecking}
      aria-label={`Check health of ${provider.name}`}
    >
      {isChecking ? (
        <Loader2 class="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Activity class="h-4 w-4" />
          Check
        </>
      )}
    </Button>
    <!-- Fixed-width result slot: always present, empty before first check -->
    <span class="inline-flex min-w-[7rem] items-center gap-1 text-xs" aria-live="polite" aria-atomic="true">
      {health === undefined ? null :
       health === null ? (
        <>
          <XCircle class="h-4 w-4 shrink-0 text-red-600" />
          <span class="text-red-600">Check failed</span>
        </>
       ) : health.reachable ? (
        <>
          <CheckCircle2 class="h-4 w-4 shrink-0 text-green-600" />
          <span class="text-green-700">{health.latency_ms != null ? `${health.latency_ms}ms` : "OK"}</span>
        </>
       ) : (
        <>
          <XCircle class="h-4 w-4 shrink-0 text-red-600" />
          <span class="text-red-600">Unreachable</span>
        </>
       )
      }
    </span>
  </div>
</TableCell>
```

**Why `min-w-[7rem]`**: "Unreachable" at `text-xs` with its `XCircle` icon requires approximately 7rem. This is the longest string in the result set. `min-w` (not `w-`) allows the slot to grow if needed but never causes the row to shrink when the result appears.

**Why `aria-live="polite" aria-atomic="true"` on the slot**: The health result updates asynchronously. `aria-live="polite"` announces the result without interrupting ongoing narration. `aria-atomic="true"` ensures the full content (icon + text) is announced together.

**Row height**: The button's `min-h-11` ensures the row does not change height between the no-result and result states. No separate height management is needed.

### DS tokens

No new tokens. All values come from §1 color palette:
- Success: `text-green-600` (icon), `text-green-700` (text)
- Error: `text-red-600` (icon + text)
- Result slot: `min-w-[7rem]` — `[7rem]` is an arbitrary value, but 112px is intentional and documented here. It is the minimum width to avoid layout shift.

---

## BUG-08 — Add provider: mockup-level FLAG for future sprint

**Mockup required**: NO (FLAG only)

### Assessment

The Cogtrix backend currently treats providers as config-file-defined records loaded at startup. The `ProviderOut` schema has no `POST /providers` endpoint in the OpenAPI spec. Providers are created by editing the YAML config file and reloading (or running the Setup Wizard).

**Ruling**: Adding a "Add provider" UI without backend support would be deceptive. This feature must not be implemented as a runtime UI until the backend exposes a provider creation endpoint.

**Action**: Register as DS §16 deferred item FEAT-001.

Design spec when backend is ready: An "Add provider" inline form matching the existing "Add model" form pattern (see BUG-09 for the form surface treatment). Fields: Provider type (Select: ollama/openai/anthropic/google), Provider name (Input), Base URL (Input, optional), API Key (Input, `type="password"`, optional). The form appears below the Providers table, toggled by the "+ Add provider" ghost row at the table bottom (BUG-09 pattern). No mockup is produced now — the brief will be written when the backend surface is confirmed.

---

## BUG-09 — Add model / provider button placement: ghost row pattern

**Mockup required**: YES — `docs/web/mockups/settings-add-row-ghost.svg`

### Decision: ghost row at bottom of table (Option A)

A full-width dashed-border ghost row at the bottom of the Models table is the better pattern for this context. Rationale:
- The current "Add model" outline button top-right creates a visual gap between the section heading and the table that looks like the button belongs to a different context.
- Ghost rows are a proven pattern for in-table creation (Notion, Linear, GitHub). They keep the "add" action co-located with the content it creates.
- The ghost row also handles the future "Add provider" flow without introducing a second pattern.

### Component hierarchy

```
<!-- Inside the overflow-x-auto border-zinc-200 wrapper, after TableBody -->
{isAdmin && (
  <tfoot>
    <tr>
      <td
        colspan={3}
        class="border-t border-dashed border-zinc-300 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors duration-150"
        role="button"
        tabIndex={0}
        aria-label="Add model"
        onClick={handleAddModelOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAddModelOpen(); }}
      >
        <span class="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
          <Plus class="h-4 w-4" />
          Add model
        </span>
      </td>
    </tr>
  </tfoot>
)}
```

**Dashed border**: `border-t border-dashed border-zinc-300`. The dashed style signals "this is not a data row — it is an affordance." Solid border would blend with regular row separators. `border-zinc-300` (rather than `border-zinc-200`) gives the dash pattern sufficient contrast.

**Text and icon**: `text-zinc-500` at rest, `hover:text-zinc-900`. `Plus` icon at `h-4 w-4`. Text: "Add model" (no `+` prefix — the icon provides that signal).

### When the add form is open

The ghost row disappears and is replaced by the existing inline form panel. The form panel appears below the table (not inside it) — the current `addModelOpen` pattern using `mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4` block is retained. The only change is removing the top-right "Add model" outline button and replacing its click handler with the ghost row's click handler.

**Closing the form**: An explicit "Cancel" link button (ghost, `text-zinc-500`) inside the form closes it. The "✕" affordance is familiar.

### DS tokens for ghost row

| Element | Classes |
|---|---|
| `td` (full-width) | `border-t border-dashed border-zinc-300 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors duration-150` |
| Label text | `text-sm text-zinc-500` |
| Hover label | `hover:text-zinc-900` |
| Plus icon | `h-4 w-4` (inherits text color) |

### Accessibility

- `td` has `role="button"` and `tabIndex={0}`.
- `aria-label="Add model"` on the `td`.
- `onKeyDown`: Enter and Space trigger the open handler.
- When form opens: focus moves to the first form input (Provider Select).

### Mobile behavior (390px)

- The ghost row spans the full table width at all breakpoints (no column alignment needed since it uses `colspan`).
- At 390px the inline form collapses to single-column (existing `flex-col sm:flex-row` pattern retained).

### Mockup instructions for graphic_designer

Produce `docs/web/mockups/settings-add-row-ghost.svg` showing:
1. Models table with ghost row at bottom (dashed border, "Add model" text + Plus icon, zinc-500 text).
2. Ghost row hovered state (zinc-50 bg, zinc-900 text).
3. Ghost row clicked — form panel appears below the table, ghost row gone.
Annotate: "ghost row replaces top-right 'Add model' button."

---

## BUG-10 — Wizard YAML: syntax highlighting + copy/download

**Mockup required**: NO — the CodeBlock pattern is specified in DS §7 and can be directly adapted.

### Current state

`SetupWizard.tsx` line 331 renders a plain `<pre>` for `yaml_preview`:

```tsx
<pre className="max-h-64 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-900">
  {step.yaml_preview}
</pre>
```

### UX pattern: YamlBlock component

The existing `CodeBlock` component in `src/components/MarkdownComponents.tsx` does NOT use a syntax highlighter — it renders children directly (no color tokens). It uses `bg-zinc-50 border border-zinc-200` (light theme).

For the YAML wizard preview, use a dark surface (matches terminal/config file conventions and increases visual distinction from the surrounding page). This requires a new `YamlBlock` component, not a reuse of `CodeBlock`. The existing `CodeBlock` is not modified (§13: never modify `src/components/ui/`; extension via new wrapper component).

**Syntax highlighting assessment**: The current codebase has NO syntax highlighter installed (the `MarkdownComponents.tsx` `CodeBlock` renders raw children). Installing `react-syntax-highlighter` or `shiki` would be the correct approach.

- **Preferred**: `shiki` (tree-sitter, zero-runtime, accurate) — but requires SSR-safe setup.
- **Simpler**: `react-syntax-highlighter` with the `tomorrow-night` or `atom-one-dark` theme — direct React component, no build config changes needed.

**Decision**: Use `react-syntax-highlighter` with `atomOneDark` theme for the YAML block only. Rationale: minimal bundle impact (the wizard page is a rare-use settings tab), no build config changes, proven compatibility with Vite + React 19. Install: `pnpm add react-syntax-highlighter @types/react-syntax-highlighter`.

**Design spec for `YamlBlock`**:

```
Outer container: relative rounded-lg border border-zinc-700 overflow-hidden
Header bar: flex items-center justify-between bg-zinc-800 px-3 py-1.5
  Left: <span class="font-mono text-xs text-zinc-400">yaml</span>
  Right: two icon buttons (gap-1):
    Copy button
    Download button
Code area: react-syntax-highlighter with atomOneDark theme, language="yaml"
  customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.75rem', maxHeight: '16rem', overflowY: 'auto' }}
```

**Copy button** (same pattern as existing CodeBlock):
- Icon: `Clipboard` → `Check` for 2s after copy
- `variant="ghost"` `size="icon"` `className="h-6 w-6 text-zinc-400 hover:text-zinc-100"`
- `aria-label={copied ? "Copied" : "Copy YAML"}`
- `onClick`: `navigator.clipboard.writeText(yaml)` → setCopied(true) → setTimeout reset

**Download button**:
- Icon: `Download` from lucide
- `variant="ghost"` `size="icon"` `className="h-6 w-6 text-zinc-400 hover:text-zinc-100"`
- `aria-label="Download YAML configuration"`
- `onClick`:
  ```ts
  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cogtrix.yaml";
  a.click();
  URL.revokeObjectURL(url);
  ```
  No side effects on other state. No toast needed — the browser download dialog is sufficient feedback.

**Container border**: `border-zinc-700` (not `border-zinc-200`) — the dark block requires a dark-appropriate border.

**Max height**: `16rem` (256px) inside the `customStyle` — matches `max-h-64`. Scrollable vertically.

**DS tokens**:

| Element | Classes / value |
|---|---|
| Outer container | `relative rounded-lg border border-zinc-700 overflow-hidden` |
| Header bar | `flex items-center justify-between bg-zinc-800 px-3 py-1.5` |
| Language label | `font-mono text-xs text-zinc-400` |
| Icon buttons | `h-6 w-6 text-zinc-400 hover:text-zinc-100` (ghost, icon size) |
| Code block theme | `atomOneDark` (react-syntax-highlighter) |
| Font size | `0.75rem` (12px = text-xs) |
| Max height | `256px` (max-h-64 equivalent) |

**Where to use YamlBlock**: In `SetupWizard.tsx`, replace the `<pre>` in the `wizardState === "complete"` branch. Also apply if any future wizard step shows YAML preview.

### Accessibility

- Copy button: `aria-label` changes between "Copy YAML" and "Copied" (same pattern as existing CodeBlock).
- Download button: `aria-label="Download YAML configuration"`.
- The code block itself: `<code>` inside the syntax highlighter has `aria-label="YAML configuration"` or a `<figure>` wrapper with a `<figcaption>`.
- Screen readers: the YAML content is accessible as text regardless of syntax highlighting (the highlighter outputs standard HTML spans).

### Mobile behavior (390px)

- The block is `max-w-xl mx-auto` (matching the wizard's `max-w-xl` container).
- At 390px, horizontal scroll is enabled inside the code area (`overflowX: 'auto'` in `customStyle`).
- Copy and Download buttons remain in the header bar at full size.

---

## Summary: Mockup files required

| Bug | Mockup file | Priority |
|---|---|---|
| BUG-01 | `docs/web/mockups/settings-models-v2.svg` | High |
| BUG-02 | `docs/web/mockups/sessions-view-toggle.svg` | High |
| BUG-03 | `docs/web/mockups/session-remove-dialog.svg` | High |
| BUG-04 | No mockup — spec is sufficient | — |
| BUG-05 | `docs/web/mockups/sessions-bulk-select.svg` | High |
| BUG-06 | `docs/web/mockups/session-model-popover.svg` | Medium |
| BUG-07 | No mockup — spec is sufficient | — |
| BUG-08 | No mockup — FLAG only | — |
| BUG-09 | `docs/web/mockups/settings-add-row-ghost.svg` | Medium |
| BUG-10 | No mockup — CodeBlock variant is specified | — |

---

## New shadcn/ui components to install

| Component | Install command | Bug |
|---|---|---|
| `radio-group` | `pnpm dlx shadcn@latest add radio-group` | BUG-01 |
| `popover` | `pnpm dlx shadcn@latest add popover` | BUG-06 |
| `checkbox` | `pnpm dlx shadcn@latest add checkbox` | BUG-05 |

Check if `checkbox` and `popover` are already present in `src/components/ui/` before installing.

## New npm packages to install

| Package | Install command | Bug |
|---|---|---|
| `react-syntax-highlighter` | `pnpm add react-syntax-highlighter @types/react-syntax-highlighter` | BUG-10 |

## New Zustand store additions

| Store | New fields | Bug |
|---|---|---|
| `ui-store` | `sessionsView: "grid" \| "list"` | BUG-02 |
| `ui-store` | `selectedSessionIds: Set<string>` + selection actions | BUG-05 |
