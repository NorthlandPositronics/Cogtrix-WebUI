# Cogtrix WebUI — Design System

**Version**: 3.15
**Created**: 2026-03-05
**Last updated**: 2026-03-27
**Owner**: web_designer agent
**Status**: Active — all mockups and implementations must follow this document.

### Changelog

| Version | Date | Change |
|---|---|---|
| 3.15 | 2026-03-27 | §16 — AUD-001 registered: WhatsApp (`#25D366`) and Telegram (`#2AABEE`) hardcoded hex fills in `ContactList.tsx` inline SVGs approved as permanent brand-IP exceptions to the §1 no-hardcoded-hex rule. No rule changes. |
| 3.14 | 2026-03-25 | §5 — Model row-selection pattern added (BUG-01): RadioGroup row selection replaces "Switch to" button; active row uses `bg-teal-50` + left `border-l-2 border-l-teal-600` + CircleCheck icon; Action and Status columns removed from Models table. §5 — View toggle button group pattern added (BUG-02): `rounded-lg border border-zinc-200 p-0.5` container, `h-8 w-8` icon buttons, `bg-zinc-100` active state. §5 — Ghost row add-action pattern added (BUG-09): `tfoot` row with `border-t border-dashed border-zinc-300`, `text-zinc-500 hover:text-zinc-900`, replaces top-right outline button for table creation actions. §5 — YamlBlock dark code surface added (BUG-10): dark theme (`bg-zinc-800/zinc-950` header/body), `atomOneDark` via react-syntax-highlighter, Copy + Download icon buttons in header. §12 — RadioGroup added to component inventory. §12 — SessionsPage updated: grid/list view toggle, bulk selection, 3-option remove dialog, archived action set. §14 — Sessions Dashboard updated with new patterns. §14 — Settings Providers & Models updated: ghost-row add pattern, model row-selection. §16 — BUG-08 registered as FEAT-001 (Add provider deferred — no backend endpoint). AUDIT-P2-001 deferred (already open). |
| 3.13 | 2026-03-25 | §16 — SCHEMA-001/002/003 resolved by DesignForge holistic audit sprint. AUDIT-P2-001 registered (DeferredRecordTable missing count row). No rule changes — implementation corrections only. |
| 3.12 | 2026-03-25 | §5 Badges — ViolationBadge color table corrected to match actual `violation_type` values from backend schema (`input`, `encoding`, `tool_call`, `rate_limit`, `llm_judge`); previous entries (`content_filter`, `spam`) retired. §5 Badges — `MemoryModeBadge` added for `memory_mode` chip in `AssistantChatList` (`conversation`/`code`/`reasoning`). §12 — ViolationBadge dormancy note removed (type field now confirmed present); ViolationBadge variants updated to match corrected color table. §12 — `AssistantChatList` column set updated (Name/Chat ID, Channel, Mode chip, Lock indicator, Last Activity, Messages). §12 — `MemoryModeBadge` added. §14 — GuardrailsPanel violations table corrected (5 columns: Time, Chat ID, Channel, Type badge, Detail); `total_violations` count badge source clarified; card title corrected to "Recent Violations". §14 — AssistantChatList `is_locked` and `memory_mode` display rules added. §14 — ContactList identifiers display rule added (comma-separated, +N more tooltip). |
| 3.11 | 2026-03-25 | §14 GuardrailsPanel — violation table columns updated to match current `ViolationRecordOut` schema (Chat ID, Count, Last Violation); schema note added. §12 ViolationBadge — dormancy note added (type field not present in current API schema). §5 Buttons — table-row icon button ruling added (h-11 w-11 approved as equivalent to size="icon" min-h-11). §9 — `transition-duration: 0.01ms` added to global reduced-motion safety net (RM-001 fix). §16 — AUDIT-001/002/003/004 all resolved; FLAG-DESIGN-001 open; FLAG-DESIGN-002 resolved by AUDIT-003 ruling. |
| 3.10 | 2026-03-25 | §2 Typography — page title corrected to `text-2xl` (implementation was already correct). §5 Buttons — `h-11 w-11` header-bar icon button exception documented. §3 — RESP-001 scope clarified: `h-14` applies to sticky bars only. §4 — `md:` breakpoint for content padding documented. §5 Tabs — `mt-4` on TabsContent documented as canonical spacing. §5 Cards — `rounded-lg` inline form widget surface variant added. §4 Sidebar — active nav item left accent bar requirement documented. |
| 3.9 | 2026-03-24 | §5 Buttons — GUARDRAIL-001 scope clarified: ruling applies to ghost icon-only buttons; labeled `variant="outline"` destructive buttons may use `text-red-600 border-red-200` at rest when backed by ConfirmDialog (GUARDRAIL-002 pattern). §5 Badges — ScheduledMessage and DeferredRecord status badge color tables added. §9 Animation — global `@media (prefers-reduced-motion)` safety-net policy documented alongside per-component `motion-safe:` requirement. §16 — DF-FLAG-001/002/003/004 resolved; GUARDRAIL-001 code action confirmed complete; D-008 registered and resolved. |
| 3.8 | 2026-03-24 | §5 — "Panel Filter Controls" subsection added. Defines dedicated filter row pattern (below header row), `h-8 text-sm` compact Select/Input sizing, `value="all"` named default state, no explicit clear button, and rationale against ToggleGroup for channel/status filters. Applies to ScheduledMessageTable, AssistantChatList, DeferredRecordTable, KnowledgePanel, CampaignsPanel. |
| 3.7 | 2026-03-24 | §5 Buttons — GUARDRAIL-001 resolved: destructive ghost icon buttons use `text-zinc-500` at rest with `hover:text-red-700` (DS §5 rule confirmed). Exceptional permanent-destructive pattern defined for irreversible-per-row actions. §5 Tables — MCP-002 resolved: "Tools" column removed from McpServerList until API surface exists. §5 Surfaces — DS-001 resolved: amber inline warning banner pattern added as official `InlineWarning` surface variant with token table. DS-002 resolved: `divide-y divide-zinc-200` "Divided List" pattern added to §5 Forms. §3 Spacing — RESP-001 resolved: `h-14` (56px) documented as the canonical page header height. §5 Tables — FONT-001 resolved: primary/secondary column text hierarchy rule (`text-zinc-900` / `text-zinc-600`) documented. §14 — retroactive mockup policy ruling added (CAMP-001/WFLOW-001/CONTACT-001/SETTINGS-001). §16 — findings registered. |
| 3.6 | 2026-03-23 | §0 (new) — Brand Identity section added. Canonical C-mark specification per size tier. Node count rules (1 node ≤32px, 2 nodes ≥64px). Prohibition on dashed connector line. Sidebar logomark specification (`SidebarLogo` inline SVG). Favicon file inventory and purpose. Rulings on INCONSISTENCY-001/002/003 and GAP-001/002/003. Brief produced: `docs/web/briefs/brand-mark.md`. |
| 3.5 | 2026-03-23 | §1 — Brand accent color changed from violet to teal-600 (`#0d9488`, `oklch(0.600 0.118 184.0)`). Rationale: teal is the Cogtrix TUI brand color; it positions Cogtrix distinctively in the dev-tools space (synthesis/cognitive framing; underused in this space vs. indigo/sky). WCAG AA contrast 5.22:1 on white — meets 4.5:1 minimum. All `violet-*` Tailwind classes replaced with `teal-*` equivalents throughout `src/`. `--primary` CSS variable updated. Favicons updated. §5 TriSwitch track/thumb position-1 colors updated to teal. §6 thinking/analyzing agent states updated to teal. §7 user bubble, blockquote, link colors updated to teal. |
| 3.4 | 2026-03-23 | §9 — `animate-pulse` on transient document-status text approved as a semantic state indicator (same rationale as agent-state dot pulse). §16 — FLAG-001 resolved: `admin-desktop.svg` marked SUPERSEDED (DS §14 is authoritative). FLAG-002 resolved: `settings-providers-desktop.svg` marked SUPERSEDED in §16 (DS §14 is authoritative). FLAG-003 resolved: `animate-pulse` on document status text approved in §9; secondary WCAG finding (D-007) raised for `DocumentCard` delete button using `text-zinc-400` at rest. |
| 3.3 | 2026-03-23 | Added `TypingIndicator` component specification to §7 (Message Bubbles) and §12 (Component Inventory). Defines bubble wrapper (matches assistant bubble), three-dot layout, `bg-zinc-400` dot color with contrast justification, `typing-bounce` keyframe animation, stagger delays, `prefers-reduced-motion` static fallback, and full ARIA semantics (`role="status"`, `aria-live="polite"`, `aria-label`). Brief produced for `graphic_designer`: `docs/web/mockups/typing-indicator.svg`. Animation keyframe `@keyframes typing-bounce` added to `src/index.css` specification. |
| 3.2 | 2026-03-22 | P2-DESIGN-003 resolved — stale `src/pages/chat/markdownComponents.tsx` path corrected to `src/components/MarkdownComponents.tsx` throughout §7, §12. P2-DESIGN-004 resolved — D-006 marked RESOLVED in §16 (CodeBlock copy-to-clipboard implemented in `src/components/MarkdownComponents.tsx`, DesignForge sprint). P2-DESIGN-005 resolved — D-003 marked RESOLVED in §16 (McpAddServerDialog implemented in `src/pages/settings/McpAddServerDialog.tsx`, feature/4-api-gaps sprint). FLAG-002 resolved — ghost icon-only button rule added to §5 Buttons (`text-zinc-500` required on white surfaces). FLAG-004 resolved — navigation icon alongside label rationale added to §10 Iconography. P2-DESIGN-001 resolved — null-state placeholder text rule added to §5 Tables (`text-zinc-500` required for `—` and absent-data text in table cells). |
| 3.1 | 2026-03-22 | FLAG-001 resolved — `ToolActivityRow` entry removed from §12 component inventory. `ToolActivityRow.tsx` has been deleted; tool activity is rendered by `EntryRow` inside `StatusBar`. FLAG-002 resolved — `MarkdownContent` entry in §12 updated to reflect actual implementation: markdown is inlined directly in `AssistantBubble` (`MessageBubble.tsx`) and `StreamingMessageBubble.tsx` via a `<div className="space-y-3 text-base leading-relaxed">` wrapper around `<ReactMarkdown>`; there is no standalone `MarkdownContent.tsx` file. |
| 3.0 | 2026-03-22 | Full visual design overhaul audit. §7 — corrected blockquote implementation (zinc-300/no-bg → violet-200/violet-50/40); corrected paragraph/list spacing (removed `mb-3` from block elements — `space-y-3` container is the sole spacing mechanism; `mb-*` on blocks inside `space-y-3` creates double-spacing); added h4, h5, h6 heading classes; added img spec; added tbody/tr with row hover; specified copy-button header for fenced code blocks; added `leading-tight` requirement for all headings; added first-child `mt-0` requirement for h1–h3. §5 (StatusBar) — `StatusBar` expand/collapse icon corrected to `text-zinc-500` (was `text-zinc-400`, WCAG AA fail on `bg-zinc-50`). §12 — `MarkdownContent` status upgraded from Partial to Full (all elements now specified and required). §16 — D-005 resolved (StatusBar violations corrected); D-006 added (markdown copy-button implementation). Graphic designer brief produced: `docs/web/briefs/overhaul-2026-03-22.md`. |
| 2.4 | 2026-03-22 | FLAG-001 resolved — §14 Admin page architecture updated to canonical 3-tab layout (System / Live Logs / Users); §12 `UserManagementPanel` added to component inventory; §12 `SystemInfoCard` and `LiveLogViewer` tab annotations updated. FLAG-002 resolved — §7 pre-text cursor state description replaced: `StreamingMessageBubble` now documented as rendering null until first token; tool activity surfaced via StatusBar instead. |
| 2.3 | 2026-03-09 | Audit corrections (no visual changes). §3 — corrected `min-h-9`/36px to `min-h-11`/44px for message textarea min height and updated the grid-multiple note accordingly; rationale cross-references §4 touch target minimum. §12 — updated `Tabs` row from "Assistant page (6 tabs)" to "Assistant page (8 tabs)"; updated `MarkdownContent` row to note partial implementation status (a, pre, code, table only; h1–h6, p, ul, ol, li, blockquote, hr, img pending ADR-0006). §14 — updated Assistant page tab count from 6 to 8 and listed all tab names including Campaigns and Workflows (added in ADR-0004/0005). |
| 2.2 | 2026-03-09 | §7 (new) — added "Markdown Typography in Assistant Bubbles" section specifying all markdown element styles: heading hierarchy (h1–h6), paragraph spacing via `space-y-3`, list indentation and bullet styles, blockquote left-border accent with violet tint, code block with copy button and language label, inline code, horizontal rules, images, tables (unchanged). §12 — added `MarkdownContent` to component inventory. Brief produced: `docs/web/briefs/chat-markdown-typography.md`. |
| 2.1 | 2026-03-08 | §5 — restored `pinned` to tool status badge color table with `bg-zinc-100 text-zinc-700 border-zinc-300`; corrected v1.7 changelog note to record the earlier removal as an error. |
| 2.0 | 2026-03-08 | §5 — added TriSwitch subsection documenting the three-position toggle used in ToolRow (dimensions, per-position colors, thumb treatment, tick-dot indicators). §12 — added `TriSwitch` to component inventory; updated `Switch` note to clarify it is no longer used in `ToolsSidebar`. §14 — added ToolRow simplified design note (TriSwitch replaces two-control design). |
| 1.9 | 2026-03-08 | §5 Tables — documented settings-page table containment exception (`rounded-xl border border-zinc-200` wrapper for tables in Settings tabs). |
| 1.8 | 2026-03-08 | §1 — documented orange as semantic spam color; documented `text-zinc-600` for neutral badge text. §5 — documented `connecting` badge as amber (transient state); expanded badge table with ViolationBadge colors; documented `text-base` CardTitle exception for compact data-table cards; documented ToolConfirmationModal button grid orphan as acceptable. §6 — added "Connection Status Dot" subsection specifying colors for all WS states. §14 — documented mobile header right slot decision (avatar retained, context-action deferred); documented session chat and documents page mockup gap. §16 (new) — Deferred Items register. |
| 1.7 | 2026-03-08 | §6 — restored AgentState table to 9 states (added analyzing, deep_thinking, delegating); dot/label/color entries verified against `AgentStateBadge.tsx`. §12 — updated AgentStateBadge variants to list all 9 states. §5 — **corrected (see v2.1)**: the v1.7 removal of `pinned` was an error; `pinned` is a valid ToolStatus per the API contract (client-contract.md §3.5) and must be documented. |
| 1.6 | 2026-03-08 | §12 — updated component inventory: added `GuardrailsPanel` (now on Assistant page), `ViolationBadge`, load/unload `Button` in `ToolsSidebar`; removed `DebugToggle` as standalone component. §14 — corrected Admin page hierarchy (no GuardrailsPanel, no DebugToggle card; debug toggle lives in LiveLogViewer header); corrected Assistant page hierarchy (6 tabs, includes Guardrails); corrected Settings/Providers section (providers are connection-only, models carry Switch-to action); corrected Sessions/NewSessionDialog (no provider selector). |
| 1.5 | 2026-03-07 | (previous content unchanged) |
| 1.4 | 2026-03-07 | §3 — documented LiveLogViewer height exception (`max-h-64`/`md:max-h-96`). §5 — documented ToolConfirmationModal as explicit exception to dialog close-button rule. |
| 1.3 | 2026-03-07 | §1 — added note that `text-red-600` is the standard error icon color; `text-red-500` is below WCAG AA 3:1 for non-text graphics on white. §3 — documented textarea `scrollHeight` auto-grow as an allowed spacing exception. §5 — clarified that border dividers use `border-zinc-200` (not `border-border`). §10 — specified empty-state icon color as `text-zinc-400`. §12 — documented Switch sm variant used in `ToolsSidebar`. |
| 1.2 | 2026-03-07 | §7 — corrected system message text from `text-zinc-500` to `text-zinc-600` (4.40:1 → 7.03:1 on `bg-zinc-100`, WCAG AA). §1 — added note that `text-amber-500` is for large text or badges only; body text on white must use `text-amber-700`. |
| 1.1 | 2026-03-06 | §7 — corrected tool activity status text from `text-zinc-400` to `text-zinc-500` to meet WCAG AA 4.5:1 contrast minimum. |
| 1.0 | 2026-03-05 | Initial release. |

This is the single source of truth for every visual decision in Cogtrix WebUI. Any deviation requires an update here first. The document is intentionally prescriptive — ambiguity in a design system produces inconsistency in the product.

---

## 0. Brand Identity

### 0.1 The C-mark concept

The Cogtrix logomark is a geometric C formed from a bold arc stroke with small filled circles ("nodes") at its open tips. The arc sweeps 270° counterclockwise, opening to the right (east). The opening is not an accident or an incomplete circle — it is the intentional gap that anchors the mark conceptually. The gap reads as a synapse, a spark gap, a moment of transmission between two nodes. The nodes are the arc endpoints; they frame the gap and make its absence readable as content.

The mark is constructed entirely from strokes and circles — no filled regions, no gradients, no decorative elements. This is both an aesthetic constraint (clean, scalable, technically legible) and a functional one (renders correctly at 16px, on dark backgrounds, in monochrome).

