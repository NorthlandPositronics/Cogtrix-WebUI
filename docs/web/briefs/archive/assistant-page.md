# Layout Brief: Assistant Page (`/assistant`)

**Brief ID**: S4-M2
**Prepared by**: web_designer
**Date**: 2026-03-08
**Design system version**: 1.6
**Target agent**: graphic_designer
**Backlog entry**: `docs/web/mockups/BACKLOG.md` → S4-M2

---

## Purpose

Produce a desktop SVG mockup of the Assistant page in its current state. The page now has 6 tabs (previously 5) and includes a Guardrails tab backed by `GuardrailsPanel`. The Guardrails tab is the highest-priority new frame in this sprint and must be shown in full with realistic data.

---

## Page overview

Route: `/assistant` (authenticated)
Layout: App shell — sidebar (220px fixed) + scrollable main area
Max content width: `max-w-5xl mx-auto`
Padding: `px-6 py-6` desktop

---

## Exact component composition

```
AppShell (sidebar + main)
└── main area (px-6 py-6, max-w-5xl)
    ├── PageHeader — "Assistant"
    ├── ServiceControlPanel
    └── Tabs (6 tabs)
        ├── Chats tab → AssistantChatList
        ├── Scheduled tab → ScheduledMessageTable
        ├── Deferred tab → DeferredRecordTable
        ├── Contacts tab → ContactList
        ├── Knowledge tab → KnowledgePanel
        └── Guardrails tab → GuardrailsPanel  ← PRIMARY FOCUS
```

---

## Component 1: PageHeader

- Text: "Assistant"
- Typography: `text-2xl font-semibold text-zinc-900`
- No action button on the right

---

## Component 2: ServiceControlPanel

**Card**: `rounded-xl border border-zinc-200 shadow-sm`

**Card header**: Title "Service Status" (`text-xl font-semibold`)

**Card content** (running state — show this in primary frame):

`flex flex-wrap items-center gap-4`:

| Element | Component | Detail |
|---|---|---|
| Status badge | `Badge variant="outline"` | `bg-green-50 text-green-700 border-green-200` — label "Running" |
| Channels | `<span>` | `text-sm text-zinc-500` — "Channels: " + `font-medium text-zinc-900` — "telegram, whatsapp" |
| Uptime | `<span>` | `text-sm text-zinc-500` — "Uptime: " + `font-medium text-zinc-900` — "3d 12h 08m" (live-ticking — annotate) |
| Stop button (admin only) | `Button size="sm" variant="outline"` | `border-red-200 text-red-600 hover:bg-red-50` — label "Stop", positioned `ml-auto` |

**Additional states to annotate**:
- Stopped state: badge `bg-zinc-50 text-zinc-500 border-zinc-200` with status text (e.g., "Stopped"), Start button (default/primary variant)
- Loading state: two skeleton pills `h-6 w-20` and `h-4 w-32`
- Error state: `AlertTriangle` icon (`w-5 h-5 text-red-600`), red error text, Retry outline button

---

## Component 3: Tabs

Tab bar: `TabsList` with `w-max min-w-full justify-start`, horizontally scrollable container (`overflow-x-auto [-webkit-overflow-scrolling:touch]`).

**Tab labels in order** (left to right):
1. Chats
2. Scheduled
3. Deferred
4. Contacts
5. Knowledge
6. Guardrails

The primary mockup frame should show the **Guardrails** tab as active. Also produce a secondary frame stub showing the **Chats** tab as active (the default/first tab view users see on load).

Tab content area: `mt-4` below the tab bar.

---

## Frame 1 (primary): Guardrails tab — GuardrailsPanel

The Guardrails tab content is `GuardrailsPanel`, which renders two cards stacked with `space-y-6` between them.

### Card 1: Recent Violations

**Card**: `rounded-xl border border-zinc-200 shadow-sm`

**Card header** (`flex items-center justify-between`):
- Left: title "Recent Violations" (`text-base font-semibold`) — note this uses `text-base`, not `text-xl`, because these are sub-cards within a tab
- Right: `Badge variant="outline" text-xs` — "12 total"

**Card content**: `Table` (use shadcn/ui table styling)

