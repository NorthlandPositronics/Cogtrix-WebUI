# Mockup Backlog

**Raised by**: DesignForge audit — 2026-03-06
**Last revised**: 2026-03-24 — S2-M1, S2-M3, S3-M1, S3-M2, S4-M2, S4-M3 reviewed and approved by web_designer (all DS v3.6 compliant; teal accent throughout; no blocking issues).
**Owner**: web_designer

This file tracks all pages and component areas that have been implemented without a reviewed and approved SVG mockup. The current implementations follow the page architecture and component specs in `docs/web/design-system.md` (section 14), but pixel-precise visual review has not been completed. Mockups must be produced by `graphic_designer`, reviewed by `web_designer`, and approved before any visual rework by `web_coder`.

### Position on existing implementations

Pages listed below were built ahead of the mockup review cycle. They are **not** considered approved by virtue of having been implemented. The approved mockup remains the authoritative build target. Once a mockup for a given page reaches APPROVED status, `web_coder` must reconcile the implementation against that mockup. Divergences that conflict with the design system will require correction; divergences that are neutral or additive may be accepted with a documented rationale.

### Accessibility remediation tracked here

| ID | Component | Spec change | Design system version | Priority | Resolved |
|---|---|---|---|---|---|
| A-001 | `ToolActivityRow` — status text ("Running...", duration) | `text-zinc-400` → `text-zinc-500` | v1.1 | High — WCAG AA failure | RESOLVED 2026-03-24 — `StatusBar.tsx` uses `text-zinc-500` throughout (timestamps, duration, ellipsis). Verified against source. |

---

## Status key

| Status | Meaning |
|---|---|
| `PENDING` | Not yet briefed to graphic_designer |
| `BRIEFED` | Brief sent, mockup in progress |
| `IN REVIEW` | SVG submitted, web_designer reviewing |
| `APPROVED` | Mockup approved, web_coder may build against it |
| `SUPERSEDED` | A later mockup replaces this entry |

---

## Sprint 2 — Sessions (highest priority)

### S2-M1: `/sessions` — Sessions dashboard

**Status**: APPROVED — 2026-03-24
**Brief**: `docs/web/briefs/sessions-page.md`
**Files**:
- `docs/web/mockups/sessions-desktop.svg` — 1440px; 3-column grid (6 cards), empty state, loading skeletons, NewSessionDialog open, ConfirmDialog annotation. Teal accent throughout (DS v3.6). Overwrites stale violet v1.6 file.

**Scope**: Full page at desktop (`lg+`) and mobile breakpoints.

Desktop composition:
- App shell with sidebar visible
- Page header: "Sessions" title (`text-2xl font-semibold`) left-aligned, "New Session" primary button right-aligned
- Session card grid: 3 columns at `xl`, 2 columns at `md`, 1 column mobile
- Each `SessionCard`: session name (`text-base font-medium`), `AgentStateBadge`, model alias subtitle (`text-sm text-zinc-500`), relative timestamp (`text-xs text-zinc-500`). Archive trash icon button appears on hover (desktop) or always visible (mobile). **No provider field on the card.**
- Empty state: centered `MessageSquare` icon (48px, `text-zinc-400`, `strokeWidth={1.5}`), "No sessions yet." heading, "Create one to get started." subtext, second `NewSessionDialog` trigger button
- `NewSessionDialog` open state: modal (`max-w-lg`), three fields: Name (text input, placeholder "Untitled Session"), Model (Select, default option + model aliases), Memory mode (Select, default + conversation/code/reasoning options). No provider selector field. Cancel + Create buttons in footer.
- Infinite scroll sentinel below the grid (no visible UI element — loading skeletons appear when fetching next page)

Mobile composition (below `lg`):
- Sidebar replaced by hamburger top bar
- Cards stack single column, full width

Key interaction states to show:
- Default card (populated with realistic data)
- Card hover state (archive button revealed)
- Empty state
- `NewSessionDialog` open with Name partially filled

