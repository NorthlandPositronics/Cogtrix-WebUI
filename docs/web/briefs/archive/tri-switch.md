# Layout Brief: TriSwitch Component

**Brief ID**: S2-M4
**Prepared by**: web_designer
**Date**: 2026-03-08
**Design system version**: 2.0
**Target agent**: graphic_designer
**Depends on**: `docs/web/design-system.md` §1, §2, §3, §5

---

## Purpose

Produce an SVG mockup showing the `TriSwitch` component in all meaningful visual states. The TriSwitch is a three-position toggle track used in each `ToolRow` inside the Tools sidebar panel. It replaces the previous two-control design (separate Switch + Load button). The mockup must cover: all three positions in resting state, hover, keyboard-focus, disabled, and a ToolRow context frame showing the control in situ.

---

## What the component communicates

The three positions map to the tool's operational status:

| Position | Label | Semantic meaning |
|---|---|---|
| 0 — left | Disabled | Tool is excluded from the LLM's tool set |
| 1 — middle | On demand | Tool is enabled; the LLM may invoke it when relevant |
| 2 — right | Loaded | Tool is actively loaded into the LLM's context this turn |

The control must communicate "there are three discrete stops, not a continuous range" without requiring the user to read a tooltip. Semantic color reinforces position meaning. Position indicators on the track make the discrete stops visible even before the user interacts.

---

## 1. Dimensions

### Track

- Width: **64px**
- Height: **24px**
- Border radius: `rounded-full` — track is a pill shape, so radius = 12px
- The track is the outermost element. Its bounding box is exactly 64 × 24px.

Rationale for 64px: the existing 52px track is too narrow to accommodate three clearly separated thumb positions with 2px padding on each end. 64px gives three 20px zones (left edge to center: 0px, 22px, 44px from left-inner-edge), each large enough to be click-targeted on desktop. The height increases from 20px to 24px to match the larger thumb and improve touch ergonomics.

### Thumb

- Size: **20 × 20px** (circular, `rounded-full`)
- The thumb sits inside the track with **2px clearance** on all sides (track height 24px − thumb 20px = 4px total vertical clearance, 2px each side).
- Thumb center positions (measured from track left edge):
  - Position 0: thumb center at **12px** from left (thumb left edge at 2px)
  - Position 1: thumb center at **32px** from left (thumb left edge at 22px)
  - Position 2: thumb center at **52px** from left (thumb left edge at 42px)

These positions produce equal 20px spacing between thumb centers (12 → 32 → 52px).

### Touch target

The TriSwitch `div` must have a minimum touch target of **44 × 44px**. Achieve this by wrapping the 64 × 24px visual track in a container with `min-h-11` (44px height) and centering the track vertically. The visual track does not grow — only the interactive hit area expands. Show this in the mockup as a faint dashed bounding box around the control.

---

## 2. Track appearance

### Per-position fill colors

| Position | Track fill | Tailwind | Hex |
|---|---|---|---|
| 0 — Disabled | `bg-zinc-200` | zinc-200 | `#e4e4e7` |
| 1 — On demand | `bg-blue-100` | blue-100 | `#dbeafe` |
| 2 — Loaded | `bg-green-100` | green-100 | `#dcfce7` |

Rationale for changing from the current implementation's colors (`zinc-300`, `blue-400`, `green-500`): The current saturated track fills (blue-400, green-500) compete with the semantic status badges in the ToolRow. The design system uses saturated semantic colors only when they are the primary carrier of information. Here the thumb position already carries the primary signal; the track color is secondary confirmation. Reducing track saturation to 100-level tints gives the color semantic meaning without overpowering the row. The thumb itself carries the position-specific accent color at full saturation.

### Track border

All positions: `border border-zinc-200` (1px, `#e4e4e7`). The border provides shape definition on white panel backgrounds where a fill-only track would lose its edges. The border color is constant — it does not change per position.

### No inner shadow on track

The track is flat (no inset shadow, no gradient). Rationale: the design system elevation model uses `shadow-sm` for raised elements and no shadow for flat surfaces. The track is a flat indicator surface, not an elevated element.

---

## 3. Thumb appearance

### Fill

The thumb fill is white for position 0, and carries a semantic tint for positions 1 and 2:

| Position | Thumb fill | Tailwind | Hex |
|---|---|---|---|
| 0 — Disabled | `bg-white` | white | `#ffffff` |
| 1 — On demand | `bg-blue-500` | blue-500 | `#3b82f6` |
| 2 — Loaded | `bg-green-600` | green-600 | `#16a34a` |

