# Sprint 2 — Sessions Dashboard Design Brief

**Route:** `/sessions`
**Page component:** `SessionsPage`
**Brief author:** web_designer
**Design system version:** 1.0
**Created:** 2026-03-05
**Status:** Ready for mockup

---

## 1. Purpose and context

The Sessions Dashboard is the primary landing page after login. It gives the user a full inventory of their chat sessions and the only entry point to creating new ones. It must communicate session status at a glance (the `AgentState` field is live data) and keep the create action immediately reachable without cluttering the page.

---

## 2. Layout structure

The page renders inside `AppShell`. The shell provides:

- Desktop (`lg+`): fixed `220px` left sidebar, `flex-1 overflow-y-auto` main area with `px-6 py-6` padding.
- Mobile (`< lg`): top bar + `px-4 py-4` padding on main content.
- Inner content constrained by `max-w-5xl mx-auto` (already applied by `AppShell`).

`SessionsPage` outputs two regions:

```
┌─────────────────────────────────────────────────────────┐
│  PageHeader                                             │
│  "Sessions"                         [New Session btn]   │
├─────────────────────────────────────────────────────────┤
│  Session grid                                           │
│  (1 col mobile / 2 col md+ / 3 col xl+)                │
│                                                         │
│  [ Card ] [ Card ] [ Card ]                             │
│  [ Card ] [ Card ] [ Card ]                             │
│                                                         │
│  Scroll sentinel / loading indicator                    │
└─────────────────────────────────────────────────────────┘
```

The `PageHeader` component is already implemented at `src/components/PageHeader.tsx`. Use it directly — pass the "New Session" button as `children`.

---

## 3. Component inventory

| Component | File path | Role |
|---|---|---|
| `SessionsPage` | `src/pages/SessionsPage.tsx` | Page root, grid layout, infinite scroll orchestration |
| `SessionCard` | `src/components/SessionCard.tsx` | Single session card tile |
| `AgentStateBadge` | `src/components/AgentStateBadge.tsx` | Colored dot + state label — shared across pages |
| `NewSessionDialog` | `src/components/NewSessionDialog.tsx` | Create-session modal |

`AgentStateBadge` must live at the component level (not inlined inside `SessionCard`) because the same component will be reused in the Session Chat page header.

---

## 4. Data bindings — API contract

All data shapes come from `docs/api/client-contract.md` section 3.3.

### SessionOut fields used on this page

| Field | Where displayed |
|---|---|
| `id` | Card navigation target (`/sessions/{id}`) and archive call |
| `name` | Card title (primary text) |
| `state: AgentState` | `AgentStateBadge` |
| `config.provider` | Muted subtitle line |
| `config.model` | Muted subtitle line |
| `updated_at` | Relative timestamp |
| `archived_at` | Used to filter — archived sessions (`archived_at !== null`) are excluded from this list |

### API calls

| Action | Endpoint | Hook |
|---|---|---|
| List sessions (paginated) | `GET /api/v1/sessions` | `useInfiniteQuery` (TanStack Query) |
| Create session | `POST /api/v1/sessions` | `useMutation` → invalidate session list |
| Archive session | `DELETE /api/v1/sessions/{id}` | `useMutation` → invalidate session list |

**Pagination:** cursor-based via `next_cursor` / `cursor` param. The `getNextPageParam` returns `lastPage.next_cursor ?? undefined`. Load limit: 18 items per page (fills a 3-column grid with exactly 6 rows — avoids partial-row orphan on first load).

**Stale time:** 30 seconds (sessions change infrequently; matches the recommendation in `docs/api/webui-development-guide.md` section 5).

**Optimistic updates:** not required for archive. Show a loading spinner on the archive button while the mutation is in flight, then remove the card on success. On error, show a toast.

---

## 5. PageHeader region

Uses the existing `PageHeader` component.

```
title="Sessions"
children=<NewSessionDialog trigger>
```

