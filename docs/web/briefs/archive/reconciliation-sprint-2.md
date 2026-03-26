# Reconciliation Sprint 2 — Mockup vs. Implementation Audit

**Date**: 2026-03-24
**Auditor**: web_designer
**Design system version**: 3.6
**Scope**: 6 approved mockups (S2-M1, S2-M3, S3-M1, S3-M2, S4-M2, S4-M3)
**Addressee**: web_coder

---

## How to read this brief

Each page section contains a divergence table followed by page-specific notes. After all pages, the document contains:

1. **Consolidated REQUIRED corrections list** (REQ-001 onward) — these must be addressed before the sprint is closed.
2. **Accepted deviations** — neutral or additive differences that do not require correction.

The mockup is the authoritative build target. Divergences that contradict DS tokens or mislead users are REQUIRED. Divergences that are purely additive, or where the implementation correctly applies a DS rule the mockup approximated, are ACCEPTED.

**Important badge note carried from audit brief**: Green badges in SVG mockups use `green-100/green-300` fill/border approximation (SVG cannot reference CSS tokens). In code, always use DS §5 spec: `bg-green-50 border-green-200 text-green-700`.

---

## S2-M1 — Sessions Dashboard

**Mockup**: `docs/web/mockups/sessions-desktop.svg`
**Source**: `src/pages/sessions.tsx`, `src/components/SessionCard.tsx`, `src/pages/sessions/NewSessionDialog.tsx`

