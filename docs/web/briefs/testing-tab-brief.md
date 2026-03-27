## Mockup Review

**Status: APPROVED** (2026-03-27)

Mockup `docs/web/mockups/assistant-testing-tab.svg` reviewed and approved by web_designer. Three revision rounds completed (R-01: persist checkbox state; R-02: Scene 1 sample data; R-03: Scene 3 Telegram channel + session key). All scenes are DS v3.16 compliant. Cleared for implementation by web_coder.

---

# Testing Tab — Layout Brief

**Date**: 2026-03-27
**Author**: web_designer
**Status**: Approved — ready for graphic_designer mockup production
**Design system version**: 3.16
**Sprint doc**: `docs/web/briefs/testing-tab-sprint.md`
**Mockup target**: `docs/web/mockups/assistant-testing-tab.svg`

---

## 1. Purpose and scope

This brief defines every visual and structural detail needed to produce an approved SVG mockup and implement `SimulatorPanel` in React. It answers the open design questions from the sprint doc (Q4–Q7) and provides exact Tailwind class guidance for every region of the panel.

---

## 2. Open question rulings (Q4–Q7)

**Q4 — Tab ordering**: Testing is position 9, after Workflows. Ruling: last position is correct. The tab is a developer diagnostic tool, not a content-management tab. Placing it adjacent to Guardrails (position 6) would imply a peer relationship between content-management tabs and an admin-only tool. Position 9 places it clearly in its own category at the end of the strip, consistent with how admin features are typically appended rather than interleaved.

**Q5 — Result card placement**: Split layout at `lg+` (form left, result right). Ruling rationale in DS §14 Testing tab. The form is moderately tall (approximately 400–500px with all fields visible) and the result card can be similarly tall (long response prose is common). Stacking both in a single narrow column on a 1280px desktop would cause 1000px+ scroll depths for a "run and check" workflow that is inherently comparative. The side-by-side view keeps input context immediately visible while reading the output — this is the primary admin use pattern. Below `lg` (< 1024px), single-column stacking is used because the viewport is too narrow for readable split panes within the `max-w-5xl` container.

**Q6 — Empty state before first run**: Subtle text-only empty state. The result area shows centered muted text: `"Run a simulation to see the pipeline response."` at `text-sm text-zinc-500 text-center py-12`. No illustration, no card border, no icon. Rationale: the empty state is transient (it disappears on first submit) and the panel is already visually dense with the form. An illustration would add noise without utility. This pattern matches the empty-state text treatment used in `GuardrailsPanel` ("No violations recorded.") — consistent, low-weight, immediately overwritten.

**Q7 — Advanced options disclosure**: Use shadcn/ui `Collapsible` (not native `<details>`). The `Collapsible` component provides consistent animation, keyboard support, and the `data-[state=open]` attribute for icon rotation. This is now the documented DS §5 pattern. Native `<details>` is prohibited in new component files because its animation behavior is browser-dependent and its marker styling requires overrides that would conflict with Tailwind utility-first patterns.

---

## 3. Page context

The Testing tab appears within the existing `AssistantPage` tab structure. The tab strip is inside a `<div className="overflow-x-auto pb-2">` wrapper. The Testing tab trigger is:

```
{isAdmin && (
  <TabsTrigger value="testing" data-cy="tab-testing">
    Testing
  </TabsTrigger>
)}
```

No `disabled` prop. All other tabs have `disabled={!serviceRunning}` — Testing deliberately does not.

The `TabsContent` uses `className="mt-4"` (canonical tab spacing, DS §5 Tabs).

---

## 4. Layout structure

### 4.1 Outer container

```
<div class="mt-4">                          ← TabsContent canonical spacing
  <div class="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6">
    <!-- Form panel -->
    <!-- Result panel -->
  </div>
</div>
```

At `< lg`: both panels stack vertically, full width. No gap class needed — vertical spacing is provided by `space-y-6` on the result panel container (or natural block flow).

At `lg+`: `grid-cols-[2fr_3fr]` produces approximately 40% form / 60% result within the `max-w-5xl` container. The exact pixel widths at `max-w-5xl` (1024px wide inside padding) are approximately 400px form / 590px result. Both are comfortable for their content.

### 4.2 Form panel

The form panel is bare — no `Card` wrapper, no border. It lives directly in the left grid column.

```
<div class="space-y-5">
  <!-- Form fields -->
  <!-- Submit button -->
</div>
```

`space-y-5` (20px) between field groups: slightly more generous than the default `space-y-4` because the form has a mix of Textareas (tall) and compact Inputs, and the generous gap helps visual grouping without adding explicit section headers.

