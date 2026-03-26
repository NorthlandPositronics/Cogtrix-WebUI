# Layout Brief: NewSessionDialog — Advanced Config Fields

**Component**: `NewSessionDialog`
**Location**: `src/pages/sessions/NewSessionDialog.tsx`
**Triggered by**: "New Session" button on `/sessions` page (existing trigger, unchanged)
**Pattern reference**: Existing three-field form in `NewSessionDialog.tsx` — field spacing, label placement, and select sizing must match exactly.

---

## 1. Context and Purpose

The backend `SessionConfig` schema exposes three fields that have no current creation-time UI:

- `system_prompt: string | null` — custom system prompt for this session (up to 32768 chars)
- `max_steps: number | null` — max agent loop iterations, range 1–200 (null = global default)
- `context_compression: boolean | null` — per-session override (null = use global setting)

These fields are intentionally advanced — most users will not need them on session creation. They must not add visual weight to the dialog for first-time or casual users. The solution is a collapsible "Advanced" section collapsed by default, appended below the existing three fields.

---

## 2. Dialog Structure

The existing `DialogContent` uses `max-w-lg`. This width is retained — it is wide enough to display the textarea at a readable line length without expanding the modal footprint.

```
Dialog
└── DialogContent  max-w-lg
    ├── DialogHeader
    │   ├── DialogTitle        "New Session"
    │   └── DialogDescription  "Configure and create a new chat session."
    ├── div.space-y-4           ← form body (existing)
    │   ├── [Name field]        ← existing, unchanged
    │   ├── [Model select]      ← existing, unchanged
    │   ├── [Memory mode select] ← existing, unchanged
    │   └── [Advanced section]  ← NEW — see §3
    └── DialogFooter
        ├── Button variant="outline"  "Cancel"
        └── Button (primary)          "Create"
```

The "Advanced" section is added as the fourth child of the `div.space-y-4` container. No structural change to the outer dialog shell, header, or footer.

---

## 3. Advanced Section

### 3.1 Trigger row

```
button.flex.w-full.items-center.justify-between.rounded-md.px-0.py-1.5
    .text-sm.font-medium.text-zinc-700
    .hover:text-zinc-900
    .focus-visible:outline-none.focus-visible:ring-2.focus-visible:ring-ring.focus-visible:ring-offset-2
    .transition-colors.duration-150
├── span  "Advanced"
└── ChevronDown  h-4 w-4 text-zinc-400  (rotates 180° when expanded: rotate-180 transition-transform duration-200)
```

The trigger is a full-width `<button type="button">` (not `Button` variant — it has no background and carries no elevation). It sits flush with the form body's left edge. The `ChevronDown` icon provides the only affordance that this row is interactive.

**Collapsed state (default)**: chevron points down, advanced fields are hidden (`hidden` class or zero-height with `overflow-hidden`).

**Expanded state**: chevron points up (rotated 180°), advanced fields visible.

**Collapsed by default rationale**: `system_prompt`, `max_steps`, and `context_compression` are power-user overrides. Showing them by default adds three visible form fields to what is currently a three-field dialog — doubling its apparent complexity for a majority of users who will never touch these settings. Progressive disclosure via the "Advanced" label sets correct expectations without hiding the capability entirely.

### 3.2 Advanced field container

When expanded, a `div.space-y-4.pt-2` renders below the trigger row (inside the same parent `div.space-y-4`, so the gap between the trigger row and the first advanced field is the standard `space-y-4` spacing, not an extra container margin).

```
div.space-y-4.pt-2     ← pt-2 adds 8px breathing room between trigger row and first field
├── [System prompt field]  — §3.3
├── [Max steps field]      — §3.4
└── [Context compression field]  — §3.5
```

A thin horizontal rule `<hr class="border-zinc-200">` separates the trigger row from the field container visually. It renders between the trigger button and the `div.space-y-4.pt-2`, not inside the field container itself.

### 3.3 System prompt field

```
div.space-y-1.5
├── Label htmlFor="session-system-prompt"  "System prompt"
└── Textarea
      id="session-system-prompt"
      placeholder="Override system prompt for this session (optional)"
      rows={4}
      className="min-h-[96px] resize-y text-sm"
      maxLength={32768}
      disabled={isLoading}
```

- `rows={4}` (96px min height — 4 lines of `text-sm` at `leading-normal`). This is a fixed initial height, not an auto-grow textarea. The user can resize manually via `resize-y`.
- `maxLength={32768}` enforces the backend limit at the input level.
- No character counter is shown. The textarea is not required; a null/empty value means "do not override".
- `text-sm` inside the textarea matches the size used for all other form inputs in this dialog.
- When the dialog is loading (`isLoading`), the textarea is disabled (`opacity-50 cursor-not-allowed` via shadcn disabled style).

**Sizing rationale**: 96px (4 rows) is sufficient to display a one-paragraph prompt without scrolling. The `resize-y` handle allows users who need to write longer prompts to expand the textarea within the dialog without overflowing the viewport (the dialog itself is scrollable on short viewports).

### 3.4 Max steps field

```
div.space-y-1.5
├── Label htmlFor="session-max-steps"  "Max steps"
└── div.flex.items-center.gap-3
    ├── Input
    │     id="session-max-steps"
    │     type="number"
    │     min={1}
    │     max={200}
    │     placeholder="100"
    │     className="w-24"
    │     disabled={isLoading}
    └── span.text-sm.text-zinc-500  "default: 100, max: 200"
```