### Divergence table

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| `EmptyState` | Centered `MessageSquare` icon 48px `text-zinc-400` `strokeWidth={1.5}` above heading and subtext | No icon present — only heading text, subtext, and button | REQUIRED | REQ-001 |
| `ConfirmDialog` (session deletion) | Annotation: title "Archive session", confirm button "Archive" | Title "Delete session", confirm label "Delete" | REQUIRED | REQ-002 |
| `SessionCard` — name typography | `text-base font-medium text-zinc-900` | `text-base leading-tight font-medium text-zinc-900` | ACCEPTED | Extra `leading-tight` is consistent with DS §2 heading rules for tight labels; no visual regression |
| `SessionCard` — grid columns | 3-col at `xl`, 2-col at `md`, 1-col mobile | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` | ACCEPTED | Matches mockup exactly |
| `NewSessionDialog` — width | `max-w-lg` | `max-w-lg` | ACCEPTED | Match |
| `NewSessionDialog` — fields | Name, Model, Memory mode — three fields, no provider field | Same three fields, no provider | ACCEPTED | Match |
| `SessionCardSkeleton` | 4 skeleton bars (name, badge, subtitle, timestamp) at varying widths | 4 skeletons at `h-4 w-40`, `h-3 w-20`, `h-3 w-32`, `h-3 w-16` | ACCEPTED | Proportions approximate mockup; no correction needed |

### Notes

**REQ-001 justification**: The empty state icon is a primary wayfinding element — without it, a user arriving at an empty sessions page sees only text and may not understand the UI state at a glance. Mockup explicitly specifies `MessageSquare` at 48px as the visual anchor.

**REQ-002 justification**: "Archive" and "Delete" communicate fundamentally different outcomes to users. The mockup annotation specifies "Archive session" with "Archive" as the confirm label, implying the session is removed from the list but recoverable. The code says "Delete session" with "Delete" and the description reads "permanently deleted." These are different affordances. The codebase must align to one model. Since the API endpoint is `DELETE /sessions/{id}` (permanent removal), the code description is factually correct — but the label must match the mockup spec or the mockup must be updated. For this sprint the brief requires the label to match the mockup: title "Archive session", description communicating removal from list (not permanent deletion), confirm label "Archive". If the backend does not support archiving and only supports deletion, the web_coder must note this and escalate to the architect before implementing.

---

## S2-M3 — Tools Sidebar Panel

**Mockup**: `docs/web/mockups/chat-tools-panel.svg`
**Source**: `src/pages/chat/ToolsSidebar.tsx`, `src/pages/chat/PanelShell.tsx`

### Divergence table

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| `ToolRow` — `auto_approved` badge label | "Auto-approved" (full text) | "Auto" (truncated) | REQUIRED | REQ-003 |
| `TriSwitch` — focus ring | DS §5 specifies `focus-visible:ring-teal-600` for TriSwitch specifically | `focus-visible:ring-ring` (uses semantic ring token) | REQUIRED | REQ-004 |
| `PanelShell` — panel width | 320px (`w-80`) | `w-80` (320px) | ACCEPTED | Match |
| `PanelShell` — close button | Ghost X, `text-zinc-500` | Ghost X, `h-11 w-11 text-zinc-500` | ACCEPTED | Match |
| Filter input search icon | `text-zinc-400` stroke in mockup approximation | `text-zinc-500` | ACCEPTED | DS §5 ghost icon-only buttons on white require `text-zinc-500`; code is correct per DS |
| Empty / no-match state | Centered text only: "No matching tools" (`text-sm text-zinc-500`) | `Wrench` icon (48px, `text-zinc-400`) + text | ACCEPTED | Additive improvement; icon does not conflict with DS |
| Tool list rows — loading state | 5 skeleton pills `h-12` | 5 skeletons `h-12 w-full rounded-md` | ACCEPTED | Match |
| Tool list rows — hover bg | `bg-zinc-50` on row hover | `hover:bg-zinc-50` | ACCEPTED | Match |
| TriSwitch — track and thumb colors | Per DS §5: position 0 zinc-200 track / white thumb; position 1 teal-100 / teal-500; position 2 green-100 / green-600 | Matches DS §5 exactly | ACCEPTED | Match |
| TriSwitch — disabled state for pinned tools | `opacity-50` on TriSwitch, pointer-events-none | `disabled && "pointer-events-none cursor-not-allowed opacity-50"` | ACCEPTED | Match |

### Notes

**REQ-003 justification**: The `auto_approved` badge label distinguishes this tool status from `active` — "Auto" is ambiguous to users who might read it as "Automatic" without understanding the approval context. The full label "Auto-approved" communicates that the tool executes without user confirmation prompts, which is a security-relevant distinction. Truncating to "Auto" loses this information.

**REQ-004 justification**: DS §5 TriSwitch section explicitly specifies `focus-visible:ring-teal-600` for the TriSwitch component. The current `ring-ring` token resolves to `ring-zinc-400` per the DS §1 semantic tokens table, which is the correct ring color for standard inputs but not for the TriSwitch — which must use the accent color to visually associate the focused control with the tool's active state palette. This is a DS compliance requirement.

---

## S3-M1 — Settings Page

**Mockup**: `docs/web/mockups/settings-desktop.svg`
**Source**: `src/pages/settings.tsx`, `src/pages/settings/ConfigFlagsForm.tsx`, `src/pages/settings/ProviderList.tsx`, `src/pages/settings/McpServerList.tsx`, `src/pages/settings/McpAddServerDialog.tsx`, `src/pages/settings/ApiKeyList.tsx`

### Divergence table

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| `ConfigFlagsForm` — flag count | 5 flags: Debug mode, Verbose logging, Prompt optimizer, Parallel tool execution, Context compression | 3 flags only: Prompt optimizer, Parallel tool execution, Context compression. Debug mode and Verbose logging are absent | REQUIRED | REQ-005 |
| `ProviderList` — section order | Providers section first, Models section below it | Models section rendered first, Providers section below | REQUIRED | REQ-006 |
| `ProviderList` — Models layout | Traditional table with columns ALIAS / PROVIDER / MODEL NAME / STATUS / ACTION. Active model: green dot + "Active" text. Inactive model: "Switch to" outline sm button. No radio button UI. | Radio-button card UI (`role="radiogroup"`) with teal-50 active card border, inline provider + model_name subtitle | REQUIRED | REQ-007 |
| `McpServerList` — Add button variant | Primary (`fill="#0d9488"`) teal button "Add MCP Server" above the table | `variant="outline"` secondary button "Add Server" | REQUIRED | REQ-008 |
| `McpServerList` — Add button label | "Add MCP Server" | "Add Server" | REQUIRED | REQ-008 (same fix) |
| `McpServerList` — table columns | NAME / URL / STATUS / ACTION | NAME / TRANSPORT / STATUS / TOOLS / ACTIONS | REQUIRED | REQ-009 |
| `ConfigFlagsForm` — config summary block | `rounded-xl border border-zinc-200 bg-zinc-50 p-4`, two-column `dl` | Same structure | ACCEPTED | Match |
| `ConfigFlagsForm` — flag row layout | `flex items-center justify-between py-4`, label + description left, Switch right | `flex items-center justify-between py-4` | ACCEPTED | Match |
| `ConfigFlagsForm` — Reload button | `variant="outline"` size sm, bottom-right, admin-only | Same | ACCEPTED | Match |
| `ProviderList` — API Key dot indicator | Colored dot (green=configured, zinc=none) + text label | Same: `bg-green-600` / `bg-zinc-400` dot, `text-xs text-zinc-600` label | ACCEPTED | Match |
| `ProviderList` — Health Check button | Ghost button with Activity icon + "Check" text; success: `CheckCircle2` green + latency; fail: `XCircle` red + "Unreachable" | Same | ACCEPTED | Match |
| Tab bar | 5 tabs: General, Providers & Models, MCP Servers, API Keys, Setup Wizard | Same 5 tabs with same labels | ACCEPTED | Match |

### Notes

**REQ-005 justification**: Debug mode and Verbose logging are operational controls visible in the config summary. Excluding them from the flag rows means an admin cannot toggle them from the Settings page, forcing use of the LiveLogViewer's Debug toggle instead. This is a functional gap. The mockup and the BACKLOG spec both list all 5 flags. Note: these two flags (`debug`, `verbose`) are not in the current `ConfigBooleanKey` type. web_coder must verify whether the `ConfigOut` type and `ConfigPatchRequest` type support these fields before implementing. If they do not, escalate to architect.

**REQ-006 justification**: The mockup defines a clear information hierarchy: Providers (the connection layer) precede Models (the usage layer). Reversing this order puts the more frequently changed element (models/model switching) before the less-changed element (providers), which has some UX merit — but the approved mockup is the build target and must be followed. If the PM wants the order reversed, the mockup must be updated first.

**REQ-007 justification**: The radio-card UI is a significant departure from the table layout. The radio card design is more touch-friendly and communicates the "select one active model" mental model well, but it diverges from the approved mockup specification in a way that changes the information density and column structure. The mockup's table shows Alias, Provider, Model Name, Status, and Action in scannable columns — this is particularly valuable when there are many models. The radio-card UI hides the model name inside a subtitle and removes the explicit Status column. This must be corrected to match the approved table layout.

**REQ-008 justification**: "Add MCP Server" with a primary teal button is the mockup spec. The current "Add Server" with outline variant is both label-incorrect and visually weaker than intended. The Add action is the primary CTA on this tab and must use `variant="default"` (teal).

**REQ-009 justification**: The mockup columns are NAME / URL / STATUS / ACTION — the four columns needed to understand and manage an MCP server connection. The implementation adds TRANSPORT and TOOLS columns and renames ACTION to ACTIONS (plural). The TRANSPORT and TOOLS columns are additive information but change the column order. This must align to the mockup: NAME / URL / STATUS / (TRANSPORT and TOOLS may follow as additional columns if needed by the product) / ACTION. At minimum, URL must appear in column 2 (not transport), and the button must be labeled correctly.

---

## S3-M2 — Admin Page

**Mockup**: `docs/web/mockups/admin-desktop.svg`
**Source**: `src/pages/admin.tsx`, `src/pages/admin/SystemInfoCard.tsx`, `src/pages/admin/LiveLogViewer.tsx`, `src/pages/admin/UserManagementPanel.tsx`

### Divergence table

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Page architecture | Two cards stacked: SystemInfoCard then LiveLogViewer. No tabs. No Users panel on this page. | 3-tab layout: System tab (SystemInfoCard), Live Logs tab (LiveLogViewer), Users tab (UserManagementPanel) | REQUIRED | REQ-010 |
| `SystemInfoCard` — CardTitle size | `font-size: 20` (text-xl equivalent) | `CardTitle className="text-xl"` | ACCEPTED | Match |
| `SystemInfoCard` — fields | 7 fields in 2-column dl: Version, API Version, Uptime (live), Python, Platform, Debug, Verbose | Same 7 fields | ACCEPTED | Match |
| `SystemInfoCard` — loading state | Skeleton grid | `grid grid-cols-2` skeleton pairs | ACCEPTED | Match |
| `SystemInfoCard` — error state | Red error text + Retry button | Same | ACCEPTED | Match |
| `LiveLogViewer` — card title | "Live Log Stream" at text-xl | `CardTitle className="text-xl"` | ACCEPTED | Match |
| `LiveLogViewer` — control order | Debug Switch + "Debug" label, connection Badge, level Select (w-28), connect/disconnect Button, Clear Button | Same order: Switch + Label, Badge, Select (`w-28`), Button, Clear Button | ACCEPTED | Match |
| `LiveLogViewer` — log body | `bg-zinc-50 rounded-md border border-zinc-200 font-mono text-xs leading-relaxed`, `max-h-64 md:max-h-96` | Same classes | ACCEPTED | Match |
| `LiveLogViewer` — level badge colors | DEBUG=zinc, INFO=blue, WARNING=amber, ERROR=red (all light tint surfaces) | `LEVEL_BADGE_CLASSES` map: DEBUG `bg-zinc-100 text-zinc-600 border-zinc-200`, INFO `bg-blue-50 text-blue-700 border-blue-200`, WARNING `bg-amber-50 text-amber-700 border-amber-200`, ERROR `bg-red-50 text-red-700 border-red-200` | ACCEPTED | Match |
| `LiveLogViewer` — connection badge: connected | Mockup SVG approximation uses `#dcfce7/#86efac` (green-200 fill/border) | Code: `bg-green-50 text-green-700 border-green-200` | ACCEPTED | Code matches DS §5 green badge spec; mockup SVG approximation is within expected tolerance |
| `LiveLogViewer` — description subtext | Not shown in mockup | Code renders `<p className="mt-0.5 text-xs text-zinc-500">` subtitle below the card title | ACCEPTED | Additive; does not conflict with DS |

