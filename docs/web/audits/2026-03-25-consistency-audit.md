# UI Consistency Audit — 2026-03-25

**Auditor**: web_designer
**Design system reference**: DS v3.9 (`docs/web/design-system.md`)
**Scope**: Full codebase — all authenticated pages, shared layout components, and chat sub-components
**Status**: Read-only findings. No code was modified.

---

## Findings

### Button Sizing

---

#### CONS-001

**Page/Component**: `AppShell.tsx` — `MobileHeader`
**Issue**: The hamburger menu button uses `h-11 w-11` instead of `size="icon"`. DS §5 specifies ghost icon-only buttons as `h-8 w-8` or `size="icon"` (which resolves to `h-9 w-9`). The mobile header is a `h-14` bar; an `h-11` button is taller than the `h-9` DS default for icon buttons but shorter than the bar itself. This size is not in the DS spec for icon buttons and is not registered as an exception.
**Severity**: P2 — visual inconsistency with other icon-only buttons; touch target is large enough so no accessibility concern.
**Fix**: Replace `h-11 w-11` with `size="icon"` (removes the explicit dimensions and lets shadcn defaults apply `h-9 w-9`), or register `h-11 w-11` as the canonical icon button height for header bars in DS §5 Component Exceptions table. The latter is preferable because `SessionHeader` ghost icon buttons also use `h-11 w-11` — they should match.

---

#### CONS-002

**Page/Component**: `SessionHeader.tsx` — all ghost icon-only buttons (back, clear history, memory toggle, tools toggle, settings popover trigger)
**Issue**: All ghost icon buttons in `SessionHeader` use `h-11 w-11` (44px). The shadcn/ui default for `size="icon"` is 36px (`h-9 w-9`). DS §3 documents `h-14` as the canonical header height with no corresponding icon button size exception for header rows.
**Severity**: P2 — consistent within `SessionHeader` itself but inconsistent with icon buttons on other pages that use the shadcn default size. If `h-11 w-11` is the intended header-bar icon button size (which is reasonable for touch target parity), it must be documented in DS §5 as "header-bar icon buttons use `h-11 w-11`".
**Fix**: Register `h-11 w-11` as the canonical icon button size within `h-14` header bars in DS §5, or standardise all header icon buttons to `size="icon"`. Given the existing consistent usage in `SessionHeader` and `AppShell.MobileHeader`, formalising `h-11 w-11` is the lower-disruption path.

---

#### CONS-003

**Page/Component**: `ProviderList.tsx` — "Check health" button inside `TableCell`
**Issue**: The health-check button uses `variant="ghost" size="sm" className="min-h-11"`. DS §5 specifies `size="sm"` for table row actions. However, `min-h-11` (44px) overrides the `sm` height of 32px. This makes the row taller than other tables in the app (e.g., `McpServerList`, `UserManagementPanel`) whose row actions use `min-h-11` consistently — so the issue is an undocumented exception on the `size` prop, not on `min-h-11`.
**Severity**: P2 — internal inconsistency between `size="sm"` declaration and effective height. The visual result is acceptable but the intent is unclear.
**Fix**: Remove `size="sm"` and keep `min-h-11` (matching all other table row action buttons), or remove `min-h-11` and let `size="sm"` define the height. The former is consistent with the rest of the codebase.

---

#### CONS-004

**Page/Component**: `DocumentsPage` (index.tsx) — "Upload Document" primary button
**Issue**: `<Button onClick={...}>` with no `size` prop — renders at the shadcn/ui default height (`h-9`). Every other primary page-header button (e.g., `NewSessionDialog` trigger, "Add MCP Server", "Create key") also uses the shadcn default, so this is consistent. However, DS §5 specifies `size="lg"` exclusively for "auth page CTA only". The `NewSessionDialog` trigger uses no size prop either. This is fine — documenting for completeness.
**Severity**: P2 (informational) — no actual inconsistency found; all page-header action buttons correctly omit a size override and use the shadcn default `h-9`.
**Fix**: No change required. Confirm in DS §5 that page-header action buttons use the default size (no `size` prop).

---

#### CONS-005

