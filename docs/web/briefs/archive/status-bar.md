# StatusBar — Design Brief

**Prepared by**: web_designer
**Date**: 2026-03-22
**Target**: graphic_designer
**Status**: Approved for mockup
**Component file**: `src/pages/chat/StatusBar.tsx`
**Mockup output path**: `docs/web/mockups/status-bar-collapsed.svg`, `docs/web/mockups/status-bar-expanded.svg`

---

## Purpose

The StatusBar is a persistent thin strip anchored between the `MessageList` and `MessageInput` in the session chat page. It gives the user a live read-out of tool activity without requiring them to open the Tools sidebar. It is the most compact tool status surface in the application.

It has two visual states:

- **Collapsed** (default): a single row showing the most recent tool entry — icon, tool name, status/duration — plus a ChevronUp button to expand.
- **Expanded**: a scrollable panel of all historical entries grows upward from the collapsed row, each with a timestamp prefix.

The StatusBar is invisible (renders nothing) when no tool has run in the current session. It appears on the first tool invocation and remains visible for the rest of the session, including when the agent is idle.

---

## Design Audit — Problems Found in Current Implementation

The following problems must be corrected in the approved design. Each is a design system violation or a UX deficiency, not a stylistic preference.

### 1. Color violation — `text-red-500` prohibited

**Severity**: High — WCAG AA failure.