**Design system references**: §4 (layout), §5 (Cards, Dialogs, Buttons), §12 (SessionCard, Dialog), §14 (Sessions Dashboard hierarchy).

---

### S2-M2: `/sessions/:id` — Chat page, desktop full layout

**Status**: APPROVED — 2026-03-23
**Submitted**: 2026-03-23
**Files**:
- `docs/web/mockups/chat-desktop.svg` — 1440×900px desktop; three-column layout (sidebar + chat + Memory panel), all 5 message types, StatusBar expanded, all send-button interaction states
- `docs/web/mockups/chat-mobile.svg` — 390×844px mobile (iPhone 14 Pro); no sidebar, no right panel, collapsed StatusBar

**Teal migration note**: All accent colors use DS v3.6 teal tokens (`#0d9488` primary, `#f0fdfa` teal-50, `#99f6e4` teal-200, `#14b8a6` teal-500). User bubble: `bg-teal-50 border-teal-200`. Send button: `bg-teal-600`. AgentStateBadge thinking dot: `bg-teal-600`. StatusBar running indicator: `border-teal-500`, pulse dot `bg-teal-500`.

**Scope**: Desktop layout with Memory panel open (right panel position), plus separate mobile frame.

Desktop composition:
- Sidebar (220px) + chat area (`flex-1`) + right panel (320px, Memory panel open as default example)
- `SessionHeader`: session name left, `AgentStateBadge` adjacent (thinking state), panel toggle icon buttons right (Memory active teal, Tools inactive)
- Message list (scrollable, fills available height, messages in chronological order oldest-first):
  - User message bubble (teal-50, right-aligned)
  - Assistant message bubble (white, left-aligned, with markdown prose + tool call summary row)
  - System message (centered, zinc-100, italic)
  - Tool message (zinc-50, monospace, border-l-2 zinc-400)
  - `StreamingMessageBubble` with blinking cursor at bottom
- StatusBar expanded: 2 completed history entries, 1 running entry (teal left accent + pulse dot)
- Message input: textarea with text, Send button (teal), mode selector
- Right panel (Memory): mode row, mode switcher, token usage progress bar, stats block, summary trigger, clear memory button

Key interaction states shown (in panel annotation area):
- Send button: default, hover, loading, disabled
- Textarea: focus, empty, error

Mobile composition (separate frame):
- AppShell mobile header with hamburger + C-mark logo centered
- Session header tighter (model selector w-24)
- 3 messages (user, assistant+tool summary, streaming)
- StatusBar collapsed (summary row only)
- Full-width message input

**Design system references**: §4 (Session page layout), §6 (Agent state colors), §7 (Message bubbles, StatusBar, streaming cursor), §12 (all Session-area components), §15 (Memory panel token thresholds).

---

### S2-M3: `/sessions/:id` — Tools sidebar panel

**Status**: APPROVED — 2026-03-24
**Brief**: `docs/web/briefs/chat-tools-panel.md`
**Files**:
- `docs/web/mockups/chat-tools-panel.svg` — 1440×1100px; three-column shell (sidebar simplified, chat simplified, Tools panel full detail); all 8 tool rows with all 5 status variants; TriSwitch in all 3 positions per DS §5; status badge semantics annotation; filter no-match state; interaction state annotations.

**Scope**: Isolated frame showing the right panel in "Tools" mode. Reuses the three-column shell frame from S2-M2 but focuses on the panel content.

Panel content:
- Panel header: "Tools" title, close button (X icon, ghost)
- Filter bar: search input with Lucide `Search` icon (16px, `text-zinc-400`), `border-b border-zinc-200`
- Tool list: each row contains
  - Left block: tool name (`text-sm font-medium text-zinc-900`), status badge (colored per tool status), optional MCP badge (`outline` variant), short description (`text-xs text-zinc-500`)
  - Right block: `TriSwitch` (64×24px, three positions per DS §5) — supersedes the earlier Load/Unload + Switch two-control design
