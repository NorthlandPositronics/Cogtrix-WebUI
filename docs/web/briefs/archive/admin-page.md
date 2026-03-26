# Layout Brief: Admin Page (`/admin`)

**Brief ID**: S3-M2
**Prepared by**: web_designer
**Date**: 2026-03-08
**Design system version**: 1.6
**Target agent**: graphic_designer
**Backlog entry**: `docs/web/mockups/BACKLOG.md` → S3-M2

---

## Purpose

Produce one desktop SVG mockup of the Admin page in its complete, current state. This brief supersedes any previous Admin page description. The page has been significantly simplified — it now contains exactly two cards with no additional panels.

---

## Page overview

Route: `/admin` (admin role required)
Layout: App shell — sidebar (220px fixed) + scrollable main area
Max content width: `max-w-5xl mx-auto`
Padding: `px-6 py-6` desktop

---

## Exact component composition

Reading top to bottom:

```
AppShell (sidebar + main)
└── main area (px-6 py-6, max-w-5xl)
    ├── PageHeader — "Administration"
    ├── SystemInfoCard
    └── LiveLogViewer
```

There are no other components. The `DebugToggle` card does not exist. The `GuardrailsPanel` does not appear on this page — it lives on the Assistant page.

---

## Component 1: PageHeader

- Text: "Administration"
- Typography: `text-2xl font-semibold text-zinc-900`
- No action button in the header (admin page is read-only display)
- Bottom border or separator below: `border-b border-zinc-200 pb-4 mb-6`

---

## Component 2: SystemInfoCard

**Card**: `rounded-xl border border-zinc-200 shadow-sm`

**Card header**: Title "System Information" (`text-xl font-semibold`)

**Card content** (populated/normal state):

A two-column definition list (`dl`) with `grid grid-cols-2 gap-x-4 gap-y-3`:

| Label (dt) | Value (dd) | Notes |
|---|---|---|
| Version | `1.4.2` | — |
| API Version | `v1` | — |
| Uptime | `2d 4h 37m` | Live-ticking; this value changes every second — indicate with a "live" annotation in the mockup |
| Python | `3.12.3` | — |
| Platform | `Linux-6.x-amd64` | — |
| Debug | `Off` | — |
| Verbose | `Off` | — |

Label (`dt`): `text-sm font-medium text-zinc-500`
Value (`dd`): `text-sm text-zinc-900`

**Loading state** (separate sub-frame or annotation): skeleton grid — 8 skeleton pills (4 rows × 2 cols), alternating `w-24` and `w-32` widths, `h-4`.

**Error state** (separate sub-frame or annotation): centered `text-sm text-red-600` + outline "Try again" button.

---

## Component 3: LiveLogViewer

This is the dominant component — it is visually larger and more complex than SystemInfoCard.

**Card**: `rounded-xl border border-zinc-200 shadow-sm`

### Card header

The header contains a single row of controls. The row uses `flex flex-wrap items-center justify-between gap-3` between the title and the control cluster.

Left side of header:
- Card title "Live Log Stream" (`text-xl font-semibold`)

Right side of header (control cluster, `flex flex-wrap items-center gap-3`):

| Control | Component | Notes |
|---|---|---|
| Debug switch | `Switch` (default size) + `Label` "Debug" | Switch is off in the primary mockup frame. Label is `text-sm text-zinc-700`. |
| Connection status | `Badge variant="outline"` | Show "connected" state: `bg-green-50 text-green-700 border-green-200`. Also document: "disconnected" = zinc, "error" = red. |
| Level selector | `Select` (`w-28`, `size="sm"`) | Show "INFO" as the selected value. Options: DEBUG, INFO, WARNING, ERROR. |
| Connect/Disconnect button | `Button size="sm" variant="outline"` | When connected, shows "Disconnect" (outline variant). When disconnected, shows "Connect" (default/primary variant). Show connected state in primary frame. |
| Clear button | `Button size="sm" variant="ghost"` | Label "Clear". No icon. |

All controls in the right cluster are on one visual row at desktop width. On narrower widths they wrap.

### Card content — log body

The log output area:
- Background: `bg-zinc-50` (light grey — NOT a dark background)
- Border: `border border-zinc-200 rounded-md`
- Padding: `p-3`
- Height: `max-h-64` mobile / `max-h-96` (384px) desktop — show desktop height in mockup
- Overflow: `overflow-y-auto` (scroll indicator visible when content exceeds height)
- Font: `font-mono text-xs leading-relaxed`

**Each log line** is a flex row (`flex items-start gap-2 py-0.5`):

```
[timestamp]  [LEVEL badge]  [logger name]  [message text]
```

Column details:
- Timestamp: `text-zinc-500`, monospace, format "14:23:07"
- Level badge: `Badge variant="outline" font-mono text-xs` with level-specific colors:
  - DEBUG: `bg-zinc-100 text-zinc-600 border-zinc-200`
  - INFO: `bg-blue-50 text-blue-700 border-blue-200`
  - WARNING: `bg-amber-50 text-amber-700 border-amber-200`
  - ERROR: `bg-red-50 text-red-700 border-red-200`
- Logger name: `text-zinc-500 shrink-0`
- Message text: `text-zinc-900 break-all min-w-0`

Show approximately 8–10 realistic log lines in the mockup. Include at least one INFO, one DEBUG, one WARNING, and one ERROR line to demonstrate all badge variants.

**Empty/disconnected state** (annotation): `text-zinc-500 italic` text "Connect to start streaming logs."

**Footer note** (when buffer full): `text-xs text-zinc-500 mt-1` — "Showing last 500 lines. Older entries have been discarded." This appears below the log area, not inside it.

---

## Interaction states to annotate

| State | Where | Visual treatment |
|---|---|---|
| Debug switch ON | Header | Switch thumb right, filled |
| Debug switch OFF | Header (primary frame) | Switch thumb left, unfilled |
| Disconnected | Header badge + Connect button | Badge zinc, button is primary/default variant, label "Connect" |
| Connecting | Connect button | Button disabled, label "Connecting..." |
| Connected | Header badge + Disconnect button | Badge green, button is outline variant, label "Disconnect" |
| Log body scrolled up | Log area | Scroll position not at bottom; new lines accumulate but auto-scroll pauses |

---

## Sizing and spacing reference

- `space-y-6` between PageHeader and SystemInfoCard, and between SystemInfoCard and LiveLogViewer
- Card internal padding: `p-6` for settings-style cards (use `p-4` standard for these cards, consistent with CardHeader/CardContent default)
- No decorative elements between cards

---

## What NOT to include

- No `DebugToggle` standalone card above `SystemInfoCard`
- No `GuardrailsPanel`
- No dark terminal background in the log viewer — the log area is `bg-zinc-50`
- No "Pause / Resume" button — the controls are Connect / Disconnect / Clear

---

## Output specification

**File**: `docs/web/mockups/admin-page.svg`
**Canvas**: 1440px wide × auto height (capture full page scroll height)
**Frames**: One primary desktop frame. Annotate loading/error states as inset sub-frames or callout annotations rather than separate full-page frames.
**Font rendering**: Use system-stack sans for UI text, monospace stack for log content.