The trigger element is a `Button` with:
- `className="bg-violet-600 hover:bg-violet-700 text-white"` (violet primary per design system section 1 and 5)
- Size: `default`
- Icon: `Plus` from `lucide-react`, `w-4 h-4`, placed left of the label with `gap-2`
- Label: "New Session"

Rationale for violet: "New Session" is the primary AI-workflow action on this page, qualifying it for the violet accent per the design system rule that violet is reserved for "primary CTAs" and "AI-specific primary actions."

---

## 6. Session grid

### Grid classes

```
grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3
```

Gap is `gap-4` (16px) rather than `gap-6` because cards already have internal `p-4` padding — a 16px gap provides sufficient breathing room without making the grid feel loose.

### Empty state

Rendered when `items.length === 0` and the first page has loaded without error.

```
┌──────────────────────────────────────┐
│                                      │
│   (centered, col-span-full)          │
│   "No sessions yet."                 │
│   "Create one to get started."       │
│                                      │
│   [New Session]  ← violet button     │
│                                      │
└──────────────────────────────────────┘
```

Layout: `flex flex-col items-center gap-4 py-20 text-center`

Text:
- First line: `text-base font-medium text-zinc-900`
- Second line: `text-sm text-zinc-500`

No illustration or icon. Negative space is intentional — this state is not a failure, it is a prompt. An oversized empty-state illustration would compete with the create action.

---

## 7. SessionCard component

### Visual anatomy

```
┌─────────────────────────────────────┐  ← rounded-lg, border border-zinc-200,
│  Session name              [Trash2] │    bg-white, shadow-sm, p-4
│  ● Thinking...                      │  ← AgentStateBadge
│  anthropic · claude-opus-4          │  ← muted subtitle
│  2 minutes ago                      │  ← relative timestamp
└─────────────────────────────────────┘
```

### Class specification

| Element | Classes |
|---|---|
| Card root | `group relative flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors duration-150 hover:border-zinc-300 cursor-pointer` |
| Session name | `text-base font-medium text-zinc-900 truncate leading-tight` |
| AgentStateBadge | See section 8 |
| Subtitle (provider + model) | `text-sm text-zinc-500 truncate` |
| Timestamp | `text-xs text-zinc-400` |
| Archive button wrapper | `absolute right-3 top-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100` |
| Archive button | `Button` variant `ghost`, size `sm`, `aria-label="Archive session"`, `text-zinc-400 hover:text-red-600 hover:bg-red-50` |
| Archive icon | `Trash2`, `w-4 h-4` |

**The entire card is a click target for navigation** to `/sessions/{id}`. Use `onClick` on the card root, but ensure the archive button's `onClick` calls `e.stopPropagation()` to prevent card navigation when archiving.

**Hover border change** (`hover:border-zinc-300`) signals interactivity without a heavy background fill. This keeps the card surface white and clean — a background color change on hover would make the grid feel cluttered.

**Archive button visibility on hover:** `opacity-0 group-hover:opacity-100` on a wrapper positioned absolute top-right. This keeps the card surface uncluttered in the default state. The button is still keyboard-focusable and will become visible on focus via the focus ring, which is always shown (never suppressed per design system section 8).

**Truncation:** both the session name and the subtitle are `truncate` (single-line overflow). Reason: the card height must be consistent across all three columns — variable-height cards in a CSS grid create ragged bottom edges.

### Subtitle construction

```
{config.provider ?? "Default"} · {config.model ?? "Default"}
```

If both provider and model are null (session uses global defaults), display `Default · Default` in muted text. This is better than an empty line, which would cause height inconsistency.

### Timestamp

Use a relative time formatter (e.g., `date-fns/formatDistanceToNow` or the native `Intl.RelativeTimeFormat`). Examples: "just now", "2 minutes ago", "yesterday", "Mar 3".

Fall back to an absolute short date (`MMM D`) when `updated_at` is more than 7 days ago. Rationale: relative labels like "10 days ago" are less useful than a specific date.

