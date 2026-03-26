# Layout Brief: Chat Tools Sidebar Panel

**Brief ID**: S2-M3
**Prepared by**: web_designer
**Date**: 2026-03-08
**Design system version**: 1.6
**Target agent**: graphic_designer
**Backlog entry**: `docs/web/mockups/BACKLOG.md` → S2-M3

---

## Purpose

Produce a desktop SVG mockup showing the Tools right panel in the Session chat page. The panel has been significantly updated: each tool row now has two controls — a Load/Unload button AND an enable/disable Switch. This brief replaces the earlier stub description of the panel.

The tool system also introduces a new `pinned` status for user-loaded tools that persist across turns, distinct from `active` (LLM-loaded, temporary).

---

## Page overview

Route: `/sessions/:id` with Tools panel open
Layout: App shell (sidebar 220px) + Chat area (flex-1) + Tools panel (320px)
The mockup should show all three columns to establish spatial context, but the panel content is the focus.

---

## Component composition

```
AppShell
└── Session page
    ├── Sidebar (220px) — show collapsed/simplified
    ├── Chat area (flex-1) — show simplified with a few message bubbles
    └── ToolsSidebar (320px, right panel)
        ├── PanelShell (panel header with title + close button)
        ├── Filter bar (search input)
        └── Tool list (scrollable)
            └── ToolRow × N
```

---

## ToolsSidebar structure

### Panel header (PanelShell)

`border-b border-zinc-200 px-4 py-3 flex items-center justify-between`

- Left: "Tools" title (`text-sm font-semibold text-zinc-900` or similar — match PanelShell's heading style)
- Right: X close button (`Button variant="ghost" size="sm"`, `w-8 h-8` or `w-11 h-11` for touch target, X Lucide icon)

### Filter bar

`border-b border-zinc-200 px-4 py-2`

Contains a search `Input` with:
- `Search` Lucide icon (16px, `text-zinc-400`) absolutely positioned left-center (`absolute top-1/2 left-3 -translate-y-1/2`)
- Input `pl-9 text-sm` to accommodate icon
- Placeholder: "Filter tools..."

### Tool list (scrollable body)

`flex-1 overflow-y-auto`

Contains `py-1` wrapper. Each `ToolRow` is a full-width row. Show 8–10 tool rows demonstrating all 5 status variants.

---

## ToolRow anatomy

Each row: `flex min-h-11 items-start gap-3 rounded-md px-3 py-2.5 transition-colors duration-150 hover:bg-zinc-50`

**Left block** (`min-w-0 flex-1`):

Row 1 (top line): `flex flex-wrap items-center gap-2`
- Tool name: `text-sm font-medium text-zinc-900 truncate`
- Status badge (colored, see below)
- Optional MCP badge: `Badge variant="outline" text-xs` — "MCP" label (shown for tools sourced from MCP servers)

Row 2 (description): `text-xs text-zinc-500 truncate mt-0.5` — short description of the tool

**Right block** (`flex shrink-0 items-center gap-2`):

Two controls side by side:
1. **Load/Unload button** (`Button size="sm"`, `h-7 px-2 text-xs`)
   - Loaded state: `variant="outline"`, `border-green-200 text-green-700 hover:bg-green-50`, label "Loaded"
   - Unloaded state: `variant="ghost"`, `text-zinc-500 hover:text-zinc-900`, label "Load"
   - Hidden (not rendered) when tool status is `disabled`
2. **Enable/Disable Switch** (sm variant: `className="h-3.5 w-6 [&_[data-slot=switch-thumb]]:size-3"`)
   - `checked={true}` when status is NOT `disabled` (switch on)
   - `checked={false}` when status IS `disabled` (switch off)
   - Switch controls the enabled/disabled axis independently from load/unload

---

## Status badge colors

All badges: `text-xs border` applied via `className` on shadcn/ui `Badge`

| Status | Badge classes | Load button visibility |
|---|---|---|
| `active` | `bg-green-50 text-green-700 border-green-200` | Show "Loaded" (green outline) |
| `pinned` | `bg-emerald-50 text-emerald-700 border-emerald-200` | Show "Loaded" (green outline) |
| `on_demand` | `bg-blue-50 text-blue-700 border-blue-200` | Show "Load" (ghost) |
| `disabled` | `bg-zinc-50 text-zinc-500 border-zinc-200` | Hidden |
| `auto_approved` | `bg-violet-50 text-violet-700 border-violet-200` | Show "Loaded" (green outline) |

**Status label text**:
- `active` → "Active"
- `pinned` → "Pinned"
- `on_demand` → "On demand"
- `disabled` → "Disabled"
- `auto_approved` → "Auto-approved"

**Semantic distinction note** (for annotation): `active` means the LLM loaded this tool for the current turn and it will auto-unload after processing. `pinned` means the user loaded it manually and it stays until explicitly unloaded. Both show "Loaded" button text, but the status badge distinguishes the reason.

---

## Suggested tool rows (realistic data)

Show these tools in order, one per status variant:

| Tool name | Status | Description | MCP? | Load button | Switch |
|---|---|---|---|---|---|
| web_search | `pinned` (emerald) | Search the web for current information | No | "Loaded" (green outline) | On |
| code_executor | `active` (green) | Execute Python or shell code | No | "Loaded" (green outline) | On |
| file_reader | `on_demand` (blue) | Read files from the workspace | No | "Load" (ghost) | On |
| send_email | `auto_approved` (violet) | Send emails via SMTP | No | "Loaded" (green outline) | On |
| brave_search | `on_demand` (blue) | Search using Brave Search API | Yes (MCP badge) | "Load" (ghost) | On |
| calendar_events | `disabled` (zinc) | Read and create calendar events | Yes (MCP badge) | Hidden | Off |
| database_query | `on_demand` (blue) | Run SQL queries against the connected DB | No | "Load" (ghost) | On |
| github_pr | `disabled` (zinc) | Create and review GitHub pull requests | Yes (MCP badge) | Hidden | Off |

---

## Interaction states to annotate

| State | Element | Treatment |
|---|---|---|
| Hover on row | ToolRow | `bg-zinc-50` background |
| Toggle in progress | Either control on the row | Both controls `opacity-50 cursor-not-allowed` |
| Filter active | Filter input | Input shows typed text; rows that don't match are removed from list |
| No match | Tool list body | `flex h-24 items-center justify-center` — `text-sm text-zinc-500` "No matching tools" |
| No tools at all | Tool list body | Same but "No tools available" |
| Loading | Tool list body | 5 skeleton pills `h-12 w-full rounded-md` with `space-y-2 p-4` |
| Error | Tool list body | `text-sm text-red-600` + outline "Retry" button, centered |

---

## Panel sizing and overflow

- Panel width: `w-[320px]` fixed at desktop
- Panel height: fills remaining viewport height (`h-full flex flex-col`)
- Tool list scrolls independently (`flex-1 overflow-y-auto`) — the header, filter bar, and panel header are sticky/fixed within the panel
- At mobile (< `lg`): the panel renders inside a `Sheet` (slides from right, full screen width). Show this as an annotation rather than a full separate frame.

---

## Output specification

**File**: `docs/web/mockups/chat-tools-panel.svg`
**Canvas**: 1440px wide showing the three-column layout (sidebar simplified, chat area simplified with 2–3 message bubbles, Tools panel in full detail)
**Primary focus**: The Tools panel — show all 8 tool rows visible, with all 5 status variants represented
**Annotations**: Status badge semantics (active vs pinned distinction), interaction states (toggling, filtering, loading, error)
**Secondary annotation**: Mobile Sheet variant (small inset frame showing panel as a full-width overlay)
