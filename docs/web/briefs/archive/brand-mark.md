# Graphic Designer Brief — Cogtrix Brand Mark

**Brief ID**: brand-mark
**Date**: 2026-03-23
**Requested by**: web_designer
**Design system version**: 3.6
**Status**: Ready for production

This brief is complete and self-contained. Produce all assets listed in §6 without further input. Every dimension, color, and geometry value is specified. Do not introduce additional visual elements (gradients, shadows, decorative strokes, connector lines).

---

## 1. The mark concept

The Cogtrix C-mark is a 270° arc opening to the right, with filled node circles at the open tips. The gap between the tips is the conceptual center of the mark — it reads as a synapse or spark gap. The nodes frame the gap; they must not be connected. The mark is stroke-based: arc stroke + filled circles, nothing else.

Arc direction: counterclockwise from bottom-right to top-right, passing through the left (west) side. In SVG terms: `large-arc=1, sweep=0`.

---

## 2. Colors

| Role | Value |
|---|---|
| Teal-600 (mark color on white background) | `#0d9488` |
| White (mark color on teal background; also background color) | `#ffffff` |

No other colors. No opacity variations. No gradients.

---

## 3. Arc geometry — all sizes

The arc geometry follows a single formula. For a canvas of size W×H (square), center C = (W/2, H/2), radius R:

- Arc start (bottom-right, 45°): `x = Cx + R*cos(45°)`, `y = Cy + R*sin(45°)`
- Arc end (top-right, 315°): `x = Cx + R*cos(45°)`, `y = Cy - R*sin(45°)`
- Because cos(45°) = sin(45°) = √2/2 ≈ 0.70711, both x coordinates are identical.
- SVG path: `M {start_x} {start_y} A {R} {R} 0 1 0 {end_x} {end_y}`

All arcs use `stroke-linecap="round"` and `fill="none"`.

---

## 4. File specifications

### 4.1 `public/favicon.svg` — replace existing file

**Purpose**: Browser tab favicon, bookmarks. Primary SVG favicon.

**Canvas**: `width="32" height="32" viewBox="0 0 32 32"`

**Background**: White circle — `<circle cx="16" cy="16" r="16" fill="#ffffff"/>`

**Arc**:
- Center: (16, 16)
- Radius: 11.5
- Start point (45°): (24.132, 24.132)
- End point (315°): (24.132, 7.868)
- `d="M 24.132 24.132 A 11.5 11.5 0 1 0 24.132 7.868"`
- `stroke="#0d9488"`, `stroke-width="4.5"`, `stroke-linecap="round"`, `fill="none"`

**Nodes**: One node only — upper tip.
- `<circle cx="24.132" cy="7.868" r="2.5" fill="#0d9488"/>`

**No lower node. No connector line.**

The current file already matches this specification exactly. Verify and confirm — no change may be needed.

---

### 4.2 `public/favicon-32x32.svg` — DELETE this file

This file is an exact duplicate of `favicon.svg` and serves no distinct purpose. Delete it from the `public/` directory. The web_coder will remove its `<link>` tag from `index.html`.

---

### 4.3 `public/favicon-192x192.svg` — fix existing file

**Purpose**: PWA manifest icon / Android home screen.

**Canvas**: `width="192" height="192" viewBox="0 0 192 192"`

**Background**: White circle — `<circle cx="96" cy="96" r="96" fill="#ffffff"/>`

**Arc**:
- Center: (96, 96)
- Radius: 74
- Start point (45°): (148.326, 148.326)  — `96 + 74*0.70711 = 148.326`
- End point (315°): (148.326, 43.674)    — `96 - 74*0.70711 = 43.674`
- `d="M 148.326 148.326 A 74 74 0 1 0 148.326 43.674"`
- `stroke="#0d9488"`, `stroke-width="21"`, `stroke-linecap="round"`, `fill="none"`

**Nodes**: Two nodes.
- Upper: `<circle cx="148.326" cy="43.674" r="13" fill="#0d9488"/>`
- Lower: `<circle cx="148.326" cy="148.326" r="9" fill="#0d9488"/>`

**REMOVE**: The `<line>` element with `stroke-dasharray="4 8"` that connects the two tips. This element exists in the current file and must be deleted entirely. It contradicts the mark concept — see DS §0.3.

**No connector line of any kind.**

---

### 4.4 `public/apple-touch-icon.svg` — verify existing file

**Purpose**: iOS Safari home screen / tab icon. iOS applies its own rounded-rect mask — the file is full-bleed square.

**Canvas**: `width="180" height="180" viewBox="0 0 180 180"`

**Background**: Teal full-bleed rect — `<rect width="180" height="180" fill="#0d9488"/>`
(Do NOT use a circle — iOS masks the square to rounded rect, full-bleed coverage is required.)

**Arc**:
- Center: (90, 90)
- Radius: 66
- Start point (45°): (136.669, 136.669)  — `90 + 66*0.70711 = 136.669`
- End point (315°): (136.669, 43.331)    — `90 - 66*0.70711 = 43.331`
- `d="M 136.669 136.669 A 66 66 0 1 0 136.669 43.331"`
- `stroke="#ffffff"`, `stroke-width="19"`, `stroke-linecap="round"`, `fill="none"`

