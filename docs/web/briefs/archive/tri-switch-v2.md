# TriSwitch v2 — Design Brief

**Component**: `TriSwitch` (three-position toggle)
**Status**: Specification — ready for implementation
**Author**: web_designer
**Date**: 2026-03-08
**Supersedes**: TriSwitch v1 spec in `docs/web/design-system.md` §5 TriSwitch subsection
**Target file**: `src/pages/chat/ToolsSidebar.tsx` — replace the `TriSwitch` function (lines 44–113)

---

## 1. Design intent

The v2 design is adapted from a reference toggle that uses an oversized thumb relative to a thin track, with fill color extending from the far end toward the thumb. The visual result communicates directionality — the fill pushes in from the extreme, the thumb "reveals" the neutral center when settled there.

This approach is more expressive than the v1 uniform-fill model. It reads as a physical slider rather than a stepped button group. The three states are legible at a glance without relying solely on thumb position.

The aesthetic is adapted to our palette: red/pink is replaced with zinc for the disabled end, and blue replaces the neutral track. The reference used vivid red and green — we map to zinc-400 (disabled), blue-500 (on-demand), and green-500 (loaded), which align with our semantic status colors.

---

## 2. Anatomy

The component has four distinct visual layers rendered in a single `<div>` container:

```
[ outer hit-area div — 44px tall, 72px wide, transparent ]
  [ track bar — centered vertically, 8px tall, 64px wide, rounded-full ]
    [ fill segment — extends from one end, rounded matching that end ]
  [ icon left — ✕ — visible only at position 1 (center) ]
  [ icon right — ✓ — visible only at position 1 (center) ]
  [ thumb circle — 28px diameter, centered vertically, positioned over track ]
```

The thumb overflows the track above and below. The track does not expand — it stays 8px tall. The thumb center is always on the track center line.

---

## 3. Dimensions

### Container (hit area)

- Width: `72px` (fixed, `w-[72px]`)
- Height: `44px` (min-touch target, `h-11`)
- `relative` positioning context for all child layers
- `cursor-pointer` (or `cursor-not-allowed` when disabled)

Rationale: 72px is the minimum width that allows 28px thumb travel across three positions with 4px clearance at each end. 44px height is the WCAG 2.5.5 touch target minimum.

### Track bar

- Width: `64px` — centered horizontally within the 72px container (`left-1 right-1`)
- Height: `8px`
- Positioned: vertically centered via `top-1/2 -translate-y-1/2`, absolute
- `rounded-full` (4px radius, pill)
- Background: `bg-zinc-200` (the base track color, always present)
- No border on the track itself

Rationale: The thin track (8px vs 28px thumb) creates the pronounced oversize effect. The track base color is zinc-200 — the fill segment overlays it.

### Fill segment

- An absolutely positioned `<span>` inside the track
- Full height of the track (`h-full`)
- `rounded-full` on both ends always (the segment may be 0px wide at position 1)
- Width and horizontal position depend on the current position (see §4)
- `transition-all duration-150 ease-in-out`

### Thumb circle

- Diameter: `28px` (`size-7`)
- Shape: `rounded-full`
- Fill: `bg-white`
- Shadow: `shadow-md` (floating elevation — the reference image shows a pronounced shadow)
- Positioned: `absolute top-1/2 -translate-y-1/2`
- Left edge position at each position (see §4)
- `transition-left duration-150 ease-in-out` (Tailwind v4 supports `transition-[left]` or use inline style + `transition`)

### Icons (flanking the thumb at position 1)

- Size: `12px` (`h-3 w-3`)
- Left icon: `X` from Lucide — color `text-red-500` — positioned left of center
- Right icon: `Check` from Lucide — color `text-green-600` — positioned right of center
- Both icons are `absolute`, vertically centered
- Visibility: `opacity-100` at position 1 (center), `opacity-0` at positions 0 and 2
- `transition-opacity duration-150 ease-in-out`
- Pointer events: `pointer-events-none` — icons are purely decorative, the fill covers them at extremes

