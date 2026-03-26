# ConfirmDialog — Design Brief

**Status**: Pending mockup
**Author**: web_designer
**Date**: 2026-03-22
**Target file**: `src/components/ConfirmDialog.tsx`
**Call site audited**: `src/pages/sessions.tsx` (session deletion), `src/components/SessionCard.tsx` (trigger button)
**Design system version**: 2.3

---

## Audit findings — all issues

### Issue 1 — Wrong copy: "Archive" vs "Delete" (REPORTED — CRITICAL)

The mutation in `sessions.tsx` calls `api.delete<null>(\`/sessions/\${id}\`)`. There is no archive endpoint and no unarchive capability in the API. The dialog title "Archive session" and confirm label "Archive" misrepresent the action to the user. The session is permanently deleted.

Correct copy:
- Title: `Delete session`
- Description: `This session and all its messages will be permanently deleted. This action cannot be undone.`
- Confirm label: `Delete`

The original description ("This session will be archived and removed from your dashboard") must also be replaced — it implies reversibility ("archived") and understates consequence ("removed from your dashboard" downplays permanent data loss).

### Issue 2 — Button height mismatch (REPORTED — HIGH)

`Cancel` has `min-h-11` (44px) but the confirm `Button` has no `min-h-11` class. shadcn/ui New York `Button` default height is `h-9` (36px). This causes the two buttons to render at different heights inside the `DialogFooter`.

Fix: add `min-h-11` to the confirm button. Both buttons must share the same 44px minimum height. This also aligns with the §3 touch target minimum documented for interactive elements.

### Issue 3 — No warning icon in the header (NEW — MEDIUM)

The dialog header contains only a title and description text — no visual affordance that this is a destructive action. For a non-reversible delete, a warning icon anchors the user's attention and signals severity before they read the copy.

`sessions.tsx` already imports `AlertTriangle` from lucide-react (used in the error state of the session grid). This icon is the correct choice for irreversible destructive actions per §10 Iconography.

The icon must appear inside `DialogHeader`, left-aligned with the title, sized at `w-5 h-5` (20px — "in buttons" context), colored `text-red-600` (§1 WCAG AA note: `text-red-600` not `text-red-500` on white surfaces). It sits to the left of the `DialogTitle` text, in an `inline-flex items-center gap-2` row. Do not use the 48px empty-state size — this is a compact modal, not an illustration.

Rationale: The design system (§1) specifies `--destructive` as `text-red-600 / bg-red-600` for destructive actions. An icon at this size paired with the red confirm button creates two reinforcing visual cues that the action is irreversible, without adding a third-party alert pattern.

### Issue 4 — Spinner replaces entire label on confirm button during pending state (NEW — LOW)

The current confirm button renders `{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}`. When `isPending` is true, the label disappears entirely, replaced by the spinner. This causes the button to narrow (spinner is narrower than the label text) and lose semantic content for screen readers.

Fix: render both the spinner and the label together during pending: `{isPending && <Loader2 className="h-4 w-4 animate-spin" />}{confirmLabel}`. The button width remains stable and the label remains visible. The `aria-disabled` or `disabled` attribute on the button already communicates the in-progress state to screen readers — the label does not need to disappear.

Additionally, adding `aria-busy="true"` to the confirm button when `isPending` is true provides an explicit machine-readable loading signal.

### Issue 5 — Cancel button disabled during pending has no rationale comment, but the behaviour itself is correct (NEW — INFORMATIONAL)

Disabling Cancel while `isPending` is the correct UX for a mutation that cannot be cancelled mid-flight. This is not a bug. However, the `onOpenChange` handler in `sessions.tsx` has no guard against the dialog closing via the backdrop click while `isPending` is true — the `Dialog` will still call `onOpenChange(false)` if the user clicks outside the dialog, bypassing the disabled Cancel button.

Fix: guard the `onOpenChange` prop to reject close events while `isPending`:

```tsx
onOpenChange={(open) => {
  if (!open && archiveMutation.isPending) return;
  if (!open) setArchiveTarget(null);
}}
```

This is a call-site fix in `sessions.tsx`, not a fix inside `ConfirmDialog` itself — the component should not own the "is operation cancellable" decision.

### Issue 6 — `variant` prop defaults to `"destructive"` but accepts `"default"` — misleading for callers (NEW — LOW)

The prop signature allows `variant?: "destructive" | "default"`. The `default` variant (violet) on a confirm button that replaces a label with a spinner and disables Cancel implies a permanent action — using `default` here would visually lie about severity. The interface accepts a non-destructive variant but the component is named `ConfirmDialog` and wired for irreversible confirmation patterns.

This is a documentation-level issue, not a visual bug. The brief calls out that any non-destructive use of `ConfirmDialog` should be deliberately reviewed — if the action is reversible, a `default`-variant confirm button is appropriate; if it is irreversible, `destructive` must be used. The `variant` prop may be retained for flexibility but the caller is responsible for semantic accuracy.