**Page/Component**: `MemoryPanel.tsx` — memory mode switcher buttons
**Issue**: The three memory mode buttons (`Conversation`, `Code`, `Reasoning`) use `variant="outline" size="sm" className="min-h-11 flex-1 ..."`. They combine `size="sm"` (which sets `h-8` in Tailwind CSS v4 / New York) with `min-h-11` (44px floor). The net rendered height is 44px — correct for a touch target and consistent with the `min-h-11` pattern used elsewhere. However, the `size="sm"` prop is semantically misleading since it is overridden.
**Severity**: P2 — same as CONS-003. Correct visual result, inconsistent size prop usage.
**Fix**: Remove `size="sm"` from the mode switcher buttons. They are not compact table-row actions; they are panel-level toggles and should not declare `sm`.

---

#### CONS-006

**Page/Component**: `KnowledgePanel.tsx` — Search and Clear buttons
**Issue**: The `Search` button uses no `size` prop (renders `h-9`) while the `Clear` button also uses no `size` prop. The adjacent search `Input` uses `min-h-11`. This creates a visible height mismatch between the input and its action button in the flex row — the input is taller than the button.
**Severity**: P1 — visible height mismatch in a primary interaction row.
**Fix**: Add `className="min-h-11"` to both the Search and Clear buttons (matching the adjacent Input height), or reduce the Input to `h-9` to match the default button height. The `min-h-11` pattern is preferred as it provides adequate touch targets.

---

### Tab Sizing

---

#### CONS-007

**Page/Component**: `AdminPage` (`src/pages/admin/index.tsx`) — `TabsList`
**Issue**: `<TabsList>` has no width or sizing override. The `TabsList` in shadcn/ui New York style has `inline-flex` display by default, meaning it fits its content width and does not stretch. With only 2–3 tabs ("System", "Live Logs", "Users"), the list is narrow and tabs are close together but not technically "squashed". The reported squashing is most likely caused by the default shadcn/ui New York `TabsTrigger` height (`h-9`) combined with the tabs being inside a padded page container where the breathing room between the heading and the tabs is `space-y-6`. However, unlike `SettingsPage` and `AssistantPage`, `AdminPage` does NOT wrap its `TabsList` in a `div className="overflow-x-auto pb-2"` or apply `w-max min-w-full justify-start`. This means at narrow viewports the tab list cannot scroll and tabs may squash to fit.
**Severity**: P1 — the Admin page lacks the overflow-x-auto scroll wrapper present on Settings and Assistant pages. At small viewport widths this causes tabs to compress rather than scroll horizontally.
**Fix**: Wrap the `TabsList` in `<div className="overflow-x-auto pb-2">` and add `className="w-max min-w-full justify-start"` to `TabsList` — matching the pattern already used in `SettingsPage` and `AssistantPage`.

---

#### CONS-008

**Page/Component**: `SettingsPage` (`src/pages/settings/index.tsx`) — `TabsList`
**Issue**: `TabsList` has `className="w-max min-w-full justify-start"` inside a `div className="mb-6 overflow-x-auto pb-2"`. This is the correct DS-compliant pattern. However, `mb-6` is applied to the scroll wrapper, creating a 24px gap between the tab list and the first `TabsContent`. The `AdminPage` has no such spacing — its `TabsContent` directly follows `TabsList` with no `mt-*` class, relying on the default shadcn/ui margin. This creates a visual inconsistency in spacing between the tab strip and content across the two pages.
**Severity**: P2 — spacing inconsistency between tab list and tab content on Settings vs. Admin.
**Fix**: Standardise the gap between `TabsList` and `TabsContent` across all tab pages. Either: (a) use `mb-4` on the scroll wrapper in Settings (to match the `mt-4` applied on each `TabsContent` in Assistant), or (b) document the `mb-6` value as the DS standard and apply it on Admin too.

---

#### CONS-009

**Page/Component**: `AssistantPage` (`src/pages/assistant/index.tsx`) — `TabsList`
**Issue**: Each `TabsContent` adds `className="mt-4"` for spacing between the tab strip and content. This is not present in `AdminPage` or `SettingsPage`. Minor inconsistency.
**Severity**: P2 — cross-page spacing inconsistency between tab content and tab strip.
**Fix**: Standardise. The `mt-4` approach (add spacing at `TabsContent` level) or the `mb-6` approach (add spacing at scroll wrapper level) must be chosen and applied consistently across all three tab pages. Recommended: `mt-4` on `TabsContent` is more precise since it applies only when content exists.

---

### Page Header Pattern

---

#### CONS-010

