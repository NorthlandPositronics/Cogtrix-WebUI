# Chat and Documents Page — Mockup vs. Implementation Reconciliation

**Date**: 2026-03-23
**Design system version**: 3.6
**Mockups audited**:
- `docs/web/mockups/chat-desktop.svg` (1440×900)
- `docs/web/mockups/chat-mobile.svg` (390×844)
- `docs/web/mockups/documents-desktop.svg` (1440×900)

**Implementations audited**:
- `src/pages/chat/SessionPage.tsx`
- `src/pages/chat/SessionHeader.tsx`
- `src/pages/chat/MessageBubble.tsx`
- `src/pages/chat/StreamingMessageBubble.tsx`
- `src/pages/chat/StatusBar.tsx`
- `src/pages/chat/MessageInput.tsx`
- `src/pages/chat/MemoryPanel.tsx`
- `src/pages/chat/ToolsSidebar.tsx`
- `src/pages/chat/PanelShell.tsx`
- `src/pages/chat/TypingIndicator.tsx`
- `src/pages/documents.tsx`
- `src/pages/documents/DocumentCard.tsx`
- `src/pages/documents/SemanticSearchBar.tsx`
- `src/pages/documents/DocumentUploadDialog.tsx`
- `src/components/Sidebar.tsx`
- `src/components/SidebarLogo.tsx`
- `src/components/AgentStateBadge.tsx`

**Reviewer**: web_designer

---

## Pre-audit notes

### ToolConfirmationModal open state

The `ToolConfirmationModal` open state is absent from both chat mockups. This is intentional and documented in DS §16 D-001. `web_coder` must build it directly from DS §5 (Dialogs): `max-w-xl`, 6-button grid `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`, suppressed close button via `[&>[data-slot=dialog-close]]:hidden`. No correction is needed — the existing implementation is correct.

### Failed badge border (Documents)

DS §16 D-002 records that the `documents-desktop.svg` mockup depicts the failed badge border as `#fca5a5` (red-300), but the DS §5 badge pattern is authoritative and requires `border-red-200` (`#fecaca`). The mockup value is a minor inaccuracy in the SVG. The correction listed in the summary below follows DS §5, not the SVG.

---

## 1. Chat Page — Desktop (`chat-desktop.svg`)

### 1.1 Sidebar

