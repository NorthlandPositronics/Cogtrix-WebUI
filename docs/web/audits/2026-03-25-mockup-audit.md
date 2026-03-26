# Mockup Consistency Audit — 2026-03-25

**Auditor**: graphic_designer agent
**Design system version audited against**: 3.9 (2026-03-24)
**Scope**: All SVG mockup files in `docs/web/mockups/`
**Audit type**: Read-only — no files were modified

---

## Summary Table

| ID | File(s) | Category | Severity | Description |
|---|---|---|---|---|
| MOCK-001 | 13 files (see §1) | Color — violet accent | P0 | Violet-600/violet-200 accent colors present instead of teal-600. Explicitly registered as FLAG-005 in DS §16 but not yet resolved. |
| MOCK-002 | `blockquote-corrected.svg`, `chat-markdown-typography.svg`, `markdown-full-spec.svg` | Color — blockquote border | P1 | Blockquote left-border uses `#ddd6fe` (violet-200). DS v3.0 mandates `border-teal-200` (`#99f6e4`). |
| MOCK-003 | `admin-desktop.svg` | Architecture — layout | P1 | No tab bar present. Admin page has a no-tab layout (System + Live Log cards stacked). DS §14 (v2.4+) mandates 3 tabs: System, Live Logs, Users. FLAG-001 in §16 acknowledges this as SUPERSEDED but the file carries no in-file retirement annotation. |
| MOCK-004 | `settings-desktop.svg` | Architecture — tab count | P1 | Settings mockup covers only 3 of the 5 canonical tabs (General, Providers & Models, MCP Servers). The API Keys and Setup Wizard tabs have no mockup frame. DS §14 defines 5 tabs. |
| MOCK-005 | `assistant-desktop.svg` | Architecture — tab count | P1 | Assistant mockup covers 6 tabs (Chats, Scheduled, Deferred, Contacts, Knowledge, Guardrails). DS §14 defines 8 tabs — Campaigns and Workflows tabs are absent. |
| MOCK-006 | `documents-desktop.svg` | Geometry — page header | P2 | Page header height is 64px (`height="64"`). DS §3 canonical height is 56px (`h-14`). This is the only desktop page mockup where the header deviates from 56px. |
| MOCK-007 | `chat-tools-panel.svg` | Geometry — sidebar offset | P2 | Sidebar `rect` starts at `y="20"` (not `y="0"`), creating a 20px gap at the top. All other desktop mockups begin the sidebar at `y="0"`. This appears to be a frame label accommodation, not an intentional design choice. |
| MOCK-008 | `optimize-prompt-toggle.svg` | Color — canvas background | P2 | Canvas background is `#f8fafc` (Tailwind `slate-50`). No such color exists in the DS palette. The correct muted surface is `#fafafa` (`bg-zinc-50`). |
| MOCK-009 | `session-settings-popover.svg` | Color — frame background | P2 | Frame B annotation background uses `#f9fafb` (Tailwind `gray-50`). No such color exists in the DS palette. Should be `#fafafa` (`bg-zinc-50`) or `#f4f4f5` (`bg-zinc-100`). |
| MOCK-010 | `chat-desktop.svg` | Metadata — DS version | P2 | File declares `Design system version: 3.6`. Current DS is 3.9. Teal accent colors are correct (DS v3.5+ compliant), but several token updates from v3.7–3.9 are not reflected: StatusBar running indicator uses `#14b8a6` (teal-500) which is correct per DS §7; however the blockquote accent in nearby markdown mockups is still violet — see MOCK-002. |
| MOCK-011 | `typing-indicator.svg` | Metadata — DS version | P2 | File declares `Design system version: 3.2`. Current DS is 3.9. The component specification has been updated in §7 multiple times since v3.2. The dot count (3) and color (`bg-zinc-400`) appear correct, but the DS v3.3 animation stagger specification and v3.9 reduced-motion policy are not reflected in the mockup's annotation layer. |
| MOCK-012 | `sessions-desktop.svg` | Metadata — DS version | P2 | File declares `Design system version: 3.6`. Active nav item shows a left-edge accent bar (`width="2"` teal rect) that was not present in `chat-desktop.svg`'s sidebar. This creates a sidebar active-state inconsistency across mockups — one uses `bg-teal-50` fill only, the other uses `bg-teal-50` fill plus a 2px teal left accent bar. The DS does not explicitly specify whether the left accent bar is required or optional. |
| MOCK-013 | `chat-desktop.svg` | Sidebar — active state | P2 | Active sidebar item ("Sessions") uses `bg-teal-50` fill with no left accent bar. In `sessions-desktop.svg`, `settings-desktop.svg`, `admin-desktop.svg`, and `assistant-desktop.svg`, the active nav item uses `bg-teal-50` fill plus a 2px `fill="#0d9488"` left-edge rect. `chat-desktop.svg` is the outlier — it omits the accent bar. |
| MOCK-014 | Multiple | Missing mockups — login/register pages | P2 | `sprint-1-login.svg` and `sprint-1-register.svg` exist but are declared SUPERSEDED (FLAG-005, DS §16) — they use violet-600 accent. There is no teal-era login or register page mockup. DS §14 describes the login/register layout (centered card, `max-w-sm`, logomark at 40×40px, `text-3xl font-bold` headline). |
| MOCK-015 | `blockquote-corrected.svg` | Color — off-palette | P1 | Canvas uses an annotation background rect `fill="#faf9ff"` — this is an off-palette color (near-violet tint, not present in DS §1). Appears to be a holdover from the violet era. The correct surface would be `#ffffff` or `#fafafa`. |
| MOCK-016 | `admin-desktop.svg` | Architecture — no Users tab | P1 | `admin-desktop.svg` shows only two logical sections: `SystemInfoCard` and `LiveLogViewer`. The `UserManagementPanel` (Users tab) is entirely absent. DS §14 defines this as the third tab and `§12` lists `UserManagementPanel` as a component. |