### 4.3 Result panel

The result panel occupies the right column at `lg+` or appears below the form at `< lg`.

```
<div class="min-h-[200px] lg:min-h-0">
  <!-- Empty / loading / result / error state -->
</div>
```

`min-h-[200px]` on mobile prevents the result area from collapsing when empty and jumping in height on first result. At `lg+`, the column height is determined by the taller of the two panels (grid behavior) — no min-height needed.

---

## 5. Form fields — exact specification

All fields follow DS §5 Forms: `Label` above input, `gap-1.5` between label and control, `space-y-5` between field groups.

### 5.1 Channel

```
Component: Select (shadcn/ui)
Label text: "Channel"
Options: "WhatsApp" (value "whatsapp"), "Telegram" (value "telegram")
Default: "whatsapp"
Classes: w-full
```

### 5.2 Chat ID

```
Component: Input (shadcn/ui)
Label text: "Chat ID"
Placeholder: "+1234567890@c.us"
Help text below input: "The channel-specific contact identifier (e.g. WhatsApp number or Telegram chat ID)."
Help text classes: text-xs text-zinc-500 mt-1
Constraints: required, 1–256 chars
```

### 5.3 Direction

```
Component: Select (shadcn/ui)
Label text: "Direction"
Options: "Inbound" (value "inbound"), "Outbound" (value "outbound")
Default: "inbound"
Classes: w-full
```

### 5.4 Message

```
Component: Textarea (shadcn/ui)
Label text: "Message"
Placeholder: "Type the message to simulate..."
Classes: min-h-[80px] resize-y
Constraints: required, 1–8192 chars
```

`min-h-[80px]` provides approximately 3–4 visible rows at `text-sm` line height. `resize-y` allows manual expansion. The DS auto-grow exception (§3) does not apply here — a fixed `min-h` is sufficient because this is a form textarea, not the chat input.

### 5.5 Instructions (conditional)

Rendered only when `direction === "outbound"`.

```
Component: Textarea (shadcn/ui)
Label text: "Operator instructions"
Help text: "Instructions for the outbound operator persona."
Help text classes: text-xs text-zinc-500 mt-1
Placeholder: "e.g. Be concise and formal."
Classes: min-h-[64px] resize-y
Constraints: optional, max 8192 chars
```

When direction changes from "outbound" to "inbound", this field unmounts and its value is reset. The transition is an abrupt mount/unmount — no animation is required.

### 5.6 Persist memory

```
Component: Checkbox + Label (shadcn/ui)
Layout: flex items-start gap-2
Checkbox: id="persist-memory", default unchecked
Label: htmlFor="persist-memory"
  Primary text: "Persist memory" — text-sm font-medium text-zinc-900
  Secondary text: (no help text — the warning banner below covers this)
```

Immediately below the checkbox+label group, always rendered regardless of checkbox state:

```
Component: Alert (shadcn/ui, DS §5 Inline Warning Banner)
className: border-amber-200 bg-amber-50 text-amber-800
Icon: AlertTriangle h-4 w-4 text-amber-700
Text: "When enabled, the simulation writes to live conversation memory for this chat. This cannot be undone."
```

This banner is never conditionally hidden. Rationale: the risk exists and should be understood before checking the box. Hiding it until checked means the user learns about the danger only after the decision is already made. Showing it always means the admin sees it on page load and can factor it in proactively.

### 5.7 Advanced options (Collapsible)

```
Component: Collapsible (shadcn/ui, DS §5 Collapsible disclosure pattern)
Trigger: flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-150
Trigger icon: ChevronDown h-4 w-4 transition-transform duration-150 data-[state=open]:rotate-180
Trigger label: "Advanced options"
Content margin: mt-2
Content fields: space-y-4 (standard form field gap inside)
```

Fields inside the collapsible:

**Sender name**:
```
Component: Input
Label: "Sender name"
Placeholder: "Simulator"
Help text: "Display name shown in the simulated message. Defaults to "Simulator"."
Help text classes: text-xs text-zinc-500 mt-1
```

**Sender ID**:
```
Component: Input
Label: "Sender ID"
Placeholder: "simulator"
Help text: "Internal sender identifier. Defaults to "simulator"."
Help text classes: text-xs text-zinc-500 mt-1
```

The collapsible is closed by default. Its open/closed state is local component state — it does not need to survive navigation.

### 5.8 Submit button

```
Component: Button (shadcn/ui)
Variant: default (teal-600 primary)
Size: default
Width: w-full
Label: "Run simulation"
Loading state:
  - disabled while simulateMutation.isPending
  - Contents: <Loader2 class="h-4 w-4 mr-2 animate-spin" /> "Running…"
```