**Page/Component**: `PageHeader.tsx` component
**Issue**: The `PageHeader` component renders `<h1 className="text-2xl font-semibold text-zinc-900">`. DS §2 specifies `text-2xl` as the page title size — this is correct. However, `PageHeader` has no `h-14` height constraint. DS §3 documents `h-14` as the canonical page header height for the mobile AppShell header and `SessionHeader`, but does **not** require `PageHeader` (the component used on standard content pages) to be `h-14`. The `PageHeader` renders as an inline flow element with a bottom border and `pb-6 mb-6` — its height is determined by content, not a fixed value. This is architecturally different from `SessionHeader` which is a sticky bar.
**Severity**: P2 (informational) — `PageHeader` is not a sticky header bar and does not need `h-14`. However the DS §3 header height rule is ambiguous about which header types it covers. Needs documentation clarification.
**Fix**: Update DS §3 RESP-001 to clarify that `h-14` applies specifically to sticky/fixed header bars (`SessionHeader`, `AppShell.MobileHeader`), not to inline page title + action row patterns (`PageHeader` component).

---

#### CONS-011

**Page/Component**: All content pages using `PageHeader` — vertical padding
**Issue**: All pages (`SessionsPage`, `DocumentsPage`, `SettingsPage`, `AdminPage`, `AssistantPage`) use `px-4 py-4 md:px-6 md:py-6` on the outer container. DS §4 specifies `px-6 py-6` (desktop) / `px-4 py-4` (mobile). The implementation uses responsive variants: `px-4 py-4 md:px-6 md:py-6`. This is correct. However DS §4 says "padded `px-6 py-6` on desktop, `px-4 py-4` on mobile" — the breakpoint at which the padding transitions is `md` (768px) in all implementations, which is reasonable but not explicitly documented in DS §4.
**Severity**: P2 (informational) — consistent across all pages.
**Fix**: Update DS §4 standardised patterns to explicitly document `md:` as the breakpoint for padding expansion (i.e., `px-4 py-4 md:px-6 md:py-6`).

---

### Typography

---

#### CONS-012

**Page/Component**: `PageHeader.tsx`
**Issue**: `PageHeader` uses `text-2xl font-semibold text-zinc-900` for page titles. DS §2 documents `text-2xl` as "Page titles" (24px). This is correct. However the DS also states "Page titles `text-xl font-semibold`" in the typography use column at `xl` (20px). There is a conflict within the DS: the size scale table labels `xl` as "Page subheadings, card titles" and `2xl` as "Page titles". `PageHeader` uses `text-2xl` — which is correct per the scale table. The "Page titles `text-xl`" phrasing in the DS should be `text-2xl`.
**Severity**: P1 (DS documentation error, not an implementation error) — the current implementation is correct; the DS wording is internally inconsistent.
**Fix**: Update DS §2 typography section to confirm `text-2xl font-semibold` as the page title class (the size scale table is authoritative).

---

#### CONS-013

**Page/Component**: `SystemInfoCard.tsx` and `LiveLogViewer.tsx` — `CardTitle`
**Issue**: Both cards use `CardTitle className="text-xl"` — overriding the shadcn/ui default `CardTitle` size. DS §5 documents the `text-base` CardTitle exception for compact data-table cards (as in `GuardrailsPanel`). `text-xl` is consistent with DS §2 which lists `xl` for "card titles". The usage here is correct and intentional. No finding.
**Severity**: None — confirming compliance.

---

#### CONS-014

**Page/Component**: `GuardrailsPanel.tsx` — `CardTitle`
**Issue**: `CardTitle className="text-base"` on both "Recent Violations" and "Blacklisted Chats" cards. DS §5 explicitly documents this exception for stacked data-table cards with a count `Badge` in the header. Compliant.
**Severity**: None — confirming compliance.

---

#### CONS-015

**Page/Component**: `SetupWizard.tsx` — section headings
**Issue**: All wizard state headings (`h2`) use `text-lg font-semibold text-zinc-900`. DS §2 documents `text-lg` as "Section subheadings". This is correct for a content section within a tab, not a page title. Compliant.
**Severity**: None — confirming compliance.

---

#### CONS-016

**Page/Component**: `CampaignDetail` (in `CampaignsPanel.tsx`) — sub-section label
**Issue**: Labels inside the expanded detail row use `text-xs font-medium tracking-wide text-zinc-500 uppercase`. DS §5 tables specifies `text-xs font-medium text-zinc-500 uppercase tracking-wide` as the `TableHead` pattern. This is the correct pattern for section sub-labels. Compliant.
**Severity**: None — confirming compliance.