No visual change required for this issue. Document in code via a JSDoc comment on the interface (out of scope for visual implementation but flagged for `web_coder`).

### Issue 7 — `DialogFooter` button order (NEW — MEDIUM)

shadcn/ui `DialogFooter` renders children left-to-right on desktop and stacked (column) on mobile. The current order is `[Cancel] [Confirm]` — Cancel is first in DOM order. On desktop this is correct: Cancel left, Confirm right. On mobile (stacked), the DOM order places Cancel above the confirm button, which is the reverse of convention (primary action should be at the bottom / most reachable position on mobile).

The standard shadcn/ui `DialogFooter` applies `flex-col-reverse sm:flex-row` by default (New York style). This means on mobile, the last child renders at the top — so putting the confirm button last in DOM order results in it appearing at the top on mobile (visually first, which is wrong for a destructive action: the user should have to scroll past a safety pause).

Verify the shadcn/ui New York `DialogFooter` class. If it uses `flex-col-reverse`, the DOM order `[Cancel] [Confirm]` renders as:
- Desktop: Cancel left, Confirm right — correct.
- Mobile: Confirm top, Cancel below — this is correct for a primary action but arguably wrong for a destructive action where Cancel should be the "easy" tap.

For a destructive confirm dialog specifically, the preferred mobile layout is Cancel at top (easy reach), Confirm below (requires intent). This means DOM order should be `[Confirm] [Cancel]` when `flex-col-reverse` is in effect, which reverses to Cancel-top on mobile, Confirm-top on desktop — wrong for desktop.

Resolution: add `sm:flex-row-reverse` to the `DialogFooter` or reverse DOM order to `[Confirm] [Cancel]` and verify the shadcn/ui `flex-col-reverse` behavior produces the intended mobile layout. The implementor must inspect the actual rendered output. This brief mandates: desktop = Cancel left / Confirm right, mobile = Cancel top / Confirm below.

### Issue 8 — Trigger button label on SessionCard says "Archive" (NEW — HIGH)

`SessionCard.tsx` line 82: `aria-label={\`Archive session: \${session.name}\`}`. If the action is renamed to Delete, the aria-label must be updated to `Delete session: ${session.name}` to match the dialog. The `data-cy="archive-session"` Cypress selector is a test concern, not a visual one — the implementor should update the test ID to `data-cy="delete-session"` for consistency, and update any Cypress specs that reference it.

The `Trash2` icon on the trigger button is correct for a delete action — no change needed to the icon.

---

## Corrected component specification

### Props (unchanged interface, copy expectations updated)

```
open: boolean
onOpenChange: (open: boolean) => void
title: string               -- caller must pass "Delete session"
description: string         -- caller must pass the exact copy below
confirmLabel?: string       -- caller must pass "Delete"; default "Confirm" is too generic
onConfirm: () => void
variant?: "destructive" | "default"   -- must be "destructive" for irreversible actions
isPending?: boolean
```

### Exact copy for session deletion call site

```
title:       Delete session
description: This session and all its messages will be permanently deleted. This action cannot be undone.
confirmLabel: Delete
variant:      destructive
```

### Visual layout

```
┌─────────────────────────────────────────────┐
│  [X]                                        │  <- shadcn/ui close button, top-right
│                                             │
│  [!] Delete session                         │  <- DialogTitle: AlertTriangle w-5 h-5
│                                             │     text-red-600, inline-flex items-center gap-2
│  This session and all its messages will     │  <- DialogDescription: text-sm text-zinc-500
│  be permanently deleted. This action        │     leading-normal
│  cannot be undone.                          │
│                                             │
│  ┌──────────────┐  ┌──────────────────────┐ │  <- DialogFooter
│  │    Cancel    │  │       Delete         │ │     gap-2, justify-end
│  └──────────────┘  └──────────────────────┘ │     Cancel: variant="outline" min-h-11
│                                             │     Delete: variant="destructive" min-h-11
└─────────────────────────────────────────────┘
```

Desktop: Cancel left, Delete right. Both buttons 44px tall minimum. Dialog max-w-md.

Mobile (stacked): Cancel above, Delete below. `DialogFooter` stacks children; the order must produce this layout — verify against shadcn/ui `flex-col-reverse` behavior.

### DialogHeader icon treatment

- Element: `AlertTriangle` from lucide-react
- Size: `w-5 h-5` (20px)
- Color: `text-red-600`
- strokeWidth: default (2) — icon is not at empty-state size
- Container: wrap the title and icon together: `<div className="inline-flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" /><span>{title}</span></div>` inside `DialogTitle`
- Alternative: if `DialogTitle` renders a heading element, the icon sits before the text inside the heading — do not break the heading into two separate DOM elements at the same heading rank

Do not place the icon above the title on its own line — this inflates the dialog height and creates a modal-alert pattern more suited to system-level interruptions. The icon belongs inline with the title for a compact, information-dense confirm dialog.

### Pending state (confirm button)