---

## Detailed Findings

### MOCK-001 — Violet Accent Colors (P0)

**Affected files**: `sprint-1-register.svg`, `sprint-1-login.svg`, `sprint-1-shell-desktop.svg`, `sprint-1-shell-mobile.svg`, `tri-switch.svg`, `chat-markdown-typography.svg`, `blockquote-corrected.svg`, `confirm-dialog-delete.svg`, `code-block-component.svg`, `status-bar-expanded.svg`, `status-bar-collapsed.svg`, `markdown-full-spec.svg`, `assistant-guardrails-desktop.svg`

**Evidence**: Grep confirms `#7c3aed`, `#6d28d9`, `#8b5cf6`, and `#ddd6fe` (violet-200) appear across these files. The sprint-1 files use `#7c3aed` as the primary button fill. The markdown-era files use `#ddd6fe` for blockquote borders.

**DS reference**: §1 — `--primary` is teal-600 `#0d9488` since DS v3.5 (2026-03-23). §16 FLAG-005 acknowledges all pre-v3.5 mockups as superseded on color fidelity.

**Status**: Registered in DS §16 as FLAG-005. These files should not be used as build targets. No immediate regeneration required unless a revision cycle is opened.

**Fix**: When any of these files enters a revision cycle, regenerate from DS v3.5+ tokens. Do not use any of these files as a base for new work. Add an in-file `<desc>` retirement notice to each superseded file.

---

### MOCK-002 — Blockquote Border Color is Violet-200, Not Teal-200 (P1)

**Affected files**: `blockquote-corrected.svg`, `chat-markdown-typography.svg`, `markdown-full-spec.svg`

**Evidence**:
- `blockquote-corrected.svg` line 48: `fill="#ddd6fe"` (violet-200) used as blockquote left border
- `chat-markdown-typography.svg` lines 162, 481, 510: `fill="#ddd6fe"` blockquote borders throughout
- `markdown-full-spec.svg` line 66: `fill="#ddd6fe"` blockquote left border