---

### Spacing Rhythm

---

#### CONS-017

**Page/Component**: `SessionsPage` — outer container padding
**Issue**: `px-4 py-4 md:px-6 md:py-6` — consistent with other pages. However the inner grid uses `gap-6` (24px) between cards, which is correct per DS §3 "Section gap (vertical): `space-y-6` or `gap-6`". Compliant.

---

#### CONS-018

**Page/Component**: `DocumentsPage` — document list spacing
**Issue**: Between the document count text (`text-sm text-zinc-500`) and the document list, there is no top margin — the `<p>` and `<div class="space-y-3">` sit adjacent in the JSX with no separator. This creates a tighter-than-expected visual gap between the count label and the first card.
**Severity**: P2 — minor spacing inconsistency. Other list headers (e.g., `AssistantChatList`, `CampaignsPanel`) include `mb-4` on the header section before the table.
**Fix**: Add `mb-2` or `mt-2` between the count `<p>` and the document list `<div>`.

---

#### CONS-019

**Page/Component**: `KnowledgePanel.tsx` — search row and filter Input
**Issue**: The source-chat filter `Input` (`h-8 w-[160px] text-sm`) is placed in its own `<div>` beneath the search row flex container, not inside the flex row. DS §8 panel filter controls require all filter controls to be in a `flex flex-wrap items-center gap-2` row. Having the source-chat filter in a separate `<div>` breaks the filter-row pattern — at wider viewports the two filter controls appear stacked vertically rather than inline.
**Severity**: P1 — violates DS §5 Panel Filter Controls layout rule. The filter row should be a single `flex flex-wrap` container.
**Fix**: Move the source-chat `Input` into the same `flex flex-wrap items-center gap-2` div as the search `Input` and buttons.

---

### Card / Surface Consistency

---

#### CONS-020

**Page/Component**: `LoginPage` (`login.tsx`) — auth card
**Issue**: The auth card uses `rounded-xl border border-zinc-200 bg-white shadow-sm`. DS §5 Cards specifies `rounded-xl border border-zinc-200 shadow-sm`. Compliant — correct surface pattern.
**Severity**: None.

---

#### CONS-021

**Page/Component**: `MemoryPanel.tsx` — stats section and summary collapsible
**Issue**: The stats block uses `rounded-md border border-zinc-200 bg-zinc-50 p-3`. DS §5 Cards specifies `rounded-xl` as the standard card radius. `rounded-md` is a smaller radius that creates visual inconsistency with cards elsewhere in the app. The summary block `div` also uses `rounded-md`.
**Severity**: P2 — `rounded-md` vs. `rounded-xl` inconsistency within a panel component.
**Fix**: Replace `rounded-md` with `rounded-lg` (a middle ground appropriate for small inline surface blocks) or `rounded-xl` (the DS standard). `rounded-xl` may appear overly large for a compact stats block — `rounded-lg` is the better choice here. Update DS §5 to document `rounded-lg` as permitted for inline surface blocks (not standalone cards).

---

#### CONS-022

**Page/Component**: `ConfigFlagsForm.tsx` — active model / config info block
**Issue**: The config info block uses `rounded-xl border border-zinc-200 bg-zinc-50 p-4`. Correct — uses `rounded-xl` and DS-standard surface tokens.
**Severity**: None — confirming compliance.

---

#### CONS-023

**Page/Component**: `WorkflowsPanel.tsx` / `WorkflowFormFields` — knowledge base and auto-detect toggle rows
**Issue**: The Switch rows inside the workflow form use `rounded-lg border border-zinc-200 px-4 py-3`. This is the DS-approved "inline toggle row" pattern documented in the workflow form. `rounded-lg` is used on a small form widget surface — consistent with the exemption noted in CONS-021 above. However the DS does not formally document `rounded-lg` as a variant for inline form widget surfaces. The inconsistency with the DS `rounded-xl` standard is a gap in DS documentation.
**Severity**: P2 — implementation gap: `rounded-lg` surfaces appear throughout sub-forms but the DS only documents `rounded-xl` for cards and `rounded-md` is used in older code.
**Fix**: DS update — add a "Inline form widget surface" pattern to §5 that specifies `rounded-lg border border-zinc-200 bg-white px-4 py-3` (or `bg-zinc-50` where the row needs muted background). All inline toggle rows and compact surface blocks should use `rounded-lg`.