### Archive confirmation

No confirmation dialog for archive — the action is reversible server-side (the record is soft-deleted, not destroyed). Show a destructive toast with an "Undo" action that calls `POST /api/v1/sessions` — wait, the archive action is `DELETE /api/v1/sessions/{id}` which sets `archived_at`. There is no unarchive endpoint in the current API contract, so do not offer an undo affordance. Remove the card optimistically after a brief 300ms delay to allow the user to see the button state transition.

### AgentState on the dashboard

Session cards show the `state` field from the REST response, not a live WebSocket state. Actively running sessions (state is not `idle` or `done`) will show their last-known state from the REST poll. The state is not live-updated on the dashboard — live state updates happen only on the Session Chat page. The badge is therefore a "last seen" indicator, not a real-time indicator. Use `idle` / `done` states to communicate a dormant session; use `thinking` / `researching` / `writing` to communicate a session the agent was last active in (the user may want to open it).

---

## 8. AgentStateBadge component

This component is shared. It must accept a single `state: AgentState` prop and render exactly as defined in design system section 6.

### Prop interface

```typescript
interface AgentStateBadgeProps {
  state: AgentState;
}
```

### Visual spec

Layout: `inline-flex items-center gap-1.5`

| State | Dot class | Label | Label class |
|---|---|---|---|
| `idle` | `size-2 rounded-full bg-zinc-400` | "Ready" | `text-sm font-medium text-zinc-500` |
| `thinking` | `size-2 rounded-full bg-violet-600 animate-pulse` | "Thinking..." | `text-sm font-medium text-violet-700` |
| `researching` | `size-2 rounded-full bg-blue-600 animate-pulse` | "Researching..." | `text-sm font-medium text-blue-700` |
| `writing` | `size-2 rounded-full bg-green-600 animate-pulse` | "Writing..." | `text-sm font-medium text-green-700` |
| `done` | `size-2 rounded-full bg-green-600` | "Done" | `text-sm font-medium text-green-700` |
| `error` | `size-2 rounded-full bg-red-600` | "Error" | `text-sm font-medium text-red-600` |

The dot is a plain `span` — not an icon, not a `Badge` from shadcn/ui. Using a `span` avoids import overhead and keeps the markup minimal. The `animate-pulse` class provides the opacity cycle for active states. No `scale` or color-shift animation — per design system section 9, only `animate-pulse` is used for agent activity.

---

## 9. NewSessionDialog component

### Trigger

The `NewSessionDialog` wraps its own trigger. The trigger is the violet "New Session" button. The component accepts an optional `onSuccess` callback that receives the created session's `id`.

### Modal spec

shadcn/ui `Dialog`, `max-w-md` (standard form dialog per design system section 5).

```
┌──────────────────────────────────────────────┐
│  New Session                           [X]   │
│──────────────────────────────────────────────│
│  Name                                        │
│  ┌──────────────────────────────────────┐    │
│  │ Untitled Session                     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Provider                                    │
│  ┌──────────────────────────────────────┐    │
│  │ Default                           ▾  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Model                                       │
│  ┌──────────────────────────────────────┐    │
│  │ Default                           ▾  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Memory mode                                 │
│  ┌──────────────────────────────────────┐    │
│  │ Default                           ▾  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│──────────────────────────────────────────────│
│                    [Cancel]  [Create]        │
└──────────────────────────────────────────────┘
```

### Field details

All fields are optional. Omitting them sends a `SessionCreateRequest` with no `config` override, inheriting global defaults.

| Field | Component | Placeholder | Value sent to API |
|---|---|---|---|
| Name | `Input` | "Untitled Session" | `name?: string` — send `undefined` if empty |
| Provider | `Select` | "Default" | `config.provider?: string` — send `undefined` if "Default" selected |
| Model | `Select` | "Default" | `config.model?: string` — send `undefined` if "Default" selected |
| Memory mode | `Select` | "Default" | `config.memory_mode?: MemoryMode` — send `undefined` if "Default" selected |