**DS reference**: §7 Markdown Typography — Blockquotes (v3.0 correction): `border-l-2 border-teal-200 bg-teal-50/40 pl-4 py-1 italic text-zinc-600`. `border-teal-200` = `#99f6e4`. The previous `border-l-4 border-zinc-300` or violet-200 implementation is explicitly called out as incorrect.

**Severity note**: `chat-markdown-typography.svg` carries annotation text confirming the violet-200 choice was made prior to DS v3.5. This is a known superseded mockup (FLAG-005). `blockquote-corrected.svg` is named as a "corrected" version but still uses violet-200 — its correction only addressed the border width (from 4px to 2px) and background tint, not the accent color.

**Fix**: Regenerate `blockquote-corrected.svg` with `border-teal-200` (`#99f6e4`) for the left accent and `bg-teal-50/40` (approx `rgba(240,253,250,0.4)`) for the background. Add teal to the design token swatch panel. The other two files are covered by FLAG-005 (superseded).

---

### MOCK-003 — Admin Page: No Tab Bar (P1)

**Affected file**: `admin-desktop.svg`

**Evidence**: The file shows `SystemInfoCard` and `LiveLogViewer` stacked vertically as plain card components, with no `Tabs` component anywhere in the SVG. The `desc` says "Design system version: 3.6 (2026-03-23)" — this is after DS v2.4 which defined the 3-tab layout — but the file was produced against DS v1.6 architecture and never updated.

**DS reference**: §14 Admin page (v2.4, 2026-03-22): "Page header → `Tabs` with 3 tabs: System, Live Logs, Users." §16 FLAG-001 explicitly marks `admin-desktop.svg` as SUPERSEDED.

**Note**: The file's `desc` metadata claims DS v3.6 but its architectural content reflects DS v1.6. The `desc` was likely updated without regenerating the actual mockup content.

**Fix**: Regenerate `admin-desktop.svg` as `admin-desktop-v2.svg` with the 3-tab layout (System tab: SystemInfoCard; Live Logs tab: LiveLogViewer; Users tab: UserManagementPanel). The existing file must be marked SUPERSEDED in its `desc` block.

---

### MOCK-004 — Settings Page: API Keys and Setup Wizard Tabs Missing (P1)

**Affected file**: `settings-desktop.svg`

**Evidence**: The file contains 3 frames (General, Providers & Models, MCP Servers). The tab bar in each frame shows 5 tabs correctly (General, Providers & Models, MCP Servers, API Keys, Setup Wizard) but only 3 are rendered as full frames. API Keys and Setup Wizard tab content has no mockup representation.

**DS reference**: §14 Settings page: "5 tabs: General, Providers & Models, MCP Servers, API Keys, Setup Wizard."

**Fix**: Add two frames to `settings-desktop.svg` (or produce `settings-desktop-v2.svg`) covering the API Keys tab (ApiKeyList table with revoke buttons) and the Setup Wizard tab.

---

### MOCK-005 — Assistant Page: Campaigns and Workflows Tabs Missing (P1)

**Affected file**: `assistant-desktop.svg`

**Evidence**: Frame 1 tab bar shows: Chats, Scheduled, Deferred, Contacts, Knowledge, Guardrails (6 tabs). DS §14 specifies 8 tabs. The Campaigns and Workflows tabs have no rendered frame in the mockup.

**DS reference**: §14 Assistant page: "Tabs with 8 tabs: Chats, Scheduled, Deferred, Contacts, Knowledge, Guardrails, Campaigns, Workflows." DS v2.3 changelog updated the tab count from 6 to 8.

**Note**: DS §14 retroactive mockup policy (CAMP-001/WFLOW-001) defers retroactive mockups for `CampaignsPanel` and `WorkflowsPanel` indefinitely. This means the missing Campaigns and Workflows frames in `assistant-desktop.svg` are formally deferred — this finding is informational only and does not require immediate action. The tab bar labels themselves are wrong (show 6, should show 8).