**Nodes**: Two nodes — white on teal.
- Upper: `<circle cx="136.669" cy="43.331" r="11" fill="#ffffff"/>`
- Lower: `<circle cx="136.669" cy="136.669" r="7.5" fill="#ffffff"/>`

**No connector line.**

The current file already matches this specification exactly (it already has 2 nodes, no connector). Verify and confirm — no change may be needed.

---

### 4.5 `public/logo.svg` — CREATE this file (does not exist)

**Purpose**: Scalable in-app logomark for sidebar header, login page, and mobile header. Used as an inline SVG component (`<SidebarLogo />`).

**Canvas**: `viewBox="0 0 28 28"` — NO `width` or `height` attributes. The consuming component sizes it via CSS (`width="22"` or `width="40"` etc.).

**Background**: None. Transparent. The host element provides its own background.

**Arc**:
- Center: (14, 14)
- Radius: 10
- Start point (45°): (21.071, 21.071)  — `14 + 10*0.70711 = 21.071`
- End point (315°): (21.071, 6.929)    — `14 - 10*0.70711 = 6.929`
- `d="M 21.071 21.071 A 10 10 0 1 0 21.071 6.929"`
- `stroke="#0d9488"`, `stroke-width="3.5"`, `stroke-linecap="round"`, `fill="none"`

**Nodes**: Two nodes (this is a ≥64px rendered context — the sidebar renders it at 22px CSS pixels but on 2× displays it is 44px, so two nodes are correct and readable).
- Upper: `<circle cx="21.071" cy="6.929" r="2.2" fill="#0d9488"/>`
- Lower: `<circle cx="21.071" cy="21.071" r="1.6" fill="#0d9488"/>`

**No background circle. No connector line.**

The file must include a `<desc>` element:
```xml
<desc>Cogtrix logomark — C mark for in-app UI use. Part of design system v3.6.</desc>
```

---

### 4.6 `public/manifest.webmanifest` — CREATE this file (does not exist)

**Purpose**: PWA manifest — enables Android home screen installation and correct icon use.

Exact content:

```json
{
  "name": "Cogtrix",
  "short_name": "Cogtrix",
  "description": "Cogtrix AI assistant",
  "icons": [
    {
      "src": "/favicon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d9488"
}
```

This is a JSON/webmanifest file, not an SVG. The graphic designer produces the SVG assets; the manifest is a companion deliverable in this same brief because its content is entirely defined by the brand colors and icon inventory.

---

## 5. `index.html` changes — for web_coder

After the graphic designer produces the files above, web_coder must update `index.html`:

**Remove**:
```html
<link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32x32.svg" />
```

**Add**:
```html
<link rel="manifest" href="/manifest.webmanifest" />
```

Final `<head>` icon/manifest block:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
<link rel="manifest" href="/manifest.webmanifest" />
```

---

## 6. Sidebar integration — for web_coder

**New component**: `src/components/SidebarLogo.tsx`

Renders the contents of `public/logo.svg` as an inline SVG. The SVG is inlined (not `<img>`) to avoid a network request and to allow the component to accept a `className` prop for sizing.

Props: `{ className?: string }` — forwarded to the `<svg>` element.

Default size: apply `width="22" height="22"` on the `<svg>` element when no className overrides dimensions.

**Sidebar header** — replace the current content of the `<div className="px-4 py-4">` block in `Sidebar.tsx`:

Current:
```tsx
<span className="text-lg font-semibold text-zinc-900">Cogtrix</span>
```

Required:
```tsx
<div className="flex items-center space-x-2">
  <SidebarLogo />
  <span className="text-lg font-semibold text-zinc-900">Cogtrix</span>
</div>
```

---

## 7. Delivery checklist

The graphic designer delivers the following. Each item is independently reviewable.

| # | Deliverable | Action | Notes |
|---|---|---|---|
| 1 | `public/favicon.svg` | Verify unchanged | Must match §4.1 exactly — likely no edit needed |
| 2 | `public/favicon-32x32.svg` | Delete file | Confirmed duplicate |
| 3 | `public/favicon-192x192.svg` | Remove connector line | Delete the `<line stroke-dasharray="4 8">` element |
| 4 | `public/apple-touch-icon.svg` | Verify unchanged | Must match §4.4 exactly — likely no edit needed |
| 5 | `public/logo.svg` | Create new file | Full spec in §4.5 |
| 6 | `public/manifest.webmanifest` | Create new file | Full spec in §4.6 |

Items 2 and 3 require file edits. Items 1 and 4 require verification only. Items 5 and 6 are net-new files.

After graphic designer delivers items 1–6, web_coder implements:
- `index.html` changes (§5)
- `src/components/SidebarLogo.tsx` (§6)
- Sidebar header update in `src/components/Sidebar.tsx` (§6)