No secondary action button. The form is not a modal — there is no "Cancel" needed.

### 5.9 Inline field errors

Shown below the erroring input when `VALIDATION_ERROR` (400/422) is returned:

```
<p class="text-sm text-red-600 mt-1">Error message text</p>
```

Map `details.fields` from the API error response to per-field error text. Clear field errors when the form is resubmitted.

### 5.10 Provider unreachable error

Shown above the submit button when `PROVIDER_UNREACHABLE` (422) is returned:

```
<p class="text-sm text-red-600">LLM provider unreachable. Check configuration.</p>
```

This is inline above the button, not below a field — it is a submission-level error, not a field-level one.

---

## 6. Result panel states

### 6.1 Empty state

Shown before any mutation has been attempted (`simulateMutation.status === "idle"`).

```html
<div class="flex items-center justify-center py-12">
  <p class="text-sm text-zinc-500 text-center">
    Run a simulation to see the pipeline response.
  </p>
</div>
```

No icon, no card border, no action affordance.

### 6.2 Loading state

Shown while `simulateMutation.isPending`.

The previous result has been cleared by `simulateMutation.reset()` before `.mutate()`. The result area shows:

```html
<div class="rounded-lg border border-zinc-200 bg-white p-6 flex flex-col items-center gap-3">
  <Loader2 class="h-5 w-5 animate-spin text-zinc-400" />
  <p class="text-sm text-zinc-500">Running simulation…</p>
</div>
```

No elapsed timer. The pending state is a spinner-in-card, not a skeleton — there is no known content shape to skeleton. A single placeholder card with a spinner is correct per DS §5 Skeleton loaders ("Spinner is only acceptable for button loading states" — exception here because the result content shape is unknown until the response arrives; this is functionally equivalent to a button loading state, not a content area loading state).

### 6.3 Result card (success)

Surface: `rounded-lg border border-zinc-200 bg-white p-6 space-y-4` (DS §5 inline form widget surface).

#### Section 1 — Response text

```html
<div class="text-base leading-relaxed text-zinc-900">
  <!-- ReactMarkdown rendered response -->
</div>
```

When `suppressed === true` and `response === ""`:
```html
<p class="text-sm text-zinc-500 italic">
  (No response — message was suppressed)
</p>
```

The response area has no inner border or background — it is bare text on the card surface. A `border-t border-zinc-200` separator sits between the response area and the status badge row.

#### Section 2 — Status badge row

Four badges always rendered. See DS §5 SimulatorResult badge color table for color specification.

```html
<div class="flex flex-wrap gap-2 pt-4 border-t border-zinc-200">
  <!-- Badge: Guardrail blocked -->
  <!-- Badge: Suppressed -->
  <!-- Badge: Deferred -->
  <!-- Badge: Memory persisted -->
</div>
```

Badge order: Guardrail blocked → Suppressed → Deferred → Memory persisted (severity order, left to right).

Each badge uses shadcn/ui `Badge` with `variant="outline"` base, overriding className:
- Active: the color classes from DS §5 SimulatorResult badge table
- Inactive: `text-zinc-500 border-zinc-200` (the badge text is the outcome label, still readable in muted neutral)

Badge labels:
- "Guardrail blocked"
- "Suppressed"
- "Deferred"
- "Memory persisted"

#### Section 3 — Guardrail reason (conditional)

Rendered only when `guardrail_reason` is non-null.

```html
<div class="space-y-1">
  <p class="text-xs text-zinc-500 uppercase tracking-wide">Guardrail reason</p>
  <p class="text-sm text-zinc-900">{{ guardrail_reason }}</p>
</div>
```

