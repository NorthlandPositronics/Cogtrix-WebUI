# Optimize Prompt Toggle — Design Brief

**Prepared by**: web_designer
**Date**: 2026-03-24
**Design system version**: 3.6
**Target**: graphic_designer (mockup), then web_coder (implementation)
**Status**: Approved for mockup
**Component file**: `src/pages/chat/MessageInput.tsx`
**Mockup output path**: `docs/web/mockups/optimize-prompt-toggle.svg`

---

## Background

The backend WebSocket `user_message` payload accepts `optimize_prompt?: boolean`. When `true`, the backend routes the user's prompt through an optimizer before forwarding it to the LLM. The WebUI currently never sends this field, so the feature is inaccessible. This brief introduces a toggle button inside the existing `MessageInput` bar to expose this capability.

This is a toggle control, not a send-time action — the user sets a preference that persists across messages until they change it. It is an opt-in enhancement, not a default behavior change.

---

## Design Decision — Placement

The optimize-prompt toggle belongs **inside the input bar, between the mode dropdown and the textarea** — placed to the left of the textarea. This location:

1. Groups it with other pre-send message configuration controls (the mode dropdown is already there).
2. Keeps it visually distinct from the send/cancel controls on the right, which are action buttons, not configuration controls.
3. Does not require a new row or additional chrome — the existing `flex items-end gap-2` layout accommodates it.

**Rejected alternative — to the right of the textarea, before Send**: Placing a persistent toggle immediately before the Send button risks it being read as part of the "send flow" rather than a persistent preference. The mode dropdown and this toggle are both pre-flight configuration; they belong on the same (left) side.

**Rejected alternative — toolbar above the textarea**: A separate toolbar row adds layout complexity and visual weight that is not warranted for a single toggle. The design principle is to keep the input bar compact and single-row.

---

## Visual Specification

### Button structure

An icon-only ghost button using the shadcn/ui `Button` component with `variant="ghost"` and `size="sm"`. This matches the mode dropdown trigger exactly: same `min-h-11 shrink-0` height, same `variant="ghost"` weight. The button label text is hidden (icon-only); a `Tooltip` from shadcn/ui provides the accessible label on hover.

```
[Mode dropdown] [Optimize button] [Textarea] [Send | Cancel]
```

### Icon

`Sparkles` from lucide-react at `w-4 h-4` (16px inline-with-text scale per DS §10). The `Sparkles` icon communicates "AI enhancement" — a natural pairing for a prompt optimization feature that adds intelligence to the user's input before sending.

### States

#### Off state (default)

```
icon color:  text-zinc-500
background:  none (ghost — no fill at rest)
hover:       hover:bg-zinc-100 (shadcn/ui ghost default)
```