Column headers (`text-xs font-medium text-zinc-500 uppercase tracking-wide`):
| Time | Chat ID | Channel | Type | Detail |

Row data (show 4–5 rows with realistic data):

| Time | Chat ID | Channel | Type badge | Detail |
|---|---|---|---|---|
| Mar 7, 14:23 | `user_8472` | telegram | `rate_limit` badge | Too many requests in 60s window |
| Mar 7, 13:55 | `user_1091` | whatsapp | `content_filter` badge | Profanity detected in message |
| Mar 7, 11:12 | `user_3388` | telegram | `spam` badge | Repeated identical messages |
| Mar 6, 23:41 | `user_8472` | telegram | `rate_limit` badge | Too many requests in 60s window |
| Mar 6, 18:05 | `user_7710` | telegram | `content_filter` badge | Off-topic promotion link |

**Violation type badge colors** (all `variant="outline"`):
- `rate_limit`: `bg-amber-50 text-amber-700 border-amber-200`
- `content_filter`: `bg-red-50 text-red-700 border-red-200`
- `spam`: `bg-orange-50 text-orange-700 border-orange-200`
- Unknown/other: `bg-zinc-100 text-zinc-700 border-zinc-200`

Type badge text: replace underscores with spaces ("rate limit", "content filter", "spam").

Time column: `whitespace-nowrap text-sm text-zinc-900`
Chat ID column: `font-mono text-sm text-zinc-900`
Channel column: `text-sm text-zinc-900`
Detail column: `max-w-xs truncate text-sm text-zinc-900`

Row hover: `hover:bg-zinc-50`

### Card 2: Blacklisted Chats

**Card**: `rounded-xl border border-zinc-200 shadow-sm`, `mt-6` from Card 1 (handled by `space-y-6`)

**Card header** (`flex items-center justify-between`):
- Left: title "Blacklisted Chats" (`text-base font-semibold`)
- Right: `Badge variant="outline" text-xs` — "3"

**Card content**: `Table`

Column headers:
| Chat ID | (empty — action column) |

Row data (show 3 rows):

| Chat ID | Action |
|---|---|
| `user_8472` | Trash icon button |
| `user_1091` | Trash icon button |
| `user_3388` | Trash icon button |

Chat ID cell: `font-mono text-sm text-zinc-900`
Remove button: `Button size="sm" variant="ghost" className="h-11 w-11 text-red-600 hover:bg-red-50 hover:text-red-700"` — `Trash2` icon (`h-4 w-4`), no label text.

Row hover: `hover:bg-zinc-50`

**Empty state** (annotation): `text-sm text-zinc-500` — "No blacklisted chats."

**Confirm dialog** (annotation): When trash is clicked, a `ConfirmDialog` (shadcn `Dialog`, `max-w-md`) appears with title "Remove from blacklist", description text, and two buttons: Cancel (outline) and Remove (destructive).

---

## Frame 2 (secondary): Chats tab — AssistantChatList

Show as a stub or simplified frame to establish the tab-switching pattern. The Chats tab is the default view on page load. Show the tab bar with "Chats" as active, and the `AssistantChatList` content below (a table or card list of recent assistant chat threads with timestamps, chat ID, channel, and last message preview).

This frame does not need full pixel detail — it establishes the visual weight of the tab content area relative to `ServiceControlPanel` above.

---

## Loading and error states

**GuardrailsPanel loading state**: Three skeleton rows `h-8 w-full` stacked with `space-y-2`. No cards visible yet.

**GuardrailsPanel error state**: Centered `text-sm text-red-600` + outline "Try again" button. No cards visible.

---

## Spacing reference

- `space-y-6` between PageHeader and ServiceControlPanel
- `space-y-6` between ServiceControlPanel and Tabs component
- `mt-4` between tab bar and tab content
- `space-y-6` between the two cards inside GuardrailsPanel
- Standard `CardHeader` + `CardContent` internal padding

---

## Output specification

**File**: `docs/web/mockups/assistant-page.svg`
**Canvas**: 1440px wide × auto height
**Primary frame**: Guardrails tab active, both violation and blacklist cards populated with data
**Secondary frame**: Chats tab active (stub/simplified)
**Annotations**: Service status running/stopped states, empty states for both guardrail cards, confirm dialog callout