The mark's canonical colors are:
- Foreground (arc + nodes): teal-600 `#0d9488`
- Background: white `#ffffff` (on-screen / browser context)
- Inverted (iOS/large): white `#ffffff` mark on teal-600 `#0d9488` background

### 0.2 Canonical mark specification per size tier

All tiers share the same arc geometry proportionally: center at canvas midpoint, arc radius ≈ 72% of canvas half-width, arc endpoints at 45° (bottom-right) and 315° (top-right), sweep direction counterclockwise (SVG `large-arc=1, sweep=0`).

#### Micro (≤16px rendered)

The arc alone renders. No node dots — at ≤16px a 2px node circle becomes a noise pixel that muddies the arc tips rather than clarifying them. Round linecaps on the arc provide a natural termination that implies the node shape without requiring it. Stroke-width is proportionally heavier at this tier to keep the arc visible.

| Property | Value |
|---|---|
| Canvas | 32×32 viewBox (displayed at 16px) |
| Arc center | (16, 16) |
| Arc radius | 11.5 |
| Stroke-width | 4.5 |
| Node dots | None |
| Background | White circle, r=16 |

#### Small (32px rendered)

One node dot at the upper arc tip (315°, top-right). The upper node is the primary identifying detail — the lower arc tip terminates with a round linecap which reads implicitly as a node at this scale. A second explicit node at the lower tip at 32px would compete with the upper node for visual weight and would register as 1–2px, adding noise. Stroke-width matches the micro tier (canvas is the same).

| Property | Value |
|---|---|
| Canvas | 32×32 viewBox |
| Arc center | (16, 16) |
| Arc radius | 11.5 |
| Stroke-width | 4.5 |
| Upper node center | (24.132, 7.868) |
| Upper node radius | 2.5 |
| Lower node | None (round linecap terminates arc) |
| Background | White circle, r=16 |

This is the `favicon.svg` tier. The file `public/favicon-32x32.svg` previously duplicated this content and must be deleted (see §0.5).

#### Medium (64–180px rendered)

Two node dots — upper (larger) and lower (smaller). The asymmetry in node size signals directionality: the upper node is the primary endpoint and the lower is secondary. The ratio is approximately 1.3:1 (upper:lower). The inverted treatment (white mark on teal background, full-bleed square) applies at this tier for the Apple Touch Icon.

Apple Touch Icon (180×180 canvas):

| Property | Value |
|---|---|
| Canvas | 180×180 |
| Background | Teal-600 `#0d9488` full-bleed rect (iOS applies corner radius) |
| Arc center | (90, 90) |
| Arc radius | 66 |
| Stroke-width | 19 |
| Arc color | White `#ffffff` |
| Upper node center | (136.669, 43.331) |
| Upper node radius | 11 |
| Lower node center | (136.669, 136.669) |
| Lower node radius | 7.5 |
| Node color | White `#ffffff` |

#### Large (192px+ rendered)

Two node dots. Same proportions as medium. No dashed connector line (see §0.3). This tier is used for PWA / Android manifest icons.

PWA icon (192×192 canvas):

| Property | Value |
|---|---|
| Canvas | 192×192 |
| Background | White circle, r=96 |
| Arc center | (96, 96) |
| Arc radius | 74 |
| Stroke-width | 21 |
| Arc color | Teal-600 `#0d9488` |
| Upper node center | (148.326, 43.674) |
| Upper node radius | 13 |
| Lower node center | (148.326, 148.326) |
| Lower node radius | 9 |
| Node color | Teal-600 `#0d9488` |

### 0.3 The dashed connector line is prohibited

**Ruling on INCONSISTENCY-002**: The dashed connector line present in `favicon-192x192.svg` must be removed. The line is described in the file as suggesting "the gap is intentional, like a spark gap / synapse" — but a line connecting the two tips does the opposite. It bridges the gap, closing the C visually and negating the very concept the mark is meant to convey. The open gap, framed by two nodes, communicates the synapse. A line inside the gap communicates incompleteness. The connector must not appear in any size tier, any file, or any UI context.

This prohibition is unconditional. No variant of the C-mark includes a connector line.

### 0.4 UI logomark for sidebar, mobile header, and login page

The C-mark must appear in the application UI, not only in the browser tab. Using it solely as a favicon wastes the mark's brand work inside the product. The sidebar header, mobile header, and login page headline area all use the logomark alongside the "Cogtrix" wordmark.

**Asset**: `public/logo.svg` — a scalable logomark with no hardcoded `width` or `height` attributes, `viewBox="0 0 28 28"`. The consuming component sizes it via CSS. This is the canonical source for all in-app logomark use.

`logo.svg` specification:

| Property | Value |
|---|---|
| Canvas | viewBox="0 0 28 28" (no width/height) |
| Background | None (transparent — composited onto surface color by the host element) |
| Arc center | (14, 14) |
| Arc radius | 10 |
| Stroke-width | 3.5 |
| Arc color | Teal-600 `#0d9488` |
| Upper node center | (21.071, 6.929) |
| Upper node radius | 2.2 |
| Lower node center | (21.071, 21.071) |
| Lower node radius | 1.6 |
| Node color | Teal-600 `#0d9488` |

Node geometry derivation: at 45° and 315° from center (14,14) with radius 10:
- `x = 14 + 10 * cos(45°) = 14 + 7.071 = 21.071`
- Upper y: `14 - 7.071 = 6.929`
- Lower y: `14 + 7.071 = 21.071`

The logo.svg background is transparent because: (1) the sidebar surface is `bg-zinc-50`, not white, and a white circle clipped to the icon bounds would produce a visible ring; (2) `favicon.svg` needs the white circle to work on colored browser tab bars, but in-app surfaces provide their own background.

**Sidebar header layout**:

```
[logo.svg at 22×22px] [gap: 8px / space-x-2] ["Cogtrix" text-lg font-semibold text-zinc-900]
```

The logomark and wordmark are horizontally aligned on the baseline. The `<SidebarLogo />` component renders the SVG inline (not as `<img src="/logo.svg">`) so the SVG inherits the current color context and avoids a network round-trip. Because the logo colors are hardcoded to `#0d9488` within the SVG paths, inline rendering also ensures no color inheritance conflict from the parent element.

The sidebar header div retains its current padding (`px-4 py-4`) and the outer container remains unchanged. Only the inner content of the header changes from `<span>` text to `[SVG] + <span>`.

**Login page**: The `<SidebarLogo />` component at 40×40px precedes the "Cogtrix" heading (`text-3xl font-bold`) on the auth page, vertically stacked and centered. This gives the login page brand presence without adding a separate asset.

**Mobile header**: When the sidebar collapses to a sheet at `< lg`, the mobile header top-left slot shows the logomark at 22×22px (matching sidebar) alongside "Cogtrix". The same `<SidebarLogo />` component is reused.

### 0.5 Favicon file inventory

| File | Size | Purpose | Status |
|---|---|---|---|
| `public/favicon.svg` | 32×32 viewBox, scalable | Browser tab, bookmarks — primary favicon. 1 node (upper only). White circle bg. | Canonical — keep |
| `public/favicon-32x32.svg` | 32×32 | Identical duplicate of favicon.svg. Served via `<link sizes="32x32">` in index.html. | Delete — redundant. Remove the link tag from index.html. |
| `public/apple-touch-icon.svg` | 180×180 | iOS Safari tab / home screen icon. Inverted: white mark on teal bg. 2 nodes. | Canonical — keep (remove dashed connector if present; it is absent in current file — already correct) |
| `public/favicon-192x192.svg` | 192×192 | PWA manifest / Android home screen. 2 nodes. | Fix required — remove dashed connector line, then keep |
| `public/logo.svg` | viewBox 0 0 28 28, scalable | In-app logomark for sidebar, login page, mobile header. 2 nodes, transparent bg. | Create (does not yet exist) |