**Provider options:** populated from `GET /api/v1/config/providers`. Fetch this list when the dialog opens (lazy: only on open, not on page mount). Show the provider `name` field as the label. First option is always "Default" (value: `undefined`).

**Model options:** populated from `GET /api/v1/config/models`. Show `alias` as the label. First option is always "Default" (value: `undefined`).

**Memory mode options:** static. Three values from the `MemoryMode` union type:
- "Default" (value: `undefined`)
- "Conversation" (value: `conversation`)
- "Code" (value: `code`)
- "Reasoning" (value: `reasoning`)

### Form layout

```
<div class="space-y-4">
  <div class="space-y-1.5"> ... Name field ... </div>
  <div class="space-y-1.5"> ... Provider field ... </div>
  <div class="space-y-1.5"> ... Model field ... </div>
  <div class="space-y-1.5"> ... Memory mode field ... </div>
</div>
```

Labels sit above inputs per design system section 5. Gap between label and input: `gap-1.5`.

### Footer

`DialogFooter` (shadcn/ui). Two buttons, right-aligned:
- "Cancel": `Button variant="outline"` — closes the dialog, clears form state.
- "Create": `Button` with `className="bg-violet-600 hover:bg-violet-700 text-white"` — submits the form.

While the mutation is in flight:
- Replace "Create" button label with a `size-4` `Loader2` spinner (`animate-spin`).
- Disable both buttons.
- Rationale: spinner inside button is the correct loading pattern per design system section 5 (spinner for button states, skeleton for content areas).

### On success

1. Close the dialog.
2. Reset form fields.
3. Navigate to `/sessions/{created_session.id}`.
4. Invalidate the `sessions` query cache so the new session appears if the user navigates back.

### On error

Show a toast (`toast.error(error.message)`) below the dialog. Do not clear the form — let the user correct and retry.

---

## 10. Infinite scroll

### Scroll sentinel pattern

Place an invisible `div` (the sentinel) at the bottom of the session grid. Use `IntersectionObserver` to detect when it enters the viewport, then call `fetchNextPage()`.

```
<div ref={sentinelRef} />
```

The sentinel must be rendered after the last card and before the loading indicator. When `hasNextPage` is false, the sentinel can be unmounted.

### Loading state — skeleton cards

While the first page is loading (`isLoading === true`), render 6 skeleton cards (fills a 2-column grid on md and 3-column on xl without triggering premature layout reflow).

Skeleton card anatomy mirrors the real card dimensions:

```
┌─────────────────────────────────────┐
│  ████████████████████         █░░░  │  ← name skeleton (Skeleton w-40 h-4) + archive ghost
│  ██████████                         │  ← badge skeleton (Skeleton w-20 h-3)
│  ████████████████████               │  ← subtitle skeleton (Skeleton w-32 h-3)
│  ██████████                         │  ← timestamp skeleton (Skeleton w-16 h-3)
└─────────────────────────────────────┘
```

- Card wrapper: same `rounded-lg border border-zinc-200 bg-white p-4 shadow-sm`
- Each `Skeleton` uses shadcn/ui's `Skeleton` component (`animate-pulse` shimmer)
- Skeleton heights approximate the real text dimensions: `h-4` for `text-base`, `h-3` for `text-sm`/`text-xs`

While a subsequent page is loading (`isFetchingNextPage === true`), show 3 skeleton cards appended after the real cards.

### "Load more" indicator

A centered row below the grid while `isFetchingNextPage`:

```
<div class="col-span-full flex justify-center py-4">
  <span class="text-sm text-zinc-400">Loading more...</span>
</div>
```

No spinner in this row. The skeleton cards already communicate loading visually. The text is for screen readers and low-motion contexts. Rationale: a spinner here would add motion redundancy next to the shimmer skeleton cards.

### End of list

