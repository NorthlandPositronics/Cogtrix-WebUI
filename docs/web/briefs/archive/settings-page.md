# Layout Brief: Settings Page (`/settings`)

**Brief ID**: S3-M1
**Prepared by**: web_designer
**Date**: 2026-03-08
**Design system version**: 1.6
**Target agent**: graphic_designer
**Backlog entry**: `docs/web/mockups/BACKLOG.md` → S3-M1

---

## Purpose

Produce desktop SVG mockup frames for the Settings page. Three primary frames are required: General tab, Providers & Models tab, and MCP Servers tab. The Providers & Models tab brief has been substantially revised — providers are now connection-only records with no "Switch to" action; the "Switch to" action belongs to the Models section only.

---

## Page overview

Route: `/settings` (authenticated; some mutations admin-only)
Layout: App shell — sidebar (220px fixed) + scrollable main area
Max content width: `max-w-5xl mx-auto`
Padding: `px-6 py-6` desktop

---

## Exact component composition

```
AppShell (sidebar + main)
└── main area (px-6 py-6, max-w-5xl)
    ├── PageHeader — "Settings"
    └── Tabs (5 tabs)
        ├── General tab → ConfigFlagsForm
        ├── Providers & Models tab → ProviderList (two sections)
        ├── MCP Servers tab → McpServerList
        ├── API Keys tab → ApiKeyList
        └── Setup Wizard tab → SetupWizard
```

---

## PageHeader

- Text: "Settings"
- Typography: `text-2xl font-semibold text-zinc-900`
- No action button
- `mb-6` below the header before the tabs

---

## Tab bar

`TabsList className="w-max min-w-full justify-start"` inside an `overflow-x-auto` container (`mb-6`).

Tab labels (left to right):
1. General
2. Providers & Models
3. MCP Servers
4. API Keys
5. Setup Wizard

---

## Frame 1: General tab (ConfigFlagsForm)

### Config summary block

`rounded-xl border border-zinc-200 bg-zinc-50 p-4` — a read-only info block, not a card.

Two-column `dl` grid (`grid grid-cols-2 gap-x-6 gap-y-2 text-sm`):

| dt (label) | dd (value) |
|---|---|
| Active model | `claude-3-5-sonnet` |
| Memory mode | `conversation` |

If config file path is present, a third row spanning full width:
| Config file | `/etc/cogtrix/config.yaml` (font-mono, text-xs, truncated) |

dt: `text-zinc-500`
dd: `font-medium text-zinc-900`

### Feature flag rows

`divide-y divide-zinc-200` list beneath the summary block, `space-y-0`.

Each row: `flex items-center justify-between py-4`

Left side:
- Flag label: `text-sm font-medium text-zinc-900`
- Description: `text-sm text-zinc-500`

Right side: `Switch` (default size)

Five flags in order:

| Label | Description | Switch state in mockup |
|---|---|---|
| Debug mode | Enable verbose debug output in server logs. Use only in development. | Off |
| Verbose logging | Log additional detail for every agent step and API call. | Off |
| Prompt optimizer | Automatically rewrite user prompts to improve agent reasoning quality. | On |
| Parallel tool execution | Run independent tool calls concurrently to reduce latency. | On |
| Context compression | Compress older context to stay within the model's context window. | On |

### Reload from disk button

`flex justify-end border-t border-zinc-200 pt-4` after the flag list.

Button: `Button variant="outline" size="sm" className="min-h-11"` with `RefreshCw` icon (16px) + "Reload config from disk" label. Admin-only — show it present in the mockup (logged in as admin).

### Loading state (annotation)

Show the skeleton loading state: summary block skeleton (two `h-4` pills), then five flag-row skeletons each with label `h-4 w-36` + description `h-3 w-64` + switch pill `h-5 w-8 rounded-full`.

---

## Frame 2: Providers & Models tab (ProviderList)

This frame shows two distinct `<section>` blocks stacked vertically with `space-y-8` between them. Each section has a heading and a bordered table.

### Section 1: Providers

Section heading: `text-lg font-semibold text-zinc-900 mb-3` — "Providers"

Table wrapper: `rounded-xl border border-zinc-200` (the border wraps the table, no separate card)

Table columns (`text-xs font-medium text-zinc-500 uppercase tracking-wide`):
| Name | Type | Base URL | API Key | Health |

Column details:

**Name**: `font-medium text-zinc-900`
**Type**: `text-zinc-900` (e.g., "openai", "anthropic", "ollama")
**Base URL**: `max-w-[180px] truncate font-mono text-sm text-zinc-900` (e.g., `https://api.openai.com/v1`)
**API Key** (status indicator):
  - Configured: `size-2 rounded-full bg-green-600` dot + `text-xs text-zinc-500` "Configured"
  - None: `size-2 rounded-full bg-zinc-400` dot + `text-xs text-zinc-500` "None"
**Health** column:
  - Default state: `Button variant="ghost" size="sm" className="min-h-11"` with `Activity` icon (16px) + "Check" label
  - Checking: same button with `Loader2` spinner replacing the icon, button disabled
  - After check — success: `CheckCircle2` icon (`h-4 w-4 text-green-600`) + `text-xs text-green-700` "124ms"
  - After check — fail: `XCircle` icon (`h-4 w-4 text-red-600`) + `text-xs text-red-600` "Unreachable"

**CRITICAL**: There is NO "Switch to" button column on the Providers table. There is NO Status column on the Providers table. Providers are connection configuration records only.

Show 3 provider rows with realistic data:

| Name | Type | Base URL | API Key | Health (show one of each state) |
|---|---|---|---|---|
| openai | openai | `https://api.openai.com/v1` | Configured (green dot) | "Check" button (default state) |
| anthropic | anthropic | `https://api.anthropic.com` | Configured (green dot) | Success: 98ms |
| local-ollama | ollama | `http://localhost:11434` | None (zinc dot) | Fail: Unreachable |

Row hover: `hover:bg-zinc-50`

---

### Section 2: Models

Section heading: `text-lg font-semibold text-zinc-900 mb-3` — "Models"

Table wrapper: `rounded-xl border border-zinc-200`

Table columns:
| Alias | Provider | Model name | Status | Action |

Column details:

**Alias**: `font-medium text-zinc-900`
**Provider**: `text-zinc-900` (references provider name from Providers section)
**Model name**: `font-mono text-sm text-zinc-900`
**Status** (dot indicator):
  - Active: `size-2 rounded-full bg-green-600` dot + `text-xs text-zinc-500` "Active"
  - Inactive: `size-2 rounded-full bg-zinc-400` dot + `text-xs text-zinc-500` "Inactive"
**Action** (admin only, `text-right` column):
  - Active model row: no button (empty cell)
  - Inactive model row: `Button variant="outline" size="sm" className="min-h-11"` — "Switch to"
  - Switching (pending): same button with `Loader2` spinner, disabled

Show 3 model rows:

| Alias | Provider | Model name | Status | Action |
|---|---|---|---|---|
| claude-3-5-sonnet | anthropic | `claude-3-5-sonnet-20241022` | Active (green) | — (no button) |
| gpt-4o | openai | `gpt-4o-2024-11-20` | Inactive (zinc) | "Switch to" button |
| gpt-4o-mini | openai | `gpt-4o-mini` | Inactive (zinc) | "Switch to" button |

Row hover: `hover:bg-zinc-50`

**Non-admin view** (annotation): The Action column header and all "Switch to" buttons are absent. Show this as a callout annotation on the frame.

---

## Frame 3: MCP Servers tab (McpServerList)

This is a simpler frame. Show the tab bar with "MCP Servers" active.

Content layout:
- "Add MCP Server" primary button (`Button` default variant, `gap-2` with `Plus` icon) above the table, right-aligned
- `Table` with columns: Name, URL, Status, Action

| Name | URL | Status | Action |
|---|---|---|---|
| filesystem | `http://localhost:8001` | `Badge outline` "Connected" (green tint) | Remove ghost button (Trash icon, red) |
| brave-search | `http://localhost:8002` | `Badge outline` "Disconnected" (zinc tint) | Remove ghost button (Trash icon, red) |

Empty state (annotation): centered text `text-sm text-zinc-500` "No MCP servers configured."

---

## Interaction states to annotate across all frames

| State | Location | Treatment |
|---|---|---|
| Switch toggling | Flag rows | Switch disabled (`opacity-50 cursor-not-allowed`) while mutation pending |
| Provider health check in progress | Health column | Loader2 spinner in button |
| Model switch in progress | Action column | Loader2 spinner in "Switch to" button, disabled |
| Tab switching | Tab bar | Underline/highlight on active tab (shadcn/ui default) |

---

## Output specification

**File**: `docs/web/mockups/settings-page.svg`
**Canvas**: 1440px wide × auto height
**Frames**: Three primary frames (General, Providers & Models, MCP Servers) stacked or arranged as distinct labeled sections within the SVG
**Annotations**: Non-admin view callout on Providers & Models frame, loading/error states as inset annotations