The sidebar in the mockup uses `bg-zinc-50` (#fafafa), `border-r border-zinc-200`, the C-mark logomark at 22×22px followed by the "Cogtrix" wordmark at `text-lg font-semibold text-zinc-900`, and nav items at `text-sm` with active state `bg-teal-50 text-teal-600` and inactive state `text-zinc-500`. The bottom section shows a user avatar circle with initial letter, username text, and a logout icon button.

The implementation in `Sidebar.tsx` matches the mockup structure faithfully. The active nav item uses `border-teal-600 bg-teal-50 text-teal-600`. The implementation adds a `border-l-2 border-transparent` at rest (to prevent layout shift on activation) which is a pure-implementation concern absent from the mockup. The bottom section uses a shadcn/ui `Avatar` with `bg-teal-50 text-teal-700` fallback, a role `Badge`, and a "Sign out" ghost button — these are additive improvements over the mockup's simpler placeholder.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Sidebar nav inactive icon color | `stroke="#71717a"` (zinc-500) | `text-zinc-400` on icons when nav item is inactive, `text-zinc-600` on the label | ACCEPTED | Nav icons rendered alongside always-visible text labels may use `text-zinc-400` per DS §10 (icon supplement to label). |
| Sidebar bottom — user display | Simple avatar circle + username text + logout icon | Avatar with teal fallback + role Badge + "Sign out" ghost button with label | ACCEPTED | The implementation is richer than the mockup placeholder. All additions comply with DS. |
| Sidebar nav — border-l-2 at rest | No left border shown | `border-l-2 border-transparent` at rest, `border-teal-600` when active | ACCEPTED | Layout-shift prevention; invisible at rest. Not a visual change. |

### 1.2 Session Header

The mockup specifies `h-14 bg-white border-b border-zinc-200 px-4`. Left: ChevronLeft ghost button `h-11 w-11 text-zinc-500`. Center: session name at `text-base font-medium text-zinc-900`, AgentStateBadge below it. Right: model select `h-8 w-32`, Trash2 ghost, Brain ghost (active: `bg-teal-50 text-teal-600`), Wrench ghost. Mobile mockup specifies model select `w-24`.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Session header height | `h-14` (56px) | `h-14` | Matches | — |
| ChevronLeft ghost button | `h-11 w-11 text-zinc-500` | `h-11 w-11`, `text-zinc-500` on icon | Matches | — |
| Session name | `text-base font-medium text-zinc-900`, centered | `text-base font-medium text-zinc-900` on inline button, centered via `flex-col items-center` | Matches | — |
| AgentStateBadge below name | Teal pulse dot + label `text-sm font-medium text-teal-700` | `text-sm font-medium text-teal-700` per STATE_CONFIG | Matches | — |
| Model selector desktop | `h-8 w-32` | `h-8 w-24 lg:w-32` | Matches (narrower on mobile as specified in mobile mockup; `lg:w-32` matches desktop spec) | — |
| Brain button active state | `bg-teal-50 text-teal-600` | `bg-teal-50 text-teal-600` with `hover:bg-teal-100` | Matches | — |
| Wrench button | Shown in mockup with inactive state (zinc-500); no active bg | `bg-teal-50 text-teal-600` when `toolsPanelOpen` | ACCEPTED | Active styling for Tools button mirrors Memory button — consistent with DS active-toggle pattern even though mockup only shows Brain active. |
| Trash2 ghost button | `text-zinc-500` at rest | `text-zinc-500 hover:text-zinc-900` | Matches | — |
| Session name is editable (click to rename) | Not shown in mockup | Inline edit with Input + error handling | ACCEPTED | Additive feature; does not contradict mockup visual. |
| ConnectionStatusDot (when WS not open) | Not shown in mockup | Replaces AgentStateBadge when not connected | ACCEPTED | Runtime state not depicted in mockup. DS §6 specifies this component. |

### 1.3 Message Bubbles

#### User bubble

Mockup: `justify-end`, `max-w-[75%]`, `rounded-2xl rounded-br-sm`, `border border-teal-200 bg-teal-50`, `text-base text-zinc-900`, timestamp `text-xs text-zinc-500` right-aligned below bubble.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| User bubble colors | `bg-teal-50 border border-teal-200` | `border border-teal-200 bg-teal-50` | Matches | — |
| User bubble rounding | `rounded-2xl rounded-br-sm` | `rounded-2xl rounded-br-sm` | Matches | — |
| User bubble max-width | `max-w-[75%]` | `max-w-[75%]` | Matches | — |
| Timestamp | `text-xs text-zinc-500` right-aligned | `text-right text-xs text-zinc-500` | Matches | — |

#### Assistant bubble

Mockup: `justify-start`, `max-w-[75%]`, `rounded-2xl rounded-bl-sm`, `border border-zinc-200 bg-white shadow-sm`, content `text-base text-zinc-900`, tool call summary row below a `border-t border-zinc-200` divider with `Check` icon `text-green-600`, tool name in `font-mono text-xs`, duration `text-zinc-500`.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Assistant bubble colors | `bg-white border border-zinc-200 shadow-sm` | `border border-zinc-200 bg-white shadow-sm` | Matches | — |
| Tool call summary divider | `border-t` at `border-zinc-200` | `border-t border-zinc-100 pt-1.5` | REQUIRED | Mockup and DS both specify `border-zinc-200` for dividers (DS §5 Border dividers). The implementation uses `border-zinc-100`, which is a lighter, non-standard value. Fix: change `border-zinc-100` to `border-zinc-200` in `MessageBubble.tsx` line 78. |
| ToolCallSummary tool name color | Mockup shows `text-zinc-900` (fill="#18181b") | `text-zinc-700` | ACCEPTED | `text-zinc-700` is DS-compliant for secondary text. The mockup's fill value was not precisely specified as a DS token; `text-zinc-700` is marginally more muted but not a contrast violation. |
| ToolCallSummary timestamp below bubble | Not shown (no timestamp on assistant bubble) | `text-xs text-zinc-500` timestamp below bubble | ACCEPTED | Additive; timestamp on completed messages is useful context. |

#### System bubble

Mockup: `justify-center`, `max-w-[60%]`, `bg-zinc-100 rounded-md`, `text-sm text-zinc-600 italic`, timestamp centered below.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| System bubble | `bg-zinc-100 rounded-md text-sm text-zinc-600 italic` | `rounded-md bg-zinc-100 px-3 py-1.5 text-center text-sm text-zinc-600 italic` | Matches | — |

#### Tool output bubble

Mockup: `justify-start`, `max-w-[85%]`, `bg-zinc-50 border border-zinc-200 border-l-2 border-l-zinc-400 rounded-md`, monospace text `text-sm text-zinc-900`, label row `text-xs text-zinc-500 font-mono` below.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Tool bubble left accent | `border-l-2 border-l-zinc-400` | `border border-l-2 border-zinc-200 border-l-zinc-400` | Matches | — |
| Tool bubble max-width | `max-w-[85%]` | `max-w-[85%]` | Matches | — |
| Tool bubble label row | `text-xs text-zinc-500 font-mono` shown below pre | `text-xs text-zinc-500 font-mono` timestamp below bubble | Matches structurally | — |

#### Streaming bubble

Mockup: Same structure as assistant bubble. Inline blinking cursor `w-0.5 h-4 bg-zinc-900 ml-0.5` with `blink-cursor` CSS animation. No timestamp (in-progress).

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Streaming cursor | `w-0.5 h-4 bg-zinc-900 ml-0.5 align-middle`, blinking animation | `streaming-cursor ml-0.5 inline-block h-4 w-0.5 bg-zinc-900 align-middle motion-reduce:hidden` | Matches | — |
| No timestamp on streaming bubble | No timestamp in mockup | No timestamp rendered (StreamingMessageBubble has no timestamp) | Matches | — |

### 1.4 StatusBar

Mockup shows expanded state: an `bg-zinc-50` panel with `border-t border-zinc-200`, a history log section with `border-b border-zinc-200`, completed entries (Check icon `text-green-600`, time col `font-mono text-zinc-500`, tool name `text-zinc-700`, duration `font-mono text-zinc-500`), and a summary row with `border-l-2 border-teal-500` accent, pulse dot `bg-teal-500`, tool name, and a ChevronDown collapse button `text-zinc-500`. Collapsed state (mobile mockup) shows summary row only with ChevronUp.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Outer container | `bg-zinc-50 border-t border-zinc-200 text-xs` | `border-t border-zinc-200 bg-zinc-50 text-xs` | Matches | — |
| Running entry left accent | `border-l-2 border-teal-500` | `border-l-2 border-teal-500 pl-2` | Matches | — |
| Running pulse dot | `size-1.5 animate-pulse rounded-full bg-teal-500` | `inline-block size-1.5 animate-pulse rounded-full bg-teal-500` | Matches | — |
| Expand/collapse icon | ChevronDown (expanded), ChevronUp (collapsed), `text-zinc-500` | `text-zinc-500`, ChevronDown/ChevronUp `size-3.5` | Matches | — |
| Collapsed summary row — border | `border-l-2 border-teal-500` visible on summary row | `showBorder` prop passed to `EntryRow` for summary row — border applied when `isRunning` | Matches | — |
| Time column | `font-mono text-zinc-500` | `font-mono text-zinc-500 tabular-nums` | Matches | — |
| Tool name column | `font-sans text-zinc-700` | `font-sans text-zinc-700` | Matches | — |

### 1.5 MessageInput

Mockup: `sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3`. Left: mode selector ghost button (MessageSquare icon + ChevronDown + label text `text-xs text-zinc-500`). Center: textarea `border border-zinc-200 rounded-md text-sm`. Right: Send button `bg-teal-600 hover:bg-teal-700 text-white min-h-11`.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Input container | `sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3` | `sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3` | Matches | — |
| Mode selector | Ghost button with MessageSquare + ChevronDown + mode label text (`chat`) visible | Ghost button with mode icon + ChevronDown; label text absent (icon only + chevron) | REQUIRED | Mockup shows the mode label text inline beside the icon (e.g., "chat"). The implementation renders only the icon and chevron — the label is accessible via `aria-label` but not visible. Fix: add `<span className="text-xs">{selectedMode.label}</span>` between the icon and ChevronDown inside the DropdownMenuTrigger button. |
| Send button | `bg-teal-600 min-h-11`, SendHorizontal icon + "Send" text | `min-h-11`, SendHorizontal icon — no "Send" text label | REQUIRED | Mockup shows "Send" text alongside the icon. The implementation shows the icon only. A visible label on the primary CTA improves usability and matches the mockup. Fix: add `<span>Send</span>` after `<SendHorizontal className="h-5 w-5" />` inside the Send Button. Note: this applies only to the idle state (not the Cancel/Stop button). |
| Cancel button (agent running) | Not shown in mockup (mockup shows idle state only) | Square icon, outline variant, `min-h-11` | ACCEPTED | Correct handling of a state not depicted in the mockup. |
| Textarea placeholder | "Ask anything..." (mockup empty state reference) | "Send a message... (Enter to send, Shift+Enter for newline)" | ACCEPTED | More informative placeholder; does not contradict DS. |

### 1.6 Memory Panel (right panel)

Mockup: `w-320px bg-white border-l border-zinc-200`. Header: `h-14 border-b border-zinc-200`, "Memory" label `text-sm font-semibold text-zinc-900`, X close button `h-11 w-11 text-zinc-500`. Content: Mode badge, mode switcher buttons (active: `bg-teal-50 border-teal-200 text-teal-600`; inactive: outline), token progress bar `h-1 bg-zinc-400`, stats block `bg-zinc-50 border border-zinc-200 rounded-md p-3`, Summary collapsible, Clear memory button `border-red-200 text-red-600`.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Panel width | `w-320px` | `w-80` (320px via `PanelShell`) | Matches | — |
| Panel header height | `h-14` | `border-b border-zinc-200 px-4 py-3` (no explicit `h-14`) | ACCEPTED | `py-3` with label produces approximately 44px height. The mockup's `h-14` (56px) header is slightly taller. This is a minor discrepancy in a secondary panel. Changing to `h-14` would add empty vertical space. The current compact header is acceptable. |
| Mode switcher active button | `bg-teal-50 border-teal-200 text-teal-600` | `variant="default"` when active (resolves to `bg-primary` = teal-600 full saturation, white text) | REQUIRED | The mockup clearly shows the active mode as a light teal surface with teal text, not a solid filled button. The `variant="default"` produces a solid teal-600 background with white text, which is much heavier visually than the mockup intent. Fix: replace `variant={memory.mode === value ? "default" : "outline"}` with `variant="outline"` always, and apply active state via `className={cn(memory.mode === value && "bg-teal-50 border-teal-200 text-teal-600")}`. |
| Token progress bar color | `bg-zinc-400` (neutral fill) | `[&_[data-slot=progress-indicator]]:bg-zinc-400` at 0–75%; amber/red at thresholds | Matches | DS §15 specifies exact thresholds. Mockup shows neutral state at 47%. |
| Stats block | `bg-zinc-50 border border-zinc-200 rounded-md p-3 text-sm` | `rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900` | Matches | — |
| Clear memory button | `border-red-200 text-red-600` outline, `w-full` | `border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 w-full` | Matches | — |
| Confirmation dialog on clear | Not shown in mockup | Shown via Dialog component (DS §5 pattern) | ACCEPTED | Correct pattern for destructive actions. |

### 1.7 TypingIndicator

Mockup does not show TypingIndicator explicitly — the mockup depicts the streaming state with a blinking cursor instead. The TypingIndicator is a separately specified component (DS §3.3) that renders when no streaming content is yet available.

The implementation in `TypingIndicator.tsx` matches DS §3.3 exactly: same bubble wrapper as assistant bubble (`rounded-2xl rounded-bl-sm border border-zinc-200 bg-white shadow-sm`), three zinc-400 dots with staggered `typing-bounce` animation, `role="status" aria-live="polite"`.

No corrections needed.

---

## 2. Chat Page — Mobile (`chat-mobile.svg`)

### 2.1 Top bar (AppShell mobile header)

Mockup: `h-14 border-b border-zinc-200 bg-white`. Left: hamburger ghost button `h-11 w-11 text-zinc-500`. Center: C-mark logo + "Cogtrix" wordmark `text-lg font-semibold`. Right: empty (no avatar shown in mockup).

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Mobile top bar | `h-14`, hamburger left, brand center | `AppShell` renders this; see `AppShell.tsx` | Not audited directly (AppShell not in scope list) | — |
| C-mark in mobile header | `SidebarLogo` at 22px, same as sidebar | `SidebarLogo` reused in mobile header | Matches per DS §0.4 | — |

### 2.2 Session header on mobile

Mockup: Same header structure as desktop but tighter. Model selector `w-96px` (24 tailwind units). Brain button active, Trash2 ghost — Wrench button is absent in the mobile mockup (space constraint).

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Model selector mobile width | `w-24` (96px) | `w-24 lg:w-32` | Matches | — |
| Wrench button absence on mobile | Not shown in mobile mockup | Always rendered regardless of viewport | ACCEPTED | The Wrench button is 44px wide. At 390px viewport with other header controls, there is room for it. Removing it on mobile would hide a useful feature. The DS §16 D-008 gap notes mobile header layout is deferred — keeping all controls visible on mobile is acceptable until D-008 is resolved. |

### 2.3 Message list on mobile

Mockup: `px-3 py-4 space-y-3`. User bubble `max-w-[85%]` on mobile. Font sizes are 13px (`text-sm`) versus 15px on desktop.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| User bubble max-width mobile | `max-w-[85%]` | `max-w-[75%]` at all breakpoints | REQUIRED | The mobile mockup specifies `max-w-[85%]` for user and assistant bubbles (approximately 331px at 390px viewport) to better use the narrower screen width. The implementation uses `max-w-[75%]` at all breakpoints. Fix: change `max-w-[75%]` to `max-w-[75%] sm:max-w-[75%]` — i.e., add `max-w-[85%]` for the base (mobile) breakpoint and keep `max-w-[75%]` at `sm+`. Apply to both `UserBubble` and `AssistantBubble` in `MessageBubble.tsx`, and to `StreamingMessageBubble.tsx`. Exact classes: `max-w-[85%] sm:max-w-[75%]`. |
| Message font size mobile | `font-size: 13` (text-sm) in mockup | `text-base` (16px) at all breakpoints | ACCEPTED | The mockup uses 13px as an SVG approximation for mobile. The DS typography scale (§2) does not define a responsive font-size reduction for message bubbles — `text-base` is the specified message content size. Changing this would require a DS update. No correction needed. |

### 2.4 StatusBar on mobile

Mockup: Collapsed state only — summary row with `border-l-2 border-teal-500`, pulse dot, tool name, ChevronUp button.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Collapsed StatusBar | Summary row + ChevronUp to expand | Single-row collapsed view with ChevronUp when not expanded | Matches | — |

### 2.5 MessageInput on mobile

Mockup: Mode selector (icon only, no text label visible), textarea, Send button (icon only, no "Send" text). This is consistent with space constraints.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Mode selector mobile | Icon + chevron only (no label text in mobile SVG) | Icon + chevron only | Matches mobile spec | Note: the REQUIRED fix for desktop (add visible label) must not apply on mobile — use responsive visibility. See fix in §1.5 correction. |
| Send button mobile | Icon only (no "Send" text) | Icon only (no text currently on any size) | The desktop fix adds "Send" text; on mobile this may be space-constrained. | See §1.5 fix — use `hidden sm:inline` on the text span so the label appears on sm+ only. |

---

## 3. Documents Page — Desktop (`documents-desktop.svg`)

### 3.1 Page header

Mockup: `px-6 py-4 border-b border-zinc-200 bg-white`. "Documents" heading `text-2xl font-semibold text-zinc-900`. "Upload" primary button `bg-teal-600 h-40px`, Upload icon + "Upload" text.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Page header | `PageHeader` component | `PageHeader` with "Documents" title | Matches | — |
| Upload button label | "Upload" (short) | "Upload Document" (longer) | ACCEPTED | "Upload Document" is more descriptive; DS does not mandate exact button labels. |

### 3.2 SemanticSearchBar

Mockup: Input `rounded-8px border-zinc-200` with Search icon inside (left-inset), placeholder `text-zinc-400`, `max-w-576px`. Teal Search button `bg-teal-600 h-40px` with Search icon + "Search" text. Full-width form uses `flex gap-2`.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Search input | Left-inset Search icon, placeholder text-zinc-400 | `Input` component with `flex-1`, no left-inset icon | REQUIRED | The mockup clearly shows a Search icon inset into the left side of the input field. The implementation renders the Search icon only inside the submit button. Fix: add a relative wrapper around `Input`, position a `Search` icon `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400`, and add `pl-9` to the Input's className. This matches both the mockup and DS §10 sizing (`h-4 w-4` inline icon). |
| Search button | `bg-teal-600` primary, Search icon + "Search" text | `variant="default"` (resolves to `bg-primary` = teal-600), Search icon + "Search" text | Matches | — |
| Search bar max-width | `max-w-576px` (approx `max-w-xl`) | No max-width on the form; `className` prop passed but no intrinsic width constraint | ACCEPTED | The parent `DocumentsPage` uses `max-w-5xl` for the whole content area. Omitting a separate `max-w-xl` constraint on the search bar makes it full-width within `max-w-5xl`, which is a reasonable implementation decision. The mockup's narrower search bar is a proportional suggestion. |

### 3.3 DocumentCard states

The mockup shows four card states: indexed, indexed (small file), processing, and failed. Cards are full-width horizontal rows (not a grid).

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Card layout | Full-width horizontal list, single column | `grid gap-6 md:grid-cols-2` — two-column grid at `md+` | REQUIRED | The mockup and DS §16 D-002 both specify a full-width list layout ("Card layout is a full-width list"). The implementation uses a two-column grid at `md+`. Fix: change `grid gap-6 md:grid-cols-2` to `space-y-3` in `documents.tsx` (applies to both the document list and the skeleton loading state). |
| Indexed badge | `bg-green-50 border-green-200 text-green-700 rounded-full text-xs font-medium` | No Badge component visible in `DocumentCard.tsx` | REQUIRED | The implementation shows status information only in the metadata row (chunk count for indexed, "Failed" in red for failed, "Processing..." with pulse for processing). The mockup shows a distinct pill Badge next to the filename for each status. Fix: add a status `Badge` in `DocumentCard` rendered between the filename and the metadata row. Indexed: `className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-full px-2 py-0.5 font-medium"`. Processing: `className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-full px-2 py-0.5 font-medium"`. Failed: `className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-full px-2 py-0.5 font-medium"` (see pre-audit note: use `border-red-200`, not `border-red-300` or the SVG's `#fca5a5`). Pending: same amber as processing. |
| Failed badge border | Mockup SVG uses `#fca5a5` (red-300) | Not yet implemented as a badge | See above | Per DS §16 D-002, `border-red-200` (`#fecaca`) is authoritative. |
| Failed error message in metadata row | `text-red-600` inline in the metadata row | `<span className="text-red-600">Failed</span>` in metadata row | Matches | — |
| Processing/pending pulse | `text-amber-700 opacity-0.85` (simulated pulse) | `animate-pulse text-amber-700` | Matches | DS §9 explicitly approves this. |
| Delete button at rest | `text-zinc-500` ghost icon button, `h-11 w-11` | `h-11 w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700` | Matches | DS §16 D-007 confirmed correct. |
| Delete button hover | `bg-red-50 text-red-700` (hover annotation in mockup) | `hover:bg-red-50 hover:text-red-700` | Matches | — |
| Delete button disabled on processing | `opacity-50` (mockup shows icon at 50% opacity) | Delete button always shown if `isAdmin` with no disabled state for processing | REQUIRED | The mockup shows the delete button grayed out (`opacity-50`) for the processing state card. Fix: in `DocumentCard.tsx`, add `disabled={document.status === "processing" || document.status === "pending"}` and `className={cn(..., (document.status === "processing" || document.status === "pending") && "opacity-50 pointer-events-none")}` to the delete Button. |
| Card border radius | `rounded-10px` (rx="10" in SVG) | shadcn/ui `Card` default `rounded-xl` (12px) | ACCEPTED | `rounded-xl` (12px) vs. `rounded-10px` (10px) is a 2px discrepancy that falls within acceptable tolerance. DS §5 Cards specifies `rounded-xl` as the canonical card radius. |

### 3.4 Document count label

Mockup shows "4 documents" in `text-xs font-medium text-zinc-500` above the card list.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Document count label | `text-xs font-medium text-zinc-500` above card list | Absent from implementation | REQUIRED | The mockup specifies a count label above the document list. Fix: in `documents.tsx`, add `<p className="mb-3 text-xs font-medium text-zinc-500">{documents.length} {documents.length === 1 ? "document" : "documents"}</p>` immediately before the document list `div` (only when `status === "success" && documents.length > 0`). |

### 3.5 DocumentUploadDialog

Mockup: `max-w-md` Dialog, "Upload Document" title `text-xl font-semibold`, description `text-sm text-zinc-500`. Drop zone: `border-dashed border-zinc-200 rounded-md bg-zinc-50`, centered Upload icon `h-12 w-12 text-zinc-400 strokeWidth={1.5}`, "Click or drag a file here" `text-sm font-medium text-zinc-900`, "PDF, TXT, or Markdown — max 50 MB" `text-xs text-zinc-500`. Footer: Cancel `outline` + Upload `default` (disabled/opacity-50 when no file).

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Dialog max-width | `max-w-md` | `max-w-md` | Matches | — |
| Drop zone styling | `border-dashed border-zinc-200 bg-zinc-50 rounded-md` | `border-dashed rounded-md border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50` (default state) | Matches | Hover enhancement is additive. |
| Drop zone — drag-over state | Not shown in mockup | `border-teal-200 bg-teal-50` on drag-over | ACCEPTED | Teal drag-over feedback follows DS accent pattern. |
| Drop zone — validation error state | Not shown in mockup | `border-red-200 bg-red-50` on error | ACCEPTED | Follows DS §8 error state pattern. |
| Upload icon | `h-12 w-12 text-zinc-400 strokeWidth={1.5}` | `h-12 w-12 text-zinc-400 strokeWidth={1.5}` | Matches | — |
| Upload button disabled state | `opacity-50` when no file | `disabled={!selectedFile}` which shadcn/ui renders as `opacity-50` | Matches | — |
| Loading state | Not depicted in mockup | Spinner in Upload button, `aria-busy` | ACCEPTED | DS §8 specifies spinner for button loading states. |
| Validation error message | Not depicted in mockup | `text-sm text-red-600` below drop zone | ACCEPTED | DS §8 error pattern. |

### 3.6 Empty state

Mockup (state annotation section): `bg-zinc-50 border border-zinc-200 rounded-xl` container, `FileText` 48px `text-zinc-400 strokeWidth={1.5}`, "No documents yet." `text-base font-semibold`, "Upload a file to get started." `text-sm text-zinc-500`, "Upload" primary button `bg-teal-600`.

| Component | Mockup spec | Current impl | Classification | Fix |
|---|---|---|---|---|
| Empty state icon | `h-12 w-12 text-zinc-400 strokeWidth={1.5}` | `h-12 w-12 text-zinc-400 strokeWidth={1.5}` | Matches | — |
| Empty state heading | "No documents yet." `text-sm text-zinc-500` (mockup shows "No documents yet." at 15px semibold) | `text-sm text-zinc-500` — single line, no heading weight | REQUIRED | The mockup distinguishes a bold primary line "No documents yet." from a secondary line. The implementation renders both at `text-sm text-zinc-500` with no weight distinction. Fix: change the empty-state text in `documents.tsx` from `<p className="text-sm text-zinc-500">No documents uploaded yet.</p>` to two elements: `<p className="text-sm font-semibold text-zinc-900">No documents yet.</p>` followed by `<p className="text-sm text-zinc-500">Upload a file to get started.</p>`. The upload trigger button text and variant are already correct (`Button variant="outline"`). |

---

## 4. Summary of Required Corrections

The following items are classified REQUIRED. `web_coder` must address all of them. Items are ordered by component/file.

### `src/pages/chat/MessageBubble.tsx`

**REQ-001 — Tool call summary divider border**
Change the tool call summary top-border from `border-zinc-100` to `border-zinc-200` (line 78, `mt-2 border-t border-zinc-100 pt-1.5`). The DS and the mockup both specify `border-zinc-200` for all dividers.

**REQ-002 — Bubble max-width on mobile**
Change `max-w-[75%]` to `max-w-[85%] sm:max-w-[75%]` in both `UserBubble` (line 51) and `AssistantBubble` (line 66) wrapper divs. The mobile mockup specifies `max-w-[85%]` for bubbles at narrow viewport widths.

### `src/pages/chat/StreamingMessageBubble.tsx`

**REQ-003 — Streaming bubble max-width on mobile**
Change `max-w-[75%]` to `max-w-[85%] sm:max-w-[75%]` in the bubble wrapper div (line 39). Same rationale as REQ-002.

### `src/pages/chat/MessageInput.tsx`

**REQ-004 — Mode selector label text**
Add a visible label text element inside the `DropdownMenuTrigger` Button. The current button shows icon + chevron only; the mockup shows the mode name text (e.g., "chat" / "Normal") beside the icon. Use `<span className="hidden sm:inline text-xs">{selectedMode.label}</span>` between the icon and the `ChevronDown`. Hidden on mobile to match the mobile mockup; visible on sm+ to match the desktop mockup.

**REQ-005 — Send button label text**
Add a visible "Send" text label to the Send button. The mockup shows "Send" text alongside the SendHorizontal icon. Use `<span className="hidden sm:inline">Send</span>` after `<SendHorizontal className="h-5 w-5" />` so the text appears on sm+ (where there is room) but not on the smallest mobile viewport.

### `src/pages/chat/MemoryPanel.tsx`

**REQ-006 — Mode switcher active button style**
The active memory mode button currently uses `variant="default"` (solid teal-600 fill, white text). The mockup specifies a light teal surface (`bg-teal-50 border-teal-200 text-teal-600`) matching the DS active-nav-item pattern. Change the Button to always use `variant="outline"` and apply active styling via className: `className={cn("min-h-11 flex-1 ...", memory.mode === value && "bg-teal-50 border-teal-200 text-teal-600")}`. Remove the conditional `variant` prop.

### `src/pages/documents.tsx`

**REQ-007 — Document list layout (list not grid)**
Change the document card container from `grid gap-6 md:grid-cols-2` to `space-y-3`. Also change the skeleton loading state from `grid gap-6 md:grid-cols-2` to `space-y-3`. DS §16 D-002 and the mockup both specify a full-width single-column list layout for documents.

**REQ-008 — Document count label**
Add a count label above the document list. When `status === "success" && documents.length > 0`, render `<p className="mb-3 text-xs font-medium text-zinc-500">{documents.length} {documents.length === 1 ? "document" : "documents"}</p>` before the document list.

**REQ-009 — Empty state text hierarchy**
Replace the single `<p className="text-sm text-zinc-500">No documents uploaded yet.</p>` in the empty state with two elements:
- `<p className="text-sm font-semibold text-zinc-900">No documents yet.</p>`
- `<p className="text-sm text-zinc-500">Upload a file to get started.</p>`

### `src/pages/documents/DocumentCard.tsx`

**REQ-010 — Status Badge**
Add a status `Badge` pill between the filename and the metadata row. Use shadcn/ui `Badge` with `variant="outline"` and override classes:
- `indexed`: `className="rounded-full border-green-200 bg-green-50 text-xs font-medium text-green-700"`
- `processing` / `pending`: `className="rounded-full border-amber-200 bg-amber-50 text-xs font-medium text-amber-700"`
- `failed`: `className="rounded-full border-red-200 bg-red-50 text-xs font-medium text-red-600"` (use `border-red-200` — see pre-audit note)

**REQ-011 — Delete button disabled during processing/pending**
Add disabled state to the delete button when `document.status === "processing" || document.status === "pending"`. Apply `disabled` prop and `className={cn(..., (document.status === "processing" || document.status === "pending") && "opacity-50 pointer-events-none")}`.

### `src/pages/documents/SemanticSearchBar.tsx`

**REQ-012 — Search icon inside input**
Add a left-inset Search icon to the Input field. Wrap the `Input` in a `relative` div, position `<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />`, and add `pl-9` to the Input's `className`. The mockup shows the magnifying glass icon inset into the left side of the search field.

---

## 5. Accepted Deviations Summary

The following implementation deviations from the mockup are explicitly accepted. They require no changes.

| ID | Component | Deviation | Reason |
|---|---|---|---|
| ACC-001 | Sidebar | Nav icons use `text-zinc-400`; mockup shows zinc-500 strokes | DS §10 permits `text-zinc-400` for icons alongside visible text labels |
| ACC-002 | Sidebar | Richer bottom section (Avatar, role Badge, "Sign out" label) vs. mockup placeholder | Additive; all DS-compliant |
| ACC-003 | Sidebar | `border-l-2 border-transparent` at rest | Layout-shift prevention; invisible |
| ACC-004 | Session header | Wrench button present on mobile even though absent from mobile mockup | Preserves feature access; D-008 deferred |
| ACC-005 | Session header | Rename-in-place edit mode on session name | Additive interactive feature |
| ACC-006 | AssistantBubble | ToolCallSummary tool name in `text-zinc-700` vs. mockup's zinc-900 | Minor tone; DS-compliant secondary text |
| ACC-007 | AssistantBubble | Timestamp shown below completed message | Useful context; DS-compliant |
| ACC-008 | MemoryPanel | Panel header is `py-3` (approx 44px) not `h-14` (56px) | Minor height difference in secondary panel; current compact header is acceptable |
| ACC-009 | MessageInput | Cancel/Stop button for agent-running state (not shown in mockup) | Correct runtime handling |
| ACC-010 | MessageInput | Textarea placeholder text differs | Acceptable; more informative |
| ACC-011 | DocumentCard | `rounded-xl` (12px) vs. SVG `rx=10` (10px) | DS §5 cards specify `rounded-xl`; mockup SVG is not pixel-precise |
| ACC-012 | DocumentUploadDialog | Drag-over feedback (`border-teal-200 bg-teal-50`) | DS accent pattern; not shown in mockup |
| ACC-013 | DocumentUploadDialog | Error state drop zone styling | DS §8 error pattern |
| ACC-014 | SemanticSearchBar | No `max-w-xl` constraint on search form | Full-width within `max-w-5xl` container is acceptable |
| ACC-015 | TypingIndicator | Not depicted in mockup; implementation matches DS §3.3 spec | No discrepancy |
| ACC-016 | PanelShell | Sheet (mobile) and aside (desktop) rendering | Correct responsive pattern per DS §4 |
| ACC-017 | StatusBar | No divergences found | Fully compliant |

---

## 6. Known Pre-existing Gap

**D-008 — Session header mobile layout**: The session header on mobile (controls arrangement at 390px) has a deferred design spec as noted in the ProjectForge audit. The current implementation keeps all desktop controls visible on mobile. This is acceptable until D-008 is resolved in a future sprint.