- Show at least one tool in each distinct state: `pinned` (zinc), `active` (green), `on_demand` (blue), `disabled` (zinc-muted), `auto_approved` (teal)
- Empty/filter-no-match state: centered text `text-sm text-zinc-500`

**Design system references**: §5 (TriSwitch, Badges — tool status colors), §12 (ToolsSidebar, TriSwitch).

---

## Sprint 3 — Settings and Admin

### S3-M1: `/settings` — Settings page

**Status**: APPROVED — 2026-03-24
**Brief**: `docs/web/briefs/settings-page.md`
**Files**:
- `docs/web/mockups/settings-desktop.svg` — 1440×2640px; three stacked frames: General tab (ConfigFlagsForm, 5 flags with Switch states, Reload button), Providers & Models tab (Providers table with 3 rows including health states, Models table with 3 rows including Switch-to buttons, non-admin annotation), MCP Servers tab (2 server rows, Add button, empty state annotation).

**Scope**: Desktop layout. Five tabs; show General and Providers & Models tabs as primary frames.

Frame 1 — General / ConfigFlagsForm tab:
- App shell + page header "Settings" (`text-2xl font-semibold`)
- `Tabs` bar: General (active), Providers & Models, MCP Servers, API Keys, Setup Wizard
- Config summary block: `rounded-xl border border-zinc-200 bg-zinc-50 p-4`, two-column `dl` — Active model (left), Memory mode (right), Config file path (full width, `font-mono text-xs`)
- Feature-flag rows: `divide-y divide-zinc-200` list, each row is `flex items-center justify-between py-4` — label + description left, `Switch` right
- Five flags in order: Debug mode, Verbose logging, Prompt optimizer, Parallel tool execution, Context compression
- Reload-from-disk button (`outline` size sm) bottom-right, admin-only

Frame 2 — Providers & Models tab:
- Two stacked `<section>` blocks with `space-y-8` between them
- **Providers section** heading (`text-lg font-semibold`): table with columns Name, Type, Base URL, API Key (dot indicator + text), Health (ghost button "Check" with `Activity` icon; after check: `CheckCircle2` green or `XCircle` red + latency text). No "Switch to" button. No Status column.
- **Models section** heading: table with columns Alias, Provider, Model name, Status (dot + text), Action ("Switch to" outline sm button for non-active models, admin only; active model row has no action button)

Frame 3 — MCP Servers tab:
- Table: server name, URL, status badge, remove action
- "Add MCP Server" primary button above table

Notes: Setup Wizard tab is a multi-step flow; the graphic_designer may show it as a brief step-indicator frame rather than a full content frame.

**Design system references**: §5 (Tables, Cards, Tabs, Buttons, Switch), §14 (Settings hierarchy).

---

### S3-M2: `/admin` — Admin page

**Status**: APPROVED — 2026-03-24
**Brief**: `docs/web/briefs/admin-page.md`
**Files**:
- `docs/web/mockups/admin-desktop.svg` — 1440×1040px; SystemInfoCard (7-field dl grid, "live" uptime annotation), LiveLogViewer card (debug Switch OFF, connected green badge, INFO level Select, Disconnect button, 10 realistic log lines with all badge variants, state annotations). No DebugToggle card. No GuardrailsPanel. Log body bg-zinc-50 (light). Teal accent throughout. Overwrites stale violet v1.6 file.

**Scope**: Desktop layout. Admin-only route.