**`index.html` required link tags after cleanup:**

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
<link rel="manifest" href="/manifest.webmanifest" />
```

The `<link rel="icon" sizes="32x32">` tag must be removed when `favicon-32x32.svg` is deleted.

### 0.6 PWA manifest

A `public/manifest.webmanifest` must exist. The 192px icon exists for this purpose but is unused without the manifest file. Without a manifest, Android Chrome will not offer "Add to Home Screen" and will not use the 192px icon. This is a correctness gap, not a future enhancement.

Required manifest fields:

```json
{
  "name": "Cogtrix",
  "short_name": "Cogtrix",
  "icons": [
    { "src": "/favicon-192x192.svg", "sizes": "192x192", "type": "image/svg+xml" }
  ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d9488"
}
```

`theme_color` is teal-600 — this colors the Android Chrome address bar and matches the Apple Touch Icon background.

### 0.7 Rulings on audit findings

| Finding | Ruling |
|---|---|
| INCONSISTENCY-001 — node count varies by size | Resolved by §0.2. Rule: 1 node (upper only) at ≤32px rendered; 2 nodes (upper + lower) at ≥64px rendered. Rationale: second node at small sizes contributes pixel noise, not form. |
| INCONSISTENCY-002 — dashed connector in 192px | Prohibited. See §0.3. The line closes the gap it was meant to dramatise — antithetical to the mark's concept. Remove from favicon-192x192.svg immediately. |
| INCONSISTENCY-003 — redundant favicon-32x32.svg | Delete the file and its index.html link tag. `favicon.svg` already covers 32px use via the primary icon link. Keeping a duplicate with no distinct content is maintenance debt. |
| GAP-001 — no logomark in sidebar | Resolved by §0.4. Create `public/logo.svg` and implement `<SidebarLogo />` as an inline SVG component. The C-mark does no brand work if it only appears in the browser tab. |
| GAP-002 — no PWA manifest | Resolved by §0.6. Add `public/manifest.webmanifest`. The 192px icon is wasted without it. |
| GAP-003 — no canonical logomark SVG | Resolved by §0.4–0.5. `public/logo.svg` is the canonical scalable logomark for UI use. |

---

## 1. Color Palette

### Design principles

The palette is minimal by deliberate constraint. White and near-white surfaces keep cognitive load low. A single neutral grey scale (zinc) handles every non-accent element. One accent color (teal) identifies primary actions and AI activity. Semantic colors (red, green, amber, blue) appear only in their semantic roles — never decoratively.

No decorative gradients. No multi-accent compositions. If a new color is needed, revise the design system before using it.

### Semantic tokens

All colors are consumed via CSS custom properties defined in `src/index.css`. Tailwind v4 classes reference these properties. Never hardcode hex values in components.

| Token (CSS property) | Role | Tailwind equivalent | Hex |
|---|---|---|---|
| `--background` | Page background | `bg-white` | `#ffffff` |
| `--foreground` | Primary text | `text-zinc-900` | `#18181b` |
| `--card` | Card and panel surfaces | `bg-white` | `#ffffff` |
| `--card-foreground` | Text on cards | `text-zinc-900` | `#18181b` |
| `--muted` | Muted surface (secondary backgrounds) | `bg-zinc-50` | `#fafafa` |
| `--muted-foreground` | Muted text (labels, help text, timestamps) | `text-zinc-500` | `#71717a` |
| `--border` | Borders, dividers | `border-zinc-200` | `#e4e4e7` |
| `--input` | Form input border | `border-zinc-200` | `#e4e4e7` |
| `--ring` | Focus ring | `ring-zinc-400` | `#a1a1aa` |
| `--primary` | Primary action buttons, strong interactive elements | `bg-primary` (teal-600) | `oklch(0.600 0.118 184.0)` |
| `--primary-foreground` | Text on primary elements | `text-white` | `#ffffff` |
| `--secondary` | Secondary button and surface | `bg-zinc-100` | `#f4f4f5` |
| `--secondary-foreground` | Text on secondary | `text-zinc-900` | `#18181b` |
| `--accent` | Accent surface (e.g., hover on sidebar items) | `bg-zinc-100` | `#f4f4f5` |
| `--accent-foreground` | Text on accent surface | `text-zinc-900` | `#18181b` |
| `--destructive` | Destructive actions (delete, revoke, error states) | `text-red-600` / `bg-red-600` | `#dc2626` |
| `--sidebar` | Sidebar background | `bg-zinc-50` | `#fafafa` |
| `--sidebar-border` | Sidebar divider | `border-zinc-200` | `#e4e4e7` |

### Application accent (teal)

The `--primary` token is set to teal-600 (`oklch(0.600 0.118 184.0)`, hex `#0d9488`), so `bg-primary` and shadcn/ui default Button variant render as teal. Additional teal classes are used for fine-grained control. Use teal for: primary CTAs, active navigation indicators, streaming/AI activity states. `--accent` remains zinc-100 (shadcn/ui hover surfaces).

Rationale: teal is the Cogtrix TUI brand color and positions the product distinctively in the dev-tools space. "Synthesis and cognitive connection" framing maps well to an AI assistant. WCAG AA: 5.22:1 on white — sufficient.

| Role | Class |
|---|---|
| Default | `bg-teal-600` / `text-teal-600` |
| Hover | `bg-teal-700` / `text-teal-700` |
| Light surface (message bubble, badge background) | `bg-teal-50` |
| Border on teal surface | `border-teal-200` |

### Semantic status colors

These appear only in their defined semantic roles. Do not reuse for decoration.

**WCAG AA note (v1.2)**: `text-amber-500` on white yields only 2.15:1 contrast — below the 4.5:1 minimum for normal text. Use `text-amber-700` (`#b45309`, ~5.3:1) for body-size text on white surfaces. `text-amber-500` is acceptable for large text (18px+), badges with colored backgrounds, or decorative elements.

**WCAG AA note (v1.3)**: `text-red-500` (#ef4444) on white yields approximately 2.9:1 contrast — below the WCAG AA 3:1 minimum required for non-text graphics (icons, borders, UI components). Always use `text-red-600` (#dc2626, ~5.9:1) for error icons such as `AlertTriangle`. `text-red-500` must not appear on white or near-white surfaces.

| Semantic role | Class | Hex |
|---|---|---|
| Destructive / error | `text-red-600` / `bg-red-600` | `#dc2626` |
| Success / done | `text-green-600` / `bg-green-600` | `#16a34a` |
| Warning / transient | `text-amber-500` / `bg-amber-500` | `#f59e0b` (see note) |
| Info | `text-blue-600` / `bg-blue-600` | `#2563eb` |
| Spam (violation subtype) | `text-orange-700` / `bg-orange-50` | `#c2410c` text / `#fff7ed` bg |

**Orange (v1.8)**: Orange is used exclusively for the `spam` guardrail violation subtype. Its purpose is to distinguish spam from `rate_limit` (amber) and `content_filter` (red). It must not appear in any other context. `text-orange-700` (#c2410c) yields approximately 5.0:1 contrast on `bg-orange-50` (#fff7ed), meeting WCAG AA.

**Neutral badge text (v1.8)**: Neutral/idle state badges (e.g., the `disconnected`/`idle` connection badge in `LiveLogViewer`, the `disconnected` MCP server badge) use `text-zinc-600` (#52525b) rather than `text-zinc-500`. Rationale: badges render on colored surfaces (`bg-zinc-100`) where `text-zinc-600` yields approximately 5.7:1 contrast versus `text-zinc-500`'s ~4.4:1. The higher contrast is intentional and is not a deviation from `--muted-foreground`. Badge text is not muted text — it is functional status text requiring legibility.

### CSS custom properties — primary accent

`--primary` in `src/index.css` is set to `oklch(0.600 0.118 184.0)` (teal-600). The default `Button` variant and `bg-primary` both render as teal. Component authors may use either `variant="default"` or an explicit `bg-teal-600` className override — both produce the same result. Explicit teal classes remain necessary for fine-grained overrides (hover states, light surfaces) that fall outside the primary token.

---

## 2. Typography

### Font family

shadcn/ui ships with `font-sans` which uses the system font stack. Geist is preferred if loaded; otherwise Inter, then `ui-sans-serif`, then system sans. Code content uses `font-mono` (Geist Mono or system monospace).

Do not import custom web fonts in Sprint 0–1. The system stack performs better on first load and is sufficient for this product.

```css
font-family: font-sans;   /* all body and UI text */
font-family: font-mono;   /* code blocks, tool output, API key display */
```

### Size scale

| Name | rem | px | Tailwind class | Use |
|---|---|---|---|---|
| xs | 0.75rem | 12px | `text-xs` | Timestamps, badges, helper text |
| sm | 0.875rem | 14px | `text-sm` | Secondary labels, table rows, sidebar nav items |
| base | 1rem | 16px | `text-base` | Body text, message bubbles, form inputs |
| lg | 1.125rem | 18px | `text-lg` | Section subheadings |
| xl | 1.25rem | 20px | `text-xl` | Page subheadings, card titles |
| 2xl | 1.5rem | 24px | `text-2xl` | Page titles |
| 3xl | 1.875rem | 30px | `text-3xl` | Auth page headline only |

Use `text-3xl` sparingly — only for the login/register hero headline. Pages inside the authenticated shell use `text-2xl` maximum for headings.

**Page title standard (CONS-012)**: Page titles — rendered by `PageHeader` or equivalent page-heading elements inside the authenticated shell — use `text-2xl font-semibold`. This is the authoritative statement; any reference to page titles using `text-xl font-semibold` is incorrect. `text-xl` is for page subheadings and card titles only (see size scale table above).

### Weight

| Name | Value | Tailwind class | Use |
|---|---|---|---|
| Normal | 400 | `font-normal` | Body text, message content, descriptions |
| Medium | 500 | `font-medium` | Labels, nav items, button text, table headers |
| Semibold | 600 | `font-semibold` | Section headings, card titles, dialog headings |
| Bold | 700 | `font-bold` | Auth headline only |

Heading hierarchy is communicated through size and weight contrast — not color changes. Never use `text-teal-600` or any non-neutral color for headings.

### Line height

| Name | Value | Tailwind class | Use |
|---|---|---|---|
| Tight | 1.25 | `leading-tight` | Headings, single-line labels |
| Normal | 1.5 | `leading-normal` | UI body text, inputs |
| Relaxed | 1.75 | `leading-relaxed` | Long-form message content, markdown prose |

### Code blocks

```
font-mono, text-sm, leading-relaxed
bg-zinc-50, border border-zinc-200, rounded-md, p-3
```

---

## 3. Spacing

### Base unit

4px (Tailwind default). All spacing values are multiples of 4px. No arbitrary pixel values except in the rare case of icon sizing (16px, 20px, 24px).

### Common tokens

| Tailwind | px | Typical use |
|---|---|---|
| `1` | 4px | Tight inline gaps (icon + label) |
| `2` | 8px | Compact element spacing |
| `3` | 12px | Compact component padding |
| `4` | 16px | Standard component padding |
| `5` | 20px | Slightly generous internal spacing |
| `6` | 24px | Section spacing, standard gap between cards |
| `8` | 32px | Between major sections |
| `12` | 48px | Between page-level sections |
| `16` | 64px | Top-level vertical rhythm |

### Component-specific sizing exceptions

Some components require height constraints outside the common spacing tokens. These are documented here rather than treated as violations.

| Component | Class | px | Rationale |
|---|---|---|---|
| Page header (canonical) | `h-14` | 56px | Standard header height for mobile AppShell header and SessionHeader. `h-14` = 14 × 4px grid units. Fits a single line of `text-sm font-medium` with adequate touch clearance above and below. |
| Message textarea (min height) | `min-h-11` | 44px | Matches 44px touch target minimum (§4) |
| Message textarea (max height) | `max-h-36` | 144px | Caps growth at ~6 visible lines before scrolling |
| StatusBar expanded log list | `max-h-48` | 192px | Caps the expandable tool history at ~8 visible rows |

**Page header height rule (RESP-001)**: `h-14` (56px) is the canonical height for all page-level headers inside the app shell. Applied by `AppShell` mobile header and `SessionHeader`. Exceptions require a §16 entry. The `Session` page desktop header also uses `h-14` for visual parity — do not use `h-16` or other values without a design system update.

`h-14` applies specifically to **sticky/fixed header bars** — `SessionHeader` and `AppShell.MobileHeader`. It does not apply to `PageHeader` (the inline page-title-plus-actions component used on content pages), whose height is determined by its content flow.

All three values are multiples of the 4px grid.

**Auto-grow exception**: The message `textarea` computes its height dynamically via `element.scrollHeight` to grow with content between `min-h-11` and `max-h-36`. This is an allowed exception to the spacing scale — computed heights derived from content do not require a fixed Tailwind token.

**LiveLogViewer height exception**: The admin live log viewer uses `max-h-64` (256px) at mobile and `md:max-h-96` (384px) at desktop. Both are standard Tailwind scale values (multiples of 4px). These are component-specific sizing constraints, not spacing-scale violations.

### Standardised patterns

| Context | Class |
|---|---|
| Page horizontal padding (desktop) | `px-6` |
| Page horizontal padding (mobile) | `px-4` |
| Section gap (vertical) | `space-y-6` or `gap-6` |
| Component internal padding (standard) | `p-4` |
| Component internal padding (compact) | `p-3` |
| Component internal padding (spacious) | `p-6` |
| List item gap | `gap-2` |
| Form field gap | `space-y-4` |
| Button group gap | `gap-2` |

---

## 4. Layout

### Responsive breakpoints

Tailwind defaults apply without modification.

| Prefix | Min-width | Behavior |
|---|---|---|
| (none) | 0px | Mobile baseline — single column |
| `sm:` | 640px | Wider mobile / small tablets |
| `md:` | 768px | Tablets — some layout shifts |
| `lg:` | 1024px | Sidebar appears, right panels become available |
| `xl:` | 1280px | Wider desktop — content has more breathing room |

### App shell

The authenticated shell at `lg+` uses a fixed left sidebar plus a scrollable main area.

```
┌──────────────────────────────────────────────────────┐
│ Sidebar (220px fixed)  │  Main content area          │
│                        │  max-w-5xl centered         │
│                        │                             │
│                        │                             │
└──────────────────────────────────────────────────────┘
```

- Sidebar width: `w-[220px]` fixed, `hidden lg:flex`
- On `< lg`: sidebar collapses behind a hamburger icon in the top bar. A `Sheet` (shadcn/ui) slides in from the left.
- Main content: `flex-1 overflow-y-auto`, padded `px-6 py-6` on desktop, `px-4 py-4` on mobile. Content pages use `px-4 py-4 md:px-6 md:py-6` — `md` (768px) is the breakpoint at which padding expands from mobile to desktop values.
- Max content width: `max-w-5xl mx-auto` applied inside the main area.

**Sidebar active nav item (MOCK-011)**: Active navigation items use `bg-teal-50` fill plus a `2px` teal-600 left-edge accent bar (`bg-teal-600 w-0.5 h-full rounded-r-full` or equivalent). Both elements are required — background fill alone is not sufficient. Applies to all sidebar nav items in both desktop and mobile sheet variants.

### Session page layout

The session page extends the shell with optional right panels.

```
┌──────────────────────────────────────────────────────────────────┐
│ Sidebar (220px) │  Chat area (flex-1)       │ Right panel (320px) │
│                 │  - Header with agent badge │  (collapsible)      │
│                 │  - Message list            │  Memory or Tools    │
│                 │  - Message input           │                     │
└──────────────────────────────────────────────────────────────────┘
```

- Right panels: `w-[320px]`, `hidden` by default, toggled by header buttons.
- On `< lg`: right panels are hidden by default; accessible via a modal or bottom sheet if needed.
- The chat area fills remaining horizontal space: `flex-1 min-w-0`.
- Message list: `flex-1 overflow-y-auto`, scroll anchored to bottom.
- Message input: fixed at bottom of the chat area, `sticky bottom-0 bg-white border-t border-zinc-200`.

### Unauthenticated pages (login / register)

Centered card layout, no sidebar.

```
┌─────────────────────────────────┐
│         (full viewport)         │
│    ┌─────────────────────┐      │
│    │   Card (max-w-sm)   │      │
│    └─────────────────────┘      │
└─────────────────────────────────┘
```

`min-h-screen flex items-center justify-center bg-zinc-50`

---

## 5. Component Patterns

### Elevation

Three levels only. No other shadow values.

| Level | Class | Use |
|---|---|---|
| Flat | none | Default surfaces: page, sidebar, table rows |
| Raised | `shadow-sm` | Cards, form panels, session cards, settings sections |
| Floating | `shadow-md` | Dropdowns, popovers, command palettes |

Modals (Dialog) use their own backdrop — do not add extra shadow to the dialog panel itself.

### Buttons

shadcn/ui `Button` component. Variants:

| Variant | Use |
|---|---|
| `default` | Primary actions (Submit, Save, Create session). Uses `--primary` (teal-600). |
| `destructive` | Irreversible destructive actions (Delete, Revoke, Archive). |
| `outline` | Secondary actions alongside a primary button (Cancel, Edit). |
| `secondary` | Lower-priority actions in button groups. |
| `ghost` | Icon buttons, nav items, inline controls with no visual weight. |
| `link` | Navigation-style inline text actions. |

Sizes: `sm` for compact contexts (table row actions), `default` for standard, `lg` for auth page CTA only.

**Ghost icon-only buttons on white surfaces**: Use `text-zinc-500` at rest (not `text-zinc-400`). `text-zinc-500` (#71717a) yields 4.7:1 contrast on white — meeting WCAG 1.4.11 (3:1) and 1.4.3 (4.5:1). `text-zinc-400` (#a1a1aa) yields only 2.56:1 and must not be used for interactive icon controls on white or near-white backgrounds. Example: `className="text-zinc-500 hover:bg-red-50 hover:text-red-700"`.

**Destructive ghost icon buttons — rest color ruling (GUARDRAIL-001)**: All destructive **ghost icon-only** buttons (trash, delete, revoke) must use `text-zinc-500` at rest with `hover:text-red-700`. They must **not** use `text-red-600` at rest. Rationale: (1) Red at rest reads as an error state, not a resting interactive affordance — it creates ambient alarm on every row that contains one of these buttons, regardless of user intent. (2) The neutral rest / red hover pattern communicates "danger zone on activation" without constant visual noise. (3) Consistent with the ghost button rule above — the same `text-zinc-500` floor applies regardless of the button's hover destination. Full pattern: `className="text-zinc-500 hover:bg-red-50 hover:text-red-700"`.

**Scope**: GUARDRAIL-001 applies exclusively to `variant="ghost"` icon-only buttons. It does not govern labeled buttons or non-ghost variants.

Exception — permanent-destructive row actions with no confirmation gate: If a button triggers an irreversible, immediate action on that specific row without a `ConfirmDialog` (rare — prefer always adding a confirm dialog), `text-red-600` at rest is permitted so the user is pre-warned. This exception requires both conditions to be true simultaneously. When `ConfirmDialog` is present, the rest-neutral rule is unconditional.

**Labeled destructive outline buttons (GUARDRAIL-002)**: Full-width or prominent `variant="outline"` buttons that perform a destructive action and have a visible text label (e.g., "Clear memory", "Delete account") may use `text-red-600 border-red-200` at rest when backed by `ConfirmDialog`. The label communicates intent explicitly — there is no ambient alarm concern. Approved pattern: `className="w-full gap-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"`. This applies to panel-level destructive actions (e.g., `MemoryPanel` "Clear memory" button) — not to table row actions (which use GUARDRAIL-001).

Teal accent buttons (AI-specific primary actions like "Send message") override the default variant:
```
className="bg-teal-600 hover:bg-teal-700 text-white"
```
This is applied via `className` — never by modifying `src/components/ui/button.tsx`.

**Header-bar icon buttons (CONS-001/002)**: Ghost icon-only buttons inside `h-14` sticky header bars (`SessionHeader`, `AppShell.MobileHeader`) use `h-11 w-11` (44px) to provide adequate touch targets within the bar height. This is an explicit exception to the `size="icon"` (`h-9 w-9`) default.

**Table-row icon buttons (AUDIT-003, v3.11)**: Icon-only ghost buttons inside table action cells (narrow, width-constrained) may use `h-11 w-11` directly. Both `h-11 w-11` and `size="icon" min-h-11` are approved for this context — they produce the same 44px height and identical visual output. `h-11 w-11` is preferred for its brevity. The `size="icon"` default (`h-9 w-9` = 36px) must not be used without the `min-h-11` override in table cells where touch target compliance is required.

### Cards

shadcn/ui `Card` with:
- `rounded-xl` (shadcn/ui default; aligns with `--radius: 0.625rem` in index.css)
- `border border-zinc-200`
- `shadow-sm`
- Internal padding: `p-4` standard, `p-6` for settings sections

Card subcomponents: use `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` from shadcn/ui.

**Inline form widget surface (CONS-023)**: Small surface blocks within forms or panels (toggle rows, compact stats blocks, collapsible form groups) use `rounded-lg border border-zinc-200 bg-white px-4 py-3` (or `bg-zinc-50` for muted background variant). This is distinct from standalone Cards which use `rounded-xl`. `rounded-md` must not be used on new surfaces — existing `rounded-md` instances are legacy.

### Forms

Layout rules:
- `Label` positioned above its `Input` — never inline or floating.
- Gap between label and input: `gap-1.5` (6px).
- Gap between form fields: `space-y-4`.
- Error message: `text-sm text-red-600` directly below the erroring input.
- Disabled state: `opacity-50 cursor-not-allowed` via shadcn/ui's built-in disabled styles.
- Required fields: do not use asterisks — rely on validation errors to communicate missing fields.

```
<div class="space-y-4">
  <div class="space-y-1.5">
    <Label for="username">Username</Label>
    <Input id="username" ... />
    <p class="text-sm text-red-600">This field is required.</p>  <!-- conditional -->
  </div>
</div>
```

**Divided List form pattern (DS-002)**: A settings form that presents a list of flag rows (label + control on each row, without any surrounding `Card` or `Table`) may use `divide-y divide-zinc-200` on the container to produce row separators. Rules for when this pattern applies:
- The rows are logically peer settings (e.g., feature-flag toggles) where a `Table` would be over-structured and a `Card` with `CardContent` per row would be over-padded.
- There is no need for column headers — the left label is the only descriptor.
- Each row uses `flex items-center justify-between py-3` for consistent height and spacing. This yields a comfortable 12px top/bottom inset that reads cleanly against the `border-zinc-200` divider.
- Hover state: none. Divided list rows are not interactive as a whole — only the control (Switch, Select, etc.) on the right is interactive. Do not add `hover:bg-zinc-50` to divided list rows.
- Do not use `divide-y` inside a `Table` (use `TableRow` with `border-b border-zinc-100` instead). Do not use `divide-y` inside a `Card` that already has padding — use `space-y-4` instead.

Example structure:
```
<div class="divide-y divide-zinc-200">
  <div class="flex items-center justify-between py-3">
    <div>
      <p class="text-sm font-medium text-zinc-900">Feature Name</p>
      <p class="text-xs text-zinc-500">Short description of what this does.</p>
    </div>
    <Switch ... />
  </div>
  ...
</div>
```

### Badges / Pills

shadcn/ui `Badge` component. Used for: session status, agent role, API key scopes, tool status.

- `variant="outline"` for neutral status
- Custom bg/text via `className` for semantic states (see Agent State section)
- Size: always `text-xs font-medium px-2 py-0.5 rounded-full`

**Tool status badge colors** (applied in `ToolsSidebar` via `statusBadgeClass`):

| Status | Classes | Meaning |
|---|---|---|
| `active` | `bg-green-50 text-green-700 border-green-200` | LLM-loaded this turn; auto-unloads after processing |
| `on_demand` | `bg-blue-50 text-blue-700 border-blue-200` | Available but not loaded |
| `disabled` | `bg-zinc-50 text-zinc-500 border-zinc-200` | Excluded from use |
| `auto_approved` | `bg-teal-50 text-teal-700 border-teal-200` | Loaded and auto-approved for execution without user confirmation |
| `pinned` | `bg-zinc-100 text-zinc-700 border-zinc-300` | System-locked; always loaded, not user-adjustable |

**Rationale for `pinned` color (v2.1)**: `pinned` is an immutable, admin-imposed state — not an error, not an AI activity state, and not a user-controlled status. It must visually communicate "this is fixed by the system, not by you." Zinc-100 background with zinc-700 text and zinc-300 border achieves this: it is heavier than `disabled` (zinc-50/zinc-500/zinc-200) to indicate that the tool is active and present, but carries no semantic hue that would imply a user-facing action. The stronger zinc-300 border (versus zinc-200 on `disabled`) provides the additional visual weight needed to distinguish pinned from a merely disabled tool. `text-zinc-700` meets WCAG AA at 5.7:1 on `bg-zinc-100`. The TriSwitch control is simultaneously rendered as `disabled` (opacity-50, pointer-events-none) for `pinned` tools, so the badge and the locked control together communicate immutability without requiring a warning or error color.

**MCP server status badge colors** (applied in `McpServerList`):

| Status | Classes | Meaning |
|---|---|---|
| `connected` | `bg-green-50 text-green-700 border-green-200` | Server is reachable and responding |
| `connecting` | `bg-amber-50 text-amber-700 border-amber-200` | Transient: server handshake in progress |
| `error` | `bg-red-50 text-red-700 border-red-200` | Server returned an error or is unreachable |
| `disconnected` | `text-zinc-600` (outline variant only) | Not connected; no background fill |

Amber is the correct color for the `connecting` transient state — it follows the same convention as `WARNING` log level badges. No mockup validation is required; the amber-for-transient pattern is an established system rule.

**ViolationBadge colors** (applied in `GuardrailsPanel`):

The `violation_type` values below are the exact strings returned by the backend `ViolationRecordOut.violation_type` field. The two retired values (`content_filter`, `spam`) from DS v3.11 and earlier were speculative — they do not exist in the actual schema. Do not add them back.

| Violation type | Classes | Rationale |
|---|---|---|
| `rate_limit` | `bg-red-50 text-red-700 border-red-200` | Hard limit enforcement — destructive-level; the session has been blocked |
| `llm_judge` | `bg-red-50 text-red-700 border-red-200` | AI-evaluated policy violation — same severity as rate_limit; active block |
| `input` | `bg-amber-50 text-amber-700 border-amber-200` | Input content flagged — warning-level; may be recoverable |
| `encoding` | `bg-amber-50 text-amber-700 border-amber-200` | Encoding/format violation — warning-level; recoverable |
| `tool_call` | `bg-amber-50 text-amber-700 border-amber-200` | Tool invocation policy violation — warning-level; specific to tool use |
| unknown/fallback | `bg-zinc-100 text-zinc-700 border-zinc-200` | Unrecognised or future violation type |

Rationale for red/amber split: `rate_limit` and `llm_judge` both result in an active block — the message was rejected. `input`, `encoding`, and `tool_call` flag a policy concern but the session may continue. Red = blocked; amber = flagged.

**MemoryModeBadge chip** (applied in `AssistantChatList` Mode column):

The `memory_mode` field on `ChatSessionOut` has three values. These are displayed as small inline chips (not standalone `Badge` components) to minimise visual noise in a table column. The chip uses `text-xs font-medium rounded-full px-1.5 py-0.5` sizing — one step more compact than the standard badge `px-2 py-0.5` because it appears in a dense table cell alongside other columns.

| Memory mode | Classes | Rationale |
|---|---|---|
| `conversation` | `bg-zinc-100 text-zinc-600 border border-zinc-200` | Default/neutral mode — no accent; communicates "standard" |
| `code` | `bg-blue-50 text-blue-700 border border-blue-200` | Code-oriented mode — blue follows the "informational" semantic used elsewhere (API key scopes, pending badges) |
| `reasoning` | `bg-teal-50 text-teal-700 border border-teal-200` | Reasoning/deep-thinking mode — teal ties it to the application accent and AI-activity states |

Rationale for not reusing amber: amber is reserved for warning/transient states throughout the system. `reasoning` is not a warning — it is a deliberate mode. Teal is the appropriate accent for AI-capability modes.

**ScheduledMessage status badge colors** (applied in `ScheduledMessageTable`):

| Status | Classes | Rationale |
|---|---|---|
| `pending` | `bg-blue-50 text-blue-700 border-blue-200` | Informational — awaiting dispatch |
| `firing` | `bg-amber-50 text-amber-700 border-amber-200` | In-progress / transient |
| `sent` | `bg-green-50 text-green-700 border-green-200` | Success terminal state |
| `failed` | `bg-red-50 text-red-700 border-red-200` | Error terminal state |
| `cancelled` | `bg-zinc-50 text-zinc-600 border-zinc-200` | Neutral terminal state |

**DeferredRecord status badge colors** (applied in `DeferredRecordTable`):

| Status | Classes | Rationale |
|---|---|---|
| `firing` | `bg-amber-50 text-amber-700 border-amber-200` | In-progress / transient — same amber-for-transient convention |
| default/`pending` | `bg-blue-50 text-blue-700 border-blue-200` | Awaiting dispatch |

**CardTitle size exception — compact data-table cards**: Cards that contain a `Table` as their primary content and appear in a multi-card stacked layout (e.g., `GuardrailsPanel`) use `CardTitle className="text-base"` (16px / `font-semibold`). This is intentional. The default `text-xl` CardTitle creates excessive visual weight when the card is a data panel rather than a standalone section heading. This exception applies only when: (1) the card is stacked among other cards of the same hierarchy, and (2) the card header also contains a count `Badge` alongside the title. Do not apply `text-base` to standalone section-heading cards.

### Dialogs / Modals

shadcn/ui `Dialog`. Rules:
- Centered on screen via shadcn/ui default.
- Backdrop: `bg-black/50` (shadcn/ui default).
- No additional `shadow` on the dialog panel.
- Max width: `max-w-md` for standard confirmations, `max-w-lg` for forms, `max-w-xl` for the tool confirmation modal (6 action buttons require horizontal space).
- Always include a visible close button (X icon in top-right corner). **Exception**: `ToolConfirmationModal` suppresses the close button via `[&>[data-slot=dialog-close]]:hidden` because the modal is non-dismissible by design — the agent is blocked awaiting a user response. The "Cancel" action button serves as the escape path.

**ToolConfirmationModal action button grid**: The 6 action buttons use `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`. At `sm`–`md` breakpoints (640px–767px) this renders 2-per-row, leaving one button orphaned on a third row. This is an accepted layout characteristic. Rationale: a 2-wide grid is preferable to a 1-wide stack at small-but-not-tiny widths, and the orphan is visually unambiguous (it is the "Cancel" action). Adding a `sm:col-span-2` on Cancel to fill the row is an acceptable future refinement but is not required — the current behavior is not a bug.

### Tables

- No heavy outer borders — use `border-b border-zinc-100` between rows only.
- Header row: `text-xs font-medium text-zinc-500 uppercase tracking-wide`.
- Row hover: `hover:bg-zinc-50`.
- Zebra striping: do not use — hover state is sufficient.
- Use shadcn/ui `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`.

**Null-state/placeholder text in table cells**: Em-dash `—` or other placeholder text indicating absent data must use `text-zinc-500` (`--muted-foreground`). `text-zinc-400` must not be used for text content in table cells. Example: `<span className="text-zinc-500">—</span>`.

**Table column text hierarchy (FONT-001)**: In data tables, the primary identifying column (usually name or title) uses `font-medium text-zinc-900`. Secondary descriptive columns (URL/path, description, metadata) use `text-zinc-600`. This two-level hierarchy is not decorative — it directs attention to the identifier first and supporting detail second. Do not use `text-zinc-500` for secondary columns that contain substantive data (e.g., transport URLs, model names); `text-zinc-500` is reserved for null-state placeholders and muted labels. Rule summary: primary column → `font-medium text-zinc-900`; secondary column → `text-zinc-600`; absent-data placeholder → `text-zinc-500`.

**Settings-page table containment exception**: Tables on the Settings page tabs (`ProviderList`, `McpServerList`, `ApiKeyList`) are wrapped in `overflow-x-auto rounded-xl border border-zinc-200`. This outer border is an approved deviation from the "no outer borders" rule. Rationale: Settings tab content appears without ambient card framing — the outer `rounded-xl border` provides the visual container that a `Card` shell would otherwise supply, without adding shadow elevation. This pattern must not be used on tables inside `Card` components (which already provide their own border).

### Inline Warning Banner (DS-001)

Used to surface a contextual caution within a form or panel — not a global toast notification, not a dismissible alert. Appears inline where the relevant content lives (e.g., inside a workflow form to warn that no knowledge base is attached).

**When to use**: For a non-blocking, non-dismissible advisory message that is always visible while the condition it describes is true. Do not use for errors (use `text-red-600` form error text or the `destructive` toast). Do not use for success states.

**Preferred implementation**: Use shadcn/ui `Alert` with a custom className override rather than a raw `div`. This preserves semantic markup (`role="alert"` or `role="note"`) without requiring a new component file. There is no shadcn/ui `variant="warning"` — apply the amber tokens via `className`.

```tsx
<Alert className="border-amber-200 bg-amber-50 text-amber-800">
  <AlertTriangle className="h-4 w-4 text-amber-700" />
  <AlertDescription className="text-amber-800 text-sm">
    Warning message text here.
  </AlertDescription>
</Alert>
```

If `Alert` is not already installed in `src/components/ui/`, install via `pnpm dlx shadcn@latest add alert` before using it. Raw `div` implementations are accepted in existing code — do not refactor them proactively. New occurrences must use `Alert`.

**Token table**:

| Element | Token | Tailwind class | Hex |
|---|---|---|---|
| Border | amber-200 | `border-amber-200` | `#fde68a` |
| Background | amber-50 | `bg-amber-50` | `#fffbeb` |
| Text | amber-800 | `text-amber-800` | `#92400e` |
| Icon | amber-700 | `text-amber-700` | `#b45309` |

**WCAG note**: `text-amber-800` (#92400e) yields approximately 7.0:1 contrast on `bg-amber-50` (#fffbeb) — well above WCAG AA 4.5:1. `text-amber-700` (#b45309, ~5.3:1) is used for the icon only. `text-amber-500` must not appear on `bg-amber-50` or on white in this context (see §1 amber WCAG note).

**Spacing**: Inner padding `p-3` or `p-4` (use `p-4` when the message is multi-line). The banner is not a full-bleed container — it must be constrained by its parent's width.

**Existing `div`-based implementation**: `WorkflowsPanel.tsx` uses a raw `div` with `rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800`. This implementation is correct on color tokens but uses `text-amber-800` (correct) and lacks an icon. It is acceptable as-is; future additions must use `Alert`.

### Panel Filter Controls

Applies to inline filter rows within assistant panel components (ScheduledMessageTable, AssistantChatList, DeferredRecordTable, KnowledgePanel, CampaignsPanel) and any future panel that adds filter controls.

#### Layout

Filters are placed in a **dedicated filter row below the panel header row** — they are never packed into the header row alongside the count text and action button. The header row communicates content quantity and the primary action; the filter row refines what is shown. Mixing these concerns in a single row creates hierarchy ambiguity and breaks at two-filter panels.

```
<div class="space-y-4">
  <!-- Row 1: header (count left, action button right) — unchanged -->
  <div class="flex items-center justify-between">
    <p class="text-sm text-zinc-500">N items</p>
    <Button size="sm">...</Button>
  </div>

  <!-- Row 2: filter bar -->
  <div class="flex flex-wrap items-center gap-2">
    <!-- Select and/or Input filter controls -->
  </div>

  <!-- Table or empty/loading state -->
  ...
</div>
```

`flex-wrap` on the filter row ensures controls stack gracefully at narrow widths without breaking the layout.

#### Component and sizing

- **Select filters**: `SelectTrigger` with `className="h-8 w-[140px] text-sm"`. Use `w-[140px]` for all channel and status Selects — fits the longest values ("whatsapp", "completed", "cancelled") without truncation at `text-sm`.
- **Text Input filters**: `Input` with `className="h-8 w-[160px] text-sm"`. Wider than the Select to provide adequate text-entry space.
- **Filter row gap**: `gap-2` (matches DS §3 button group gap).
- **Focus ring**: do not override — shadcn/ui default `focus-visible:ring-ring` applies.
- **Border**: `border-zinc-200` via `--input` token — do not override.

The `h-8` (32px) height is intentionally below the DS touch target minimum (44px, §4). Panel filters are desktop-primary controls within a tab layout that is only reachable at desktop widths. If mobile filter usability becomes a requirement, this spec must be revised with a §16 entry.

No `Label` element is placed above filter controls. These are refinement controls, not form fields; the "Label above Input" rule from §5 Forms does not apply. Placeholder text on the Input is sufficient. If a preceding inline label is desired for a Select that lacks a visible current-value cue, use `<span class="text-xs text-zinc-500 whitespace-nowrap">` within the flex row with `gap-1.5` between the span and the control.

#### Default ("All") state for Select filters

The default unfiltered option uses `value="all"` with a visible label "All [noun]s" (e.g., "All channels", "All statuses"). Do not use an empty-string value or a `placeholder` prop — a placeholder implies no selection has been made, which is incorrect for a filter that defaults to showing everything. "All" is a named, meaningful state.

```
<SelectItem value="all">All channels</SelectItem>
<SelectItem value="whatsapp">WhatsApp</SelectItem>
<SelectItem value="telegram">Telegram</SelectItem>
```

Initialize component state to `"all"`, not `""` or `undefined`.

#### Clear filter affordance

No explicit "×" clear button is provided. Re-selecting "All" from the Select, or clearing the Input field, is sufficient. An explicit clear button doubles the control count in the filter row, adds overhead for the common default state, and creates visual noise. These are single-dimension, immediately reversible filters — an explicit clear adds no user value. Use `type="text"` on Input filters (not `type="search"`) to avoid browser-native search chrome.

### Model row-selection pattern (BUG-01, v3.14)

Applies to the Models table in Settings > Providers & Models. Replaces the "Switch to" button and Status column with a row-selection paradigm.

**Rationale**: A column of identical "Switch to" buttons in a data table communicates "execute action" when the user intent is "select which item is active." Row-level selection (like a radio group) matches the mental model. Removing the Action and Status columns reduces the column count from 5 to 3, reducing visual noise.

**Structure**:
- `RadioGroup value={activeModelAlias}` wraps the `Table`.
- Each `TableRow` acts as a selectable row. A `RadioGroupItem value={m.alias}` inside the first cell is visually hidden (`sr-only`) for semantic accessibility.
- The active row's first cell also renders a `CircleCheck` icon (`h-4 w-4 text-teal-600`, `aria-hidden="true"`) inline next to the alias text.
- Admin-only: `onClick` and `cursor-pointer` applied only when `isAdmin === true`.

**Active row visual treatment**:

| Property | Value |
|---|---|
| Background | `bg-teal-50` |
| Left accent | `border-l-2 border-l-teal-600` (applied to first `TableCell`) |
| Icon | `CircleCheck h-4 w-4 text-teal-600` inline in alias cell |

**Inactive row (admin hover)**: `hover:bg-zinc-50 cursor-pointer`

**Loading state** (switch mutation pending): `opacity-60 cursor-wait` on the clicked row.

**Admin gate**: Non-admin users see the table in read-only mode. Active row retains its visual treatment; no click handler is attached.

**Columns**: Alias / Provider / Model name. No Status column. No Action column.

### View toggle button group (BUG-02, v3.14)

Applies to the Sessions page header. Used to switch between grid and list views.

```
<div class="flex items-center rounded-lg border border-zinc-200 p-0.5" role="group" aria-label="View layout">
  <Button variant="ghost" size="icon" aria-label="Grid view" aria-pressed={isGrid} className={cn("h-8 w-8", isGrid && "bg-zinc-100")}>
    <LayoutGrid class="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" aria-label="List view" aria-pressed={isList} className={cn("h-8 w-8", isList && "bg-zinc-100")}>
    <LayoutList class="h-4 w-4" />
  </Button>
</div>
```

| Element | Classes |
|---|---|
| Container | `flex items-center rounded-lg border border-zinc-200 p-0.5` |
| Button (inactive) | `h-8 w-8 text-zinc-500` (ghost) |
| Button (active) | `h-8 w-8 bg-zinc-100 text-zinc-900` |

**Active color**: `bg-zinc-100 text-zinc-900` (not teal). This is a display preference control, not a primary action or AI state. Teal is reserved for primary CTAs, active nav, and AI activity states.

**`h-8 w-8` exception**: These buttons are page-level view-preference controls in a content header, not in a sticky bar or table row. WCAG 2.5.8 (AA, 24×24px minimum) is met. The `h-8` size (`32px`) matches the compact filter control height (§5 Panel Filter Controls) and is contextually appropriate.

**Persistence**: Store as `sessionsView: "grid" | "list"` in `useUIStore` (Zustand). Default: `"grid"`.

### Ghost row add-action pattern (BUG-09, v3.14)

Replaces top-right outline "Add X" buttons on the Models (and future Providers) table section. A `tfoot` row with a dashed top border acts as the creation affordance, keeping the add action co-located with the table it creates entries in.

```html
<tfoot>
  <tr>
    <td colspan={N} role="button" tabIndex={0} aria-label="Add model"
        class="border-t border-dashed border-zinc-300 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors duration-150">
      <span class="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <Plus class="h-4 w-4" />
        Add model
      </span>
    </td>
  </tr>
</tfoot>
```

| Element | Classes |
|---|---|
| `td` | `border-t border-dashed border-zinc-300 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors duration-150` |
| Label | `text-sm text-zinc-500 hover:text-zinc-900` (hover inherited from parent) |
| Plus icon | `h-4 w-4` |

**Dashed border rationale**: `border-dashed` visually signals "not a data row — an affordance." Solid border would blend with regular row separators. `border-zinc-300` (one step darker than `border-zinc-200`) ensures the dash pattern is legible.

**Admin gate**: Render the `tfoot` row only when `isAdmin === true`.

**Form open state**: When clicked, the ghost row disappears and the existing inline form panel (`rounded-lg border border-zinc-200 bg-zinc-50 p-4`) appears below the table. Focus moves to the first form input. An explicit "Cancel" ghost button inside the form closes it.

**Keyboard**: `onKeyDown` handles Enter and Space.

### YamlBlock dark code surface (BUG-10, v3.14)

A new `YamlBlock` component for the Setup Wizard YAML preview. Distinct from the existing `CodeBlock` component (which uses a light surface for inline markdown code blocks). `YamlBlock` uses a dark surface matching terminal/config file conventions.

**Library**: `react-syntax-highlighter` with `atomOneDark` theme. Install: `pnpm add react-syntax-highlighter @types/react-syntax-highlighter`.

**Do not modify** `CodeBlock` in `MarkdownComponents.tsx` — create `YamlBlock` as a separate component in `src/components/`.

| Element | Classes / value |
|---|---|
| Outer container | `relative rounded-lg border border-zinc-700 overflow-hidden` |
| Header bar | `flex items-center justify-between bg-zinc-800 px-3 py-1.5` |
| Language label | `font-mono text-xs text-zinc-400` — shows "yaml" |
| Copy button | `h-6 w-6 text-zinc-400 hover:text-zinc-100` (ghost, icon) |
| Download button | `h-6 w-6 text-zinc-400 hover:text-zinc-100` (ghost, icon) |
| Syntax highlighter | `atomOneDark` theme, `language="yaml"` |
| Code font size | `0.75rem` (text-xs) |
| Max height | `256px` (max-h-64 equivalent) — scroll enabled |

**Copy**: `navigator.clipboard.writeText(yaml)`. Icon swaps `Clipboard → Check` for 2s. `aria-label` changes to "Copied" during that window.

**Download**: Creates a `Blob` of type `text/yaml`, triggers browser download as `cogtrix.yaml`. No toast — browser download dialog is sufficient feedback.

**aria-live**: The copy result (icon swap + aria-label change) is communicated via `aria-label` update — no separate `aria-live` region needed since the button itself is focused when clicked.

### Skeleton loaders

For all content areas that load asynchronously, use `Skeleton` (shadcn/ui) — not spinners.

- Spinner is only acceptable for button loading states (small `size-4` spinner inside the button, replacing the label).
- Skeleton dimensions should approximate the real content dimensions.
- Shimmer animation: shadcn/ui `Skeleton` provides the `animate-pulse` shimmer by default.

### Tabs

shadcn/ui `Tabs` component. Used on AdminPage, SettingsPage, and AssistantPage.

**Tab strip to content gap (CONS-008/009)**: Add `className="mt-4"` to each `TabsContent` element. This is the canonical spacing between the tab strip and its content on all tab pages (AdminPage, SettingsPage, AssistantPage). Do not use `mb-*` on the scroll wrapper to achieve this spacing — spacing at the `TabsContent` level is more precise.

### Border dividers

Use `border-zinc-200` as the explicit token for all dividers and card borders in application files. Do not use `border-border` in files outside `src/components/ui/` — although both resolve to the same CSS custom property, the codebase consistently uses the explicit Tailwind class for readability and grep-ability. shadcn/ui components under `src/components/ui/` that use `border-border` internally are correct and exempt from this requirement.

### TriSwitch (three-position toggle)

Used exclusively in `ToolRow` inside `ToolsSidebar`. Controls a tool's operational status across three discrete positions. It is a custom component — not based on shadcn/ui `Switch`.

#### Semantics

| Position | Status value | Meaning |
|---|---|---|
| 0 — left | `disabled` | Tool excluded from LLM tool set |
| 1 — middle | `on_demand` | Tool enabled; LLM may invoke when relevant |
| 2 — right | `loaded` | Tool actively loaded into LLM context |

#### Track

- Size: **64 × 24px**; `rounded-full` (pill, radius = 12px)
- Border: `border border-zinc-200` (constant across positions)
- Fill per position (secondary semantic confirmation — track color reinforces but does not replace the thumb position signal):

| Position | Track fill | Tailwind | Hex |
|---|---|---|---|
| 0 | `bg-zinc-200` | zinc-200 | `#e4e4e7` |
| 1 | `bg-teal-100` | teal-100 | `#ccfbf1` |
| 2 | `bg-green-100` | green-100 | `#dcfce7` |

Rationale for 100-level tints: the saturated track fills in the original implementation (blue-400, green-500) competed with the semantic status badges in the same row. Track fill is secondary confirmation; the thumb carries the primary accent at full saturation.

#### Thumb

- Size: **20 × 20px**; `rounded-full`; `shadow-sm` (raised elevation)
- 2px clearance on all sides (24px track height − 20px thumb = 4px total vertical clearance)
- Center positions from track left edge: position 0 → 12px, position 1 → 32px, position 2 → 52px
- Fill per position (thumb is the primary position indicator):

| Position | Thumb fill | Tailwind | Hex |
|---|---|---|---|
| 0 | `bg-white` with `border border-zinc-300` | white / zinc-300 | `#ffffff` / `#d4d4d8` |
| 1 | `bg-teal-500` (no border) | teal-500 | `#14b8a6` |
| 2 | `bg-green-600` (no border) | green-600 | `#16a34a` |

Position 0 uses white to signal inactivity. Positions 1 and 2 use saturated fills so the thumb's current state is readable without observing position alone.

#### Tick dots (discrete stop indicators)

Three 4px circular dots are inset into the track at the three thumb center positions (12px, 32px, 52px from left inner edge), vertically centered. Color: `rgba(0,0,0,0.25)` — this yields sufficient contrast on all three track fill colors (zinc-200, teal-100, green-100) without requiring per-position color logic. The thumb covers the dot at its current position; the two uncovered dots provide orientation cues.

#### Touch target

The interactive container uses `min-h-11` (44px) with the 24px visual track centered vertically. The visual track does not expand — only the hit area grows.

#### Interaction states

| State | Treatment |
|---|---|
| Hover | Track border darkens to `border-zinc-400`. No fill or thumb change. Cursor: `cursor-pointer`. |
| Active (press) | Thumb scales to `scale-90` (instantaneous, no transition). |
| Disabled | `opacity-50 cursor-not-allowed`. No pointer events. |
| Focus | `focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none`. Ring wraps the pill shape. |

#### Keyboard

`role="slider"` with `aria-valuemin={0}`, `aria-valuemax={2}`, `aria-valuenow`, `aria-valuetext`. Arrow keys advance/retreat position.

#### Transition

Thumb: `transition-transform duration-150 ease-in-out`. Track color: `transition-colors duration-150 ease-in-out`.

### Focus and accessibility

- Focus rings: shadcn/ui default `ring-2 ring-offset-2 ring-ring` — do not suppress.
- All interactive elements must be keyboard-accessible.
- Icon-only buttons must have `aria-label`.
- Color is never the sole differentiator — pair colors with text or icons.

---

## 6. Agent State Colors

These treatments are used in the `AgentStateBadge` component displayed in the session page header. The dot and label communicate state at a glance without requiring full attention.

| State | Dot color | Dot animation | Label text | Text color |
|---|---|---|---|---|
| `idle` | `bg-green-600` | none | "Ready" | `text-green-700` |
| `thinking` | `bg-teal-600` | `animate-pulse` | "Thinking..." | `text-teal-700` |
| `analyzing` | `bg-teal-600` | `animate-pulse` | "Analyzing..." | `text-teal-700` |
| `researching` | `bg-blue-600` | `animate-pulse` | "Researching..." | `text-blue-700` |
| `deep_thinking` | `bg-amber-600` | `animate-pulse` | "Deep thinking..." | `text-amber-700` |
| `writing` | `bg-green-600` | `animate-pulse` | "Writing..." | `text-green-700` |
| `delegating` | `bg-indigo-600` | `animate-pulse` | "Delegating..." | `text-indigo-700` |
| `done` | `bg-green-600` | none | "Done" | `text-green-700` |
| `error` | `bg-red-600` | none | "Error" | `text-red-600` |

Dot sizing: `size-2 rounded-full` (8px).

The badge layout: `inline-flex items-center gap-1.5 text-sm font-medium`.

Pulsing states use Tailwind's `animate-pulse`. This is a subtle opacity cycle — not a scale or color change. Rationale: excessive motion during AI activity distracts from reading the output.

### Connection Status Dot (WebSocket session)

The `ConnectionStatusDot` in `SessionHeader` shows the WebSocket connection state when it is not `open`. When the connection is `open`, the component renders nothing — the `AgentStateBadge` takes over as the live activity indicator.

| Status | Dot class | Label text | Rationale |
|---|---|---|---|
| `open` | (component hidden) | — | Normal state; agent badge is sufficient |
| `connecting` | `bg-zinc-400 animate-pulse` | "Connecting..." | Transient; neutral color avoids false alarm |
| `reconnecting` | `bg-zinc-400 animate-pulse` | "Reconnecting..." | Same as connecting — session not lost yet |
| `closed` | `bg-red-600` | "Disconnected" | Terminal state; red signals action may be needed |
| `error` | `bg-red-600` | "Disconnected" | Treated identically to closed from the user's perspective |

Accompanying label text: `text-xs text-zinc-500`. Dot size: `size-2 rounded-full` (inherits from agent state convention).

The pulse on zinc-400 communicates "in progress" without the alarm of red. The hard red on `closed`/`error` communicates "session is not connected" — the user may need to refresh. These are distinct from agent state dots (which communicate AI activity) and must not share the same color as any agent state.

---

## 7. Message Bubbles

The message list renders four role variants plus a streaming state. All bubbles use `rounded-2xl` for a conversational feel that distinguishes the chat area from the rest of the application's `rounded-xl` card components.

### User messages

```
Alignment: right (justify-end)
Background: bg-teal-50
Border: border border-teal-200
Text color: text-zinc-900
Border radius: rounded-2xl rounded-br-sm  (flattened bottom-right corner — "speech tail" hint)
Max width: max-w-[75%]
Padding: px-4 py-3
```

Rationale: teal-50 surface ties user messages to the application's accent color, marking them as "my" messages without heavy color.

### Assistant messages

```
Alignment: left (justify-start)
Background: bg-white
Border: border border-zinc-200
Text color: text-zinc-900
Border radius: rounded-2xl rounded-bl-sm
Max width: max-w-[75%]
Padding: px-4 py-3
Shadow: shadow-sm
```

Markdown content renders inside the bubble with `leading-relaxed text-base`. Code blocks within assistant messages use the standard code block treatment (see Typography section).

### System messages

```
Alignment: center
Background: bg-zinc-100
Text color: text-zinc-600
Style: italic
Size: text-sm
Border radius: rounded-md
Padding: px-3 py-1.5
Max width: max-w-[60%] mx-auto
```

System messages have no border and no shadow — they should feel lightweight and parenthetical.

### Tool messages

```
Alignment: left
Background: bg-zinc-50
Border: border border-zinc-200
Border-left: border-l-2 border-l-zinc-400  (visual distinction from assistant messages)
Border radius: rounded-md (not rounded-2xl — tool output is data, not conversation)
Font: font-mono text-sm
Padding: px-4 py-3
Max width: max-w-[85%]
```

The wider max-width accommodates structured JSON or long tool output without excessive wrapping.

**Border layering note**: The tool bubble uses `border border-l-2 border-zinc-200 border-l-zinc-400`. The `border` shorthand sets all four sides to `border-zinc-200`, then `border-l-2` overrides the left width to 2px, and `border-l-zinc-400` overrides the left color. Tailwind generates separate CSS properties for each side, so the override order is stable. This is the intended pattern for a left-accent border — do not refactor into separate border declarations.

### Streaming state

While a message is streaming (`agentState !== 'idle'`), the assistant bubble renders with its normal treatment plus a blinking cursor.

**Pre-text cursor state**: When tools are active but no text has streamed yet, `StreamingMessageBubble` renders null — the bubble does not appear at all. Live tool activity is surfaced instead via the StatusBar at the bottom of the chat window. The bubble and its blinking cursor appear only after the first token arrives.

The cursor is appended to the last character of text when text is present.

Streaming cursor element: `inline-block w-0.5 h-4 bg-zinc-900 ml-0.5 align-middle`

Animation: custom keyframe defined in `src/index.css`:

```css
@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.streaming-cursor {
  animation: blink-cursor 1s step-end infinite;
}
```

Rationale: `step-end` produces a hard blink (like a terminal cursor), not a fade. This clearly communicates "active generation" rather than a decorative pulse.

### Typing indicator (v3.3)

The `TypingIndicator` component fills the visual gap that exists when `agentState !== 'idle'` and `streamingBuffer` is empty. During this pre-text period `StreamingMessageBubble` renders null; `TypingIndicator` takes its place in the message list.

**Placement**: Left-aligned in the message list, in the same position an assistant bubble would occupy. It is not a footer element or a standalone annotation — it is a message-list item. When the first streaming token arrives, `TypingIndicator` unmounts and `StreamingMessageBubble` mounts in the same position.

**Bubble wrapper** (identical to the assistant bubble):

```
max-w-[75%] rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 shadow-sm
```

No deviation from the assistant bubble container is permitted. The indicator must be visually indistinguishable from a nascent assistant message.

**Inner layout**: `flex items-center gap-1.5`

**Dots**: Three dots. Count is a universal convention for "composing" — two is incomplete, four is busy.

| Property | Value | Tailwind |
|---|---|---|
| Diameter | 8px | `size-2` |
| Shape | Circle | `rounded-full` |
| Color | zinc-400 | `bg-zinc-400` |
| Gap between dots | 6px | `gap-1.5` |

**Dot color justification (`bg-zinc-400`)**: The dots are a non-text decorative motion indicator. WCAG 1.4.11 (3:1) applies to UI components and informational graphics — not to purely decorative elements whose meaning is carried by animation, position, and ARIA semantics. `bg-zinc-500` would make the static dots read as dense content; `bg-teal-400` would import the primary accent into an element with no interactive or primary-action meaning. `bg-zinc-400` communicates "in progress, not settled" — lighter than body text, heavier than a structural decoration. The contrast progression from muted dots → streaming cursor (`bg-zinc-900`) → full text is intentional.

**Animation keyframe** (add to `src/index.css`):

```css
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}
```

A `translateY` bounce distinguishes the indicator from all other animations in the system (`animate-pulse` is used by agent state dots and skeletons; `blink-cursor` is used by the streaming cursor). The 4px rise is 50% of the 8px dot height — perceptible without being dramatic.

**Dot animation classes with stagger** (Tailwind arbitrary animation syntax):

```
Dot 1: motion-safe:animate-[typing-bounce_0.9s_ease-in-out_infinite]
Dot 2: motion-safe:animate-[typing-bounce_0.9s_ease-in-out_0.15s_infinite]
Dot 3: motion-safe:animate-[typing-bounce_0.9s_ease-in-out_0.30s_infinite]
```

150ms stagger between each dot produces the left-to-right wave. Total cycle: 900ms.

**`prefers-reduced-motion` behaviour**: The `motion-safe:` prefix suppresses the animation class when `prefers-reduced-motion: reduce` is active. All three dots remain visible at their rest position (no movement). The bubble itself is not hidden — the placeholder function is preserved; only motion is removed. No JavaScript detection is required.

**ARIA semantics**:

```html
<div role="status" aria-live="polite" aria-label="Assistant is typing">
```

`role="status"` with `aria-live="polite"` announces the element's appearance to screen readers without interrupting ongoing narration. The `aria-label` provides the verbal equivalent. No visible text inside the element. When `TypingIndicator` unmounts (first token), screen readers transition to the streaming message content via the existing live message region.

**Full element structure**:

```html
<div class="flex justify-start" role="status" aria-live="polite" aria-label="Assistant is typing">
  <div class="max-w-[75%] rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 shadow-sm">
    <div class="flex items-center gap-1.5">
      <span class="size-2 rounded-full bg-zinc-400 motion-safe:animate-[typing-bounce_0.9s_ease-in-out_infinite]"></span>
      <span class="size-2 rounded-full bg-zinc-400 motion-safe:animate-[typing-bounce_0.9s_ease-in-out_0.15s_infinite]"></span>
      <span class="size-2 rounded-full bg-zinc-400 motion-safe:animate-[typing-bounce_0.9s_ease-in-out_0.30s_infinite]"></span>
    </div>
  </div>
</div>
```

**Approved mockup**: `docs/web/mockups/typing-indicator.svg` — three states: motion-on (mid-bounce), motion-reduced (static), transition-out (replaced by StreamingMessageBubble).

---

### Tool activity rows (inline, within message list)

Tool activity rows appear inline in the message list between assistant messages. They are not bubbles — they are compact rows.

```
Layout: flex items-center gap-2
Background: bg-zinc-50
Border: border border-zinc-200 rounded-md
Padding: px-3 py-2
Icon: Lucide icon (wrench or tool-specific), w-4 h-4 text-zinc-400
Tool name: text-sm font-medium text-zinc-700
Status: text-xs text-zinc-500 (e.g., "Running..." or "Completed in 1.2s")
```

While running: tool name color stays `text-zinc-700`, status shows "Running..." with `animate-pulse` on a zinc-400 dot.
After completion: status updates to "Completed in Xs", dot turns green or red depending on success.

**Accessibility note (v1.1)**: Status text uses `text-zinc-500` (#71717a), not `text-zinc-400` (#a1a1aa). On the `bg-zinc-50` (#fafafa) surface, zinc-500 yields approximately 4.7:1 contrast ratio, meeting WCAG AA for normal text (4.5:1 minimum). zinc-400 yields approximately 2.4:1 and must not be used for text content. The running state dot (decorative indicator, not text) remains `bg-zinc-400` — decorative elements are exempt from text contrast requirements. The `text-zinc-400` class is reserved for icons and purely decorative elements in this component.

### StatusBar (v3.0)

The `StatusBar` renders at the bottom of the chat area below `MessageInput`. It is hidden when `statusLog` is empty (no tool calls in progress or completed). It shows the most recent tool call in a single-line collapsed view, with an expand button to reveal the full log.

**StatusBar token specification:**

| Element | Classes | Notes |
|---|---|---|
| Outer container | `border-t border-zinc-200 bg-zinc-50 text-xs` | Same surface as `MessageInput` border |
| Collapsed row | `flex items-center gap-1.5 px-3 py-0.5` | Single line |
| Expand/collapse button | `ml-1 flex size-6 shrink-0 items-center justify-center rounded text-zinc-500 hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none` | **Must use `text-zinc-500`** — `text-zinc-400` fails WCAG AA on `bg-zinc-50` |
| Expand/collapse icon | `size-3.5` ChevronUp/ChevronDown | — |
| Expanded log container | `max-h-48 overflow-y-auto border-b border-zinc-200 px-3 py-1` | Capped at 192px per §3 |
| EntryRow — time column | `w-[4.5rem] shrink-0 font-mono text-zinc-500 tabular-nums` | `text-zinc-500` required for contrast |
| EntryRow — tool name | `min-w-0 truncate font-sans text-zinc-700` | `font-sans` — tool names are UI labels, not code |
| EntryRow — duration/status | `ml-auto shrink-0 font-mono tabular-nums text-zinc-500` | `text-zinc-500` for contrast |
| EntryRow — running indicator dot | `inline-block size-1.5 animate-pulse rounded-full bg-teal-500` | Decorative; `bg-teal-500` consistent with agent state convention |
| EntryRow — error indicator | `size-3 text-red-600` X icon | `text-red-600` required (see §1 WCAG note) |
| EntryRow — success indicator | `size-3 text-green-600` Check icon | — |
| EntryRow — running border | `border-l-2 border-teal-500 pl-2` | Active tool has teal left accent |
| EntryRow — error border | `border-l-2 border-red-600 pl-2` | Failed tool has red left accent |
| EntryRow — completed (no border) | `pl-2.5` | Aligns with bordered entries (2px border + 8px pl = 10px = pl-2.5) |

### Markdown typography inside assistant bubbles (v3.0)

The assistant bubble renders LLM responses through `react-markdown`. All elements are styled explicitly in `src/components/MarkdownComponents.tsx`. Do not use the Tailwind Typography plugin — full control over every element is required to maintain design system fidelity.

**CRITICAL SPACING RULE (v3.0)**: The markdown container `div` adds `space-y-3` (12px) to produce consistent vertical rhythm between all direct block children. This is the **sole spacing mechanism** between top-level blocks. Individual block elements (`p`, `ul`, `ol`, `blockquote`, `pre`, `hr`, headings) **must NOT carry their own `mb-` bottom margin** — doing so creates double-spacing (the `space-y-3` gap plus the element's own `mb-*`). Headings may use `mt-` to push away from the preceding block, and `mb-` only to tighten coupling to immediately following content (like a paragraph directly after a heading). All `mb-3 last:mb-0` patterns on `p`, `ul`, and `ol` are incorrect and must be removed.

**Heading hierarchy**

All heading classes must include `leading-tight` for correct heading line height. h1–h3 must implement first-child `mt-0` using the `[&:first-child]:mt-0` selector to suppress the top margin when the heading opens the content.

| Element | Classes |
|---|---|
| `h1` | `text-xl font-semibold leading-tight text-zinc-900 mt-4 mb-2 [&:first-child]:mt-0` |
| `h2` | `text-lg font-semibold leading-tight text-zinc-900 mt-4 mb-1.5 [&:first-child]:mt-0` |
| `h3` | `text-base font-semibold leading-tight text-zinc-900 mt-3 mb-1 [&:first-child]:mt-0` |
| `h4` | `text-sm font-semibold leading-tight text-zinc-700 mt-3 mb-1` |
| `h5` | `text-sm font-medium leading-tight text-zinc-600 mt-2 mb-0.5` |
| `h6` | `text-sm font-medium leading-tight text-zinc-500 mt-2 mb-0.5` |

Heading hierarchy is differentiated by size and weight only — never by color changes to non-neutral values. h4–h6 use progressively muted zinc shades to signal lower rank while remaining legible.

**Paragraphs**: `<p>` with no `mb-*` class. Spacing is handled entirely by the `space-y-3` container. The current incorrect pattern `mb-3 last:mb-0` on `<p>` must be removed.

**Unordered lists**: `list-disc pl-5 space-y-1 text-base text-zinc-900` — no `mb-*` class. Nested `ul`: `pl-4 mt-1 list-disc`. Bullet style: standard disc — no custom SVG markers.

**Ordered lists**: `list-decimal pl-5 space-y-1 text-base text-zinc-900` — no `mb-*` class. Nested `ol`: `pl-4 mt-1 list-decimal`.

**List items**: `leading-relaxed` (inherited from container). No extra class required.

**Blockquotes** (v3.0 correction): `border-l-2 border-teal-200 bg-teal-50/40 pl-4 py-1 italic text-zinc-600 my-2 rounded-r-sm`. The 2px teal left bar uses the accent color to signal "highlighted/quoted content" — a structural choice, not decoration. `text-zinc-600` (#52525b) at 7.03:1 on white meets WCAG AA. Nested blockquotes: `border-l-2 border-teal-100 pl-3` (lighter inner border to signal depth).

The previous implementation used `border-l-4 border-zinc-300 pl-3 text-zinc-600` with no background tint — this is incorrect. The zinc-300 border has no semantic connection to the teal accent and lacks the teal-50/40 background that provides the subtle content-highlight tint. All implementations must use the teal-200 border and teal-50/40 background.

**Fenced code blocks** (v3.0 — copy button required): The `pre` element is wrapped in a relative `div` with class `relative rounded-md border border-zinc-200 bg-zinc-50`. A header row (`flex items-center justify-between px-3 pt-2 pb-1`) contains:
- Left: language label `text-xs font-medium text-zinc-400 font-mono` (shows detected language or empty)
- Right: copy button — shadcn/ui `Button` `variant="ghost"` `size="icon"` `className="h-6 w-6"`, containing a `Clipboard` or `Check` icon at 14px (`w-3.5 h-3.5`). After click: swap to `Check` icon for 2 seconds then revert.

The `pre` itself: `overflow-x-auto px-3 pb-3 pt-0 font-mono text-sm leading-relaxed`. No border or background on `pre` directly — these are on the wrapper `div`. No max height — code output scrolls within the chat container.

Copy button implementation requires `useState` and `navigator.clipboard.writeText()`. The copy button must be implemented as a separate `CodeBlock` component that wraps `pre`, since `markdownComponents` needs to pass the raw string content to `navigator.clipboard`.

**Inline code**: `rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm text-zinc-900`. The explicit `text-zinc-900` class is required — do not rely on inheritance.

**Horizontal rules**: `border-t border-zinc-200 my-4`. No decorative treatment.

**Images**: `max-w-full rounded-md my-2`. Alt text via HTML attribute only — no visible caption. Must be implemented in `src/components/MarkdownComponents.tsx` — the `img` component is currently absent.

**Tables**: `tbody` and `tr` elements must be implemented to apply row hover (`hover:bg-zinc-50`). Current implementation lacks `tbody` and `tr` overrides, meaning table rows have no hover state. Required additions:
- `tbody`: plain `<tbody>` wrapper with no classes (shadcn table structure handles it)
- `tr`: `hover:bg-zinc-50 transition-colors duration-150`

The `table`, `thead`, `th`, `td` implementations are correct and remain unchanged from v1.0.

**Bold / italic**: browser defaults (`font-bold`, `italic`). No custom components needed.

**Links**: `text-teal-600 underline hover:text-teal-700` (unchanged). Unsafe URLs: `text-zinc-500` plain span.

The complete specification and mockup instructions are in `docs/web/briefs/chat-markdown-typography.md`.

---

## 8. Interaction States

All interactive elements must implement all applicable states below. shadcn/ui components handle most of these by default — document overrides explicitly when applied.

| State | Treatment |
|---|---|
| Hover | Background or text color shifts one step darker. Transition: `transition-colors duration-150`. |
| Focus | `ring-2 ring-offset-2 ring-zinc-400` (shadcn/ui default). Never suppress. |
| Active (pressed) | Scale down slightly: `active:scale-[0.98]`. Applied via shadcn/ui Button by default. |
| Disabled | `opacity-50 cursor-not-allowed pointer-events-none`. |
| Loading (button) | Replace button label with a `size-4` spinner (`animate-spin`). Disable the button. |
| Loading (content area) | Replace content with `Skeleton` components. |
| Error | Red border (`border-red-600`) on the affected input. Error message below in `text-red-600 text-sm`. `red-600` meets WCAG AA 3:1 for UI component graphics on white. |

Transition timing:
- Hover color changes: `duration-150 ease-in-out`
- Panel open/close: `duration-200 ease-in-out`
- No spring/bounce animations.

---

## 9. Animation

Animation is intentionally minimal. The interface communicates through content, not motion.

| Animation | Implementation | Duration | Easing |
|---|---|---|---|
| Hover state | `transition-colors` | 150ms | `ease-in-out` |
| Panel open/close | `transition-all` | 200ms | `ease-in-out` |
| Skeleton shimmer | `animate-pulse` (Tailwind/shadcn) | — | — |
| Streaming cursor blink | Custom `blink-cursor` keyframe | 1s | `step-end` |
| Typing indicator bounce | Custom `typing-bounce` keyframe, staggered per dot (0ms / 150ms / 300ms delay) | 900ms | `ease-in-out` |
| Agent state dot pulse | `animate-pulse` (Tailwind) | — | — |
| Document status text pulse | `animate-pulse` (Tailwind) on `text-amber-700` status text in `DocumentCard` | — | — |
| Toast enter/exit | shadcn/ui Sonner defaults | — | — |

**Document status text pulse (v3.4)**: `animate-pulse` on status text ("Processing...", "Pending") in `DocumentCard` is an approved use of Tailwind's built-in pulse. Rationale: the `processing` and `pending` document states are transient — they will resolve to `indexed` or `failed` without user intervention. The pulse communicates "this is not settled yet" using the same semantic signal as the agent-state dot pulse. Constraints: (1) Only transient states (`processing`, `pending`) may pulse — `indexed` and `failed` are terminal states and must not animate. (2) The pulsing element uses `text-amber-700` (not `text-amber-500`) per the §1 WCAG AA note. (3) This pattern is limited to `DocumentCard` — it must not be adopted for other status text without a design system update.

**Reduced-motion policy (v3.9)**: Animations that communicate non-essential state (e.g. typing-bounce, streaming-cursor blink) must be suppressed for users who request reduced motion. Two complementary mechanisms are required:

1. **Per-component `motion-safe:` prefix** on every `animate-*` or `transition-*` that is cosmetic (not functional). Required for `typing-bounce` and `blink-cursor` — both are defined as `motion-safe:animate-[...]` in the component JSX.
2. **Global CSS safety net** in `src/index.css`: a `@media (prefers-reduced-motion: reduce)` block that zeroes out all keyframe animations and transitions as a final fallback. This catches any future animation added without a `motion-safe:` prefix.

```css
/* src/index.css — global safety net */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Both mechanisms must be present. The per-component prefix ensures correct behavior in production. The global rule provides belt-and-suspenders protection and is auditable without reading every component.

Do not add:
- Spring physics or bounce easing
- Parallax or scroll-triggered animations
- Spinning loaders for content areas (use skeletons)
- Stagger animations on list items

---

## 10. Iconography

### Library

Lucide React. It is bundled with shadcn/ui and already available as a dependency.

Import pattern:
```tsx
import { MessageSquare, Settings, ChevronRight } from "lucide-react";
```

Never install a second icon library.

### Sizing

| Context | Size | Tailwind class |
|---|---|---|
| Inline with text | 16px | `w-4 h-4` |
| In buttons | 20px | `w-5 h-5` |
| Standalone / navigation | 24px | `w-6 h-6` |
| Feature / empty state illustration | 48px | `w-12 h-12` |

### Stroke width

Default (`strokeWidth={2}`). Do not change stroke width for decorative reasons. Use `strokeWidth={1.5}` only for large (48px) empty-state icons where the default stroke looks heavy.

### Color

Icons inherit text color via `currentColor` by default. Apply color via the parent element's `text-*` class, not directly on the icon. Example:

**Empty-state icons**: Use `text-zinc-400` for large decorative icons in empty states (e.g., a 48px `FileText` or `MessageSquare` when a list has no items). Do not use `text-zinc-300` — it falls below the minimum legibility threshold on white surfaces.

**Navigation icons with visible text labels**: Nav icons rendered alongside an always-visible text label (e.g. sidebar navigation items) may use `text-zinc-400` because the label provides the required accessible affordance. Per WCAG 1.4.11, only parts of the graphic "required to understand the content" must meet 3:1. The label is the primary affordance; the icon is supplementary.

```tsx
<span className="text-zinc-400">
  <Settings className="w-4 h-4" />
</span>
```

---

## 11. Dark Mode

Dark mode is planned but not in initial scope (Sprint 0–5).

All colors are defined via CSS custom properties in `src/index.css`. The `.dark` class ruleset is already present in `index.css` with shadcn/ui's default dark values.

Rules for dark mode readiness:
- Never hardcode hex or rgb values in component `style` props.
- Always use Tailwind semantic classes (`bg-background`, `text-foreground`, `border-border`) or direct CSS variable references for surfaces and text.
- Teal accent classes (`bg-teal-600`, `text-teal-600`) will need dark mode variants when dark mode is activated — use the `dark:` prefix at that time.
- Do not add dark mode overrides speculatively. Add them only when the dark mode sprint begins.

---

## 12. Component Inventory

| Component | Variants | shadcn/ui base | Pages |
|---|---|---|---|
| `Button` | default, destructive, outline, secondary, ghost, link | `button` | All pages |
| `Input` | default, disabled, error | `input` | Login, Register, Session input, Settings forms |
| `Label` | default | `label` | All forms |
| `Card` | default, raised | `card` | Dashboard (session cards), Settings sections |
| `Dialog` | confirmation, form, tool-confirmation | `dialog` | Session (tool confirm), Settings (delete confirms), Dashboard (new session) |
| `Badge` | outline, agent-state (custom color), tool-status (custom color) | `badge` | Session header, Dashboard, Settings (tool status), Assistant (violation type) |
| `Skeleton` | text, card, message-bubble | `skeleton` | All data-loading pages |
| `Sheet` | sidebar (mobile nav) | `sheet` | App shell (< lg) |
| `Separator` | horizontal | `separator` | Sidebar, Settings sections |
| `Switch` | default, sm | `switch` | Settings (feature flags), LiveLogViewer header (debug toggle). Note: the sm variant previously used in `ToolsSidebar` has been superseded by `TriSwitch`. |
| `TriSwitch` | positions 0/1/2 | Custom (no shadcn/ui base) | Session page — `ToolsSidebar` / `ToolRow` only |
| `Table` | default | `table` | Settings (API keys, MCP servers), Admin, Documents, Assistant (violations, blacklist, guardrails) |
| `Tabs` | default | `tabs` | Settings page (5 tabs), Assistant page (8 tabs) |
| `Tooltip` | default | `tooltip` | Icon buttons without visible labels |
| `Toast` (Sonner) | info, success, error, warning | `sonner` | Global notifications |
| `Select` | default | `select` | LiveLogViewer (log level selector), NewSessionDialog (model, memory mode) |
| `AgentStateBadge` | idle, thinking, analyzing, researching, deep_thinking, writing, delegating, done, error | Custom (uses `Badge` + dot) | Session header, SessionCard |
| `MessageBubble` | user, assistant, system, tool | Custom | Session message list |
| `StreamingMessageBubble` | assistant-streaming | Custom (extends MessageBubble) | Session message list |
| `TypingIndicator` | default (motion-on), reduced-motion (static dots) | Custom | Session message list — shown when `agentState !== 'idle'` and `streamingBuffer` is empty; unmounts on first token |
| `SessionCard` | default, archived, selected (v3.14) | Custom (uses `Card`) | Dashboard — subtitle shows model alias as interactive `Popover` trigger (BUG-06); archived variant shows Unarchive + Delete buttons always-visible; selected variant shows `ring-2 ring-teal-600 ring-offset-2` selection ring and `Checkbox` overlay (BUG-04/05) |
| `RadioGroup` / `RadioGroupItem` | default | `radio-group` (shadcn/ui — install via `pnpm dlx shadcn@latest add radio-group`) | Settings > Providers & Models — Models table row-selection (BUG-01) |
| `Checkbox` | default | `checkbox` (shadcn/ui — install via `pnpm dlx shadcn@latest add checkbox`) | Sessions page bulk selection (BUG-05) |
| `Popover` / `PopoverContent` | default | `popover` (shadcn/ui — install via `pnpm dlx shadcn@latest add popover`) | SessionCard model chip (BUG-06) |
| `SessionActionDialog` | 3-option (cancel/archive/delete) | Custom (uses `Dialog` — not `ConfirmDialog`) | Sessions page — replaces the single-destructive ConfirmDialog for non-archived sessions (BUG-03); component at `src/pages/sessions/SessionActionDialog.tsx` |
| `SessionRow` | default, archived, selected (v3.14) | Custom (exported from `src/components/SessionCard.tsx`) | Sessions list view — one row per session; columns: Checkbox, Name, Model, State, Updated, Actions; uses same model-popover pattern as `SessionCard` |
| `SessionBulkBar` | default (sticky bottom) | Custom | Sessions page — appears when ≥1 session selected; shows count, Clear, Archive, Delete permanently (BUG-05) |
| `YamlBlock` | default (dark surface) | Custom (uses `react-syntax-highlighter`, does NOT extend `CodeBlock`) | Settings > Setup Wizard — YAML preview with syntax highlighting, Copy + Download actions (BUG-10) |
| `AppShell` | authenticated | Custom | All authenticated pages |
| `Sidebar` | desktop-fixed, mobile-sheet | Custom | App shell |
| `ToolCallSummary` | default | Custom (internal to `MessageBubble`) | Session message list (completed assistant messages) |
| `GuardrailsPanel` | default | Custom (uses `Card`, `Table`) | Assistant page — Guardrails tab only |
| `ViolationBadge` | input, encoding, tool_call, rate_limit, llm_judge | Custom (uses `Badge`) | Assistant / GuardrailsPanel — Recent Violations table. **Active as of v3.12**: `ViolationRecordOut.violation_type` confirmed present in backend schema 2026-03-25. Component at `src/components/ViolationBadge.tsx`. |
| `MemoryModeBadge` | conversation, code, reasoning | Custom (inline chip — not a standalone component file; render inline in `AssistantChatList`) | Assistant page — Chats tab, Mode column of the chat list table |
| `ServiceControlPanel` | default | Custom (uses `Card`) | Assistant page — above tabs; shows live-ticking uptime |
| `SystemInfoCard` | default | Custom (uses `Card`) | Admin page — System tab; shows live-ticking uptime |
| `LiveLogViewer` | default | Custom (uses `Card`) | Admin page — Live Logs tab; contains debug `Switch`, connection status badge, level `Select`, connect/disconnect `Button`, clear `Button` all in card header |
| `UserManagementPanel` | default | Custom (uses `Card`, `Table`) | Admin page — Users tab; user list with role and status management |
| Markdown rendering (inline) | — | No standalone component — inlined in `AssistantBubble` (`MessageBubble.tsx`) and `StreamingMessageBubble.tsx` via `<div className="space-y-3 text-base leading-relaxed"><ReactMarkdown components={markdownComponents}>` | Session message list — assistant and streaming bubbles. Element overrides live in `src/components/MarkdownComponents.tsx`. Full specification in §7. |
| `CodeBlock` | default | Custom (wraps `pre` with copy button) | Used by `src/components/MarkdownComponents.tsx` — handles fenced code blocks with language label and copy-to-clipboard button |

---

## 13. shadcn/ui Conventions

**Style**: New York (configured at project init — do not change).

**Installation**:
```bash
pnpm dlx shadcn@latest add <component>
```

**Extension rule**: Extend components exclusively via the `className` prop. Never modify files under `src/components/ui/`. If a component requires structural changes beyond what `className` supports, create a new wrapper component in `src/components/`.

**Composition rule**: shadcn/ui compound components (e.g., `Card`, `Dialog`, `Table`) must use their full subcomponent set. Do not nest raw `div` elements inside a `CardContent` where a `CardHeader` or `CardTitle` should be used — this breaks structural consistency.

**Theming**: All shadcn/ui theme values are set in `src/index.css` via CSS custom properties. To change any token (e.g., `--radius`), update `src/index.css` and document the change in this design system.

---

## 14. Page Architecture

### Page list

| Route | Page component | Layout | Notes |
|---|---|---|---|
| `/login` | `LoginPage` | Centered card, no sidebar | Unauthenticated only |
| `/register` | `RegisterPage` | Centered card, no sidebar | Unauthenticated only |
| `/sessions` | `SessionsPage` | App shell | Authenticated; session list dashboard |
| `/sessions/:id` | `SessionPage` | App shell + optional right panels | Most complex page |
| `/settings` | `SettingsPage` | App shell | Admin-gated mutations |
| `/admin` | `AdminPage` | App shell | Admin-only route |
| `/documents` | `DocumentsPage` | App shell | Authenticated |
| `/assistant` | `AssistantPage` | App shell | Authenticated |
| `*` | `NotFoundPage` | Minimal (no sidebar) | 404 |

### Information hierarchy per page

**Login / Register**: Single purpose. Headline → form → submit CTA → toggle link. No competing elements.

**Sessions Dashboard (v3.14)**: Page title + right-hand header controls (in order: Show archived switch, view toggle group, New Session button) → session content area (grid or list view, toggled by view toggle group) → infinite scroll at bottom → empty state when no sessions.

Header controls layout: `flex items-center gap-4`. View toggle group: `rounded-lg border border-zinc-200 p-0.5` container with `h-8 w-8` LayoutGrid/LayoutList ghost buttons. Active button: `bg-zinc-100 text-zinc-900`. View preference stored in `useUIStore.sessionsView`.

Grid view: `grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3` (unchanged).

List view: `overflow-x-auto rounded-xl border border-zinc-200` wrapper containing a `Table` with columns: Checkbox | Name | Model | State | Updated | Actions.

Bulk selection: each `SessionCard` (grid) has a `Checkbox` overlay (top-left, `absolute top-2 left-2 z-10`). Visible on hover (desktop) or when any session is selected. Selected card: `ring-2 ring-teal-600 ring-offset-2`. List view: Checkbox always visible in leftmost column. When ≥1 selected: `SessionBulkBar` appears fixed at viewport bottom (`fixed bottom-0 left-0 right-0 lg:left-[220px]`). Selection state in `useUIStore.selectedSessionIds`.

Non-archived session delete action: opens `SessionActionDialog` (3-option: Cancel / Archive / Delete permanently). The Archive option calls `DELETE /sessions/{id}` (actual backend archive behavior). The Delete permanently option shows a pending toast — no backend hard-delete endpoint exists yet (see MISSING-ENDPOINT-001).

Archived session action set: two ghost icon buttons always visible — Unarchive (`ArchiveRestore` icon, `text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900`) and Delete permanently (`Trash2` icon, `text-zinc-500 hover:bg-red-50 hover:text-red-700`). Unarchive calls `PATCH /sessions/{id} { archived_at: null }`. Delete opens a standard `ConfirmDialog` (single destructive action, no archive option since already archived).

Model chip on `SessionCard`: the model subtitle is an interactive `Popover` trigger button (`text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900`). Opening it shows a `w-56` popover with a model `Select`. Save on select (immediate mutation). See §5 Model row-selection and BUG-06 brief.

`NewSessionDialog` fields: Name (optional text input), Model (select, default = system active model), Memory Mode (select, default = system setting). No provider selector.

**Session Chat**: Agent state badge + session name in header → message list (primary content, takes all available height, chronological oldest-first, newer pages loaded at bottom via infinite scroll) → message input (sticky bottom) → right panels (secondary, collapsible: Memory or Tools).

`ToolRow` in the Tools panel uses a single `TriSwitch` control (64 × 24px visual, three positions). The earlier two-control design (separate shadcn/ui `Switch` for enabled/disabled + Load/Unload `Button`) has been superseded. Each `ToolRow` now contains: [left block: tool name, optional MCP badge, status badge, description] + [right block: TriSwitch only]. Status badges in the left block continue to use the tool status colors defined in §5 (Badges / Pills).

**Settings**: Tabbed navigation with 5 tabs: General, Providers & Models, MCP Servers, API Keys, Setup Wizard.
- General tab (v3.14): Default model select field (above the divided list) → `<hr>` separator → feature-flag divided switch list (debug, verbose, prompt optimizer, parallel tool execution, context compression) → reload-from-disk button (admin only). The Default model field is `Label + help text + Select` with `min-h-11 w-full sm:w-64`. Non-admin: select is `disabled`. Save on select via `PATCH /config`. See §5 and BUG-06 brief.
- Providers & Models tab (v3.14): Two `<section>` blocks stacked vertically. First: Providers table (Name, Type, Base URL, API Key status dot, Health check button + fixed-width result slot). Health column cell layout: Check ghost button + `min-w-[7rem]` result slot (always present, empty before first check). No layout shift on result appearance. Second: Models table (Alias / Provider / Model name — 3 columns only). Active model row: `bg-teal-50 border-l-2 border-l-teal-600` + `CircleCheck h-4 w-4 text-teal-600` in alias cell. Clicking an inactive row (admin only) fires the switch mutation. `RadioGroup` wraps the table body for screen-reader semantics. Ghost row at table bottom (admin only): dashed border, "Add model" affordance. No "Switch to" button column. No Status column. See §5 Model row-selection pattern and Ghost row add-action pattern.
- MCP Servers tab: The canonical table columns are **Name, Transport, Status, Actions (restart/delete)**. This supersedes the settings-providers-desktop.svg mockup columns (Name, URL, Action/delete). Rationale: "Transport" is more accurate than "URL" because MCP servers may use non-URL transports (stdio, etc.). The implementation is the authoritative reference for this tab. The "Add MCP Server" button is implemented. A "Tools" count column was previously present in the implementation but has been removed (MCP-002 ruling, DS v3.7) — `McpServerOut` has no `tool_count` field; the column showed `—` for every row, which is false information. The column must not be re-added until the API surface supports a tools count. When the backend adds tool count, the column heading "Tools" and a numeric `text-zinc-900` cell value are approved without further design review.

**Admin**: Page header → `Tabs` with 3 tabs: System, Live Logs, Users. No `GuardrailsPanel`, no `DebugToggle` card.

- **System tab**: `SystemInfoCard` — read-only key/value grid with live-ticking uptime. The live-ticking uptime string (e.g., "2d 4h 31m") is sufficient visual feedback; a separate "live" badge is not required.
- **Live Logs tab**: `LiveLogViewer` — the debug toggle `Switch` lives in the card header alongside the connection status badge, level `Select`, connect/disconnect `Button`, and clear `Button`.
- **Users tab**: `UserManagementPanel` (`src/pages/admin/UserManagementPanel.tsx`) — user list with role and status management.

**Documents**: Search bar (prominent) → document list → upload action.

**Mobile header**: The `AppShell` mobile header (`< lg`) has three slots: left (hamburger menu button), center (brand name "Cogtrix"), right (user avatar). The sessions-desktop.svg mockup showed "Sessions" as center text and a `+` icon button in the right slot. Both deviations are intentional. Right slot: the avatar is retained as a universal "you are signed in" affordance; a context-sensitive `+` button is inappropriate in a global header (see rationale below). Center slot: the center text displays the brand name "Cogtrix" rather than a per-page title because `AppShell` is a layout shell with no access to child route metadata. A title-propagation mechanism (React context or `document.title` sync) would be required to display the current page title — this is deferred. Right slot rationale: (1) the avatar provides a navigation anchor. (2) Not all pages have a creation action, and the button would be inert on non-sessions pages. New session creation is accessible via the "New Session" button on the Sessions page itself.

**Session Chat page**: Approved SVG mockups exist as of 2026-03-23. Desktop: `docs/web/mockups/chat-desktop.svg`. Mobile: `docs/web/mockups/chat-mobile.svg`. These are the authoritative visual targets for all chat page components. See §16 D-001 for resolution notes including the ToolConfirmationModal build instructions.

**Documents page**: Approved SVG mockup exists as of 2026-03-23. Desktop: `docs/web/mockups/documents-desktop.svg`. See §16 D-002 for resolution notes including the failed badge border correction.

**Retroactive mockup policy (CAMP-001 / WFLOW-001 / CONTACT-001 / SETTINGS-001)**: The following panels/pages have been implemented without prior approved SVG mockups: `CampaignsPanel`, `WorkflowsPanel`, `ContactList`, `ScheduledMessageTable`, `DeferredRecordTable`, `KnowledgePanel`, `SetupWizard`. Producing retroactive mockups of already-reviewed, in-production implementations yields minimal design value and incurs real cost. **Ruling: retroactive mockups are deferred indefinitely for all panels listed above.** The implementation is treated as the de-facto approved target for future audit cycles. Future changes to these panels must produce a mockup before implementation (forward-looking mockup requirement is unchanged). A retroactive mockup may be requested at any time if a substantial redesign of one of these panels is planned — at that point a full brief/mockup cycle is required for the new design, not the existing one.

**Assistant**: Page header → `ServiceControlPanel` (running status badge, live-ticking uptime, start/stop button for admins) → `Tabs` with 8 tabs: Chats, Scheduled, Deferred, Contacts, Knowledge, Guardrails, Campaigns, Workflows. The Guardrails tab renders `GuardrailsPanel` which contains two cards stacked vertically: "Recent Violations" (violations table — see below) with `total_violations` count badge in card header, and "Blacklisted Chats" (table: Chat ID, remove trash icon button) with count badge in card header. GuardrailsPanel is exclusively on the Assistant page — it is not on the Admin page.

**GuardrailsPanel — violations table (v3.12)**: The "Recent Violations" card shows the actual `ViolationRecordOut` fields. The card header title is "Recent Violations" (not "Violations"). The count badge in the card header displays `GuardrailStatusOut.total_violations` — the cumulative total from the server — not `recentViolations.length` (which is only the length of the truncated recent list).

Column specification:

| Column | Header text | Cell treatment | Notes |
|---|---|---|---|
| Time | "Time" | `text-xs text-zinc-500 font-mono tabular-nums whitespace-nowrap` | Formatted as relative time (e.g., "2 min ago") or short absolute (HH:MM) — whichever the implementation uses; both are acceptable. `timestamp` field. |
| Chat ID | "Chat ID" | `font-mono text-zinc-900 text-sm` | `chat_id` field — primary identifying column |
| Channel | "Channel" | `text-zinc-600 text-sm` | `channel` field — secondary column |
| Type | "Type" | `ViolationBadge` chip (see §5 ViolationBadge color table) | `violation_type` field — one of `input`, `encoding`, `tool_call`, `rate_limit`, `llm_judge` |
| Detail | "Detail" | `text-zinc-500 text-sm truncate max-w-[200px]` with `Tooltip` showing full text on hover | `detail` field — nullable; render `—` (`text-zinc-500`) when null per §5 Tables null-state rule |

Column order left-to-right: Time → Chat ID → Channel → Type → Detail.

The Detail column uses `truncate max-w-[200px]` to prevent long strings from expanding the table row. The full detail text is shown in a shadcn/ui `Tooltip` (install via `pnpm dlx shadcn@latest add tooltip` if not present). The Tooltip wrapper is only rendered when `detail` is non-null — do not wrap the `—` placeholder in a Tooltip.

**AssistantChatList — Chats tab column specification (v3.12)**: The chat list table uses the `ChatSessionOut` schema. Column set:

| Column | Header text | Cell treatment | Notes |
|---|---|---|---|
| Name / Chat ID | "Name" | `display_name` if non-null: `text-zinc-900 font-medium text-sm`; fallback to `chat_id`: `font-mono text-zinc-500 text-sm` | Primary identifying column. `display_name` is the human-readable contact name (e.g., "Alice"); show it when present. When absent, fall back to monospace `chat_id` in muted text to signal it is a raw ID, not a name. |
| Channel | "Channel" | `text-zinc-600 text-sm` | `channel` field |
| Mode | "Mode" | `MemoryModeBadge` chip (see §5 MemoryModeBadge table) | `memory_mode` field — `conversation`, `code`, or `reasoning` |
| Locked | (no header text — icon column) | `Lock` icon (`w-4 h-4 text-amber-600`) — visible only when `is_locked === true`; cell renders empty when false | `is_locked` field. Amber signals "temporarily unavailable / in use" without implying error. Do not use red. Icon: Lucide `Lock`. Column width: narrow (`w-8`), placed immediately after the Mode column. |
| Last Activity | "Last Activity" | `text-zinc-500 text-xs tabular-nums` | `last_activity` field — nullable; `—` when null |
| Messages | "Messages" | `text-zinc-600 text-sm tabular-nums text-right` | `message_count` field — right-aligned numeric |

Column order left-to-right: Name/Chat ID → Channel → Mode → Locked → Last Activity → Messages.

`is_locked` display rationale: amber is used for in-progress / transient states throughout the system (connecting badges, `firing` scheduled messages, warning banners). A locked chat is temporarily unavailable while a message is being processed — this is transient, not an error. Amber communicates "wait, not available right now" without alarming the user.

**ContactList — Identifiers column (v3.12)**: `ContactOut.identifiers` is a `string[]` (e.g., `["+1234567890", "alice_tg"]`). Display rules:

- Column header: "Identifiers" (plural).
- If `identifiers.length <= 2`: render all values as comma-separated `text-zinc-600 text-sm` text inline in the cell.
- If `identifiers.length > 2`: render the first two values followed by a `+N more` span in `text-zinc-500 text-xs` (where N = `identifiers.length - 2`). The `+N more` span is wrapped in a shadcn/ui `Tooltip` whose content lists all identifiers (one per line). The tooltip is the only mechanism for seeing the full list — do not add a click-to-expand pattern.
- If `identifiers` is empty or null: render `—` in `text-zinc-500`.

Tooltip content for overflow: a `<div className="space-y-0.5 text-xs">` containing one `<p>` per identifier, `text-zinc-100` on the dark tooltip background (shadcn/ui Tooltip uses `bg-zinc-900` by default). No max-height cap on the tooltip — identifier arrays are expected to be short (≤ 10 in practice).

---

## 15. Memory Panel Token Thresholds

The Memory panel displays a `Progress` bar for context window token usage. The bar color changes at two thresholds to warn users before the context window fills up.

| Usage | Progress bar color | Indicator class |
|---|---|---|
| 0–75% | Neutral | `bg-zinc-400` (via `[&_[data-slot=progress-indicator]]:bg-zinc-400`) |
| 75–90% | Warning | `bg-amber-600` (via `[&_[data-slot=progress-indicator]]:bg-amber-600`) |
| > 90% | Critical | `bg-red-600` (via `[&_[data-slot=progress-indicator]]:bg-red-600`) |

These thresholds are hardcoded in `src/pages/chat/MemoryPanel.tsx`. If they need to change, update both the component and this document.

---

## 16. Deferred Items

This section is the authoritative register of design gaps that are acknowledged and tracked. Items here are not violations — they are planned work. When an item is resolved, move it to the relevant section and remove it from this table.

| ID | Description | Priority | Blocking? | Resolution path |
|---|---|---|---|---|
| D-001 | RESOLVED (2026-03-23) — Session Chat page approved SVG mockups produced and reviewed. Files: `docs/web/mockups/chat-desktop.svg` (1440px desktop, three-column layout, Memory panel open, all 5 message types, StatusBar expanded, send-button interaction states) and `docs/web/mockups/chat-mobile.svg` (390px mobile, no sidebar, collapsed StatusBar). `ToolConfirmationModal` open state is not shown in the mockups — `web_coder` must build it from DS §5 (Dialogs: `max-w-xl`, 6-button grid `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`, suppressed close button via `[&>[data-slot=dialog-close]]:hidden`). | — | — | — |
| D-002 | RESOLVED (2026-03-23) — Documents page approved SVG mockup produced and reviewed. File: `docs/web/mockups/documents-desktop.svg` (1440px desktop, all 4 DocumentCard states, DocumentUploadDialog open, hover and empty states). Note for `web_coder`: failed badge border must use `border-red-200` (`#fecaca`) — the mockup shows `#fca5a5` (red-300), which is a minor inaccuracy; the DS §5 badge pattern is authoritative. Card layout is a full-width list (not a grid) — compatible with DS §14 "document list" description. | — | — | — |
| D-003 | RESOLVED (feature/4-api-gaps sprint, 2026-03-22) — Implemented in `src/pages/settings/McpAddServerDialog.tsx`. | — | — | — |
| D-004 | `ToolConfirmationModal` button grid — orphaned Cancel button at `sm`–`md` breakpoints. Acceptable as-is per §5. | Low | No | Optional refinement: add `sm:col-span-2` to the Cancel button when the grid has an odd number of items. Requires no design system update. |
| D-005 | RESOLVED (v3.0) — `StatusBar` violations corrected. `text-zinc-400` → `text-zinc-500` for expand/collapse icon. Full token specification added to §7. | — | — | — |
| D-006 | RESOLVED (DesignForge sprint, 2026-03-22) — Implemented in `src/components/MarkdownComponents.tsx` — CodeBlock with copy-to-clipboard. `CodeBlock` component uses `useState`, Clipboard/Check icons, and `aria-label`. | — | — | — |
| D-007 | RESOLVED (DesignForge sprint, 2026-03-23) — `DocumentCard` delete button corrected to `text-zinc-500` at rest. `src/pages/documents/DocumentCard.tsx` line 60 verified as `text-zinc-500 hover:bg-red-50 hover:text-red-700`. WCAG 1.4.11 3:1 non-text contrast now met. | — | — | — |
| FLAG-005 | All SVG mockups produced before DS v3.5 (2026-03-23) use violet-600 (`#7c3aed`) as the primary accent color. These files are **superseded on color fidelity** — any revision cycle must regenerate from DS v3.5 tokens (teal-600 `#0d9488`). Affected files: `sprint-1-register.svg`, `sprint-1-login.svg`, `sprint-1-shell-desktop.svg`, `sprint-1-shell-mobile.svg`, `sessions-desktop.svg`, `settings-providers-desktop.svg`, `assistant-guardrails-desktop.svg`, `admin-desktop.svg`, `status-bar-collapsed.svg`, `status-bar-expanded.svg`, `markdown-full-spec.svg`, `chat-markdown-typography.svg`, `tri-switch.svg`. These files are retained for historical reference only — do NOT use as base files for new mockup work. | Medium | No — DS v3.5 token spec is authoritative | Regenerate from DS v3.5 when next revision is required. |
| FLAG-001 | RESOLVED (v3.4, 2026-03-23) — `docs/web/mockups/admin-desktop.svg` is SUPERSEDED. The SVG was produced against DS v1.6 and depicts a layout without tabs. The current authoritative specification is DS §14 (Admin page), which defines a 3-tab layout: System, Live Logs, Users. The implementation in `src/pages/admin.tsx` and sub-components (`SystemInfoCard`, `LiveLogViewer`, `UserManagementPanel`) correctly follows DS §14 — the SVG file must not be used as a build target. The file is retained for historical reference only. | — | — | — |
| FLAG-002 | RESOLVED (v3.4, 2026-03-23) — `docs/web/mockups/settings-providers-desktop.svg` is SUPERSEDED. The SVG was produced against DS v1.6. The MCP Servers tab columns it depicts (Name, URL, Action/delete) have been superseded by the DS §14 canonical column set (Name, Transport, Status, Tools, Actions/restart). The SVG file has no in-file retirement annotation; this §16 entry is the authoritative retirement notice. The file must not be used as a build target. DS §14 (Settings — MCP Servers tab) is the authoritative reference. | — | — | — |
| FLAG-003 | RESOLVED (v3.4, 2026-03-23) — `animate-pulse` on `DocumentCard` transient status text ("Processing...", "Pending") is approved. Added to §9 Animation Inventory with constraints: transient states only, `text-amber-700` required, pattern confined to `DocumentCard`. A secondary WCAG finding was raised as D-007 (delete button `text-zinc-400` at rest). D-002 remains open for the Documents page mockup. | — | — | — |
| GUARDRAIL-001 | RESOLVED (v3.7, 2026-03-24) — Destructive ghost icon button rest color ruled as `text-zinc-500` (not `text-red-600`) for all buttons backed by a `ConfirmDialog`. Full ruling in §5 Buttons. **Action required for `web_coder`**: `GuardrailsPanel.tsx` line 196 and `McpServerList.tsx` line 199 use `text-red-600` at rest — both have `ConfirmDialog` gates and must be corrected to `text-zinc-500 hover:bg-red-50 hover:text-red-700`. | Medium | No | `web_coder` corrects the two files. No mockup needed. |
| MCP-002 | RESOLVED (v3.7, 2026-03-24) — "Tools" column removed from `McpServerList`. The `McpServerOut` schema has no `tool_count` field; the column displayed `—` for every row (false information). DS §14 updated. **Action required for `web_coder`**: remove the "Tools" `TableHead` and its corresponding `TableCell` from `McpServerList.tsx`. Column may be re-added when backend adds `tool_count` — no further design approval needed at that time. | Medium | No | `web_coder` removes column. |
| DS-001 | RESOLVED (v3.7, 2026-03-24) — Inline amber warning banner pattern documented in §5 as `InlineWarning` surface variant. Preferred implementation via shadcn/ui `Alert` with amber `className` overrides. Existing `div`-based instance in `WorkflowsPanel.tsx` accepted as-is. | — | — | — |
| DS-002 | RESOLVED (v3.7, 2026-03-24) — `divide-y divide-zinc-200` Divided List form pattern documented in §5 Forms. Pattern approved for peer-setting flag rows without column headers. No refactoring required for existing `ConfigFlagsForm.tsx`. | — | — | — |
| RESP-001 | RESOLVED (v3.7, 2026-03-24) — `h-14` (56px) documented as canonical page header height in §3 Spacing component exceptions. | — | — | — |
| FONT-001 | RESOLVED (v3.7, 2026-03-24) — Table column text hierarchy rule documented in §5 Tables: primary column `font-medium text-zinc-900`, secondary column `text-zinc-600`, absent-data placeholder `text-zinc-500`. | — | — | — |
| CAMP-001 / WFLOW-001 / CONTACT-001 / SETTINGS-001 | RESOLVED (v3.7, 2026-03-24) — Retroactive mockup policy defined in §14. Deferred indefinitely for reviewed in-production panels: `CampaignsPanel`, `WorkflowsPanel`, `ContactList`, `ScheduledMessageTable`, `DeferredRecordTable`, `KnowledgePanel`, `SetupWizard`. Implementation is the de-facto approved visual target. | — | — | — |
| DF-FLAG-001 | RESOLVED (v3.9, 2026-03-24) — Reduced-motion strategy: belt-and-suspenders is correct. Keep both the global `@media (prefers-reduced-motion: reduce)` CSS safety net in `src/index.css` AND per-component `motion-safe:` Tailwind prefixes on every cosmetic animation. Both are required. §9 Animation updated with full policy and CSS snippet. | — | — | — |
| DF-FLAG-002 | RESOLVED (v3.9, 2026-03-24) — `MemoryPanel` "Clear memory" button (`variant="outline"` with `text-red-600 border-red-200` at rest) is approved. GUARDRAIL-001 scope is ghost icon-only buttons. Labeled `variant="outline"` destructive buttons backed by `ConfirmDialog` may use `text-red-600 border-red-200` at rest — this is the new GUARDRAIL-002 pattern, documented in §5 Buttons. | — | — | — |
| DF-FLAG-003 | RESOLVED (v3.9, 2026-03-24) — ScheduledMessage status badge color table added to §5 Badges: `pending` → blue, `firing` → amber, `sent` → green, `failed` → red, `cancelled` → zinc. Pattern is consistent with DS §5 badge token conventions. | — | — | — |
| DF-FLAG-004 | RESOLVED (v3.9, 2026-03-24) — DeferredRecord status badge color table added to §5 Badges: `firing` → amber, default/`pending` → blue. Pattern consistent with ScheduledMessage and DS §5 badge token conventions. | — | — | — |
| GUARDRAIL-001-CODE | RESOLVED (v3.9, 2026-03-24) — Code action from GUARDRAIL-001 confirmed complete. `GuardrailsPanel.tsx` line 196 and `McpServerList.tsx` line 199 both verified to use `text-zinc-500 hover:bg-red-50 hover:text-red-700`. No further action required. | — | — | — |
| D-008 | RESOLVED (v3.9, 2026-03-24) — Session header mobile layout. The authoritative visual target is `docs/web/mockups/chat-mobile.svg` (390px viewport), which shows: compact single-row header with session name text, model selector (`w-24`), settings gear, and delete icon. Implemented in `src/pages/chat/SessionHeader.tsx` using `w-24 lg:w-32` for the model Select and responsive icon visibility. No further action required. | — | — | — |
| AUDIT-001 | RESOLVED (v3.11, 2026-03-25) — **GP-001** fixed in commit `7dfdee4`. `GuardrailsPanel.tsx` lines 97 and 148: `ShieldOff` and `Ban` icons changed from `text-zinc-300` → `text-zinc-400`. DS §10 compliance restored. | — | — | — |
| AUDIT-002 | RESOLVED (v3.11, 2026-03-25) — **KP-001 / WP-001** fixed in commit `7dfdee4`. (1) `KnowledgePanel.tsx` line 61 and (2) `WorkflowsPanel.tsx` line 921: absent-value `"—"` placeholder wrapped in `<span className="text-zinc-500">`. DS §5 Tables placeholder rule satisfied. | — | — | — |
| AUDIT-003 | RESOLVED (v3.11, 2026-03-25) — **WP-002** — Table-row icon button sizing ruling applied in §5 Buttons. `h-11 w-11` approved as equivalent to `size="icon" min-h-11` for icon-only ghost buttons in narrow table action cells. No code change required. See also FLAG-DESIGN-002 (superseded by this ruling). | — | — | — |
| AUDIT-004 | RESOLVED (v3.11, 2026-03-25) — **RM-001** fixed. Added `transition-duration: 0.01ms !important;` to the `@media (prefers-reduced-motion: reduce)` block in `src/index.css`. All three DS §9 required properties now present: `animation-duration`, `animation-iteration-count`, `transition-duration`. | — | — | — |
| FLAG-DESIGN-001 | `docs/web/mockups/optimize-prompt-toggle.svg` references the per-message optimize_prompt toggle, which was removed in the 2026-03-25 APIForge contract sync (`UserMessagePayload.optimize_prompt` field deleted from WebSocket protocol). This mockup is SUPERSEDED. Retained for historical reference only. | Low | No | Annotate file as SUPERSEDED. Do not use as build target. |
| FLAG-DESIGN-002 | RESOLVED (v3.11, 2026-03-25) — Superseded by AUDIT-003 ruling. `h-11 w-11` is approved for table-row icon buttons. No code change required. | — | — | — |
| SCHEMA-001 | RESOLVED (v3.13, 2026-03-25) — `GuardrailsPanel.tsx` time cell corrected: `className="text-xs font-mono tabular-nums whitespace-nowrap text-zinc-500"`. Closes DS §14 GuardrailsPanel time column spec. | — | — | — |
| SCHEMA-002 | RESOLVED (v3.13, 2026-03-25) — `AssistantChatList` column order corrected to Name/Chat ID → Channel → Mode → Locked → Last Activity → Messages. Lock icon updated to `h-4 w-4`. Last Activity cell: `text-xs text-zinc-500 tabular-nums`. Messages cell: `text-right text-sm text-zinc-600 tabular-nums`. Closes DS §14 AssistantChatList column spec. | — | — | — |
| SCHEMA-003 | RESOLVED (v3.13, 2026-03-25) — `ContactList` tooltip corrected: identifiers rendered one per line as `<p className="font-mono">` inside `<div className="space-y-0.5 text-xs">` instead of `join(", ")`. Closes DS §14 ContactList overflow tooltip spec. | — | — | — |
| AUDIT-P2-001 | **Open (v3.13, 2026-03-25)** — `DeferredRecordTable` (`src/pages/assistant/DeferredRecordTable.tsx`) lacks a count/header row above its filter bar. DS §5 Panel Filter Controls requires the 2-row pattern: first row shows item count and any action buttons; second row holds filter controls. This panel currently shows only the filter select with no record count visible. Action: `web_designer` to brief a count-row addition; `web_coder` implements once brief is approved. | Low | Yes — filter is functional without count row | `web_designer` → `web_coder` implements count row. |
| FEAT-001 | **Open (v3.14, 2026-03-25)** — "Add provider" UI (BUG-08) deferred — no backend endpoint exists. The Cogtrix backend treats providers as YAML config-file records loaded at startup; there is no `POST /providers` REST endpoint in the current OpenAPI schema. The Add provider UI must not be implemented as a runtime action until the backend exposes a creation endpoint. Design spec for when ready: inline form below the Providers table using the Ghost row add-action pattern (§5); fields: Provider type (Select), Provider name (Input), Base URL (Input, optional), API Key (Input password, optional). | Low | No — workaround is the Setup Wizard | Backend adds endpoint → `web_designer` writes brief → `graphic_designer` mockup → `web_coder` implements. |
| BUG-01-MOCKUP | **Open (v3.14, 2026-03-25)** — `docs/web/mockups/settings-models-v2.svg` required before implementation. See brief: `docs/web/briefs/sessions-settings-ux-v1.md` §BUG-01. | High | Yes — blocks `web_coder` | `graphic_designer` → `web_designer` review → `web_coder` implements. |
| BUG-02-MOCKUP | **Open (v3.14, 2026-03-25)** — `docs/web/mockups/sessions-view-toggle.svg` required before implementation. See brief §BUG-02. | High | Yes | `graphic_designer` → review → implement. |
| BUG-03-MOCKUP | **Open (v3.14, 2026-03-25)** — `docs/web/mockups/session-remove-dialog.svg` required before implementation. See brief §BUG-03. | High | Yes | `graphic_designer` → review → implement. |
| BUG-05-MOCKUP | **Open (v3.14, 2026-03-25)** — `docs/web/mockups/sessions-bulk-select.svg` required before implementation. See brief §BUG-05. | High | Yes | `graphic_designer` → review → implement. |
| BUG-06-MOCKUP | **Open (v3.14, 2026-03-25)** — `docs/web/mockups/session-model-popover.svg` required before implementation. See brief §BUG-06. | Medium | Yes | `graphic_designer` → review → implement. |
| BUG-09-MOCKUP | **Open (v3.14, 2026-03-25)** — `docs/web/mockups/settings-add-row-ghost.svg` required before implementation. See brief §BUG-09. | Medium | Yes | `graphic_designer` → review → implement. |
| MISSING-ENDPOINT-001 | **Open (v3.14, 2026-03-25)** — No backend hard-delete endpoint for sessions. `DELETE /sessions/{id}` is the archive action; a separate permanent-delete endpoint does not exist in the current OpenAPI schema. The "Delete permanently" action in `SessionActionDialog` and `SessionBulkBar` currently shows a pending toast stub. When the backend adds the endpoint, remove the toast stub and wire the real mutation. No design review required — existing dialog UI is sufficient. | Low | No — archive is the primary destructive action | Backend adds endpoint → `web_coder` removes toast stub and wires mutation. |
| MISSING-ENDPOINT-002 | **Open (v3.14, 2026-03-25)** — No backend unarchive endpoint. Unarchiving a session (restoring `archived_at` to null via `PATCH /sessions/{id} { archived_at: null }`) currently shows a pending toast stub because the backend does not expose this operation. The Unarchive `ArchiveRestore` button is present on archived `SessionCard` and `SessionRow` but is non-functional until the endpoint is available. | Low | No — users can still create new sessions | Backend adds endpoint → `web_coder` removes toast stub and wires mutation. |
| AUD-001 | **Permanent exception (v3.15, 2026-03-27)** — `ContactList.tsx` (`src/pages/assistant/ContactList.tsx`) channel icons use hardcoded hex fills in inline SVG `fill` attributes: `#25D366` (WhatsApp green) and `#2AABEE` (Telegram blue). These are brand IP requirements — the colors are not design choices and no semantic design-system token approximates either value. Substituting any other color would make the marks unrecognisable as brand identifiers. These fills are exempt from the §1 "no hardcoded hex" rule. No action required; exception is permanent for as long as these brand SVGs are in use. | — | No | No resolution required — exception is intentional and permanent. |