No card or background — bare text within the result card. Separated from the badge row by `space-y-4` (the container's gap).

#### Section 4 — Metadata footer

```html
<div class="border-t border-zinc-200 pt-3 space-y-1">
  <p class="text-xs text-zinc-500 tabular-nums text-right">{{ duration_ms.toFixed(0) }} ms</p>
  <p class="font-mono text-xs text-zinc-500">{{ session_key }}</p>
</div>
```

Duration is right-aligned because it is a numeric value — tabular-nums applies. Session key is left-aligned monospace — it is an identifier, not a measurement.

### 6.4 Error state

Shown when `simulateMutation.isError`. Uses a red callout — not the DS amber banner (amber is for always-visible advisory warnings, not submission errors).

```html
<div class="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
  <AlertTriangle class="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
  <p class="text-sm text-red-700">{{ error.message }}</p>
</div>
```

Use `error.message` directly — the API client surfaces localised message strings. For `VALIDATION_ERROR` and `PROVIDER_UNREACHABLE`, inline field/form errors take precedence and are shown in the form panel instead of this callout (those error types are handled before reaching the result panel).

---

## 7. Color and token summary

All colors follow DS §1 and §5. No new tokens are introduced. Summary of non-obvious token choices:

| Element | Token/Class | Hex | Rationale |
|---|---|---|---|
| Persist warning banner background | `bg-amber-50` | `#fffbeb` | DS §5 DS-001 amber inline warning |
| Persist warning banner text | `text-amber-800` | `#92400e` | 7.0:1 on amber-50 — WCAG AA |
| Guardrail blocked badge (active) | `bg-red-50 text-red-700 border-red-200` | — | "Blocked" = error terminal state (same as rate_limit ViolationBadge) |
| Suppressed badge (active) | `bg-amber-50 text-amber-700 border-amber-200` | — | "Not delivered" = amber warning convention |
| Deferred badge (active) | `bg-blue-50 text-blue-700 border-blue-200` | — | "Awaiting" = blue informational convention |
| Memory persisted badge (active) | `bg-teal-50 text-teal-700 border-teal-200` | — | AI action = teal application accent |
| Inactive badge text | `text-zinc-500` | `#71717a` | Muted — communicates "this did not fire" without removing the badge |
| Loading spinner | `text-zinc-400 animate-spin` | `#a1a1aa` | Decorative spinner — exempt from text contrast rules |
| Response prose | `text-zinc-900 text-base leading-relaxed` | `#18181b` | Body text — full contrast for LLM response readability |
| Duration value | `text-zinc-500 tabular-nums` | `#71717a` | Metadata — muted, numerically aligned |
| Session key | `font-mono text-zinc-500` | `#71717a` | Identifier — monospace signals machine-generated value |
| Error callout text | `text-red-700` | `#b91c1c` | ~5.6:1 on `bg-red-50` — WCAG AA compliant |

---

## 8. Responsive behavior summary

| Viewport | Form | Result | Notes |
|---|---|---|---|
| `< lg` (< 1024px) | Full width, top | Full width, below form | Single-column scroll |
| `lg` (1024px+) | Left column `2fr` ≈ 40% | Right column `3fr` ≈ 60% | Split pane, same scroll container |

No horizontal scroll is required — the form inputs are `w-full` within their column and the result card text wraps naturally.

Tab overflow: the 9-tab strip may overflow the tab list container at tablet widths. This is already handled by the existing `<div className="overflow-x-auto pb-2">` wrapper in `index.tsx` — the Testing tab trigger inherits this behavior.

---

## 9. Interaction states

| Element | Hover | Focus | Disabled | Loading |
|---|---|---|---|---|
| Select / Input / Textarea | shadcn/ui default (ring on focus) | `focus-visible:ring-ring` | `opacity-50 cursor-not-allowed` | n/a |
| Submit button | `hover:bg-teal-700` (default variant) | shadcn/ui default | `opacity-50 cursor-not-allowed pointer-events-none` | Spinner replaces label |
| Collapsible trigger | `hover:text-zinc-900` | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | n/a | n/a |
| Badge (outcome) | No hover — badges are display-only, not interactive | n/a | n/a | n/a |

---

## 10. Admin-only guard visual note

Non-admin users: the Testing tab trigger is not rendered at all (`{isAdmin && <TabsTrigger>`). There is no placeholder, no tooltip, no locked state. The tab strip for non-admins has 8 tabs; it does not have a 9th greyed-out tab. Rationale: a disabled tab visible to non-admins invites questions about why it is locked. The feature is an admin tool with no non-admin use case — hiding it entirely is the correct product decision.

---

## 11. shadcn/ui components required

Components that may not yet be installed:

| Component | Install command |
|---|---|
| `Collapsible` | `pnpm dlx shadcn@latest add collapsible` |
| `Alert` | `pnpm dlx shadcn@latest add alert` |
| `Checkbox` | `pnpm dlx shadcn@latest add checkbox` (may already be installed for Sessions bulk-select) |
| `Textarea` | shadcn/ui ships this by default; verify at `src/components/ui/textarea.tsx` |

---

## 12. Graphic designer brief

### What to produce

One SVG file: `docs/web/mockups/assistant-testing-tab.svg`

Canvas: 1440px wide (standard desktop viewport). Use the existing `max-w-5xl` content area framing (sidebar at 220px left, content at 1220px, centered with `max-w-5xl`). Height: as tall as needed to show all content — no fixed height constraint. Multiple scenes in a single SVG (labelled regions, stacked vertically or side-by-side with a visual separator) are preferred over multiple files.

### Scene 1 — Full form with advanced options open (populated / pre-submission)

Show the split-pane layout at desktop (`lg+`).

**Left column (form)**:
- Channel: "WhatsApp" selected
- Chat ID: "+441234567890@c.us" filled in
- Direction: "Outbound" selected
- Message textarea: contains sample text "Please check in with the customer about their outstanding invoice."
- Instructions textarea: visible (because Direction is Outbound) with text "Be professional and reference the invoice number if available."
- Persist memory: Checkbox checked (ticked)
- Amber warning banner visible below checkbox: full DS §5 amber tokens (`bg-amber-50 border-amber-200 text-amber-800`), `AlertTriangle` icon, full warning text
- Advanced options Collapsible: open. Chevron rotated 180°. Sender name: "Sales Bot" filled in. Sender ID: "salesbot" filled in.
- Submit button: idle state (not loading), full-width teal-600 "Run simulation"

**Right column (result)**:
- Show the empty state (no run yet): centered muted text "Run a simulation to see the pipeline response."

This scene demonstrates: all form fields, the conditional Instructions field, the always-visible amber warning, the open Collapsible, the persist checkbox.

### Scene 2 — Result card: guardrail-blocked outcome

Show the split-pane layout. Left column shows the form in a compact/collapsed state (advanced options closed, all fields filled but not the focus of this scene — can be lighter in weight). Right column shows the result card.

**Result card**:
- Surface: `rounded-lg border border-zinc-200 bg-white p-6`
- Response area: italic suppressed placeholder text "(No response — message was suppressed)" in `text-zinc-500 italic text-sm`
- Horizontal divider `border-t border-zinc-200`
- Status badge row: "Guardrail blocked" badge ACTIVE (`bg-red-50 text-red-700 border-red-200`), "Suppressed" badge ACTIVE (`bg-amber-50 text-amber-700 border-amber-200`), "Deferred" badge INACTIVE (`text-zinc-500 border-zinc-200`), "Memory persisted" badge INACTIVE (`text-zinc-500 border-zinc-200`)
- Guardrail reason section (visible): label "GUARDRAIL REASON" (`text-xs text-zinc-500 uppercase tracking-wide`), value "Input contained restricted content." (`text-sm text-zinc-900`)
- Metadata footer: duration "312 ms" (right-aligned, muted), session key "whatsapp_+441234567890_c.us" (monospace, muted)

This scene demonstrates: the result card layout, the active/inactive badge states, the guardrail reason section, the suppressed response placeholder.

### Scene 3 — Result card: clean inbound response

Show only the right column result card (form can be abbreviated or omitted in this scene).

**Result card**:
- Response area: a few lines of sample LLM response text. Example: "Hello! I wanted to follow up on your recent order. Everything looks good on our end — your shipment is on track for delivery on Friday. Let me know if you have any questions!" Rendered as plain prose (no markdown formatting needed in the mockup).
- Horizontal divider
- Status badge row: All four badges INACTIVE (`text-zinc-500 border-zinc-200`)
- No guardrail reason section (all badges inactive, reason not applicable)
- Metadata footer: duration "1,847 ms" (right-aligned), session key "telegram_123456789" (monospace, muted)

This scene demonstrates: the clean outcome (all badges inactive), the response prose area, the metadata footer, absence of the guardrail reason section.

### Typography, spacing, and color fidelity requirements

- Font: use Geist or Inter (match the app body font)
- All text sizes must match the DS §2 size scale
- Teal-600 `#0d9488` for the submit button and any teal-tinted elements
- Amber-50/200/700/800 tokens for the persist warning banner
- Red-50/200/700 for the guardrail blocked active badge
- Blue-50/200/700 for the deferred active badge
- Zinc scale for all muted/neutral elements
- Border color: `#e4e4e7` (zinc-200) for all card and form borders
- Card shadow: `shadow-sm` equivalent (very light drop shadow, approximately `0 1px 2px rgba(0,0,0,0.05)`)
- Border radius: `rounded-lg` (8px) for the result card and warning banner; `rounded-xl` for the outer content container if shown

### What NOT to include

- No sidebar or navigation chrome needed — the mockup focuses on the tab content area only
- No mobile layout needed — this is a desktop-only scene (Testing tab is an admin tool; the `lg+` split layout is the primary target)
- No loading state scene needed — the loading state is a simple spinner-in-card that does not require mockup approval; the spec in this brief is sufficient for implementation