### Notes

**REQ-010 justification**: The approved mockup defines the admin page as a linear two-card layout with no tab chrome. The implementation adds a `UserManagementPanel` as a third tab, which is an unreviewable addition since no mockup exists for it. The architecture decision to use tabs was a pre-mockup implementation choice. Now that the mockup is approved as the build target, the implementation must revert to the two-card stacked layout. The `UserManagementPanel` content should be moved to a location where it has an approved mockup — or a new mockup must be produced and approved before this panel can exist on the admin page.

**Escalation required**: Before web_coder implements REQ-010, the architect must confirm where `UserManagementPanel` belongs if it is removed from the admin tabs. Options: (a) keep it in an "Administration" section below the two cards as a third card on the same page — which would require a mockup update; (b) move to a separate admin sub-route; (c) remove until a mockup is approved. web_designer recommends option (a) with a mockup amendment rather than deleting the feature.

---

## S4-M2 — Assistant Page

**Mockup**: `docs/web/mockups/assistant-desktop.svg`
**Source**: `src/pages/assistant.tsx`, `src/pages/assistant/ServiceControlPanel.tsx`, `src/pages/assistant/AssistantChatList.tsx`, `src/pages/assistant/GuardrailsPanel.tsx`

### Divergence table

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| `AssistantChatList` — column structure | CHAT ID / CHANNEL / LAST MESSAGE / TIME (4 columns; CHAT ID is monospace; LAST MESSAGE is full message text; TIME is timestamp) | Name / Channel / Messages (count) / Last Message (relative time) | REQUIRED | REQ-011 |
| `AssistantChatList` — "CHAT ID" header vs "Name" | Column 1 header: "CHAT ID", content monospace font | Column 1 header: "Name", content is `display_name ?? chat_id`, non-monospace button | REQUIRED | REQ-011 (same fix) |
| `ServiceControlPanel` — CardTitle | `text-xl` | `text-xl` | ACCEPTED | Match |
| `ServiceControlPanel` — Stop button | `border-red-200 text-red-600` outline button | `border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700` | ACCEPTED | Hover state is additive; rest state matches |
| `ServiceControlPanel` — Stopping state | Outline button with Loader2 spinner, disabled | `variant="outline"` disabled with `animate-spin` Loader2 | ACCEPTED | Match |
| `ServiceControlPanel` — running info | Channels list `text-sm text-zinc-500`, uptime live-ticking | Same | ACCEPTED | Match |
| Tab bar | 6 tabs: Chats, Scheduled, Deferred, Contacts, Knowledge, Guardrails | 8 tabs: same 6 plus Campaigns and Workflows | ACCEPTED | DS changelog v2.3 explicitly documents 8 tabs; 2 extra tabs are DS-compliant additions |
| `GuardrailsPanel` — ViolationBadge: `rate_limit` | Mockup SVG `#fffbeb/#fde68a/#b45309` (amber approximation) | `bg-amber-50 text-amber-700 border-amber-200` | ACCEPTED | Code matches DS §5 exactly; SVG approximation is within tolerance |
| `GuardrailsPanel` — ViolationBadge: `content_filter` | Mockup SVG `#fef2f2/#fecaca/#b91c1c` (red approximation) | `bg-red-50 text-red-700 border-red-200` | ACCEPTED | Code matches DS §5 exactly |
| `GuardrailsPanel` — ViolationBadge: `spam` | Mockup SVG `#fff7ed/#fed7aa/#c2410c` (orange approximation) | `bg-orange-50 text-orange-700 border-orange-200` | ACCEPTED | Code matches DS §5 §1 orange spec exactly |
| `GuardrailsPanel` — Blacklist remove button | Ghost, `text-red-600`, `h-11 w-11`, trash icon | `h-11 w-11 text-red-600 hover:bg-red-50 hover:text-red-700`, ghost | ACCEPTED | Match (hover state additive) |
| `GuardrailsPanel` — CardTitle size | `text-base font-semibold` (mockup SVG `font-size=16`) | `CardTitle className="text-base"` | ACCEPTED | Match — DS §5 compact data-table card exception is correctly applied |
| `GuardrailsPanel` — count badge | Plain outline badge, no background tint | `Badge variant="outline"` with no tint class | ACCEPTED | Match |