Composition (complete page — two cards only):
- App shell + page header "Administration" (`text-2xl font-semibold`)
- `SystemInfoCard`: Card with title "System Information". Content: two-column `dl` grid — Version, API Version, Uptime (live-ticking, shown as "2d 4h 37m"), Python, Platform, Debug (On/Off), Verbose (On/Off). Loading state: skeleton grid. Error state: red error text + Retry button.
- `LiveLogViewer`: Card with title "Live Log Stream" and a dense header control bar. Controls (left to right in the header, all on one row, wrapping on small screens): debug `Switch` + "Debug" label, connection status `Badge` (colored: green=connected, zinc=disconnected, red=error), log level `Select` (w-28, options DEBUG/INFO/WARNING/ERROR), connect/disconnect `Button` (sm, default variant when disconnected / outline when connected), clear `Button` (sm, ghost). Log body: monospace area `max-h-64 md:max-h-96`, `bg-zinc-50 rounded-md border border-zinc-200 font-mono text-xs leading-relaxed`. Each log line: timestamp (`text-zinc-500`), level badge (DEBUG=zinc, INFO=blue, WARNING=amber, ERROR=red — all light tint surfaces), logger name (`text-zinc-500`), message (`text-zinc-900`). Connected state shows live lines. Disconnected/empty state shows italic placeholder text.

**Critical note to graphic_designer**: There is no `DebugToggle` card. There is no `GuardrailsPanel` on this page. The debug toggle is a Switch inside the LiveLogViewer card header. The LiveLogViewer background is `bg-zinc-50` (light), not a dark terminal surface — the dark terminal treatment described in earlier briefs is superseded.

**Design system references**: §3 (LiveLogViewer height exception), §5 (Cards, Switch, Select, Buttons, Badges), §14 (Admin hierarchy).

---

## Sprint 4 — Documents, Assistant, 404

### S4-M1: `/documents` — Documents page

**Status**: APPROVED — 2026-03-23
**Submitted**: 2026-03-23
**Files**:
- `docs/web/mockups/documents-desktop.svg` — 1440×900px desktop; sidebar (Documents active), page header with Upload button, SemanticSearchBar, 4 DocumentCards (indexed×2, processing, failed), DocumentUploadDialog open state, hover state, empty state

**Teal migration note**: All accent colors use DS v3.6 teal tokens. Upload button and Search button: `bg-teal-600`. Active nav item: `bg-teal-50 text-teal-600`.

**Scope**: Desktop layout.

Composition:
- App shell + page header "Documents" (`text-2xl font-semibold`), "Upload" primary button right-aligned
- `SemanticSearchBar`: prominent search input at top of content area (`max-w-xl`), with Lucide `Search` icon inside
- `DocumentCard` list below: 4 cards showing all status states (indexed, processing with amber pulse, failed)
- `DocumentUploadDialog`: modal (`max-w-md`), file drop zone with Lucide `Upload` icon (48px, `text-zinc-400`), Upload button disabled (no file selected)
- Interaction states: card hover (bg-zinc-50, delete button hover red), empty state with Upload trigger

**Design system references**: §5 (Cards, Dialogs), §9 (document status text pulse — `text-amber-700 animate-pulse` on processing state), §14 (Documents hierarchy).

---

### S4-M2: `/assistant` — Assistant page

**Status**: APPROVED — 2026-03-24
**Brief**: `docs/web/briefs/assistant-page.md`
**Files**:
- `docs/web/mockups/assistant-desktop.svg` — 1440×1900px; Frame 1 (Chats tab active, AssistantChatList with 5 rows, ServiceControlPanel running state, service status annotations), Frame 2 (Guardrails tab active — GuardrailsPanel: Recent Violations table with 5 rows including all 3 badge types, Blacklisted Chats table with 3 rows, empty/error/confirm-dialog annotations).

**Scope**: Desktop layout. This is the assistant management surface.