When `hasNextPage === false` and `items.length > 0`, render nothing below the grid. Do not show "You've reached the end." — this is unnecessary chatter for a session list.

---

## 11. Interaction states summary

| Element | Hover | Focus | Active | Disabled | Loading |
|---|---|---|---|---|---|
| Session card | `border-zinc-300` (from `border-zinc-200`) | n/a (not focusable itself — child links handle focus) | n/a | n/a | Skeleton |
| Archive button | `text-red-600 bg-red-50` (ghost button override) | `ring-2 ring-offset-2 ring-zinc-400` | `scale-[0.98]` | `opacity-50 cursor-not-allowed` | Spinner inside button |
| "New Session" trigger button | `bg-violet-700` | `ring-2 ring-offset-2 ring-zinc-400` | `scale-[0.98]` | n/a | n/a |
| Dialog "Create" button | `bg-violet-700` | `ring-2 ring-offset-2 ring-zinc-400` | `scale-[0.98]` | `opacity-50 cursor-not-allowed` | Spinner inside button |
| Dialog "Cancel" button | shadcn/ui `outline` defaults | shadcn/ui focus ring | `scale-[0.98]` | `opacity-50 cursor-not-allowed` | — |

**Note on card focus:** wrap the card content in an `<a>` or a `<button>` to make it keyboard-navigable. Using an `<a>` to `/sessions/{id}` is preferred — it gives native browser tab navigation, right-click to open in new tab, and correct semantics for a navigation element.

---

## 12. Responsive behavior

| Breakpoint | Grid columns | Card width | Notes |
|---|---|---|---|
| `< md` (mobile) | 1 | Full width | AppShell has `px-4` padding |
| `md` (tablet) | 2 | ~50% | Sidebar hidden on `< lg`, so full width available |
| `lg` (desktop) | 2 | ~50% | Sidebar (220px) + content area, 2 columns fits comfortably |
| `xl` (wide desktop) | 3 | ~33% | Extra width allows third column without compression |

`xl:grid-cols-3` is triggered at 1280px. At that width with the 220px sidebar, the content area is ~1060px constrained to `max-w-5xl` (1024px). Three cards with `gap-4` gives approximately 330px per card — sufficient for session names up to ~35 characters before truncation.

---

## 13. Mockup brief for graphic_designer

Produce the following SVG mockups in `docs/web/mockups/`:

### Mockup 1: `sprint-2-sessions-desktop.svg`

Show the Sessions Dashboard at desktop (1280px wide viewport), `xl` breakpoint.

Content to show:
- AppShell chrome visible: sidebar on left (220px, `bg-zinc-50`) with nav items, main content on right
- PageHeader: "Sessions" title (left) and violet "New Session" button (right)
- 6 session cards in a 3-column grid with `gap-4`
  - Card 1: "Market Research Report", state `thinking` (violet dot, pulsing indicated), subtitle "anthropic · claude-opus-4", "3 minutes ago"
  - Card 2: "Code Review — auth.py", state `idle` (zinc dot), subtitle "openai · gpt-4o", "yesterday"
  - Card 3: "Untitled Session", state `done` (green dot), subtitle "Default · Default", "Mar 2"
  - Card 4: "Weekly Summary", state `writing` (green dot, pulsing), subtitle "anthropic · claude-sonnet-4", "just now"
  - Card 5: "API Integration Help", state `error` (red dot), subtitle "openai · gpt-4o-mini", "Mar 1"
  - Card 6: "Brainstorm Ideas", state `idle` (zinc dot), subtitle "ollama · llama3.3", "Feb 28"
- Card 1 should show the hover state: `border-zinc-300`, archive button visible top-right
- No skeleton cards — all content loaded

### Mockup 2: `sprint-2-sessions-dialog.svg`

Show the Sessions Dashboard with the `NewSessionDialog` open, centered on the desktop layout.