Icon color rationale:
- `text-red-500` is used here for the ✕ icon because it renders on the neutral zinc-200 track background, not on a white surface. Red-500 (#ef4444) on zinc-200 (#e4e4e7) yields approximately 3.2:1 contrast — above the 3:1 minimum for non-text graphics (WCAG AA §1.4.11). This is the only context in the codebase where red-500 is permitted. See design system §1 WCAG note.
- `text-green-600` is used for the ✓ icon (green-600 = #16a34a, ~4.8:1 on zinc-200, WCAG AA compliant for non-text).

---

## 4. Per-position visual states

### Position 0 — Disabled (thumb left)

The fill extends from the right end of the track toward the thumb. It covers the right portion of the track, leaving the left portion (behind the thumb) showing the base zinc-200. Icons are hidden.

```
Track base:   bg-zinc-200 (full width)
Fill segment: bg-zinc-400, right-0, width spans from right edge to thumb right edge
              width = 64px - (thumb-left + thumb-width) = 64 - (0 + 28) = 36px
              Positioned: right-0, w-[36px] (or equivalent calc)
Icons:        opacity-0
Thumb left:   left-0 (relative to the 64px track, but within the 72px container → left-1)
```

Exact Tailwind classes for fill at position 0:
```
bg-zinc-400, right-0, w-[36px], h-full, rounded-full, absolute
```

Color rationale: zinc-400 (#a1a1aa) on zinc-200 (#e4e4e7) yields ~1.7:1 — the fill does not need to meet text contrast requirements (it is a decorative track fill, not text or an icon boundary). Its purpose is to convey direction and status visually. The thumb itself is the primary affordance.

### Position 1 — On demand (thumb center)

The track shows its bare base color. No fill segment is visible (width = 0 or display hidden). Icons appear flanking the thumb.

```
Track base:   bg-zinc-200 (full width visible)
Fill segment: width = 0 / hidden
Icons:        opacity-100
              Left ✕: positioned at approximately left-[10px] (12px from track left, -6px icon half-width)
              Right ✓: positioned at approximately right-[10px]
Thumb left:   left-[22px] (relative to 64px track → 1px container offset → left-[23px] in container)
              Formula: (64 - 28) / 2 = 18px from track left → 18 + 4 = 22px from container left → left-[22px]
```

The thumb center at position 1 lands at exactly 32px from the track left edge (50% of 64px), matching center.

### Position 2 — Loaded (thumb right)

The fill extends from the left end of the track toward the thumb. It covers the left portion, leaving the right portion showing zinc-200.

```
Track base:   bg-zinc-200 (full width)
Fill segment: bg-green-500, left-0, width = thumb-left position = 36px
              Positioned: left-0, w-[36px], h-full, rounded-full, absolute
Icons:        opacity-0
Thumb left:   left-[36px] (relative to track, 4px container offset → left-[40px] in container)
              Formula: 64 - 28 = 36px from track left → 36 + 4 = 40px from container left → left-[40px]
```

Fill color: `bg-green-500` (#22c55e). Green-500 on zinc-200 provides clear visual distinction. Rationale: green-500 is used here (not green-600) because it is a track fill element, not a text or icon element — it does not require 4.5:1 text contrast. Green-600 (#16a34a) would be used if this were text or a bordered interactive boundary.

---

## 5. Thumb positions — consolidated reference

These are positions of the thumb's left edge within the **72px container** (which includes the 4px horizontal inset of the track).

| Position | Status | Thumb `left` (container) | Fill direction | Fill width |
|---|---|---|---|---|
| 0 | disabled | `left-1` (4px) | from right | `w-[36px]` from right-0 |
| 1 | on_demand | `left-[22px]` | none | 0 |
| 2 | loaded | `left-[40px]` | from left | `w-[36px]` from left-0 |

Derivation:
- Container is 72px, track insets are 4px each side, track width = 64px
- Thumb diameter = 28px
- Position 0: thumb left edge at track left edge = container left + 4px = `left-1`
- Position 2: thumb right edge at track right edge → thumb left = 64 - 28 + 4 = 40px = `left-[40px]`
- Position 1: center of track (32px from track left) is the thumb center → thumb left = 32 - 14 + 4 = 22px = `left-[22px]`

---

## 6. Fill width derivation

At position 0, fill comes from the right. It must cover everything the thumb does not:
- Fill extends from the thumb's right edge to the track's right edge
- Thumb right edge in track coordinates = 0 + 28 = 28px → track right boundary = 64px → fill width = 64 - 28 = 36px

At position 2, fill comes from the left:
- Fill extends from track left edge to the thumb's left edge
- Thumb left edge in track coordinates = 64 - 28 = 36px → fill width = 36px

Both extremes produce the same fill width (36px = container-relative `w-[36px]`). This is by design.

---

## 7. Interaction states

### Hover

- Track border: none in v2 (the track has no border — the design uses fill color only)
- Thumb: subtle lift — `shadow-lg` instead of `shadow-md` on hover (CSS group-hover or direct hover variant on the thumb span)
- No change to fill color or position
- Cursor: `cursor-pointer`

Implementation: wrap the outer container in a group (`group` class on the container), apply `group-hover:shadow-lg` on the thumb span.

### Active (press)

- Thumb scales down slightly: `active:scale-95` on the container (or directly on the thumb span via group-active)
- Duration: `duration-100` (faster than the movement transition, feels physically responsive)

### Focus

- `focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 focus-visible:outline-none`
- Ring wraps the full 72px × 44px container (not just the track)
- `rounded-full` on the container so the ring traces the pill shape

### Disabled

- `opacity-50 cursor-not-allowed pointer-events-none`
- Applied to the outer container

### Loading / pending

- When the mutation is in-flight (`toggling` prop is true), treat as disabled: same `opacity-50 cursor-not-allowed`
- No spinner; the tool row fades to indicate pending state

---

## 8. Accessibility

### ARIA

```tsx
role="slider"
aria-label={`${toolName} status`}
aria-valuemin={0}
aria-valuemax={2}
aria-valuenow={position}
aria-valuetext={TRI_LABELS[position]}   // "Disabled" | "On demand" | "Loaded"
tabIndex={disabled ? -1 : 0}
```

No changes from v1 — the ARIA model is correct.

### Keyboard

- `ArrowRight` / `ArrowUp`: advance position (0→1, 1→2, clamp at 2)
- `ArrowLeft` / `ArrowDown`: retreat position (2→1, 1→0, clamp at 0)
- No click-position logic needed on keyboard — keyboard always steps by 1

### Color independence

The three states are distinguished by:
1. Thumb position (primary affordance — always visible)
2. Track fill color (secondary reinforcement)
3. Flanking icons at center position (tertiary — on-demand state is visually tagged)

No state relies on color alone.

### Icons as aria-hidden

Both `X` and `Check` icons must carry `aria-hidden="true"` and have `focusable={false}`. The `aria-valuetext` on the slider provides the accessible label — the icons are purely visual reinforcement.

---

## 9. ToolRow layout at 320px panel width

The panel is 320px wide. The ToolRow padding is `px-3` (12px each side), leaving 296px of content width. The TriSwitch is `72px` fixed-width. The left content block (`flex-1 min-w-0`) receives 296 - 72 - gap(12px) = 212px. This is sufficient for tool names with truncation (`truncate`).

No layout changes are required to ToolRow for the v2 switch. The existing `shrink-0` on TriSwitch prevents it from compressing.

---

## 10. Implementation notes for web_coder

### State-driven classes

Use a lookup object (same pattern as v1) to map `TriPosition` to Tailwind class strings. For the fill segment, use two separate lookups: one for direction (left vs right positioning) and one for color.

```ts
const FILL_COLOR: Record<TriPosition, string> = {
  0: "bg-zinc-400",
  1: "",            // no fill at center
  2: "bg-green-500",
};

const FILL_POSITION: Record<TriPosition, string> = {
  0: "right-0",
  1: "",
  2: "left-0",
};

// Fill segment is hidden at position 1
const FILL_WIDTH = "w-[36px]";

const THUMB_LEFT: Record<TriPosition, string> = {
  0: "left-1",        // 4px
  1: "left-[22px]",
  2: "left-[40px]",
};
```

### Thumb transition

Use `transition-[left]` (Tailwind v4 arbitrary transition) or `transition-all` restricted scope. Avoid `transition-all` on the container itself — it will attempt to animate the ring on focus. Preferred: apply `transition-[left]` only to the thumb span, `transition-[width,opacity]` to the fill span, and `transition-opacity` to the icon spans.

### No structural change to ToolRow or ToolsSidebar

Only the `TriSwitch` function (lines 63–113) and the lookup constants (lines 44–54) need replacing. The `ToolRow` component, `ToolsSidebar`, and all hooks remain unchanged.

### No new shadcn/ui components needed

This is a pure custom component with Tailwind classes. No `pnpm dlx shadcn` installs required.

---

## 11. Design system update required

After implementation is confirmed working, `docs/web/design-system.md` §5 TriSwitch subsection must be updated to reflect v2 dimensions and the fill-from-end model. The changelog entry should note:

> §5 — TriSwitch updated to v2: oversized thumb (28px on 8px track), fill-from-end model (zinc-400 right-fill at pos 0, green-500 left-fill at pos 2, no fill at pos 1), flanking X/Check icons at center state. Track border removed. Shadow upgraded to shadow-md (idle) / shadow-lg (hover).

This update is the responsibility of `web_designer` after `tester` confirms a clean build.