Rationale: the thumb is the focal point — the element the eye tracks during movement. Giving the thumb a saturated fill at positions 1 and 2 makes the active state immediately readable without requiring the user to observe thumb position. Position 0 (Disabled) uses white to signal inactivity; a colored thumb at the disabled position would imply the tool is doing something.

### Thumb border

Position 0: `border border-zinc-300` — adds definition to the white thumb on the light zinc-200 track.
Positions 1 and 2: no separate border — the colored fill provides sufficient contrast against the light-tinted track.

### Thumb shadow

All positions: `shadow-sm` (elevation: raised). The shadow lifts the thumb off the track plane and communicates that it is a draggable / interactive element. This is consistent with the design system's "raised" elevation level for interactive sub-elements.

### Thumb transition

Thumb translates horizontally on position change: `transition-transform duration-150 ease-in-out`. No scale change during transition — the thumb does not "squish" or "stretch".

---

## 4. Position indicators (tick marks)

Three small tick dots are inset into the track to mark the three stop positions. These are the primary affordance that communicates "three discrete positions" rather than a continuous slider.

### Tick dot specification

- Shape: circle
- Size: **4px diameter**
- Color: `bg-zinc-400` (`#a1a1aa`) when the track area behind them is light (positions 0, 1, 2 tinted tracks)
- Vertical position: centered within the track (track center Y = 12px)
- Horizontal positions (measured from track left inner edge, inside the 2px padding zone):
  - Left tick: **12px** from left edge (aligns with position-0 thumb center — sits behind the thumb when at position 0)
  - Middle tick: **32px** from left edge (aligns with position-1 thumb center)
  - Right tick: **52px** from left edge (aligns with position-2 thumb center)

The ticks sit beneath the thumb on the track plane. When the thumb is at a given position, it covers that position's tick dot. The two visible ticks (those not covered by the thumb) provide orientation cues showing the other available positions.

**Color adjustment when covered by colored thumb**: The ticks at positions 1 and 2, when uncovered, appear on the light-tinted track (blue-100 or green-100). Use `rgba(0,0,0,0.25)` for tick color so they are visible on both the light-tinted areas and the white/light-zinc areas. Do not use zinc-400 directly — it loses contrast on the blue-100 track. Show the tick dot color at `rgba(0,0,0,0.25)` in the mockup annotations.

---

## 5. Labels and hints

### No inline labels on the control itself

The TriSwitch does not render position labels ("Disabled", "On demand", "Loaded") as visible text on or beneath the control. Rationale: the Tools panel is a compact 320px-wide sidebar. Adding labels to the control would either require a wider control (disrupting the row layout) or require very small text below the control (which would fail WCAG AA contrast at xs size). The tooltip (via `title` attribute) is the disclosure mechanism for label text.

### Tooltip

The TriSwitch renders `title={TRI_LABELS[position]}` on the track element. This provides a native browser tooltip on hover (desktop) and serves as the accessible text for the current position. The tooltip content per position:
- Position 0: "Disabled"
- Position 1: "On demand"
- Position 2: "Loaded"

### ARIA

The element uses `role="slider"` with `aria-valuemin={0}`, `aria-valuemax={2}`, `aria-valuenow={position}`, `aria-valuetext={TRI_LABELS[position]}`. Show this in the mockup's annotation column — it is not a visual element but graphic_designer should note that the accessible name is carried by `aria-label={"{toolName} status"}`.

---

## 6. Hover state

On hover (`hover:` pseudo-class on the track):

- Track border color intensifies: `border-zinc-300` → `border-zinc-400`
- Track background: no change to fill color (the color is position-semantic, not interaction feedback)
- Cursor: `cursor-pointer`
- The thumb does not scale up on hover

Show the hover state for position 1 (On demand) in the mockup. The subtle border darkening is the only visual change — annotate this explicitly so it is not mistaken for an error.

---

## 7. Active (pressed) state

While the mouse button is depressed on the track:

- Thumb scale: `scale-90` (transforms to 18×18px visible size while maintaining layout)
- Duration: immediate (no transition on the press-down scale; the `scale-90` is an instant visual acknowledgment)

The active state is transient and may be omitted from the static mockup, but include an annotation describing it.

---

## 8. Disabled state

When `disabled={true}` is passed (e.g., a status mutation is in flight):

- Entire control: `opacity-50`
- Cursor: `cursor-not-allowed`
- No interaction: pointer events are ignored

Show the disabled state for position 1 (On demand) in the mockup. The track and thumb appear at 50% opacity over the white panel background — the washed-out appearance is the visual signal. Do not add any additional treatment (no stripe, no overlay).

---

## 9. Keyboard focus state

When the track receives keyboard focus (`focus-visible:` pseudo-class):