---

### Empty State Pattern

---

#### CONS-024

**Page/Component**: `SessionsPage` — `EmptyState` component
**Issue**: The empty state uses a centered 48px icon (`h-12 w-12 text-zinc-400`), heading text, subtext, and a CTA button. This matches DS §10 empty-state pattern exactly. Compliant.
**Severity**: None.

---

#### CONS-025

**Page/Component**: `McpServerList.tsx` — empty state
**Issue**: The empty state wraps the icon and text in `<div class="rounded-xl border border-zinc-200">` with inner `flex flex-col items-center gap-3 py-16 text-center`. This adds a visible border around the empty state, creating an unusual boxed empty-state style not used elsewhere. Other empty states (SessionsPage, DocumentsPage, AssistantChatList, etc.) use an unboxed centered layout.
**Severity**: P2 — the border box around the empty state is inconsistent with all other empty-state implementations in the codebase.
**Fix**: Remove the outer `rounded-xl border border-zinc-200` wrapper. Use the same unboxed empty-state pattern: `<div class="flex flex-col items-center gap-3 py-16 text-center">`.

---

#### CONS-026

**Page/Component**: `GuardrailsPanel.tsx` — "No violations recorded" and "No blacklisted chats" states
**Issue**: The empty states for both tables are plain text: `<p class="text-sm text-zinc-500">No violations recorded.</p>`. No icon, no centered layout, no structured empty-state. DS empty state pattern requires a centered icon (48px, `text-zinc-400`) + heading + subtext.
**Severity**: P2 — incomplete empty-state implementation. These are inside `CardContent`, so a full centered empty-state with large icon is appropriate.
**Fix**: Replace each plain `<p>` with a centered empty-state: icon + text, consistent with the pattern in other components. Suggested icons: `ShieldOff` (12×12, text-zinc-400) for violations, `Ban` for blacklist.

---

#### CONS-027

**Page/Component**: `ProviderList.tsx` — "No providers configured" and "No models configured"
**Issue**: Both empty states are plain `<p class="text-sm text-zinc-500">No [x] configured.</p>` without icon or structured layout.
**Severity**: P2 — plain text empty states.
**Fix**: Replace with centered icon + text pattern. Suggested icons: `Server` or `Plug` for providers, `Cpu` or `Layers` for models.

---

### Table Consistency

---

#### CONS-028

**Page/Component**: `GuardrailsPanel.tsx` — violations table — cell text colors
**Issue**: `TableCell` for `v.channel` and `v.detail` use `text-zinc-900` instead of the DS-specified secondary column text `text-zinc-600`. DS §5 FONT-001 requires secondary descriptive columns to use `text-zinc-600`.
**Severity**: P1 — violates FONT-001 table column text hierarchy rule.
**Fix**: Change `text-zinc-900` to `text-zinc-600` on the Channel, Type detail, and Detail columns (keep `text-zinc-900` for the primary Chat ID column).

---

#### CONS-029

**Page/Component**: `ContactList.tsx` — `TableCell` text color
**Issue**: `contact.identifiers.join(", ")` cell uses `font-mono text-sm text-zinc-900`. `contact.filter_mode` cell uses `text-sm text-zinc-900`. Per DS FONT-001, secondary descriptive columns should use `text-zinc-600`. The `Identifiers` column is secondary data and `filter_mode` is also secondary. Only `Name` (primary identifier) should be `text-zinc-900`.
**Severity**: P1 — violates FONT-001.
**Fix**: Change `text-zinc-900` to `text-zinc-600` on `Identifiers` and `Filter` columns.

---

#### CONS-030

**Page/Component**: `ScheduledMessageTable.tsx` — cell colors
**Issue**: `msg.channel` uses `text-zinc-900` (secondary column). `msg.text` uses `text-zinc-900` (content). `msg.attempts` uses `text-zinc-900`. Per FONT-001, secondary columns should use `text-zinc-600`.
**Severity**: P1 — violates FONT-001.
**Fix**: Change channel, content, attempts, and max_attempts cells from `text-zinc-900` to `text-zinc-600` (keep Chat ID as `text-zinc-900` since it is the primary identifier column).

---

#### CONS-031