- `type="number"` with `min={1}` `max={200}` constraints. The input is `w-24` (96px) — wide enough for a three-digit number.
- A helper span to the right reads "default: 100, max: 200". It uses `text-sm text-zinc-500` (muted foreground). This communicates both the implicit default (null = 100) and the ceiling without requiring a separate help section.
- An empty value means null (use global default). The coder should treat `""` as null in the request payload.

### 3.5 Context compression toggle

```
div.flex.items-center.justify-between
├── div.space-y-0.5
│   ├── Label htmlFor="session-context-compression"  "Context compression"
│   └── p.text-xs.text-zinc-500  "Use global setting when off"
└── Switch
      id="session-context-compression"
      checked={form.contextCompression ?? false}
      onCheckedChange={(checked) => setForm(...)}
      disabled={isLoading}
```

- The label sits left, the Switch sits right — a standard row layout used throughout the settings page for boolean toggles.
- A sub-label `p.text-xs.text-zinc-500` "Use global setting when off" clarifies that unchecked means `null` (not `false`). The coder should distinguish between: switch not touched (null — use global), switch checked (true — force enabled), switch explicitly unchecked (false — force disabled). Initial state: unchecked (null).
- Uses shadcn/ui `Switch` component at its default size.

---

## 4. Complete Expanded State (Annotation for Mockup)

The mockup should show the dialog in **expanded state** so all fields are visible. A second frame showing the **collapsed state** (just the trigger row visible, no fields) is also required for comparison.

```
┌─────────────────────────────────────────────────────────┐
│  New Session                                             │
│  Configure and create a new chat session.                │
│─────────────────────────────────────────────────────────│
│  Name                                                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Untitled Session                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Model                                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Default                                     ▾     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Memory mode                                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Default                                     ▾     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Advanced                                          ▴     │  ← trigger row, expanded
│─────────────────────────────────────────────────────────│  ← hr border-zinc-200
│  System prompt                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Override system prompt for this session (optio... │  │
│  │                                                   │  │
│  │                                                   │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Max steps                                               │
│  ┌────────┐  default: 100, max: 200                      │
│  │  100   │                                              │
│  └────────┘                                              │
│                                                          │
│  Context compression               ┌──┐                  │
│  Use global setting when off       │  │                  │  ← switch, unchecked
│                                    └──┘                  │
│─────────────────────────────────────────────────────────│
│                       [Cancel]  [Create]                 │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Interaction States

| State | Behavior |
|---|---|
| Collapsed (default) | "Advanced" trigger row visible; no fields below it; chevron points down |
| Expanded | Chevron rotates to point up; hr divider appears; three fields render |
| isLoading (submit pending) | All fields disabled (opacity-50); Cancel and Create buttons disabled |
| System prompt empty | null sent in request payload — no system_prompt override |
| Max steps empty | null sent — backend uses global default (100) |
| Context compression unchecked | null sent — backend uses global setting |
| Context compression checked | true sent |
| Advanced section re-collapse | User can click trigger to re-collapse; field values are preserved |

---

## 6. Token and Class Reference

All classes must be sourced from the design system. No arbitrary values.

| Element | Classes |
|---|---|
| Advanced trigger button | `flex w-full items-center justify-between rounded-md px-0 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Chevron icon (collapsed) | `h-4 w-4 text-zinc-400 transition-transform duration-200` |
| Chevron icon (expanded) | `rotate-180` added |
| Section divider | `border-zinc-200` |
| Advanced field container | `space-y-4 pt-2` |
| Label (all fields) | shadcn/ui default (`text-sm font-medium`) |
| Helper text | `text-xs text-zinc-500` |
| System prompt textarea | `min-h-[96px] resize-y text-sm` |
| Max steps number input | `w-24` |
| Max steps helper span | `text-sm text-zinc-500` |
| Switch sub-label | `text-xs text-zinc-500` |

---

## 7. Mockup Deliverables

The `graphic_designer` must produce one SVG file:

**`docs/web/mockups/new-session-dialog-advanced.svg`**

The SVG must contain two frames side by side:

1. **Frame A — Collapsed** (default state): Shows the full dialog with the Advanced trigger row visible and collapsed. No advanced fields visible below it.

2. **Frame B — Expanded**: Shows the full dialog with the Advanced section open, all three fields visible. Use the box layout from §4 as the guide.

SVG dimensions: each frame approximately 540px wide. Total canvas approximately 1200px wide × 700px tall with a gap and label between frames.

Use the established mockup palette: white dialog background, `#e4e4e7` borders, `#18181b` primary text, `#71717a` muted text, `#0d9488` for the primary Create button, zinc fills for inputs. No gradients, no decorative shadows beyond the dialog backdrop overlay.

---

## 8. Implementation Notes (for web_coder, not for graphic_designer)

- The Advanced section's collapse state is local UI state (`useState(false)`) — not persisted to any store.
- The state resets to collapsed when the dialog closes (handled in `handleOpenChange` which already resets `form` to `INITIAL_FORM`).
- `SessionCreateRequest.config` gains three new optional fields: `system_prompt?: string`, `max_steps?: number`, `context_compression?: boolean`. Null/empty values must be omitted from the request (same pattern as `model` and `memory_mode`).
- The Switch initial state is a three-way concept (null / true / false). Model it as `contextCompression: boolean | null` in `FormState`, initial value `null`. A null Switch renders as unchecked; a user toggle sets it to `true`; a second toggle sets it to `false`. The sub-label "Use global setting when off" covers the null→false ambiguity: from the user's perspective, unchecked always means "use global", regardless of whether that was the initial null or a deliberate false.