### Notes

**REQ-011 justification**: The mockup column structure differs from the implementation in two meaningful ways. First, column 1 is "CHAT ID" in the mockup (monospace, showing the raw chat identifier) versus "Name" in the code (showing `display_name ?? chat_id` as a clickable text link in normal font). Second, the mockup includes a "LAST MESSAGE" column showing the full message text — a key piece of information for the admin monitoring chats — which the code replaces with a "Messages" count column that shows a number. The time column in the mockup shows an absolute timestamp format ("Today, 14:22"), while the code shows a relative time ("1h ago"). The column structure change means the admin cannot see what the most recent message content was directly in the table. This is a functional information gap.

The implementation's addition of a chat history drawer (clicking the name to see history) partially compensates for the missing last-message column, but the table column structure must still match the approved mockup. The clickable name with drawer is ACCEPTED as additive.

---

## S4-M3 — 404 Not Found Page

**Mockup**: `docs/web/mockups/not-found.svg`
**Source**: `src/pages/not-found.tsx`

### Divergence table

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| "404" text size | `text-3xl font-bold text-zinc-900` (30px, weight 700) | `text-xl leading-none font-normal text-zinc-500` | REQUIRED | REQ-012 |
| "Page not found" size | `text-xl text-zinc-500` (not a heading) | `text-xl font-semibold text-zinc-900` as an `h1` | REQUIRED | REQ-013 |
| `FileQuestion` icon | Present: 48px, `text-zinc-400`, `strokeWidth={1.5}` | Absent — no icon rendered | REQUIRED | REQ-014 |
| Background | `bg-zinc-50` (`#fafafa`) full viewport | White (`bg-white` default via `min-h-screen`) | REQUIRED | REQ-015 |
| "Go home" button | `variant="outline"`, links to home (`/`) | `variant="default"` (teal primary), links to `/sessions`, label "Go to Sessions" | REQUIRED | REQ-016 |
| Brief message | Two lines of `text-sm text-zinc-500` centered, `max-w-sm` | One line: "The page you're looking for doesn't exist or has been moved." — no `max-w-sm` constraint | REQUIRED | REQ-016 (same fix) |
| Layout container | `min-h-screen flex items-center justify-center bg-zinc-50` | `flex min-h-screen flex-col items-center justify-center` (missing `bg-zinc-50`, uses `gap-6 px-4 text-center`) | REQUIRED | REQ-015 |
| Content gap | Mockup: `space-y` between stacked elements | `gap-6` on the flex column | ACCEPTED | Both produce equivalent vertical spacing; no correction needed |