**Page/Component**: `DeferredRecordTable.tsx` — cell colors
**Issue**: `record.pending_messages.length` and `record.depth/record.max_depth` cells use `text-zinc-900`. These are secondary data columns. Per FONT-001 they should be `text-zinc-600`.
**Severity**: P1 — violates FONT-001.
**Fix**: Change Pending and Depth cells from `text-zinc-900` to `text-zinc-600`.

---

#### CONS-032

**Page/Component**: `CampaignsPanel.tsx` — `CampaignRow` and `CampaignDetail`
**Issue**: `campaign.targets.length` and `campaign.max_follow_ups` cells in `CampaignRow` use `text-zinc-900`. In `CampaignDetail`, `t.follow_ups_sent` uses `text-zinc-900`. These are secondary numeric data columns. Per FONT-001 they should be `text-zinc-600`.
**Severity**: P1 — violates FONT-001.
**Fix**: Change Targets, Follow-ups, and Follow-ups Sent cells to `text-zinc-600`.

---

### Loading / Skeleton Pattern

---

#### CONS-033

**Page/Component**: `ProviderList.tsx` — loading state
**Issue**: Loading state renders individual skeletons via `Skeleton` component. However, the first skeleton is `h-5 w-24` (simulating a heading) followed by `h-10 w-full` rows. DS §5 Skeleton loaders states skeletons should approximate real content dimensions. The `h-10` row skeletons approximate a table row reasonably. The heading skeleton is `h-5` while the real heading is rendered in an `h2` that would be taller than `h-5`. Acceptable approximation.
**Severity**: P2 (minor) — no change required.

---

#### CONS-034

**Page/Component**: All pages — correct use of `PageSkeleton` vs. inline skeletons
**Issue**: `AdminPage` and `SettingsPage` use `<Suspense fallback={<PageSkeleton />}>` and `<Suspense fallback={<TabSkeleton />}>` respectively. `SessionPage` uses `<PageSkeleton />` for initial session load. All other loading states use inline `Skeleton` components per the DS §5 rule. This is consistent and correct.
**Severity**: None — confirming compliance.

---

### Color Token Usage

---

#### CONS-035

**Page/Component**: `LiveLogViewer.tsx` — `SelectTrigger`
**Issue**: `<SelectTrigger size="sm" className="min-h-11 w-28">`. The `size="sm"` prop on `SelectTrigger` is not documented in shadcn/ui New York variant for Select. The effective size depends on whether the underlying shadcn component supports a `size` prop. If unsupported, the `size` attribute is silently ignored and only `min-h-11 w-28` applies. This is harmless but misleading.
**Severity**: P2 — non-standard prop usage.
**Fix**: Remove `size="sm"` from `SelectTrigger` in `LiveLogViewer.tsx`. Keep `className="min-h-11 w-28"` which is sufficient.

---

#### CONS-036