**Fix (deferred per policy)**: When `assistant-desktop.svg` enters a revision cycle, update the tab bar labels to show all 8 tabs. Add Campaigns and Workflows frames at that time.

---

### MOCK-006 — Documents Page Header Height is 64px, Not 56px (P2)

**Affected file**: `documents-desktop.svg`

**Evidence**: Line 90: `<rect x="220" y="0" width="1220" height="64" fill="#ffffff"/>`. The header border is at `y="64"`. All other desktop page mockups position the header border at `y="56"` (chat-desktop.svg, chat-tools-panel.svg, sessions-desktop.svg, admin-desktop.svg, settings-desktop.svg all use 56px headers).

**DS reference**: §3 Spacing — "Page header height rule (RESP-001): `h-14` (56px) is the canonical height for all page-level headers inside the app shell."

**Impact**: `documents-desktop.svg` allocates 8px more vertical space to the header than the canonical height. This cascades into the content area: content starts at `y="64"` instead of the expected `y="56"`. The `SemanticSearchBar` and document list are positioned assuming this taller header.

**Fix**: Regenerate as `documents-desktop-v2.svg` with `height="56"` for the page header rect, adjusting all content `y` coordinates accordingly.

---

### MOCK-007 — Chat Tools Panel: Sidebar Vertical Offset (P2)

**Affected file**: `chat-tools-panel.svg`

**Evidence**: Line 16: `<rect x="0" y="20" width="220" height="1080" fill="#fafafa"/>`. The sidebar begins 20px below the top edge of the artboard. The sidebar border line: `<line x1="220" y1="20" x2="220" y2="1100">`. A frame label occupies the top 20px of the artboard. All other desktop mockups start the sidebar at `y="0"`.

**DS reference**: §4 Layout — sidebar is `w-[220px] fixed`. In SVG mockup convention (established by chat-desktop.svg, sessions-desktop.svg, admin-desktop.svg), the sidebar starts at `y="0"` and occupies the full artboard height.

**Impact**: The 20px offset makes the sidebar appear truncated at the top when viewed alongside other page mockups. It also means the logo and top nav item positions are shifted 20px relative to all other mockups — not a design intent, just a frame-label collision.

**Fix**: Move frame label to outside the artboard bounds (e.g., `y="-12"` or a separate annotation layer). Adjust sidebar to start at `y="0"`.

---

### MOCK-008 — Optimize Prompt Toggle: Off-Palette Canvas Background (P2)

**Affected file**: `optimize-prompt-toggle.svg`

**Evidence**: Line 25: `<rect width="900" height="320" fill="#f8fafc"/>`. `#f8fafc` is Tailwind `slate-50` — not present in the DS color palette (§1). The DS muted surface is `#fafafa` (`bg-zinc-50`) or `#f4f4f5` (`bg-zinc-100`).

**DS reference**: §1 — "No decorative gradients. No multi-accent compositions. If a new color is needed, revise the design system before using it." `#f8fafc` is not a documented palette token.

**Severity note**: This is a canvas/annotation background, not a component color. It does not affect the component being mocked. However, it is an off-palette value in a design file.

**Fix**: Change canvas fill to `#fafafa` (`bg-zinc-50`).

---

### MOCK-009 — Session Settings Popover: Off-Palette Frame Background (P2)

**Affected file**: `session-settings-popover.svg`

**Evidence**: Line 207: `fill="#f9fafb"` on a Frame B annotation background rect. `#f9fafb` is Tailwind `gray-50` — not present in the DS palette.

**DS reference**: §1 — palette does not include gray-50. Closest tokens are `#fafafa` (zinc-50) or `#f4f4f5` (zinc-100).

**Fix**: Change fill to `#fafafa`.

---

### MOCK-010 — Multiple Files: Stale DS Version in Metadata (P2)

**Affected files and their declared DS versions**:

| File | Declared version | Current DS |
|---|---|---|
| `chat-desktop.svg` | 3.6 | 3.9 |
| `chat-mobile.svg` | 3.6 | 3.9 |
| `sessions-desktop.svg` | 3.6 | 3.9 |
| `settings-desktop.svg` | 3.6 | 3.9 |
| `admin-desktop.svg` | 3.6 (but content is DS v1.6) | 3.9 |
| `assistant-desktop.svg` | 3.6 | 3.9 |
| `documents-desktop.svg` | 3.6 | 3.9 |
| `chat-tools-panel.svg` | 3.6 | 3.9 |
| `new-session-dialog-advanced.svg` | 3.6 | 3.9 |
| `session-settings-popover.svg` | 3.6 | 3.9 |
| `optimize-prompt-toggle.svg` | 3.6 | 3.9 |
| `not-found.svg` | 3.6 | 3.9 |
| `typing-indicator.svg` | 3.2 | 3.9 |

**DS reference**: SVG Mockup Standards — "Document metadata: Design system version: `<date of docs/web/design-system.md used>`."

**Impact**: Stale version numbers make it impossible to determine by inspection whether a mockup reflects the current spec or an older one. `admin-desktop.svg` has a particularly misleading mismatch — it claims v3.6 but its content reflects v1.6.

**Fix**: Update `<desc>` metadata in each file during the next revision cycle for that file. The version number should be updated only when the file content is reviewed against and confirmed compliant with the current DS version.

---

### MOCK-011 — Sidebar Active State Inconsistency: Left Accent Bar (P2)

**Affected files**: `chat-desktop.svg` (outlier) vs `sessions-desktop.svg`, `settings-desktop.svg`, `admin-desktop.svg`, `assistant-desktop.svg`, `chat-tools-panel.svg` (consistent)

**Evidence**:

`chat-desktop.svg` — active sidebar nav item (Sessions):
```
<rect x="8" y="66" width="204" height="36" rx="6" fill="#f0fdfa"/>
<!-- No left accent bar rect present -->
```

`sessions-desktop.svg` — active sidebar nav item (Sessions):
```
<rect x="8" y="64" width="204" height="36" rx="6" fill="#f0fdfa"/>
<rect x="8" y="64" width="2" height="36" rx="1" fill="#0d9488"/>
```

The majority pattern (5 of 6 mockups) includes a 2px teal left-edge accent rectangle alongside the `bg-teal-50` fill. `chat-desktop.svg` uses `bg-teal-50` fill only.

**DS reference**: §5 Component Patterns does not explicitly specify whether the active nav item uses a left accent bar or only a background fill. This is a design system gap — the sidebar active state treatment is underspecified.

**Fix**: `web_designer` should add an explicit active nav item specification to DS §4 Layout / App shell or §5 Component Patterns, resolving the ambiguity. Until then, the majority pattern (bg-teal-50 + 2px teal left bar) should be treated as the de-facto standard, and `chat-desktop.svg` should be updated to match.

---

### MOCK-012 — Missing Teal-Era Login and Register Page Mockups (P2)

**Status of existing files**: `sprint-1-login.svg` and `sprint-1-register.svg` are SUPERSEDED (FLAG-005, DS §16) — they use `#7c3aed` (violet-600) as the primary accent. There is no current, teal-era mockup for either the `/login` or `/register` page.

**DS reference**: §14 — "Login / Register: Single purpose. Headline → form → submit CTA → toggle link." §0.4 — "Login page: `<SidebarLogo />` at 40×40px precedes the `Cogtrix` heading (`text-3xl font-bold`) on the auth page, vertically stacked and centered."

**Impact**: The login and register pages are the first thing new users see. The existing visual targets are violet-era and must not be used by `web_coder`. The implementation must rely on DS prose spec alone, with no approved visual reference. This increases the risk of divergence between the implementation and design intent.

**Fix**: Produce `login-desktop.svg` and `register-desktop.svg` as new files (not revisions of the v1.0 files, which are historical reference). These should cover: default state, field focus state, validation error state, loading (submit in progress) state. The login page should match the centered card layout from DS §4 with the C-mark logomark per DS §0.4.

