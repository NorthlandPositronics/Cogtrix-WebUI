# Layout Brief: Sessions Page (`/sessions`)

**Brief ID**: S2-M1
**Prepared by**: web_designer
**Date**: 2026-03-08
**Design system version**: 1.6
**Target agent**: graphic_designer
**Backlog entry**: `docs/web/mockups/BACKLOG.md` → S2-M1

---

## Purpose

Produce desktop and mobile SVG mockup frames for the Sessions dashboard page. This brief clarifies two points that differ from earlier notes: the SessionCard subtitle shows the model alias only (no provider); and the NewSessionDialog has no provider selector field.

---

## Page overview

Route: `/sessions` (authenticated)
Layout: App shell — sidebar (220px fixed) + scrollable main area
Max content width: `max-w-5xl mx-auto`
Padding: `px-6 py-6` desktop, `px-4 py-4` mobile

---

## Exact component composition

```
AppShell (sidebar + main)
└── main area (px-6 py-6, max-w-5xl)
    ├── PageHeader — "Sessions" + NewSessionDialog trigger button
    ├── Session card grid
    │   ├── SessionCard × N (populated)
    │   └── (or EmptyState when no sessions)
    ├── InfiniteScrollSentinel (no visible UI; triggers fetchNextPage)
    └── ConfirmDialog (archive confirmation, renders when triggered)
```

---

## Component 1: PageHeader

`flex items-center justify-between` layout:

- Left: "Sessions" (`text-2xl font-semibold text-zinc-900`)
- Right: `NewSessionDialog` trigger — `Button` default variant, `gap-2`, `Plus` icon (16px) + "New Session"

---

## Component 2: Session card grid

`grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3`

Show the `xl` (3-column) desktop grid as the primary frame. Show `md` (2-column) as an annotation or secondary frame.

---

## Component 3: SessionCard (populated)

**Card**: `rounded-xl border border-zinc-200 shadow-sm`, cursor pointer, hover: `border-zinc-300`

Card is fully clickable (navigates to `/sessions/:id`). Archive button is an absolute-positioned overlay.

**Card content** (`p-4 flex flex-col gap-2`):

Top row (`flex items-start justify-between gap-2`):
- Session name: `text-base font-medium text-zinc-900 leading-tight truncate`

Below name:
- `AgentStateBadge` — show "Ready" (green dot, no animation) for most cards; show "Thinking..." (violet dot, pulsing — annotated) for one card
- Model subtitle: `text-sm text-zinc-500 truncate` — the model alias string (e.g., "claude-3-5-sonnet" or "Default"). **No provider name, no additional subtitle fields.**
- Relative timestamp: `text-xs text-zinc-500` (e.g., "3 hours ago", "yesterday", "Mar 5")

**Archive button** (absolute positioned):
- Position: `absolute top-3 right-3`
- Visibility: `sm:opacity-0 sm:group-hover:opacity-100` (hidden on desktop until hover, always visible on mobile)
- Component: `Button variant="ghost" size="sm" min-h-11 min-w-11 text-zinc-400 hover:bg-red-50 hover:text-red-700`
- Icon: `Trash2` (16px)

The card itself has `group` class to trigger the hover visibility of the archive button.