The current implementation uses `text-red-500` for the error X icon and the "failed" label text. Design system §1 (v1.3) explicitly prohibits `text-red-500` on white or near-white surfaces: it yields approximately 2.9:1 contrast, below the WCAG AA 3:1 minimum for non-text graphics and below the 4.5:1 minimum for normal text. The surface here is `bg-zinc-50` (#fafafa), which is near-white.

**Required fix**: Replace all `text-red-500` with `text-red-600` (#dc2626, ~5.9:1 on zinc-50).

### 2. Color violation — timestamp text at `text-zinc-400`

**Severity**: High — WCAG AA failure for text content.

The timestamp column in the expanded history panel uses `text-zinc-400` (#a1a1aa). Design system §7 (v1.1 correction) explicitly states: "zinc-400 must not be used for text content. Text must use zinc-500 minimum for WCAG AA on zinc-50." On `bg-zinc-50`, zinc-400 yields approximately 2.4:1 contrast — far below the 4.5:1 minimum for normal text.

**Required fix**: Timestamps use `text-zinc-500` (#71717a, ~4.7:1 on zinc-50).

The duration/ellipsis trailing field in both collapsed and expanded rows also uses `text-zinc-400`. Same fix applies: `text-zinc-500`.

### 3. Focus ring missing `ring-offset-2`

**Severity**: Medium — accessibility gap.

The ChevronUp/Down toggle button uses `focus-visible:ring-zinc-400` without `ring-offset-2`. The design system §5 specifies `ring-2 ring-offset-2 ring-ring` as the standard focus treatment. Without `ring-offset-2`, the focus ring renders flush against the `bg-zinc-50` surface and is nearly invisible.

**Required fix**: Button focus ring must include `ring-offset-2`. The ring offset background on `bg-zinc-50` resolves correctly with shadcn/ui's defaults.

### 4. Chevron button hit target far below minimum

**Severity**: Medium — accessibility gap.

The toggle button uses `p-0.5` (2px padding) around a `size-3.5` (14px) icon, producing an approximately 18px hit target. Design system §3 and §4 specify a 44px minimum touch target (matching `min-h-11`).

**Required fix**: The toggle button must have a minimum hit area of `min-h-11 min-w-11` (44px). The visual icon inside remains small — only the hit area expands. Use `flex items-center justify-center` inside the button so the icon stays centered within the larger tappable zone.

### 5. Chevron icon size outside the design system scale

**Severity**: Low — design system deviation.

The current implementation uses `size-3.5` (14px) for the chevron icon. Design system §10 defines three valid sizes: 16px (`w-4 h-4`) for inline-with-text, 20px (`w-5 h-5`) for in-buttons, 24px (`w-6 h-6`) for standalone. 14px is not on the scale.

**Required fix**: Use `w-4 h-4` (16px). At the `text-xs` scale of the bar this is visually prominent but appropriate — the chevron is the primary interactive element on this strip and should not be smaller than the text it sits beside.

### 6. `font-mono` applied to tool names — incorrect semantic

**Severity**: Low — typography inconsistency.

The StatusBar sets `font-mono` on the entire component wrapper, meaning tool names (e.g., "web_search", "file_read") render in monospace. Design system §2 specifies `font-mono` for "code blocks, tool output, API key display." Tool names are labels, not code. Applying monospace to the full component conflates the timestamp and duration (which are data values that benefit from monospace for alignment) with the tool name label (which is a UI string).

**Required fix**: Remove `font-mono` from the component wrapper. Apply `font-mono tabular-nums` only to the timestamp span and the duration/ellipsis trailing span. The tool name renders in `font-sans` (the default body font). The icon slot and status indicator are not text and need no font class.

### 7. Expanded panel has no open/close transition

**Severity**: Low — animation system deviation.

The expanded history panel appears and disappears instantly (conditional render with no CSS transition). Design system §9 specifies panel open/close transitions at `duration-200 ease-in-out`. An instant appearance at this position in the layout is jarring — the panel pushes the MessageInput downward abruptly.

**Required fix**: The expanded panel must animate in. The recommended approach is a CSS max-height transition from `0` to the capped value, with `overflow-hidden` and `transition-all duration-200 ease-in-out`. Do not use JS-based height calculations. The mockup must show the expanded panel as the static end-state; the coder will handle the transition implementation.

### 8. Running state uses `bg-violet-400` — inconsistent with agent state convention

**Severity**: Low — minor inconsistency.

The running state pulse dot uses `bg-violet-400`. Design system §6 specifies agent activity dots as `bg-violet-600` with `animate-pulse`. The `ToolActivityRow` component (inline in the message list) also uses `bg-violet-400`, so this is internally consistent between the two tool-activity surfaces — but it deviates from the broader agent state convention.

**Decision**: Standardize the running state tool dot to `bg-violet-500` as a deliberate middle ground. Rationale: `bg-violet-600` with `animate-pulse` is reserved for the primary agent state badge in the header (§6). Tool activity is a secondary signal — using violet-500 maintains the violet = AI activity semantic while visually subordinating the tool dot relative to the header badge. This requires the same change in `ToolActivityRow`.

Note to web_coder: this change also applies to `src/pages/chat/ToolActivityRow.tsx`.

---

## Approved Design Specification

### Surface and typography

- Component wrapper: `border-t border-zinc-200 bg-zinc-50`
- Font: `font-sans text-xs` on the wrapper (not `font-mono`)
- The collapsed bar and expanded panel share the same surface treatment — there is no color change between states

The StatusBar sits directly above the MessageInput. The MessageInput has its own `border-t border-zinc-200 bg-white`. The two surfaces form a clear visual layer: zinc-50 (StatusBar) over white (MessageInput). Do not add extra borders or shadows between them.

### Collapsed state (default)

The collapsed bar is a single horizontal row. Measure: `px-4 py-1.5` (consistent with compact component padding from §3).

Layout from left to right:

```
[ Status dot | Tool name (flex-1, truncate) | Duration / ellipsis | ChevronUp button ]
```

**Status dot slot** (width: fixed `w-4`, `flex items-center justify-center`):
- Running: `inline-block size-1.5 rounded-full bg-violet-500 animate-pulse`
- Error: Lucide `X` icon, `w-4 h-4 text-red-600`
- Done: Lucide `Check` icon, `w-4 h-4 text-green-600`

**Tool name** (`min-w-0 flex-1 truncate text-zinc-700`):
- Font: `font-sans` (inherits from wrapper)
- Single line, truncates with ellipsis if too long

**Trailing status** (`shrink-0 font-mono tabular-nums`):
- Running: `text-zinc-500` — literal `…` character (U+2026)
- Done: `text-zinc-500` — e.g., "1.24s"
- Error: `text-red-600` — literal "failed" (lowercase)

**Toggle button** (`shrink-0 ml-2 rounded min-h-11 min-w-11 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400`):
- Icon: Lucide `ChevronUp` `w-4 h-4` when collapsed, `ChevronDown` `w-4 h-4` when expanded
- The icon is centered in the 44px hit zone
- `aria-label="Expand tool history"` / `"Collapse tool history"`
- `aria-expanded` reflects current state

### Expanded state

When expanded, a scrollable history panel appears above the collapsed bar (between MessageList and the collapsed row). DOM order: expanded panel first, collapsed row second.

**Expanded panel container**:
- `border-b border-zinc-200` (divides history from the collapsed summary row below)
- `max-h-48 overflow-y-auto` (192px cap, 48 Tailwind units — matches the LiveLogViewer sizing convention)
- `px-4 py-1.5`
- `role="log" aria-label="Tool activity history" aria-live="off"`
- Scroll behavior: auto-scrolls to bottom when new entries are appended and the panel is expanded

**Each history entry row** (`flex items-center gap-2 py-0.5`):

Layout from left to right:

```
[ Timestamp | Status dot | Tool name (flex-1, truncate) | Duration / ellipsis ]
```

**Timestamp** (`w-[4.5rem] shrink-0 font-mono tabular-nums text-zinc-500`):
- Format: `HH:MM:SS` (24-hour, always shown in expanded view)
- `w-[4.5rem]` is tighter than the current `w-20` and sufficient for 8 characters in `text-xs` monospace

**Status dot slot** (same spec as collapsed state, `w-4 flex items-center justify-center`)

**Tool name** (`min-w-0 flex-1 truncate text-zinc-700 font-sans`): same as collapsed

**Trailing status** (`shrink-0 font-mono tabular-nums`): same spec as collapsed — `text-zinc-500` for done/running, `text-red-600` for error

**Error tooltip**: When status is "failed", render `title={entry.error}` on the "failed" span. This surfaces the error message on hover without adding layout complexity.

### Color table — complete

| Element | Class | Hex | Rationale |
|---|---|---|---|
| Surface | `bg-zinc-50` | #fafafa | Muted surface token; visually distinct from MessageInput (white) |
| Top border | `border-zinc-200` | #e4e4e7 | Standard divider token |
| Inner divider (expanded/collapsed) | `border-zinc-200` | #e4e4e7 | Same token; consistent |
| Tool name text | `text-zinc-700` | #3f3f46 | Legible label text; 7.3:1 on zinc-50 |
| Timestamp text | `text-zinc-500` | #71717a | Muted data; 4.7:1 on zinc-50 — WCAG AA |
| Duration / ellipsis text | `text-zinc-500` | #71717a | Same as timestamp |
| Running dot | `bg-violet-500` | #8b5cf6 | AI activity; subordinate to header badge (violet-600) |
| Done icon | `text-green-600` | #16a34a | Success semantic |
| Error icon | `text-red-600` | #dc2626 | Destructive/error semantic; 5.9:1 on zinc-50 — WCAG AA |
| "failed" label | `text-red-600` | #dc2626 | Consistent with error icon; must not be red-500 |
| Toggle button default | `text-zinc-400` | #a1a1aa | Icon-only, decorative at rest |
| Toggle button hover | `text-zinc-700` | #3f3f46 | Clear affordance shift |
| Toggle button focus ring | `ring-zinc-400` | #a1a1aa | Matches `--ring` token |

### Spacing summary

| Region | Padding |
|---|---|
| Collapsed bar (horizontal) | `px-4` |
| Collapsed bar (vertical) | `py-1.5` |
| Expanded panel (horizontal) | `px-4` |
| Expanded panel (vertical) | `py-1.5` |
| Gap between icon and tool name | `gap-2` |
| Gap between entries (vertical) | `py-0.5` per row |

### Sizing exception — expanded panel max height

Add to design system §3 spacing exceptions:

| Component | Class | px | Rationale |
|---|---|---|---|
| StatusBar expanded history panel | `max-h-48` | 192px | Caps the history to approximately 12 rows at `text-xs` line height (16px × 12 = 192px); consistent with the LiveLogViewer `max-h-64` / `md:max-h-96` exception. The cap prevents the panel from consuming more than ~25% of a typical chat viewport before the user scrolls. |

---

## Mockup Instructions for graphic_designer

Produce two SVG mockups showing the StatusBar in context — rendered at the bottom of the chat area, above a visible portion of the MessageInput.

### Shared context to render in both mockups

Show a partial `MessageInput` below the StatusBar so the tonal boundary between `bg-zinc-50` (StatusBar) and `bg-white` (MessageInput) is legible. The MessageInput content itself can be simplified (just the textarea border and a send icon button).

Show the StatusBar at desktop width: assume a 1024px viewport with the left sidebar (220px). The StatusBar stretches edge to edge of the chat column (`flex-1`).

### Mockup 1: `status-bar-collapsed.svg`

Show three collapsed bar variants stacked vertically (as a comparison key — do not show three bars at once in the real UI, just in the mockup for review):

**Row A — Running state**:
- Violet-500 pulse dot in status slot
- Tool name: "web_search"
- Trailing: "…" in zinc-500
- ChevronUp in zinc-400, right-aligned with 44px hit zone indicated by a faint outline

**Row B — Completed state**:
- Green-600 Check icon
- Tool name: "file_read"
- Trailing: "0.82s" in zinc-500
- ChevronUp in zinc-400

**Row C — Error state**:
- Red-600 X icon
- Tool name: "database_query" (long enough to show truncation behavior is not triggered at standard widths)
- Trailing: "failed" in red-600
- ChevronUp in zinc-400

Label each row A/B/C in a callout outside the component frame. The component border and background should be visible to confirm the `bg-zinc-50` surface and `border-t border-zinc-200` divider.

### Mockup 2: `status-bar-expanded.svg`

Show the expanded state with 6 history entries, followed by the collapsed summary row.

**Expanded panel** (above the summary row):
- `border-b border-zinc-200` visible between the panel and the summary row
- Entries listed oldest first (top) to newest (bottom)
- Entry 1: 14:02:11 | check (green-600) | web_search | 1.24s
- Entry 2: 14:02:14 | check (green-600) | file_read | 0.38s
- Entry 3: 14:02:14 | check (green-600) | file_read | 0.41s
- Entry 4: 14:02:17 | X (red-600) | database_query | failed
- Entry 5: 14:02:19 | check (green-600) | file_write | 2.01s
- Entry 6: 14:02:22 | violet pulse dot | web_search | …

Entry 6 is the currently running tool — also shown in the summary row below.

**Summary row** (below the panel):
- Same content as Entry 6: violet-500 pulse dot | web_search | …
- ChevronDown in zinc-700 (active hover state — the user just interacted with this button)

Annotate the following in callouts:
- The `border-b border-zinc-200` divider between history panel and summary row
- The `text-zinc-500` color on timestamps (with contrast ratio callout: 4.7:1)
- The `w-[4.5rem]` timestamp column width
- The `font-mono tabular-nums` treatment on timestamps and durations (tool name is `font-sans`)
- The 44px hit zone on the ChevronDown button

---

## Component Inventory Update

Add to design system §12 component inventory:

| Component | Variants | shadcn/ui base | Pages |
|---|---|---|---|
| `StatusBar` | collapsed (running / done / error), expanded | Custom (no shadcn/ui base) | Session chat page — between MessageList and MessageInput |

---

## Required Design System Update

After the mockup is approved, update `docs/web/design-system.md` as follows:

1. **§12** — add `StatusBar` to the component inventory table (see above).
2. **§3** — add the `max-h-48` / 192px spacing exception for the StatusBar expanded panel.
3. **§7** — add a "StatusBar" subsection documenting the approved token set (mirror this brief's color table).
4. **Changelog** — add a v2.4 entry: "§3, §7, §12 — added StatusBar component: spacing exception (max-h-48 expanded panel), color token table, component inventory entry. Corrected running-state tool dot from bg-violet-400 to bg-violet-500 in StatusBar and ToolActivityRow for consistency with revised convention."

The design system update must be completed before `web_coder` begins implementation corrections.

---

## Summary of Required Code Changes (for web_coder, post-approval)

| Problem | File | Change |
|---|---|---|
| `text-red-500` → `text-red-600` | `StatusBar.tsx` | Error icon and "failed" label |
| `text-zinc-400` → `text-zinc-500` | `StatusBar.tsx` | Timestamps, duration/ellipsis in both collapsed and expanded rows |
| `font-mono` on wrapper → `font-sans` | `StatusBar.tsx` | Remove from wrapper; add `font-mono tabular-nums` only to timestamp and duration spans |
| Focus ring: add `ring-offset-2` | `StatusBar.tsx` | Toggle button focus-visible classes |
| Hit target: `p-0.5` → `min-h-11 min-w-11 flex items-center justify-center` | `StatusBar.tsx` | Toggle button |
| Icon size: `size-3.5` → `w-4 h-4` | `StatusBar.tsx` | Chevron icons |
| Collapsed bar padding: `py-1` → `py-1.5` | `StatusBar.tsx` | Collapsed summary row |
| Timestamp column: `w-20` → `w-[4.5rem]` | `StatusBar.tsx` | Expanded panel timestamp span |
| Running dot: `bg-violet-400` → `bg-violet-500` | `StatusBar.tsx` and `ToolActivityRow.tsx` | Both files |
| Panel transition: add CSS transition | `StatusBar.tsx` | Expanded panel show/hide; `transition-all duration-200 ease-in-out` |