`text-zinc-500` (#71717a) is required — not `text-zinc-400`. Rationale: DS §5 ghost icon-only buttons on white surfaces require `text-zinc-500` minimum for WCAG 1.4.11 compliance (4.7:1 on white). `text-zinc-400` yields only 2.56:1 and is prohibited for interactive icon controls on white.

#### On state (active)

```
icon color:  text-teal-600
background:  bg-teal-50
border:      none (no border added — consistent with ghost pattern on hover surfaces)
hover:       hover:bg-teal-100
```

Rationale for `text-teal-600` on `bg-teal-50`: teal-600 (#0d9488) on teal-50 (#f0fdfa) yields approximately 5.22:1 contrast — meets WCAG AA. The teal-50 fill visually communicates "this setting is active" using the same language as other active-state surfaces in the system (user message bubbles use `bg-teal-50 border-teal-200`; TriSwitch position-1 track uses `bg-teal-100` with `bg-teal-500` thumb). The pattern is established: teal surface = accent active state.

#### Disabled state

Applied when `disabled || isAgentRunning` — matching the mode dropdown's disabled condition exactly.

```
opacity:  opacity-50 (shadcn/ui built-in via disabled prop)
cursor:   cursor-not-allowed
```

Do not change the icon color or background in the disabled state — let `opacity-50` communicate the disabled state uniformly, consistent with DS §8.

### Tooltip

Shadcn/ui `Tooltip` wrapping the button. Content:

- Off: "Optimize prompt"
- On: "Prompt optimization on"

The tooltip appears on hover after shadcn/ui's default delay (400ms). No additional tooltip styling is needed — defaults are correct.

`aria-label` on the button must also reflect the current state (not just the tooltip). The `aria-label` should be:
- Off: `"Optimize prompt (off)"`
- On: `"Optimize prompt (on)"`

This makes the state readable to screen readers without requiring tooltip activation. The tooltip is supplementary.

### Active state indicator

No badge, no dot, no checkmark. The `bg-teal-50` fill on the button is the sole active-state indicator. Rationale: adding a separate indicator (a dot, a checkmark overlay) creates visual noise in a compact bar. The color change is sufficient and is consistent with the pattern used by the mode dropdown trigger in its selected state (where the icon color shifts to convey the current mode).

---

## Layout within MessageInput

Current MessageInput layout at rest (from `MessageInput.tsx`):

```
flex items-end gap-2
├── [Mode dropdown trigger]   min-h-11 shrink-0
├── [Textarea]                flex-1
└── [Send button]             min-h-11 shrink-0
```

New layout:

```
flex items-end gap-2
├── [Mode dropdown trigger]   min-h-11 shrink-0
├── [Optimize button]         min-h-11 shrink-0
├── [Textarea]                flex-1
└── [Send button]             min-h-11 shrink-0
```

The `gap-2` (8px) between controls is unchanged. The textarea retains `flex-1` — the additional button narrows the available textarea width by approximately 44px (the `min-h-11` / 44px square), which is acceptable.

**Mobile behavior** (< sm): The mode dropdown already hides its text label below `sm:` breakpoint, showing only the icon. The optimize button is icon-only at all breakpoints, so no responsive modification is needed. The overall input bar remains usable on mobile.

---

## State management

The toggle state (`optimizePrompt: boolean`) lives in `MessageInput` local state, initialized by the `defaultOptimizePrompt` prop described below. It persists across message sends (it is not reset in `handleSend` the way `mode` is currently reset to `"normal"` after each send).

Rationale for persistent state: the user is expressing a workflow preference ("I always want my prompts optimized in this session"), not a per-message one-shot action. Resetting after each send would require the user to re-toggle for every message, defeating the purpose.

### Props changes required

`MessageInputProps` gains two new optional props:

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `defaultOptimizePrompt` | `boolean` | `false` | Initial toggle state — set to `true` when `prompt_optimizer` is enabled in the session's config |
| `onSend` signature change | see below | — | Passes `optimizePrompt` flag on send |

The `onSend` callback signature must be updated from:

```ts
onSend: (text: string, mode: MessageMode) => void
```

to:

```ts
onSend: (text: string, mode: MessageMode, optimizePrompt: boolean) => void
```

This is a breaking change to the `onSend` interface. The `session.tsx` (or `chat/` sub-component that owns the send handler) must be updated to accept and forward the new `optimizePrompt` argument to the WebSocket `user_message` payload.

**Architect coordination required**: Before implementation, the architect must confirm that the `user_message` WebSocket payload type in `streaming-store.ts` or `session-socket.ts` already accommodates `optimize_prompt?: boolean`, or that a type update is needed. This brief does not prescribe the WebSocket layer change — only the UI layer.

### Config-driven default

When the session's config `prompt_optimizer` flag is `true` (read from `useConfigQuery`), `defaultOptimizePrompt` should be passed as `true` to `MessageInput`. This gives the button an initial ON state when the global setting is enabled, reflecting the user's expressed preference at the account level.

`defaultOptimizePrompt` is an initialization signal only — it sets the initial `useState` value. After mount, the user can toggle freely without the prop overriding them. Do not use `useEffect` to sync the prop after mount — that would remove user agency.

---

## Interaction states summary

| State | Icon color | Background | Tooltip |
|---|---|---|---|
| Off, rest | `text-zinc-500` | none | "Optimize prompt" |
| Off, hover | `text-zinc-500` | `hover:bg-zinc-100` | "Optimize prompt" |
| On, rest | `text-teal-600` | `bg-teal-50` | "Prompt optimization on" |
| On, hover | `text-teal-600` | `hover:bg-teal-100` | "Prompt optimization on" |
| Disabled (any) | inherited (opacity-50) | inherited (opacity-50) | — |
| Focus | `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring` | — | — |

Focus ring uses `ring-ring` (resolves to `ring-zinc-400` per DS §1 semantic tokens). This is a standard ghost button — it does not get the TriSwitch-specific `ring-teal-600` treatment. The TriSwitch exception (DS §5) is specific to that component.

---

## Color compliance table

| Element | Class | Hex | Contrast | WCAG |
|---|---|---|---|---|
| Icon off | `text-zinc-500` | #71717a | 4.7:1 on white | AA pass (1.4.11) |
| Icon on | `text-teal-600` | #0d9488 | 5.22:1 on teal-50 | AA pass (1.4.3) |
| Active bg | `bg-teal-50` | #f0fdfa | — | Surface only |
| Hover active | `hover:bg-teal-100` | #ccfbf1 | — | Surface only |

---

## Mockup instructions for graphic_designer

Produce one SVG at `docs/web/mockups/optimize-prompt-toggle.svg`.

### Canvas

Width: 900px. Height: 200px. Show the `MessageInput` bar in isolation — no need to render the full chat page. Background: white (`#ffffff`), matching the MessageInput surface.

Include a `border-t border-zinc-200` rule at y=0 (the top of the component) to show the bar's attachment to the chat area above it. The bar itself: `bg-white px-4 py-3`.

### Show four variants stacked in a 2×2 grid

Label each variant clearly outside the component bounds.

**Variant A — Off state, empty textarea**

Layout (left to right inside the `flex items-end gap-2` row):
- Mode dropdown trigger: ghost button, `MessageSquare` icon 16px `text-zinc-500`, label "Normal" `text-sm text-zinc-500 hidden sm:inline`, `ChevronDown` 16px `text-zinc-500`
- Optimize button: ghost, `Sparkles` 16px **`text-zinc-500`**, no fill
- Textarea: `min-h-11 flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500`, placeholder text "Send a message..."
- Send button: `bg-teal-600 text-white`, `SendHorizontal` 20px, label "Send" `hidden sm:inline`, disabled (no text in textarea)

Annotate the optimize button with: "off state — `text-zinc-500`, no bg fill"

**Variant B — On state, empty textarea**

Same layout as A except:
- Optimize button: `bg-teal-50`, `Sparkles` 16px **`text-teal-600``**
- Send button remains disabled

Annotate the optimize button with: "on state — `text-teal-600`, `bg-teal-50`"

**Variant C — On state, text in textarea**

Same as B except:
- Textarea shows placeholder replaced by text: "Summarise this article for me"
- Send button is enabled (full teal, not disabled)
- Optimize button: same on-state treatment as B

This variant shows the normal ready-to-send state with optimization active.

**Variant D — Disabled state (agent running)**

Same layout as C except:
- Mode dropdown: `opacity-50`
- Optimize button: `opacity-50`
- Textarea: `opacity-50`
- Send button replaced by Cancel button: `variant="outline"`, `Square` icon 20px, label hidden

Annotate: "disabled — `opacity-50` on mode + optimize + textarea; agent running replaces Send with Cancel"

### Annotations required

Include the following callout annotations (lines pointing to the relevant elements):

1. Pointing to the optimize button in Variant B:
   - "`Sparkles` w-4 h-4"
   - "`text-teal-600` — DS §1 accent"
   - "`bg-teal-50` — DS §1 light surface"
   - "contrast 5.22:1 on teal-50 — WCAG AA"

2. Pointing to the optimize button in Variant A:
   - "`text-zinc-500` — DS §5 ghost icon on white"
   - "contrast 4.7:1 — WCAG AA"

3. Pointing to the tooltip on Variant B (show a floating tooltip above the button):
   - Tooltip content: "Prompt optimization on"
   - Show shadcn/ui tooltip shape: `rounded-md bg-zinc-900 text-white text-xs px-2 py-1`

4. Pointing to the layout row:
   - "Position: between mode dropdown and textarea"
   - "Same `min-h-11 shrink-0` as mode dropdown trigger"

### Color reference key

At the bottom of the artboard, include a small color swatch legend:

| Swatch | Label | Hex |
|---|---|---|
| teal-600 fill | Active icon | #0d9488 |
| teal-50 fill | Active background | #f0fdfa |
| teal-100 fill | Active hover | #ccfbf1 |
| zinc-500 fill | Inactive icon | #71717a |
| zinc-100 fill | Inactive hover | #f4f4f5 |

---

## Component inventory update (for design system)

After the mockup is approved and implementation is complete, add to DS §12 component inventory:

| Component | Variants | shadcn/ui base | Pages |
|---|---|---|---|
| `OptimizePromptButton` (inline in `MessageInput`) | off, on, disabled | `Button` (ghost) + `Tooltip` | Session chat page — MessageInput bar |

---

## Implementation notes for web_coder (post-mockup approval)

These are implementation-layer notes to accompany the mockup. They do not override the mockup — the mockup is the build target.

1. Install `Tooltip` from shadcn/ui if not already present: `pnpm dlx shadcn@latest add tooltip`. Verify it exists under `src/components/ui/tooltip.tsx` before adding.

2. The button's `className` in the on-state should use conditional classes: `cn("min-h-11 shrink-0", optimizePrompt ? "bg-teal-50 text-teal-600 hover:bg-teal-100" : "text-zinc-500 hover:bg-zinc-100")`. Do not use inline `style` for these overrides.

3. The `onSend` callback update is a breaking interface change. Update the call site in the session page before or alongside updating `MessageInput`. Type-checking (`pnpm build`) will surface any missed call sites.

4. Do not add `data-cy` attributes until the tester agent requests them. The `data-cy="optimize-prompt"` attribute on the button is the natural choice when Cypress tests are written.

5. The toggle must not affect the `mode` reset logic. After a send, `mode` is currently reset to `"normal"`. `optimizePrompt` must not be reset — it is a persistent preference, not a one-message flag.