**Focus state**: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:outline-none`

---

## Realistic card data for mockup

Show 6 cards in the primary desktop frame (2 rows × 3 columns):

| Session name | Agent state | Model subtitle | Timestamp |
|---|---|---|---|
| Research on climate models | Ready (green) | claude-3-5-sonnet | 2 hours ago |
| Code review sprint | Thinking... (violet, pulsing) | gpt-4o | 5 minutes ago |
| Marketing copy draft | Ready (green) | Default | yesterday |
| Competitor analysis | Done (green) | claude-3-5-sonnet | Mar 5 |
| Database migration plan | Ready (green) | gpt-4o-mini | 3 days ago |
| API integration help | Error (red) | Default | Mar 3 |

The "Error" and "Thinking..." states demonstrate how the badge variants render in a real grid.

---

## Component 4: EmptyState

Shown only when the sessions list is empty.

Layout: `col-span-full flex flex-col items-center gap-4 py-20 text-center`

Elements:
- Lucide `MessageSquare` icon: `w-12 h-12 text-zinc-400 strokeWidth={1.5}`
- "No sessions yet." in `text-base font-medium text-zinc-900`
- "Create one to get started." in `text-sm text-zinc-500`
- `NewSessionDialog` trigger button (same as header button)

Show as a separate sub-frame or annotated state.

---

## Component 5: SessionCard loading skeleton

Shown during initial load: 6 skeleton cards with `space-y-2` internal structure.

Each skeleton card (`Card`):
```
CardContent p-4 flex flex-col gap-2:
  Skeleton h-4 w-40  (name)
  Skeleton h-3 w-20  (badge area)
  Skeleton h-3 w-32  (subtitle)
  Skeleton h-3 w-16  (timestamp)
```

Show as annotation or secondary state.

---

## Component 6: NewSessionDialog (open state)

`Dialog` modal, `max-w-lg`, centered with `bg-black/50` backdrop.

**DialogHeader**: "New Session" (`text-lg font-semibold`)

**Form body** (`space-y-4`):

Field 1 — Name:
- `Label` "Name" above
- `Input` placeholder "Untitled Session"
- Optional (blank submits as untitled)

Field 2 — Model:
- `Label` "Model" above
- `Select` full width (`w-full`)
- Default selected value: "Default" (first option, value `__default__`)
- Additional options: model aliases loaded from API (e.g., "claude-3-5-sonnet", "gpt-4o", "gpt-4o-mini")
- Error state (annotation): `text-sm text-red-600` "Failed to load models" below the select

Field 3 — Memory mode:
- `Label` "Memory mode" above
- `Select` full width
- Default selected: "Default"
- Options: Default, Conversation, Code, Reasoning

**There is NO provider selector field.** The form has exactly three fields: Name, Model, Memory mode.

**DialogFooter**: `Cancel` (outline) + `Create` (default/primary) buttons. Create button shows `Loader2` spinner when submitting.

Show dialog in a sub-frame with the Name field partially filled ("Climate research") and Model set to "claude-3-5-sonnet".

---

## Component 7: ConfirmDialog (archive confirmation)

`Dialog max-w-md`, triggered by clicking the archive (Trash) button on a card.

- Title: "Archive session"
- Description: "This session will be archived and removed from your dashboard. This action cannot be undone."
- Buttons: Cancel (outline) + Archive (destructive variant)

Show as annotation/callout — not a full frame.

---

## Infinite scroll behavior

At the bottom of the session grid, the `InfiniteScrollSentinel` component triggers page loading when scrolled into view. No visible pagination UI. When loading more pages, 3 additional skeleton cards appear at the bottom of the grid.

Annotation only — no visible UI element to render for the sentinel itself.

---

## Mobile layout (secondary frame, below `lg`)

- No sidebar visible — replaced by a top bar with a hamburger icon (Lucide `Menu`, left) and "Sessions" text centered, profile/account icon button right
- Cards stack single column, full width
- Archive button always visible (not hover-only) on mobile
- `NewSessionDialog` trigger: positioned in the mobile header or as a FAB (consult existing implementation — use the header position that matches the implementation)

---

## Spacing reference

- `gap-6` between cards in the grid
- `mb-6` or `pb-4` below PageHeader before the grid
- Standard card internal padding `p-4`

---

## Output specification

**File**: `docs/web/mockups/sessions-page.svg`
**Canvas**: 1440px wide × auto height for desktop frame; 390px wide for mobile frame
**Primary frame**: Desktop, 3-column grid, 6 cards populated with data (two rows)
**Secondary frames**: Empty state, loading skeleton state, NewSessionDialog open, mobile layout
**Annotations**: Archive button hover reveal, AgentStateBadge variants, ConfirmDialog callout