### Notes

The 404 page has the highest divergence count of any page in this audit. The implementation appears to have been built before the mockup was approved, and was not subsequently reconciled. All REQUIRED items are simple CSS and markup changes — no state logic is involved.

**REQ-012**: The "404" text is the visual hero of the page. `text-xl font-normal text-zinc-500` renders at 20px with normal weight and muted color — it reads as body text, not a page headline. The mockup specifies `text-3xl font-bold text-zinc-900` (30px, bold, dark). This is the one exception in the DS where `font-bold` and `text-3xl` appear outside the auth page — the DS §2 notes `text-3xl` for "Auth page headline only" but the 404 page is also an unauthenticated route in the same centered card pattern. The intent carries over.

**REQ-013**: "Page not found" is styled as `text-xl font-semibold text-zinc-900` in the code — this makes it appear as a heading. The mockup specifies `text-xl text-zinc-500` (muted, not bold) — it is subtitle text, not a heading. Semantically the `h1` is appropriate for the element, but the visual treatment (weight and color) must match the mockup.

**REQ-014**: The `FileQuestion` icon anchors the page visually and communicates "this is a document/page lookup failure" through iconography. Without it, the page feels unpolished and lacks the spatial anchor that centers the content block visually.

**REQ-015**: The `bg-zinc-50` background is explicit in the mockup and in the BACKLOG spec. The current `min-h-screen` flex container inherits the default white background. This must be `bg-zinc-50`.

