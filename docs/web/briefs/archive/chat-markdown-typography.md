# Design Brief: Markdown Typography in Assistant Chat Bubbles

**Brief ID**: chat-markdown-typography
**Date**: 2026-03-09
**Author**: web_designer agent
**For**: graphic_designer
**Status**: Ready for mockup

---

## Overview

The assistant message bubble currently renders LLM responses through `react-markdown` with custom components for only a subset of elements: links, code blocks (`pre`/`code`), and tables. All remaining markdown elements — headings, paragraphs, lists, blockquotes, horizontal rules — fall through to browser defaults. Browser defaults inside a styled bubble surface produce inconsistent sizes, margins that break vertical rhythm, and bullet styles that don't belong to the design system.

This brief defines the complete typography specification for every markdown element that can appear inside an assistant bubble, and instructs the graphic_designer to produce one reference mockup that includes all of them.

---

## Design System Constraints

All decisions below derive strictly from `docs/web/design-system.md`. Tokens:

| Role | Tailwind class | Hex |
|---|---|---|
| Primary text | `text-zinc-900` | `#18181b` |
| Muted text | `text-zinc-500` | `#71717a` |
| Heading text | `text-zinc-900` (same as body — differentiated by size and weight only) | `#18181b` |
| Subtle muted surface | `bg-zinc-50` | `#fafafa` |
| Borders / dividers | `border-zinc-200` | `#e4e4e7` |
| Inline code background | `bg-zinc-100` | `#f4f4f5` |
| Accent / links | `text-violet-600` | `oklch(0.541 0.258 293.54)` |
| Blockquote left border | `border-violet-200` | (violet-200) |
| Font: body | `font-sans` | system stack |
| Font: code | `font-mono` | system monospace |

The bubble container itself uses `text-base leading-relaxed` (16px / line-height 1.75). All markdown typography must compose within this context — children must not reset the container's base font size downward unless stated explicitly.

---

## 1. Container Context

The assistant bubble is:

```
rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm
max-w-[75%]
```

Inside the bubble, markdown content lives in a `div` with `text-base leading-relaxed`. This is the typography root. All spacing below is relative to this context.

The top-level `div` should also add `space-y-3` (12px) between all direct block children. This creates the baseline vertical rhythm between consecutive paragraphs, headings, code blocks, lists, etc.

---

## 2. Heading Hierarchy

**Principle**: headings differentiate from body text through size and weight only. Never use color changes on headings. The markdown heading scale inside a bubble is intentionally compressed — an h1 inside a chat response is not a page title.

| Element | Tailwind classes | Notes |
|---|---|---|
| `h1` | `text-xl font-semibold leading-tight text-zinc-900 mt-4 mb-2` | First heading in bubble: `mt-0` |
| `h2` | `text-lg font-semibold leading-tight text-zinc-900 mt-4 mb-1.5` | |
| `h3` | `text-base font-semibold leading-tight text-zinc-900 mt-3 mb-1` | Same size as body but bold — hierarchically below h2 |
| `h4` | `text-sm font-semibold leading-tight text-zinc-700 mt-3 mb-1` | Slightly muted to signal lower hierarchy |
| `h5` | `text-sm font-medium leading-tight text-zinc-600 mt-2 mb-0.5` | |
| `h6` | `text-sm font-medium leading-tight text-zinc-500 mt-2 mb-0.5` | Muted — lowest heading level |

**Spacing logic**: `mt-` is the spacing above a heading (separating it from the preceding block). `mb-` is the tighter spacing below it (coupling it visually to its following content). When a heading is the first element in the bubble, `mt-0` replaces its standard top margin so it doesn't add unnecessary space below the bubble's `py-3` padding.

**In practice**: h1 and h2 are rare in chat responses. h3 and h4 are the most common structural elements. h5 and h6 should be treated as design curiosities — they exist but LLMs rarely emit them.

---

## 3. Paragraphs

Paragraphs require no additional wrapper class — the `space-y-3` on the container handles block spacing. Individual `p` elements render at `text-base leading-relaxed text-zinc-900` (inherited from the container). No extra margin is applied to `p` elements directly to avoid double-spacing with the `space-y` gap.

**Rule**: the `p` component in `markdownComponents` should render as a plain `p` with no additional margin classes. Container `space-y-3` is the spacing mechanism.

---

## 4. Lists

### Unordered Lists (`ul`)

```
list-disc pl-5 space-y-1 text-base text-zinc-900
```