---

### MOCK-013 — `blockquote-corrected.svg` Canvas Uses Off-Palette Violet-Tint Background (P1)

**Affected file**: `blockquote-corrected.svg`

**Evidence**: The file uses `fill="#faf9ff"` as annotation background rectangles (lines 44, 46). `#faf9ff` is a near-white with a violet tint — not a DS palette color. This color appears to be a residual from the violet-era palette (violet-50 is `#f5f3ff`; `#faf9ff` is a lighter variant).

**DS reference**: §1 — palette uses `#fafafa` (zinc-50) and `#f4f4f5` (zinc-100) as muted surfaces. No violet-tinted surfaces exist in the palette.

**Fix**: Replace `#faf9ff` with `#fafafa`. Simultaneously regenerate the blockquote border color (see MOCK-002).

---

## Superseded Files Register

The following files are formally superseded per DS §16. They must not be used as build targets or bases for new work.

| File | DS version at creation | Superseded by | Reason |
|---|---|---|---|
| `sprint-1-login.svg` | v1.0 | DS §16 FLAG-005 | Violet-600 accent throughout |
| `sprint-1-register.svg` | v1.0 | DS §16 FLAG-005 | Violet-600 accent throughout |
| `sprint-1-shell-desktop.svg` | v1.0 | DS §16 FLAG-005 | Violet-600 accent throughout |
| `sprint-1-shell-mobile.svg` | v1.0 | DS §16 FLAG-005 | Violet-600 accent throughout |
| `tri-switch.svg` | v2.0 | DS §16 FLAG-005 | Violet-600 accent in track/thumb |
| `chat-markdown-typography.svg` | v2.2 | DS §16 FLAG-005 | Violet-200 blockquote border |
| `markdown-full-spec.svg` | (pre-v3.5) | DS §16 FLAG-005 | Violet-200 blockquote border |
| `status-bar-collapsed.svg` | v2.3 | DS §16 FLAG-005 | Pre-teal era |
| `status-bar-expanded.svg` | v2.3 | DS §16 FLAG-005 | Pre-teal era |
| `confirm-dialog-delete.svg` | v2.3 | DS §16 FLAG-005 | Pre-teal era |
| `code-block-component.svg` | (pre-v3.5) | DS §16 FLAG-005 | Pre-teal era |
| `blockquote-corrected.svg` | (pre-v3.5) | DS §16 FLAG-005 + MOCK-002/013 | Violet blockquote border, off-palette background |
| `assistant-guardrails-desktop.svg` | v1.6 | DS §16 FLAG-005 | Violet accent; pre-tab-layout era |
| `settings-providers-desktop.svg` | v1.6 | DS §16 FLAG-002 | MCP Servers tab columns superseded |
| `admin-desktop.svg` | v1.6 (mislabeled as v3.6) | DS §16 FLAG-001 | No tab bar; missing UserManagementPanel |

---

## Missing Mockup Coverage

Pages and components with no current, teal-era approved mockup:

| Page / Component | Route | Notes |
|---|---|---|
| Login page | `/login` | `sprint-1-login.svg` exists but is SUPERSEDED (violet). No teal-era replacement. |
| Register page | `/register` | `sprint-1-register.svg` exists but is SUPERSEDED (violet). No teal-era replacement. |
| Settings — API Keys tab | `/settings` (tab 4) | No frame in `settings-desktop.svg`. |
| Settings — Setup Wizard tab | `/settings` (tab 5) | No frame in `settings-desktop.svg`. |
| Assistant — Campaigns tab | `/assistant` (tab 7) | Deferred per DS §14 CAMP-001. |
| Assistant — Workflows tab | `/assistant` (tab 8) | Deferred per DS §14 WFLOW-001. |
| Admin — 3-tab layout | `/admin` | `admin-desktop.svg` is SUPERSEDED. No replacement with System/Live Logs/Users tabs. |
| ConfirmDialog (delete/archive) | Modal | `confirm-dialog-delete.svg` is SUPERSEDED (FLAG-005). |
| TriSwitch component | Session tools panel | `tri-switch.svg` is SUPERSEDED (FLAG-005). |
| StatusBar (collapsed/expanded) | Session chat | Both status-bar files are SUPERSEDED (FLAG-005). |
| CodeBlock component | Markdown | `code-block-component.svg` is SUPERSEDED (FLAG-005). |