**Page/Component**: `WorkflowsPanel.tsx` — `BindingsDialog` inline warning
**Issue**: The "chat is already bound" warning uses a raw `div` with `rounded-lg border border-amber-200 bg-amber-50 px-4 py-3`. DS §5 Inline Warning Banner states: "Raw `div` implementations are accepted in existing code — do not refactor them proactively. New occurrences must use `Alert`." This `div` was introduced as part of a recent sprint. It uses `text-amber-700` for body text, which is `5.3:1` contrast on `bg-amber-50` — acceptable for body text per DS §1. However, DS §5 specifies `text-amber-800` for the body text of inline warnings (7.0:1 on amber-50). The current implementation uses `text-sm text-amber-700`, not `text-amber-800`.
**Severity**: P1 — WCAG-adjacent: `text-amber-700` (#b45309) on `bg-amber-50` yields ~5.3:1, which does meet WCAG AA 4.5:1. However DS §5 explicitly specifies `text-amber-800` for warning body text, and a new implementation must use the correct token.
**Fix**: Change `text-sm text-amber-700` to `text-sm text-amber-800` in the `BindingsDialog` warning `div`. Also convert to `Alert` component per the DS rule for new implementations.

---

#### CONS-037

**Page/Component**: Multiple files — hardcoded `gray-*` or `slate-*` tokens
**Issue**: A systematic check was performed. No `gray-*`, `slate-*`, or `violet-*` classes were observed in any of the audited files. All files use `zinc-*` consistently. Teal and semantic colors (red, green, amber, blue, orange) appear only in their documented semantic roles.
**Severity**: None — confirming compliance.

---

#### CONS-038

**Page/Component**: `SessionHeader.tsx` — `h-8 text-xs` on `SelectTrigger`
**Issue**: The model selector in `SessionHeader` uses `<SelectTrigger className="h-8 w-24 truncate text-xs lg:w-32">`. DS §5 Panel Filter Controls specifies `h-8 text-sm` for compact controls (not `text-xs`). `text-xs` (12px) on a form control violates the DS minimum text size for functional controls. DS §2 reserves `text-xs` for "Timestamps, badges, helper text" — not form input labels.
**Severity**: P1 — `text-xs` on a `SelectTrigger` is below the DS minimum for interactive control text.
**Fix**: Change `text-xs` to `text-sm` on the `SelectTrigger` in `SessionHeader`. DS §5 Panel Filter Controls explicitly requires `text-sm` for compact `h-8` controls.

---

#### CONS-039

**Page/Component**: `ProviderList.tsx` — "Add model" input
**Issue**: The model-name `Input` in the add-model form uses `className="h-9 font-mono text-sm"`. This is the only `Input` in the codebase using a raw `h-9` height instead of the shadcn default or `min-h-11`. The adjacent `SelectTrigger` uses `min-h-11 w-40 text-sm`. The "Add" button uses `min-h-11 shrink-0`. These three controls are in a flex row — the `h-9` input will be shorter than the `min-h-11` neighbours, creating a misaligned baseline.
**Severity**: P1 — visible height mismatch within a flex row of controls.
**Fix**: Replace `h-9` with `min-h-11` on the model-name `Input` in the add-model form in `ProviderList.tsx`.

---

#### CONS-040

**Page/Component**: `LiveLogViewer.tsx` — `CardContent` log area border radius
**Issue**: The log output `div` uses `rounded-md border border-zinc-200 bg-zinc-50`. DS §2 Code blocks specifies `rounded-md` for code/log display areas. This is correct.
**Severity**: None — confirming compliance.

---

### Cross-Page Visual Cohesion

---

#### CONS-041

**Page/Component**: `AssistantPage` vs. `AdminPage` — `ServiceControlPanel` and `SystemInfoCard` card structure
**Issue**: `ServiceControlPanel` and `SystemInfoCard` both use `<Card>` with `<CardHeader>` and `<CardTitle className="text-xl">`. They sit inside pages that use `PageHeader` as the page-level title. This creates a consistent "page title → card heading" hierarchy. However `GuardrailsPanel` (also in Assistant) uses `<Card>` with `<CardTitle className="text-base">` — the DS-approved exception for stacked data-table cards. The asymmetry between `text-xl` (standalone cards) and `text-base` (stacked data cards) is intentional and DS-compliant. No action required.
**Severity**: None — confirming compliance.

---

#### CONS-042

**Page/Component**: `DocumentsPage` — `PageHeader` upload button has no `size` prop
**Issue**: `<Button onClick={...}>` (default size, `h-9`). Other pages use the same default size for page-header actions. The button uses no explicit `size` prop and renders at the shadcn default `h-9`. This is consistent with `SessionsPage` (`NewSessionDialog` trigger also has no explicit `size` prop beyond what the default button provides).
**Severity**: None — consistent.

---

#### CONS-043

**Page/Component**: `AssistantChatList.tsx` — missing header row separator from filter row
**Issue**: The component wraps both the count text/action button area and the filter Select in a single `<div className="mb-4 space-y-4">`. DS §5 Panel Filter Controls defines a two-row pattern: Row 1 (header with count + CTA) and Row 2 (filter bar). `AssistantChatList` has the count text in Row 1 but no action button (no "New Chat" CTA since chats are created externally via the assistant service). This is architecturally correct — the header row just has the count. The filter Select is in a correct separate row. DS-compliant.
**Severity**: None — confirming compliance.

---

#### CONS-044

**Page/Component**: `NewSessionDialog.tsx` — advanced toggle
**Issue**: The "Advanced" collapsible toggle button uses a raw `<button>` with `px-0 py-1.5 text-sm font-medium text-zinc-700`. This is similar to, but not using, the DS-documented `variant="ghost" size="sm"` pattern for collapsible section triggers. `WorkflowsPanel.WorkflowFormFields` uses `<Button variant="ghost" size="sm">` for its "Advanced settings" collapsible trigger.
**Severity**: P2 — inconsistency between two collapsible section triggers in the same codebase. `NewSessionDialog` uses a raw `<button>`, `WorkflowsPanel` uses `<Button>`.
**Fix**: Replace the raw `<button>` in `NewSessionDialog` with `<Button variant="ghost" className="w-full justify-between px-0 text-zinc-600 hover:text-zinc-900">` to match the `WorkflowsPanel` pattern.

---

## Summary

### Findings by Theme

| Theme | P0 | P1 | P2 | Total |
|---|---|---|---|---|
| Button sizing | 0 | 3 | 4 | 7 |
| Tab sizing / spacing | 0 | 1 | 2 | 3 |
| Page header / DS documentation | 0 | 1 | 2 | 3 |
| Spacing rhythm | 0 | 1 | 1 | 2 |
| Card / surface consistency | 0 | 0 | 3 | 3 |
| Empty state pattern | 0 | 0 | 3 | 3 |
| Table — column text color (FONT-001) | 0 | 5 | 0 | 5 |
| Color token / text size | 0 | 3 | 2 | 5 |
| Cross-page cohesion | 0 | 0 | 1 | 1 |
| **Total** | **0** | **14** | **18** | **32** |

### Priority 0 Findings
None.

### Priority 1 Findings (14 total)

| ID | Page/Component | Issue |
|---|---|---|
| CONS-006 | KnowledgePanel | Search/Clear buttons height mismatch with adjacent Input |
| CONS-007 | AdminPage | TabsList missing overflow-x-auto scroll wrapper (causes reported squashing) |
| CONS-012 | PageHeader (DS doc) | DS §2 internal wording conflict — implementation is correct, DS text is not |
| CONS-019 | KnowledgePanel | Source-chat filter Input placed outside the filter flex row |
| CONS-028 | GuardrailsPanel | Secondary table cell colors should be `text-zinc-600` not `text-zinc-900` (FONT-001) |
| CONS-029 | ContactList | Secondary table cell colors should be `text-zinc-600` not `text-zinc-900` (FONT-001) |
| CONS-030 | ScheduledMessageTable | Secondary table cell colors should be `text-zinc-600` not `text-zinc-900` (FONT-001) |
| CONS-031 | DeferredRecordTable | Secondary table cell colors should be `text-zinc-600` not `text-zinc-900` (FONT-001) |
| CONS-032 | CampaignsPanel | Secondary table cell colors should be `text-zinc-600` not `text-zinc-900` (FONT-001) |
| CONS-036 | WorkflowsPanel — BindingsDialog | Warning `div` uses `text-amber-700` for body text; DS requires `text-amber-800` |
| CONS-038 | SessionHeader | Model selector uses `text-xs` on `SelectTrigger`; DS requires `text-sm` for compact controls |
| CONS-039 | ProviderList | Add-model Input uses `h-9` — misaligns with `min-h-11` neighbours in flex row |

> Note: CONS-028 through CONS-032 are five separate P1 findings all related to the same FONT-001 violation. They are grouped in the summary but each requires a distinct fix in a distinct file.

### Priority 2 Findings (18 total)

The 18 P2 findings cover: undocumented header-bar icon button size convention (CONS-001, CONS-002), inconsistent `size="sm"` + `min-h-11` combination pattern (CONS-003, CONS-005), tab content spacing inconsistency across pages (CONS-008, CONS-009), DS documentation gaps (CONS-010, CONS-011, CONS-023), minor spacing issue in DocumentsPage (CONS-018), `rounded-md` vs. `rounded-xl` in MemoryPanel (CONS-021), McpServerList boxed empty state (CONS-025), plain-text empty states in GuardrailsPanel and ProviderList (CONS-026, CONS-027), `SelectTrigger size="sm"` non-standard prop in LiveLogViewer (CONS-035), collapsible trigger inconsistency (CONS-044).

### High-Value Fixes (P1, quickest wins)

1. **CONS-007** — Admin page tabs squashing: wrap `TabsList` in `<div className="overflow-x-auto pb-2">` and add `className="w-max min-w-full justify-start"`. This directly addresses the user-reported squashed tabs issue.
2. **CONS-038** — Session header model selector `text-xs` → `text-sm`. Single class change.
3. **CONS-039** — ProviderList add-model input `h-9` → `min-h-11`. Single class change.
4. **CONS-028 to CONS-032** — FONT-001 secondary column colors. Mechanical find-replace across 5 files.
5. **CONS-006** — KnowledgePanel button height. Add `min-h-11` to two buttons.
6. **CONS-036** — Warning div text token correction. Single class change.