- `list-disc`: standard filled-circle bullet. No custom SVG markers — the design is minimal and disc is readable.
- `pl-5` (20px): standard left indent. Aligns bullet outside the text column.
- `space-y-1` (4px): compact spacing between items for single-line list items.
- Nested `ul` inside an `li`: additional `pl-4 mt-1 list-disc` — one extra indent level, same bullet style.

### Ordered Lists (`ol`)

```
list-decimal pl-5 space-y-1 text-base text-zinc-900
```

- `list-decimal`: standard Arabic numerals.
- Same indent and spacing as `ul`.
- Nested `ol` inside an `li`: `pl-4 mt-1 list-decimal`.

### List Items (`li`)

```
leading-relaxed
```

List items inherit `text-base` from the container. `leading-relaxed` ensures multi-line items read cleanly. No additional class needed — items that contain multiple paragraphs will space them via `space-y-1` on the item itself, but this is rare in LLM output.

### Compact vs Loose Lists

The distinction is handled automatically: `space-y-1` keeps single-line items tight. When an `li` contains a full paragraph (multi-sentence), the relaxed line height provides visual separation. No additional variant is needed.

### Nesting

Maximum two levels of nesting should be shown in the mockup. Three levels is theoretically possible but not a design priority.

---

## 5. Blockquotes

Blockquotes signal quoted or highlighted content — citations, caveats, pulled phrases. They must be visually distinct but not garish.

```
border-l-2 border-violet-200 bg-violet-50/40 pl-4 py-1 text-zinc-600 italic my-2 rounded-r-sm
```