---

## Consistent Findings (No Issues)

The following checks passed across all in-scope files:

- **Teal-era primary accent** (`#0d9488`): Correct in all post-v3.5 mockups (chat-desktop, chat-mobile, sessions-desktop, settings-desktop, admin-desktop, assistant-desktop, documents-desktop, chat-tools-panel, new-session-dialog-advanced, session-settings-popover, optimize-prompt-toggle, not-found, typing-indicator).
- **Sidebar width**: 220px is consistent across all desktop mockups that include a sidebar.
- **Sidebar background**: `#fafafa` (`bg-zinc-50`) is consistent across all desktop mockups.
- **Sidebar border**: `#e4e4e7` 1px right border is consistent across all desktop mockups.
- **Primary text color**: `#18181b` (`text-zinc-900`) is consistent throughout all files.
- **Muted text color**: `#71717a` (`text-zinc-500`) is used correctly for labels, timestamps, and helper text across all files.
- **Border color**: `#e4e4e7` (`border-zinc-200`) is used consistently for all dividers and card borders in post-v3.5 mockups.
- **Primary button**: `#0d9488` fill with `#ffffff` text is consistent across all teal-era files.
- **Page header height (56px)**: Correct in chat-desktop, sessions-desktop, settings-desktop, admin-desktop, assistant-desktop, chat-tools-panel, and chat-mobile (two stacked 56px bars). Exception: documents-desktop.svg at 64px (MOCK-006).
- **Card corner radius**: `rx="10"` (approximately `rounded-xl`) is consistent in card containers across sessions-desktop, settings-desktop, admin-desktop, assistant-desktop, and documents-desktop. `rx="6"` is used correctly for small interactive elements (buttons, inputs).
- **Typography**: All post-v3.5 mockups correctly specify `font-family: 'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif`.
- **Page title typography**: `font-size="24" font-weight="600"` (`text-2xl font-semibold`) is consistent across sessions, settings, admin, and assistant pages.
- **Ghost button icon color**: `#71717a` (`text-zinc-500`) is used correctly in post-v3.5 mockups.
- **AgentStateBadge thinking state**: `#0d9488` dot (teal-600) with `#0f766e` label (teal-700) is consistent across chat-desktop, chat-mobile, chat-tools-panel, and sessions-desktop.
- **C-mark logomark**: teal `#0d9488` arc and nodes are present and geometrically consistent in all desktop sidebars.

---

## Recommended Action Priority

| Priority | Action |
|---|---|
| Immediate | Add in-file `SUPERSEDED` retirement annotations to all 15 superseded files listed in the superseded register. No visual changes required — annotation only in `<desc>`. |
| Next revision cycle | Produce `login-desktop.svg` and `register-desktop.svg` against DS v3.9 tokens. |
| Next revision cycle | Produce `admin-desktop-v2.svg` with 3-tab layout. |
| Next revision cycle | Produce `blockquote-corrected-v2.svg` with teal-200 border and teal-50/40 background. |
| Next revision cycle | Update `documents-desktop.svg` header height from 64px to 56px. |
| Low | Add API Keys and Setup Wizard frames to `settings-desktop.svg`. |
| Low | Standardise sidebar active-state spec in DS §4 or §5 (left accent bar: yes or no). |
| Low | Update `<desc>` DS version metadata in all stale files during next revision. |
| Deferred | Campaigns and Workflows tab frames for `assistant-desktop.svg` (per DS §14 CAMP-001/WFLOW-001 policy). |