**REQ-016**: The "Go home" button in the mockup is `variant="outline"` (secondary weight) because the 404 page is a dead-end state — there is no primary action to promote. Using the teal primary button over-emphasizes the navigation action. The destination should be `/` (home/root), not `/sessions` (which requires authentication). The label should be "Go home" as specified, not "Go to Sessions".

---

## Consolidated REQUIRED Corrections

| ID | Page | Component | Fix |
|---|---|---|---|
| REQ-001 | S2-M1 Sessions | `EmptyState` | Add `MessageSquare` icon from Lucide at 48px, `className="h-12 w-12 text-zinc-400"`, `strokeWidth={1.5}`, centered above the heading text |
| REQ-002 | S2-M1 Sessions | `ConfirmDialog` (session delete) | Change `title` to `"Archive session"`, `description` to text communicating the session will be removed from the list, `confirmLabel` to `"Archive"`. Before implementing, confirm with architect whether the API endpoint performs archiving or hard deletion — if hard deletion only, escalate to update the mockup's annotation language instead |
| REQ-003 | S2-M3 Tools | `ToolRow` — `auto_approved` badge | Change badge label from `"Auto"` to `"Auto-approved"`. Classes remain `border-teal-200 bg-teal-50 text-xs text-teal-700` per DS §5 |
| REQ-004 | S2-M3 Tools | `TriSwitch` — focus ring | Change `focus-visible:ring-ring` to `focus-visible:ring-teal-600` in the TriSwitch container `className`. DS §5 TriSwitch section explicitly requires `ring-teal-600` for this component |
| REQ-005 | S3-M1 Settings | `ConfigFlagsForm` — `FLAG_ROWS` | Add two flag entries: `{ key: "debug", label: "Debug mode", description: "Enable verbose debug output in server logs. Use only in development." }` and `{ key: "verbose", label: "Verbose logging", description: "Log additional detail for every agent step and API call." }`. Insert at positions 0 and 1 (before Prompt optimizer). Also add `"debug"` and `"verbose"` to `ConfigBooleanKey`. Verify `ConfigOut` and `ConfigPatchRequest` types expose these fields — if not, raise a type gap with the architect |
| REQ-006 | S3-M1 Settings | `ProviderList` — section order | Swap the section rendering order so that the Providers `<section>` is rendered first (`aria-labelledby="providers-heading"`) and the Models `<section>` is rendered second (`aria-labelledby="models-heading"`) |
| REQ-007 | S3-M1 Settings | `ProviderList` — Models layout | Replace the radio-card `role="radiogroup"` layout with a wrapped table: `<div className="overflow-x-auto rounded-xl border border-zinc-200"><Table>`. Columns: ALIAS / PROVIDER / MODEL NAME / STATUS / ACTION. Active model row: green dot + "Active" label in Status cell, no button in Action cell. Inactive model row: zinc dot + "Inactive" in Status, "Switch to" `variant="outline"` size sm button in Action (admin-only). Keep the existing mutation logic — only change the render structure |
| REQ-008 | S3-M1 Settings | `McpServerList` — Add button | Change the Add button to `variant="default"` (teal primary) and update the label to `"Add MCP Server"`. The button remains above the table, right-aligned. Admin-only guard unchanged |
| REQ-009 | S3-M1 Settings | `McpServerList` — table columns | Reorder and rename table columns to match mockup: NAME / URL / STATUS / ACTION. Remove the TRANSPORT and TOOLS columns from the visible table (or move to a hover tooltip / expanded row if product wants to preserve this data). The URL column must display the server's endpoint URL, not the transport type string |
| REQ-010 | S3-M2 Admin | Page architecture — tab layout | Remove the `Tabs` / `TabsList` / `TabsTrigger` shell from `AdminPage`. Render `SystemInfoCard` and `LiveLogViewer` as stacked cards with `space-y-6`, matching the mockup's two-card layout. Before removing the Users tab, confirm with architect where `UserManagementPanel` should be relocated — see escalation note in S3-M2 section above |
| REQ-011 | S4-M2 Assistant | `AssistantChatList` — columns | Rename column 1 header to "CHAT ID" (uppercase, DS table style). Make the chat ID text render in `font-mono text-sm text-zinc-900` (not as a styled link — the ChatHistoryDrawer trigger may remain if product wants it, but the cell content should show the chat ID in monospace). Add a "LAST MESSAGE" column (column 3) displaying the last message text truncated to one line (`max-w-xs truncate`). Replace the "Messages" count column with "TIME" showing an absolute timestamp format (e.g., "Today, 14:22") matching the mockup. The exact data fields must be verified against the API response type — if `last_message_text` is not in `AssistantChatOut`, escalate to architect |
| REQ-012 | S4-M3 404 | `NotFoundPage` — "404" text | Change `className` from `"text-xl leading-none font-normal text-zinc-500"` to `"text-3xl font-bold text-zinc-900"`. The element can remain a `<p>` tag — it is a decorative label, not a heading |
| REQ-013 | S4-M3 404 | `NotFoundPage` — "Page not found" text | Change the `<h1>` element styling from `"text-xl font-semibold text-zinc-900"` to `"text-xl font-normal text-zinc-500"`. The element should remain `<h1>` for document structure |
| REQ-014 | S4-M3 404 | `NotFoundPage` — missing icon | Add `<FileQuestion className="h-12 w-12 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />` as the topmost element inside the centered content group, above the "404" text |
| REQ-015 | S4-M3 404 | `NotFoundPage` — background and layout | Add `bg-zinc-50` to the outermost `<main>` element. Full class: `"flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4 text-center"` |
| REQ-016 | S4-M3 404 | `NotFoundPage` — button variant, target, label | Change Button `variant` to `"outline"`. Change `<Link to="/sessions">` to `<Link to="/">`. Change button label from `"Go to Sessions"` to `"Go home"`. Add the second sentence to the brief message: `"Check the URL or return to the home page."` wrapped in the existing `<p>` or as a second `<p>` with `max-w-sm text-center` |