Composition:
- App shell + page header "Assistant" (`text-2xl font-semibold`)
- `ServiceControlPanel`: card at top titled "Service Status". Running state: green badge "Running", channels list (`text-sm text-zinc-500`), live-ticking uptime. Admin controls: Stop button (outline, red border/text) or Start button (primary). Stopping state: outline button with spinner.
- `Tabs` with 6 tabs (in order): Chats, Scheduled, Deferred, Contacts, Knowledge, Guardrails
- Frame 1 (Chats tab): `AssistantChatList` table
- Frame 2 (Scheduled tab): `ScheduledMessageTable` table
- Frame 3 (Deferred tab): `DeferredRecordTable` table
- Frame 4 (Guardrails tab — new, must be shown): `GuardrailsPanel` — two cards stacked with `space-y-6`
  - Card 1 "Recent Violations": header has title + "N total" badge. Table: Time, Chat ID, Channel, Type (badge), Detail. Violation type badge colors: rate_limit=amber, content_filter=red, spam=orange.
  - Card 2 "Blacklisted Chats": header has title + count badge. Table: Chat ID, remove button (ghost, `text-red-600`, trash icon, `h-11 w-11`).
- Contacts and Knowledge tabs: show as collapsed tab stubs in the primary frame

Note to graphic_designer: the Guardrails tab is the most important new frame in this sprint. Show it as a primary frame with realistic data in both tables.

**Design system references**: §5 (Tables, Cards, Tabs, Buttons, Badges), §14 (Assistant hierarchy).

---

### S4-M3: `*` — 404 Not Found page

**Status**: APPROVED — 2026-03-24
**Files**:
- `docs/web/mockups/not-found.svg` — 1440×900px; centered on bg-zinc-50; FileQuestion icon 48px zinc-400, "404" text-3xl font-bold zinc-900, "Page not found" text-xl zinc-500, brief message text-sm zinc-500, "Go home" outline button.

**Scope**: Single frame, no sidebar.

Composition:
- Full viewport, `min-h-screen flex items-center justify-center bg-zinc-50`
- Centered: `FileQuestion` Lucide icon (48px, `text-zinc-400`, `strokeWidth={1.5}`)
- "404" in `text-3xl font-bold text-zinc-900`
- "Page not found" in `text-xl text-zinc-500`
- Brief message `text-sm text-zinc-500 max-w-sm text-center`
- "Go home" outline button

**Design system references**: §4 (unauthenticated layout), §5 (Buttons).

---

## Sprint 5 — Session config fields and MessageInput

### S5-M1: `NewSessionDialog` — Advanced config section

**Status**: APPROVED WITH NOTES — 2026-03-24
**Brief**: `docs/web/briefs/session-config-dialog.md`
**Files**:
- `docs/web/mockups/new-session-dialog-advanced.svg` — 1200×700px; Frame A (collapsed, default state — three existing fields + Advanced trigger row + footer), Frame B (expanded — all six fields including system prompt textarea, max steps number input + helper span, context compression Switch unchecked; hr separator; resize-y handle indicator).

**Notes for web_coder**:
- Chevron icon uses `text-zinc-400` per brief spec. This is below WCAG AA 3:1 for non-text graphics in isolation (2.35:1) but the adjacent "Advanced" label is the primary affordance. Accepted per DS §10 iconography rationale. No change required.
- The trigger button requires `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` — not shown in mockup frames; implement per brief §6 token reference.
- The `max-w-lg` dialog renders input fields at ~468px width in Frame B — correct and expected.

**Design system references**: §5 (Dialogs, Inputs, Textarea, Switch, Buttons), §14 (Sessions hierarchy).

---

### S5-M2: `SessionHeader` — Settings popover

**Status**: APPROVED WITH NOTES — 2026-03-24
**Brief**: `docs/web/briefs/session-settings-header.md`
**Files**:
- `docs/web/mockups/session-settings-popover.svg` — 1320×640px; Frame A (full-width header bar crop showing active Settings gear button in teal-50/teal-600, popover attached below with Save disabled), Frame B (popover close-up showing dirty state: system prompt filled, max steps 50, context compression Switch ON/teal, Save enabled in teal-600).