- Button is `disabled` (shadcn/ui handles `opacity-50` + `pointer-events-none`)
- `aria-busy="true"` attribute added when `isPending`
- Spinner (`Loader2 h-4 w-4 animate-spin`) renders to the left of the label text — both remain visible
- Example: `<Loader2 className="h-4 w-4 animate-spin" /> Delete` — label does not disappear
- Cancel button remains disabled during pending (current behavior is correct)
- Backdrop dismiss is guarded in the call site — see Issue 5

### Size and elevation

- `max-w-md` — no change
- No shadow on the dialog panel (shadcn/ui backdrop handles visual separation)
- Backdrop: `bg-black/50` (shadcn/ui default)
- Internal padding: shadcn/ui `DialogContent` default (`p-6`) — no override

---

## Mockup brief for graphic_designer

Produce one SVG mockup at `docs/web/mockups/confirm-dialog-delete-session.svg`.

**Viewport**: render the dialog centered on a dimmed white background (simulate `bg-black/50` backdrop by using `rgba(0,0,0,0.5)` fill on a full-width rect behind the dialog panel).

**Dialog panel**: white (`#ffffff`) rectangle, `rounded-xl` (`10px` border-radius), `max-w-md` (448px wide), no drop shadow. A close button (X icon, `text-zinc-400`, top-right) is required.

**Header region** (top, `p-6 pb-0`):
- Row: `AlertTriangle` icon (20px, stroke `#dc2626`) + title text "Delete session" (`text-xl font-semibold text-zinc-900`), `gap-2` between icon and text, `inline-flex items-center`
- Below the title row: description text "This session and all its messages will be permanently deleted. This action cannot be undone." — `text-sm`, color `#71717a` (zinc-500), `leading-normal`, flowing across two lines at this dialog width

**Footer region** (bottom, `p-6 pt-4`):
- `flex justify-end gap-2`
- Left button: "Cancel" — `variant="outline"`, height 44px, `rounded-md`, `border border-zinc-200`, `text-sm font-medium text-zinc-900`, horizontal padding `px-4`
- Right button: "Delete" — `variant="destructive"`, height 44px, `rounded-md`, background `#dc2626` (red-600), text `#ffffff`, `text-sm font-medium`, horizontal padding `px-4`
- Both buttons at the same 44px height — this is the primary visual correction to verify in the mockup

**Pending state variant** (second artboard in same SVG, or an annotation box):
- Confirm button shows spinner (16px, white, left of label) + "Delete" label text — button does not narrow
- Cancel button: same size, `opacity-50`

**Do not include**:
- Any gradient or decorative background
- Shadow on the dialog panel
- A second icon above the title on its own line
- Any color other than those specified above

**Mobile layout** (optional third artboard, 375px wide):
- Full-width dialog (16px side margins → 343px dialog)
- Buttons stacked vertically, each full-width
- Cancel above, Delete below
- Both buttons remain 44px tall

---

## Call-site changes required (sessions.tsx)

These are implementation notes for `web_coder`, not mockup scope:

1. Change `title="Archive session"` to `title="Delete session"`
2. Change `description="..."` to `description="This session and all its messages will be permanently deleted. This action cannot be undone."`
3. Change `confirmLabel="Archive"` to `confirmLabel="Delete"`
4. Add backdrop-dismiss guard to `onOpenChange` (see Issue 5)
5. Rename state variable `archiveTarget` to `deleteTarget` and handler `handleArchive` to `handleDelete` for semantic accuracy
6. Remove unused `AlertTriangle` import if it is no longer used at the call site after the icon moves into `ConfirmDialog`

## Call-site changes required (SessionCard.tsx)

1. Change `aria-label={\`Archive session: \${session.name}\`}` to `aria-label={\`Delete session: \${session.name}\`}`
2. Change `data-cy="archive-session"` to `data-cy="delete-session"` — update all Cypress specs that reference this selector
3. Rename `onArchive` prop to `onDelete` and update the interface accordingly in both `SessionCard.tsx` and `sessions.tsx`

## ConfirmDialog.tsx changes required

1. Add `AlertTriangle` import from lucide-react
2. Conditionally render icon inside `DialogTitle` when `variant === "destructive"` — or always render it if `title` warrants it (simpler: always show when `variant === "destructive"`)
3. Add `min-h-11` to the confirm button
4. Change pending state rendering to `{isPending && <Loader2 ... />}{confirmLabel}` — label stays visible
5. Add `aria-busy={isPending}` to the confirm button

---

## Design system update required

After the mockup is approved and the implementation is confirmed correct, update `design-system.md`:

- §5 Dialogs section: add a note that destructive confirmation dialogs include an `AlertTriangle` (w-5 h-5 text-red-600) inline with the `DialogTitle`.
- §5 Buttons section: add a note that all buttons inside `DialogFooter` use `min-h-11` to guarantee height parity.
- §12 Component inventory: update `Dialog` row — "confirmation" variant note to reference this brief.
- §16 Deferred Items: add an entry for the confirmed `flex-col-reverse` mobile button order once verified in implementation.