**Rationale for choices**:
- `border-l-2 border-violet-200`: a 2px left accent bar using the violet scale. Violet is the system's accent — it signals "this is marked/highlighted content" without being alarming. `border-zinc-300` was considered but reads as a structural divider, not a semantic marker.
- `bg-violet-50/40`: a very faint violet tint (40% opacity) on the background. Subtle enough to not distract but grounds the element. `bg-zinc-50` was considered and is acceptable as an alternative if the violet tint reads as too colorful in context — see mockup review note below.
- `text-zinc-600`: slightly muted versus body `text-zinc-900`. This signals the quote is attributed/secondary content, not the primary response voice. `text-zinc-600` (#52525b) yields 7.03:1 on white — WCAG AA compliant.
- `italic`: standard typographic convention for quoted content.
- `pl-4 py-1`: left padding creates space between the border bar and text. Vertical padding provides breathing room.
- `rounded-r-sm`: subtle rounding on the right side only. Matches the bubble's own rounding language.

**Nested blockquotes**: A blockquote inside a blockquote adds another `border-l-2 border-violet-100 pl-3` layer. The inner border uses `violet-100` (lighter) to distinguish depth. Nested quotes should be shown in the mockup as they occasionally appear in LLM summarization output.

**Mockup review note for graphic_designer**: Render both `bg-violet-50/40` and `bg-zinc-50` variants side by side in a small callout area below the main bubble. The web_designer will select one after reviewing the mockup.

---

## 6. Code Blocks (Fenced)

### Current State

```
pre: overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm leading-relaxed
code (block): passthrough with className
```

### Additions Required

The current `pre` implementation is correct but incomplete. The mockup must show the following additions:

**Copy button**: positioned absolute top-right inside the `pre` element's parent wrapper. The `pre` itself should be wrapped in a `relative` container so the button can be placed with `absolute top-2 right-2`. Button style: `ghost` variant, `h-6 w-6 p-0`, icon-only (clipboard icon, 14px). On hover: `bg-zinc-100`. Tooltip "Copy" appears on hover.

**Language label**: when a fenced block opens with a language identifier (e.g., ` ```python `), display the language name as a small label. Placement: top-left of the block, inside the `pre` background area. Style: `text-xs font-medium text-zinc-400 font-mono`. It sits on the same row as the copy button.

**Layout**: the `pre` wrapper becomes a flex column. First row: `flex items-center justify-between px-3 pt-2 pb-1` containing language label (left) and copy button (right). Second row: the scrollable code content with `px-3 pb-3 pt-0`.

**Horizontal scroll**: already handled by `overflow-x-auto`. The mockup should show a code block whose content exceeds the bubble width to demonstrate horizontal scroll (show scroll shadow or faded right edge).

**Max height**: code blocks do not have a max height. LLM code output should be allowed to extend naturally — the chat scroll container handles overflow. Do not add `max-h` to code blocks.

**Inline code** (inside fenced block): `code` inside `pre` renders as `font-mono text-sm` without background — the `pre` background is already providing the surface.

---

## 7. Inline Code

```
rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm text-zinc-900
```

The current implementation is correct. No changes needed. The mockup should show inline code within a paragraph sentence to confirm it reads correctly at `text-base` bubble context (the `text-sm` inline code will appear slightly smaller than body text, which is intentional — code tokens are distinct from prose).

---

## 8. Horizontal Rules

```
border-t border-zinc-200 my-4
```

- `border-t border-zinc-200`: a single 1px horizontal line using the standard border token.
- `my-4` (16px): generous top and bottom margin. Horizontal rules appear rarely in LLM output and signal major content breaks — they warrant more breathing room than standard block spacing.
- No decorative treatment (no dashes, no double lines).

---

## 9. Images

LLM responses rarely contain images in this product context, but `react-markdown` renders `img` elements from markdown. A reasonable default:

```
max-w-full rounded-md my-2
```

- `max-w-full`: image never overflows the bubble width.
- `rounded-md`: matches the code block border radius for consistency.
- `my-2` (8px): modest vertical margin.
- Alt text: rendered as standard HTML `alt` attribute only (not displayed as visible caption). If the image fails to load, the browser alt text mechanism applies.

The mockup does not need to show an image element — the specification above is sufficient for the coder.

---

## 10. Tables

The current table implementation is already styled and correct:

```
table wrapper: my-2 overflow-x-auto
table: min-w-full border-collapse text-sm
thead: border-b border-zinc-200 bg-zinc-50
th: px-3 py-1.5 text-left text-xs font-medium tracking-wide text-zinc-500
td: border-b border-zinc-100 px-3 py-1.5 text-zinc-900
```

The mockup must include a table to confirm visual integration with surrounding markdown elements, but no specification changes are needed.

---

## 11. Bold and Italic (Inline)

These are inline elements with no explicit custom components in `markdownComponents` — they fall through to browser defaults, which are correct:

- `strong` / `b`: browser default `font-bold` (700). Correct — no override needed.
- `em` / `i`: browser default `italic`. Correct — no override needed.

The mockup should include both within a paragraph sentence to confirm they compose cleanly against `leading-relaxed` body text.

---

## 12. Links

```
text-violet-600 underline hover:text-violet-700
```

Already implemented. Unsafe URLs render as `text-zinc-500` plain text (no underline, no pointer). The mockup should show one safe link and one demonstration of the unsafe-URL fallback (render as muted span).

---

## 13. Vertical Rhythm Summary

The complete spacing model inside an assistant bubble:

| Element | Top spacing | Bottom spacing | Mechanism |
|---|---|---|---|
| First element in bubble | 0 (absorbed by `py-3` padding) | — | `mt-0` override |
| Consecutive blocks | 12px between | — | `space-y-3` on container |
| `h1` above content | 16px above | 8px below | explicit `mt-4 mb-2` |
| `h2` above content | 16px above | 6px below | explicit `mt-4 mb-1.5` |
| `h3` above content | 12px above | 4px below | explicit `mt-3 mb-1` |
| Horizontal rule | 16px above and below | — | explicit `my-4` |
| Blockquote | 8px above and below | — | explicit `my-2` |
| Code block | within `space-y-3` flow | — | no extra margin needed |
| List | within `space-y-3` flow | — | no extra margin needed |
| List items | 4px between | — | `space-y-1` on `ul`/`ol` |

The goal is a document that breathes evenly. No element should feel glued to the one above it, and no element should feel disconnected by excessive white space.

---

## 14. Streaming State

### Cursor Placement

The streaming cursor (`inline-block h-4 w-0.5 bg-zinc-900 align-middle`) is appended after the last character of the last rendered markdown element. When the last element is a paragraph, the cursor appears inline with the text. When the last element is a heading, it appears after the heading text. When the last element is a list item, it appears after the last item's text.

The cursor must not appear as a standalone block element — it must always be inline with content. The CSS animation class `streaming-cursor` handles the opacity blink (`@keyframes blink` — opacity 1 to 0 to 1, 1s ease-in-out infinite).

### Partial Markdown States

When tokens arrive mid-structure, `react-markdown` parses the growing string continuously. Common partial states to consider:

**Opening heading without content**: `## ` with no following text. The parser emits an empty heading. The `h2` renders visibly as an empty block. This is acceptable — it lasts only a few hundred milliseconds before content follows.

**Opening fenced code block without closing**: ` ``` ` without the closing fence. `remark-gfm` treats unclosed fences as inline code or plain text until closed. The visual result is imperfect but temporary. No special handling is specified — the render will self-correct once the closing fence arrives.

**Opening list without second item**: A `- ` with one item renders correctly as a single-item list. No issue.

**Cursor at end of code block**: The streaming cursor should not appear inside the `pre` element. The cursor is appended after the `ReactMarkdown` output in the DOM, so it will naturally appear after the closing code block, not inside it. This is the correct behavior.

### Streaming Mockup State

The mockup should include a second panel (below the complete-message panel) showing a mid-stream state:

- Partial heading rendered with cursor at the end of its text: `## Key Consider|` (cursor shown as a vertical bar in the mockup)
- A completed paragraph above it
- A partial fenced code block below the heading that is still "open" (show as plain text or partial render)
- The cursor blinking position should be clearly marked — use a filled rectangle shape in the mockup

---

## 15. Mockup Specification

### File

`docs/web/mockups/chat-markdown-typography.svg`

### Canvas

- Width: 1000px
- Height: sufficient to contain both panels (likely 1400–1800px)
- Background: `#f4f4f5` (zinc-100) — simulates the chat page background

### Panel 1: Complete Message (Full Markdown)

An assistant bubble at `max-width: 750px`, left-aligned (matching `justify-start` layout). White background (`#ffffff`), `border: 1px solid #e4e4e7`, `border-radius: 16px` (top-right, top-left, bottom-right rounded; bottom-left has a reduced radius, approximately 4px — the "tail" corner).

The bubble content must include, in this order:

1. **h1**: "Understanding Markdown Rendering"
2. **Paragraph**: two sentences of body text containing a **bold** phrase and an *italic* phrase.
3. **h2**: "Core Concepts"
4. **Paragraph**: one sentence containing an `inline code` span and a [safe link](#).
5. **h3**: "Lists"
6. **Unordered list** with three items, the third item having a nested unordered sub-list with two items.
7. **h3**: "Sequence"
8. **Ordered list** with three items.
9. **Blockquote**: two sentences, one of which contains an `inline code` span.
10. **Fenced code block**: Python snippet (8–10 lines), with language label "python" top-left and copy button top-right.
11. **Horizontal rule**.
12. **Table**: three columns, four rows (including header row).
13. **h2**: "Summary"
14. **Paragraph**: closing sentence.

### Panel 2: Streaming State

A second assistant bubble below the first, separated by 48px of background space. This bubble shows a mid-stream state:

- A completed paragraph.
- An h2 heading with the streaming cursor immediately after its text.
- Below the heading: a partial fenced code block (three lines of code visible, no closing fence — render as the parser would produce).
- The streaming cursor should be visible as a `2px × 16px` black rectangle immediately after the last character of the heading text.

### Typography Annotations

Annotate the SVG with dimension callouts for:
- Heading sizes (h1, h2, h3) — label the computed px size
- `space-y-3` gap between blocks — show a measurement indicator
- Blockquote left border width (2px) and padding-left (16px)
- Code block padding (12px all sides)
- List indent (pl-5 = 20px)

Use zinc-400 (#a1a1aa) for annotation lines and labels. Annotations should be clearly distinct from the bubble content (use dashed lines for measurement indicators).

### Blockquote Variant Callout

Below Panel 2, add a small 400px-wide side-by-side comparison:
- Left: blockquote with `bg-violet-50/40` tint
- Right: blockquote with `bg-zinc-50` tint

Label each. The web_designer will select one after reviewing the mockup.

---

## 16. What the Mockup Is Not

The mockup does not need to render:

- User bubbles (not relevant to this brief)
- System or tool messages
- The surrounding chat page layout (sidebar, header, input area)
- Dark mode (not in the design system)
- Mobile layout (the specification is desktop-first; responsive behavior is handled in implementation)

---

## 17. Implementation Notes for web_coder

These notes accompany the mockup and brief for the coder's reference:

- All changes are confined to `src/pages/chat/markdownComponents.tsx`. No other files require modification.
- The code block copy button requires a `useState` for copy-success feedback (brief flash of "Copied" text or checkmark icon swap for 1.5s). This is a minor interactive state — use `sonner` toast only if the copy API fails; success is shown inline in the button.
- The `pre` component in `markdownComponents` needs to be refactored from a plain `pre` to a wrapper `div` containing a header row and the `pre`. The `pre` itself no longer carries the padding — the wrapper `div` does.
- `space-y-3` on the markdown container: this should be applied as a `prose-spacer` wrapper `div` in `AssistantBubble` and `StreamingMessageBubble`, not inside `markdownComponents` itself. The container `div` that currently has `text-base leading-relaxed` should add `space-y-3`.
- Do not use Tailwind Typography plugin (`@tailwindcss/typography` / `prose` classes). All typography is specified explicitly in `markdownComponents.tsx` to maintain full control over each element's appearance within the design system.