**Notes for web_coder**:
- Disabled Save button in Frame A is rendered as flat zinc-300. Implement via shadcn/ui `disabled` prop on `Button` (applies `opacity-50` to the primary teal button — not a gray fill).
- Focus ring on textarea in Frame B uses `opacity="0.5"` — SVG approximation only. Actual `focus-visible:ring-2 ring-ring` must be at full opacity.
- Extract to `src/pages/chat/SessionSettingsPopover.tsx` per brief §12.
- Brain and Wrench buttons are omitted from Frame A (canvas space constraint); their treatment is `h-11 w-11 text-zinc-500 ghost` at rest, same as Trash2.

**Design system references**: §5 (Buttons, Popover, Textarea, Switch, Inputs), §14 (Session chat header).

---

### S5-M3: `MessageInput` — Optimize prompt toggle

**Status**: APPROVED WITH NOTES — 2026-03-24
**Brief**: `docs/web/briefs/optimize-prompt-toggle.md`
**Files**:
- `docs/web/mockups/optimize-prompt-toggle.svg` — 900×320px; 2×2 grid of four variants: A (off/empty), B (on/empty + tooltip), C (on/text/send enabled), D (disabled/agent running); annotation callouts; color swatch legend at bottom.

**Notes for web_coder**:
- Textarea in Variant C shows a teal-colored focus border — this is a mockup convenience only. Actual textarea focus ring uses `focus-visible:ring-2 ring-ring` (zinc-400), not teal.
- Hover states are documented in the swatch legend (zinc-100 off, teal-100 on) and not shown as separate frames. Implement per brief §states.
- Variant D shows optimize button with ON-state colors at opacity-50. If the button is in OFF state when agent starts running, it will appear as zinc-500 at opacity-50. Both are correct — opacity-50 applies uniformly per DS §8 regardless of ON/OFF state.
- `aria-label` must reflect current state: "Optimize prompt (off)" / "Optimize prompt (on)" per brief.

**Design system references**: §1 (teal accent), §5 (ghost buttons, WCAG 1.4.11 compliance), §10 (Sparkles icon sizing w-4 h-4).

---

## Approved mockups (reference)

| File | Route / Component | Sprint | Approved |
|---|---|---|---|
| `sprint-1-login.svg` | `/login` | 1 | — |
| `sprint-1-register.svg` | `/register` | 1 | — |
| `sprint-1-shell-desktop.svg` | App shell (desktop) | 1 | — |
| `sprint-1-shell-mobile.svg` | App shell (mobile) | 1 | — |
| `chat-desktop.svg` | `/sessions/:id` (desktop) | 2 | 2026-03-23 |
| `chat-mobile.svg` | `/sessions/:id` (mobile) | 2 | 2026-03-23 |
| `sessions-desktop.svg` | `/sessions` (desktop) | 2 | 2026-03-24 |
| `chat-tools-panel.svg` | `/sessions/:id` (Tools panel) | 2 | 2026-03-24 |
| `settings-desktop.svg` | `/settings` (desktop) | 3 | 2026-03-24 |
| `admin-desktop.svg` | `/admin` (desktop) | 3 | 2026-03-24 |
| `documents-desktop.svg` | `/documents` (desktop) | 4 | 2026-03-23 |
| `assistant-desktop.svg` | `/assistant` (desktop) | 4 | 2026-03-24 |
| `not-found.svg` | `*` (404) | 4 | 2026-03-24 |
| `new-session-dialog-advanced.svg` | `NewSessionDialog` advanced section | 5 | 2026-03-24 |
| `session-settings-popover.svg` | `SessionHeader` settings popover | 5 | 2026-03-24 |
| `optimize-prompt-toggle.svg` | `MessageInput` optimize toggle | 5 | 2026-03-24 |

---

## Process

When a mockup moves from PENDING to BRIEFED, update the status here and link to the brief document or the relevant task reference. When approved, update status to APPROVED and note the date. This file is maintained by `web_designer` — do not edit it without consulting the web_designer agent.

When an accessibility remediation item (table above) is resolved by `web_coder`, the item should be marked resolved with the date and the implementing commit reference. Resolved items are not deleted — they remain as a permanent audit record.