- Focus ring: `focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 focus-visible:outline-none`
- Ring color: violet-600 (`oklch(0.541 0.258 293.54)`, `#7c3aed` approximate hex)
- Ring width: 2px
- Ring offset: 2px (gap between track edge and ring)
- The ring wraps the outer pill shape of the track (radius matches the track's rounded-full)

Show the focus state for position 2 (Loaded) in the mockup. The violet ring is the design system's universal focus indicator and must be clearly visible.

Keyboard interaction (for annotation only — not a visual element):
- `ArrowRight` / `ArrowUp`: advance one position (wraps at max)
- `ArrowLeft` / `ArrowDown`: retreat one position (wraps at min)

---

## 10. ToolRow context frame

The mockup must include a full ToolRow showing the TriSwitch in situ. Show three ToolRow examples at full 320px panel width:

### ToolRow layout

```
┌─────────────────────────────────────────────┐
│  [Tool name]  [badge]   [MCP?]   [TriSwitch]│
│  [short description text, truncated]         │
└─────────────────────────────────────────────┘
```

Row container: `flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5`

Left block (`min-w-0 flex-1`):
- Top line: tool name `text-sm font-medium text-zinc-900` + optional MCP badge `Badge variant="outline" text-xs`
- Bottom line: `text-xs text-zinc-500 mt-0.5` (truncated with ellipsis at 180px approximate)

Right block (`shrink-0`): the TriSwitch (64 × 24px visual, 44px touch target height)

Alignment: the TriSwitch is vertically centered in the row (`items-center` on the row flex container). If the tool has a description (two-line row), the TriSwitch aligns to the row's center Y, not to the top line's center Y.

Gap between left block and TriSwitch: `gap-3` (12px).

### Suggested ToolRow examples for the mockup

Show three rows demonstrating the three positions:

| Tool name | Description | MCP | Position | Badge |
|---|---|---|---|---|
| web_search | Search the web for current information | No | 2 — Loaded | `bg-green-50 text-green-700` "Loaded" |
| file_reader | Read files from the workspace | No | 1 — On demand | `bg-blue-50 text-blue-700` "On demand" |
| calendar_events | Read and create calendar events | Yes | 0 — Disabled | `bg-zinc-50 text-zinc-500` "Disabled" |

Note: the status badge in the ToolRow left block reflects the tool's status with a text label and colored background. This badge is separate from the TriSwitch — it is a display-only element. The TriSwitch is the interactive control. Both appear in the same row but serve different roles (information vs. control). The mockup should make this distinction clear — the badge is on the left, the switch is on the right.

---

## 11. Mobile considerations

At mobile breakpoints (below `lg`, 1024px), the Tools panel renders inside a shadcn/ui `Sheet` (full-width overlay from the right). The TriSwitch itself does not change size or layout between desktop and mobile. The 44px minimum touch target height is the sole mobile accommodation — this is achieved at both breakpoints through the row's `min-h-11` container.

The 64px track width is fixed at both breakpoints. On mobile the panel is full viewport width (320px+), so horizontal space is not a concern.

Do not show a separate mobile frame in this mockup. The TriSwitch does not change between desktop and mobile sheet contexts. A note in the mockup annotation is sufficient.

---

## 12. Mockup output specification

**File**: `docs/web/mockups/tri-switch.svg`

**Canvas**: 800px wide × 600px tall (portrait, component-focused — not a full page mockup)

**Content layout**:

1. **Top section — Component states grid** (positions × interaction states)

   Arrange as a grid, 4 columns × 4 rows:

   | | Resting | Hover | Focus | Disabled |
   |---|---|---|---|---|
   | Position 0 | show | show | — | show |
   | Position 1 | show | show | — | show |
   | Position 2 | show | — | show | — |

   Label each row ("Position 0 — Disabled", etc.) in `text-xs text-zinc-500` left of the grid.
   Label each column header in `text-xs font-medium text-zinc-400 uppercase tracking-wide` above the grid.

2. **Middle section — ToolRow context** (3 rows at 320px width)

   Show the three ToolRow examples at actual proportional scale within a 320px-wide panel fragment. Include the panel's left border (`border-l border-zinc-200`) and right edge to establish spatial context.

3. **Bottom section — Annotations**

   Callout lines (thin zinc-300 lines with zinc-500 text labels) pointing to:
   - The track fill (position-semantic, not interaction)
   - The thumb (position indicator, carries accent color at positions 1 and 2)
   - The tick dots ("discrete stop indicators")
   - The focus ring on the focus-state example
   - The 44px touch target bounding box on one example

**Background**: white (`#ffffff`)

**No decorative borders** around the mockup frame itself.

**Scale**: 1:1 pixel-accurate. All dimensions in this brief are final pixel values, not relative.