Content to show:
- Same desktop layout in background (dimmed with `bg-black/50` overlay)
- Dialog centered: `max-w-md` width, `bg-white rounded-lg shadow-md`
- Dialog header: "New Session" title (left, `text-lg font-semibold`) + X close button (right)
- Four form fields with labels above inputs:
  - Name: `Input` with placeholder text "Untitled Session"
  - Provider: `Select` in default (placeholder "Default") state — show the select trigger element
  - Model: `Select` in default (placeholder "Default") state
  - Memory mode: `Select` in default (placeholder "Default") state
- Dialog footer: "Cancel" (`outline` button) left of "Create" (violet button), right-aligned

### Mockup 3: `sprint-2-sessions-mobile.svg`

Show the Sessions Dashboard at mobile width (390px viewport).

Content to show:
- Mobile top bar: hamburger icon left, "Cogtrix" center, avatar right (no sidebar)
- PageHeader: "Sessions" title and violet "New Session" button (may wrap to stacked layout if tight — use `flex-wrap` or reduce button text to just the Plus icon on very small sizes)
- 1-column card grid with same 4 visible cards (truncated list)
- No hover state (touch — hover is irrelevant)

### Mockup 4: `sprint-2-sessions-empty.svg`

Show the empty state at desktop.

Content to show:
- AppShell chrome
- PageHeader with "Sessions" and "New Session" button
- Empty grid area: centered text "No sessions yet." and "Create one to get started." with a violet "New Session" button below

### Design system references for graphic_designer

- All surfaces: white (`#ffffff`) cards, `bg-zinc-50` (`#fafafa`) sidebar, white page background
- Borders: `border-zinc-200` (`#e4e4e7`) default, `border-zinc-300` (`#d4d4d8`) on hover
- Text primary: `text-zinc-900` (`#18181b`)
- Text muted: `text-zinc-500` (`#71717a`)
- Text xs/timestamp: `text-zinc-400` (`#a1a1aa`)
- Violet button: `bg-violet-600` (`#7c3aed`), `text-white`
- Violet dot (thinking): `bg-violet-600` (`#7c3aed`)
- Blue dot (researching): `bg-blue-600` (`#2563eb`)
- Green dot (writing/done): `bg-green-600` (`#16a34a`)
- Red dot (error): `bg-red-600` (`#dc2626`)
- Zinc dot (idle): `bg-zinc-400` (`#a1a1aa`)
- Card shadow: `shadow-sm` (subtle, 1px offset)
- Border radius: `rounded-lg` (`0.625rem` / 10px, from `--radius` CSS variable)
- Font: system sans-serif at 16px base

---

## 14. shadcn/ui components to install

Run the following before implementation begins:

```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add skeleton
```

`Card` and `Button` are already installed from Sprint 1.

---

## 15. Acceptance criteria

The implementation is accepted when:

1. `SessionsPage` renders a responsive grid (1/2/3 columns at mobile/md/xl).
2. First-page skeleton cards (6) render while `isLoading === true`. Subsequent-page skeletons (3) render while `isFetchingNextPage === true`.
3. The scroll sentinel triggers `fetchNextPage()` when it enters the viewport. No "Load more" button is needed.
4. Each `SessionCard` shows name (truncated), `AgentStateBadge`, provider+model subtitle, and relative timestamp.
5. Hovering a card shows the archive button (opacity transition, 150ms). Keyboard focus on the archive button reveals it.
6. Clicking the archive button calls `DELETE /api/v1/sessions/{id}`, shows a spinner on the button during the call, and removes the card on success.
7. The empty state renders when `items.length === 0` after a successful first fetch.
8. `NewSessionDialog` opens on clicking "New Session", submits a `SessionCreateRequest`, and navigates to `/sessions/{id}` on success.
9. `AgentStateBadge` is a standalone component at `src/components/AgentStateBadge.tsx` accepting `state: AgentState`.
10. Zero TypeScript errors (`pnpm build` passes). Zero ESLint warnings.