---

## Accepted Deviations

| ID | Page | Component | Mockup expectation | Implementation | Rationale |
|---|---|---|---|---|---|
| A-001 | S2-M1 | `SessionCard` name | `leading-tight` not specified | `leading-tight` added | Consistent with DS §2 heading/label tight line-height rule |
| A-002 | S2-M3 | Filter bar search icon | `text-zinc-400` in SVG approximation | `text-zinc-500` | DS §5 requires `text-zinc-500` for ghost icon-only controls on white; code is correct |
| A-003 | S2-M3 | Empty / no-match state | Text only, no icon | `Wrench` icon added above text | Additive UX improvement; does not conflict with DS or mockup intent |
| A-004 | S3-M1 | ConfigFlagsForm config summary | `text-sm` for label/value pairs | Same | Match |
| A-005 | S3-M1 | ProviderList add-model inline form | Not in mockup | Inline provider/model-name form behind "Add model" button | Additive feature; does not affect the table structure requirement in REQ-007 |
| A-006 | S3-M2 | LiveLogViewer subtitle | Not in mockup | Added subtitle `text-xs text-zinc-500` below CardTitle | Additive; provides useful context for users |
| A-007 | S3-M2 | LiveLogViewer log body height | Mockup shows large log area; no explicit Tailwind class | `max-h-64 md:max-h-96` per DS §3 documented exception | DS §3 explicitly documents this as a component-specific sizing constraint |
| A-008 | S4-M2 | AssistantChatList chat history | Not in mockup | `ChatHistoryDrawer` triggered by clicking chat name | Additive; the drawer is useful and does not conflict with DS |
| A-009 | S4-M2 | Assistant tabs | 6 tabs in mockup | 8 tabs (Campaigns + Workflows added) | DS changelog v2.3 explicitly documents 8 tabs; additions are DS-compliant |
| A-010 | S4-M2 | GuardrailsPanel badge colors | SVG approximations for amber/red/orange | `bg-*-50 text-*-700 border-*-200` per DS §5 | Code matches DS spec; SVG approximation is within expected color-space tolerance |
| A-011 | S4-M3 | NotFoundPage gap | Mockup uses stacked layout | `gap-6` on flex-col container | Both achieve equivalent vertical spacing between elements |

---

## Implementation order recommendation

Address in this sequence to minimize rework:

1. REQ-012 through REQ-016 (404 page) — fully self-contained, zero architectural risk, fastest win
2. REQ-001 (Sessions empty state icon) — single component, minimal change
3. REQ-003, REQ-004 (ToolsSidebar) — targeted badge label and focus ring
4. REQ-005 (ConfigFlagsForm flags) — verify types first; if types are missing, raise to architect before coding
5. REQ-006, REQ-007, REQ-008, REQ-009 (ProviderList / McpServerList) — coordinate together since they are all in the same tab context
6. REQ-010 (Admin page architecture) — do not start until architect has confirmed UserManagementPanel relocation
7. REQ-011 (AssistantChatList columns) — verify API response fields before starting
8. REQ-002 (Sessions ConfirmDialog archive vs. delete) — do not start until architect has confirmed API behavior
