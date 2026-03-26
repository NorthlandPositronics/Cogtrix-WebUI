# Sprint 3 — Session / Chat Page Design Brief

**Route:** `/sessions/:id`
**Page component:** `SessionPage`
**Brief author:** web_designer
**Design system version:** 1.0
**Created:** 2026-03-05
**Status:** Ready for mockup

---

## 1. Purpose and context

The Session / Chat page is the primary interface for interacting with the Cogtrix AI agent. It combines REST calls (message history, session metadata, memory state, tool list) with a persistent WebSocket connection that streams token output, tool activity events, tool confirmation requests, and agent state transitions in real time.

This page is the most complex in the application. Complexity must not become visual noise. The design principle is: the message list is the dominant element at all times. Everything else — the header, the right panels, the input bar — serves the message list without competing with it.

---

## 2. Layout structure

The page renders inside `AppShell`. The overall layout at `lg+` is a three-column arrangement:

```
┌──────────────────────────────────────────────────────────────────────┐
│ Sidebar (220px)  │  Chat area (flex-1)              │ Right panel     │
│  bg-zinc-50      │  - SessionHeader (fixed top)     │ (320px, hidden  │
│  (AppShell)      │  - MessageList (flex-1 scroll)   │  by default)    │
│                  │  - MessageInput (sticky bottom)  │  MemoryPanel or │
│                  │                                  │  ToolsSidebar   │
└──────────────────────────────────────────────────────────────────────┘
```

### Chat area

The chat area is `flex flex-col flex-1 min-w-0 h-full overflow-hidden`. It never scrolls as a whole unit — only the `MessageList` scrolls.

- `SessionHeader`: `flex-shrink-0`, approximately `h-14` tall, `border-b border-zinc-200 bg-white px-4`
- `MessageList`: `flex-1 overflow-y-auto px-4 py-4` (or `px-6` at `xl+`)
- `MessageInput`: `flex-shrink-0 sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3`

The session does not use the `max-w-5xl` centering applied to most other pages — the message list expands to fill the full chat column width. Rationale: constraining message width forces horizontal scroll on code blocks and tool output; a full-width column handles long content more gracefully. Message bubbles are themselves constrained by `max-w-[75%]`.

### Right panel

The right panel (`MemoryPanel` or `ToolsSidebar`) has a fixed width of `w-[320px]` and is `hidden` by default. When toggled open, it appears at the right edge of the chat area, separated by `border-l border-zinc-200`. It has its own internal scroll (`overflow-y-auto`).

On `< lg`, right panels are not rendered inline. When toggled, they appear as a `Sheet` (shadcn/ui) sliding from the right edge of the viewport. The toggle buttons in the header remain visible at all breakpoints.

One panel is open at a time. Opening Memory closes Tools and vice versa.

---

## 3. Component inventory

| Component | File path | Role |
|---|---|---|
| `SessionPage` | `src/pages/SessionPage.tsx` | Page root, data fetching orchestrator, WebSocket lifecycle |
| `SessionHeader` | `src/components/session/SessionHeader.tsx` | Header bar with session name, agent badge, action buttons |
| `MessageList` | `src/components/session/MessageList.tsx` | Scrollable message container with upward infinite scroll |
| `MessageBubble` | `src/components/session/MessageBubble.tsx` | Individual rendered message (user / assistant / system / tool) |
| `StreamingMessageBubble` | `src/components/session/StreamingMessageBubble.tsx` | Active streaming response accumulating tokens in real time |
| `ToolActivityRow` | `src/components/session/ToolActivityRow.tsx` | Inline tool execution record — collapsible |
| `ToolConfirmationModal` | `src/components/session/ToolConfirmationModal.tsx` | Blocking confirmation dialog |
| `MessageInput` | `src/components/session/MessageInput.tsx` | Input bar with mode selector, send/cancel |
| `MemoryPanel` | `src/components/session/MemoryPanel.tsx` | Right panel — memory state display and controls |
| `ToolsSidebar` | `src/components/session/ToolsSidebar.tsx` | Right panel — tool list and management |

All session-specific components live under `src/components/session/`. The already-shared `AgentStateBadge` (`src/components/AgentStateBadge.tsx`) is reused here without modification.

---

## 4. Data bindings — API contract

All type definitions come from `docs/api/client-contract.md` sections 3.3–3.6 and 3.8.

### Session metadata

Fetched on mount via `GET /api/v1/sessions/:id`. Fields used:

| Field | Where |
|---|---|
| `id` | WebSocket connection URL, all session-scoped API calls |
| `name` | `SessionHeader` — editable inline |
| `state: AgentState` | `AgentStateBadge` in header (initial value; live updates come via WebSocket `agent_state` events) |
| `config.provider` | Displayed in session details (not on main page, but available for `MemoryPanel` header label) |

### Message history

Loaded via `GET /api/v1/sessions/:id/messages`. Returns `CursorPage<MessageOut>`. History is in reverse chronological order (newest first). Load the first page on mount, then prepend older pages as the user scrolls up.

`MessageOut` fields used:

| Field | Where |
|---|---|
| `id` | React key |
| `role` | Determines `MessageBubble` variant (user / assistant / system / tool) |
| `content` | Message text; rendered as Markdown in assistant messages |
| `tool_calls: ToolCallRecord[]` | Rendered as `ToolActivityRow` components within or below the assistant bubble |
| `token_counts` | Displayed as a muted caption below the assistant bubble after the turn completes |
| `created_at` | Timestamp displayed at message level |

### WebSocket events

Connect to `WS /ws/v1/sessions/:id?token=<jwt>&last_seq=<lastSeq>` on mount. Disconnect on unmount.

| Event type | UI effect |
|---|---|
| `agent_state` | Update `AgentStateBadge` in header; update send/cancel button state |
| `token` | Append `text` to `StreamingMessageBubble` accumulator buffer |
| `tool_start` | Append a new `ToolActivityRow` (running state) to the streaming bubble |
| `tool_end` | Update the matching `ToolActivityRow` with `duration_ms` and `error` |
| `tool_confirm_request` | Set `pendingConfirmation` state; open `ToolConfirmationModal` |
| `memory_update` | Invalidate the memory panel query (refetch `GET /sessions/:id/memory`) |
| `error` | Render an error system message in the message list |
| `done` | Finalise `StreamingMessageBubble` into a regular `MessageBubble`; store `message_id`, token stats; reset streaming state |

### Memory panel API

| Action | Endpoint |
|---|---|
| Get memory state | `GET /api/v1/sessions/:id/memory` |
| Switch mode | `PATCH /api/v1/sessions/:id/memory` |
| Clear memory | `DELETE /api/v1/sessions/:id/memory` |

`MemoryStateOut` fields used: `mode`, `summary`, `window_messages`, `summarized_messages`, `tokens_used`, `context_window`.

### Tools sidebar API

| Action | Endpoint |
|---|---|
| Get session tool list | `GET /api/v1/sessions/:id/tools` |
| Manage tools | `PATCH /api/v1/sessions/:id/tools` |
| Browse all tools | `GET /api/v1/tools` |

`ToolSummary` fields used: `name`, `short_description`, `status`, `requires_confirmation`, `is_mcp`.

`ToolActionRequest` is used to build the enable/disable/auto-approve operations. Multiple operations can be batched into a single `PATCH` call.

---

## 5. SessionHeader component

### Visual anatomy

```
┌──────────────────────────────────────────────────────────────────────┐
│  [←]  My Research Session   ● Thinking...        [Brain] [Wrench] [⋮] │
└──────────────────────────────────────────────────────────────────────┘
```

### Class specification

| Element | Classes |
|---|---|
| Header root | `flex items-center gap-3 h-14 px-4 border-b border-zinc-200 bg-white flex-shrink-0` |
| Back button | `Button` variant `ghost`, size `sm`, `aria-label="Back to sessions"` — wraps a `ChevronLeft` icon `w-5 h-5 text-zinc-500` |
| Session name (display) | `text-base font-medium text-zinc-900 truncate flex-1 min-w-0 cursor-pointer hover:text-zinc-600 transition-colors duration-150` |
| Session name (editing) | `Input` replacing the display span — `text-base font-medium h-8 px-2 flex-1 min-w-0` — focused on mount, saved on `blur` or `Enter`, cancelled on `Escape` |
| AgentStateBadge | Existing component, `flex-shrink-0` |
| Action button group | `flex items-center gap-1 flex-shrink-0` |
| Memory toggle button | `Button` variant `ghost`, size `sm`, `aria-label="Toggle memory panel"` — `Brain` icon `w-5 h-5` — active state: `text-violet-600 bg-violet-50` |
| Tools toggle button | `Button` variant `ghost`, size `sm`, `aria-label="Toggle tools panel"` — `Wrench` icon `w-5 h-5` — active state: `text-violet-600 bg-violet-50` |
| More menu trigger | `Button` variant `ghost`, size `sm`, `aria-label="More options"` — `MoreVertical` icon `w-5 h-5` |

### Inline name editing

The session name toggles between a display span and a controlled `Input` on click. On mount in edit mode, pre-fill with the current `name` value and auto-focus the input.

Save triggers: `onBlur` and `Enter` keydown. Both call `PATCH /api/v1/sessions/:id` with `{ name: trimmedValue }` and return to display mode.

Cancel trigger: `Escape` keydown — reverts to the original name without saving.

If the trimmed value is empty, do not save — revert to the previous name silently. Rationale: a blank session name would break the sessions list card display.

While the save mutation is in flight, keep the input visible but disabled (`opacity-50`). On error, show `toast.error(error.message)` and return to the edit state so the user can retry.

### More menu

shadcn/ui `DropdownMenu`. Items:

| Label | Icon | Action |
|---|---|---|
| Clear history | `Trash2` `w-4 h-4` | Opens a confirmation `AlertDialog`; on confirm calls `DELETE /api/v1/sessions/:id/messages` |
| Session settings | `Settings` `w-4 h-4` | Opens a `SessionSettingsDialog` — see section 5.1 |

`Clear history` item uses `text-red-600` to signal a destructive action within the menu. Do not use a destructive variant for the menu item itself (it would apply a heavy red background) — use only the text color.

### 5.1 Session settings dialog

Standard `Dialog` at `max-w-md`. Content: editable `system_prompt` textarea, `max_steps` number input, feature flag toggles (`prompt_optimizer`, `parallel_tool_execution`, `context_compression`). Footer: "Cancel" and "Save" (violet). On save, call `PATCH /api/v1/sessions/:id` with the updated `SessionConfig`.

This dialog is out of scope for Sprint 3 mockups but must be wired in the implementation. For the mockup, show the More menu open with the two items.

---

## 6. MessageList component

### Layout and scroll behavior

```
flex flex-col-reverse overflow-y-auto flex-1
```

Using `flex-col-reverse` combined with `overflow-y-auto` causes the list to anchor at the bottom: new messages append at the visual bottom without needing JavaScript scroll manipulation for the common case. When new messages arrive (either from `done` events or from user sends), they appear at the bottom and the list stays scrolled to the bottom.

`flex-col-reverse` reverses the DOM order visually but keeps the data array order natural (oldest first in the array, newest rendered at bottom). This is a known React/CSS pattern for chat interfaces.

**Auto-scroll suppression:** if the user has scrolled upward (away from the bottom), do not auto-scroll on new messages. Detect this by comparing `scrollTop + clientHeight` to `scrollHeight`. If the user is more than 80px from the bottom, they are "scrolled up" — suppress auto-scroll. When they scroll back to the bottom, re-enable auto-scroll.

### Upward infinite scroll

As the user scrolls toward the top of the list, load older messages. Use an `IntersectionObserver` on a sentinel `div` pinned to the top of the message list.

When the sentinel enters the viewport, call `fetchPreviousPage()` from `useInfiniteQuery` (TanStack Query). Prepend the older messages to the list.

On loading older pages, preserve scroll position so the view does not jump. This requires saving `scrollHeight` before prepending and restoring `scrollTop = newScrollHeight - savedScrollHeight` after React renders the new messages.

### Message grouping

Messages from the same role within a 5-minute window are visually grouped. In a grouped sequence, only the last message shows the full timestamp; intermediate messages show no timestamp. Rationale: consecutive messages from the same author with a single timestamp reduces noise while preserving temporal context.

The first message of a new role always starts a new group, regardless of time.

### Skeleton loading state

While the first page loads (`isLoading === true`), render 4 skeleton message bubbles alternating user and assistant positions:

```
                             ████████████████ (user, right, w-40)
████████████████████████████ (assistant, left, w-64)
             ████████████████ (user, right, w-28)
████████████████████████████████████████ (assistant, left, w-80)
```

Each skeleton uses `Skeleton` component (shadcn/ui) with `rounded-2xl` to match the real bubble border radius. Heights approximate real content: `h-10` for short messages, `h-16` for longer ones. Do not animate the skeleton positions — fixed positions prevent layout shift.

### Error state

If the message history fetch fails, render a centered error state in the message list area:

```
flex flex-col items-center justify-center h-full gap-3 text-center
```

- Icon: `AlertCircle` `w-8 h-8 text-red-400`
- Text: `text-sm text-zinc-500` with the error message
- Button: `Button variant="outline" size="sm"` — "Retry" — calls `refetch()`

### Empty state

When the session has no messages and the first page has loaded successfully:

```
flex flex-col items-center justify-center h-full gap-2 text-center
```

- `MessageSquare` icon `w-10 h-10 text-zinc-300 strokeWidth={1.5}`
- `text-sm text-zinc-400` — "No messages yet. Start the conversation."

No button. The `MessageInput` below is the natural action. Rationale: an empty state CTA button here would duplicate the input affordance.

---

## 7. MessageBubble component

The `MessageBubble` renders a single `MessageOut` record. It accepts a `role` prop that determines all visual treatment. Full visual specs are in design system section 7.

### Prop interface

```typescript
interface MessageBubbleProps {
  message: MessageOut;
  isLastInGroup?: boolean;  // controls timestamp visibility
}
```

### User message bubble

```
Alignment:     justify-end (row wrapping bubble only)
Bubble:        bg-violet-50 border border-violet-200 rounded-2xl rounded-br-sm
               px-4 py-3 max-w-[75%]
Text:          text-base font-normal text-zinc-900 leading-relaxed
Timestamp:     text-xs text-zinc-400 mt-1 text-right (below bubble, visible only on isLastInGroup)
```

No avatar. No label. The violet-50 surface and right alignment are sufficient role markers.

### Assistant message bubble

```
Alignment:     justify-start
Bubble:        bg-white border border-zinc-200 rounded-2xl rounded-bl-sm shadow-sm
               px-4 py-3 max-w-[75%]
Text:          text-base font-normal text-zinc-900 leading-relaxed
               (Markdown rendered via react-markdown — see section 7.1)
Token stats:   text-xs text-zinc-400 mt-2 (visible after turn completes — show input_tokens, output_tokens, duration)
Timestamp:     text-xs text-zinc-400 mt-1 (visible only on isLastInGroup)
```

Token stats format: `{input_tokens}↑ {output_tokens}↓ · {duration_ms / 1000}s`

Rationale for token stats: power users want to know context consumption. Showing it inline and muted keeps it available without cluttering the message body.

### System message

```
Alignment:     mx-auto
Bubble:        bg-zinc-100 rounded-md px-3 py-1.5 max-w-[60%]
Text:          text-sm text-zinc-500 italic text-center
No timestamp
```

### Tool message (historical tool_calls records)

When a `MessageOut` with `role === 'assistant'` includes non-empty `tool_calls`, render the assistant content bubble followed by one `ToolActivityRow` per `ToolCallRecord`. The rows sit below the bubble, still within `justify-start` alignment, and are not themselves wrapped in a bubble.

If a message has `role === 'tool'` (raw tool message), render it as a compact monospace block:

```
Alignment:     justify-start
Block:         bg-zinc-50 border border-zinc-200 border-l-2 border-l-zinc-400
               rounded-md px-4 py-3 max-w-[85%] font-mono text-sm
```

### 7.1 Markdown rendering

Use `react-markdown` inside assistant bubbles. Apply prose styling directly to the content container — do not install `@tailwindcss/typography`. Manually specify styles for each element:

| Element | Classes |
|---|---|
| `p` | `mb-3 last:mb-0 leading-relaxed` |
| `h1`–`h3` | `font-semibold mt-4 mb-2 text-zinc-900` with appropriate size (h1: `text-xl`, h2: `text-lg`, h3: `text-base`) |
| `ul` / `ol` | `pl-5 mb-3 space-y-1` (ul: `list-disc`, ol: `list-decimal`) |
| `li` | `leading-relaxed` |
| `code` (inline) | `font-mono text-sm bg-zinc-100 rounded px-1 py-0.5 text-zinc-800` |
| `pre` / `code` (block) | `font-mono text-sm bg-zinc-50 border border-zinc-200 rounded-md p-3 overflow-x-auto mb-3` |
| `blockquote` | `border-l-2 border-zinc-300 pl-4 text-zinc-500 italic mb-3` |
| `a` | `text-violet-600 underline underline-offset-2 hover:text-violet-700` |
| `hr` | `border-zinc-200 my-4` |

Disable raw HTML in `react-markdown` (`rehypeRaw` plugin must not be enabled). Rationale: agent responses may include untrusted content — HTML injection via Markdown is a real XSS vector.

---

## 8. StreamingMessageBubble component

The `StreamingMessageBubble` renders during an active agent turn. It replaces no existing message — it sits at the bottom of the list as a new entry. On `done`, it is removed and replaced by a standard `MessageBubble` constructed from the `MessageOut` record stored server-side.

### Prop interface

```typescript
interface StreamingMessageBubbleProps {
  text: string;                          // accumulated token text
  toolActivities: StreamingToolActivity[]; // active and completed tool rows
  isComplete: boolean;                   // true when done event received
}

interface StreamingToolActivity {
  tool_call_id: string;
  tool: string;
  input: Record<string, unknown>;
  duration_ms?: number;
  error?: string | null;
  status: 'running' | 'done' | 'error';
}
```

### Bubble anatomy

Same visual treatment as the assistant `MessageBubble`:

```
bg-white border border-zinc-200 rounded-2xl rounded-bl-sm shadow-sm
px-4 py-3 max-w-[75%]
```

Markdown is rendered on the accumulated `text`. The streaming cursor element is appended after the last token:

```html
<span class="streaming-cursor inline-block w-0.5 h-4 bg-zinc-900 ml-0.5 align-middle"></span>
```

The `streaming-cursor` CSS class animates the cursor per design system section 7. The cursor is hidden when `isComplete === true`.

### Tool activity rows within the streaming bubble

`ToolActivityRow` components render below the Markdown content, within the same bubble container. Each row corresponds to one tool call in `toolActivities`. Rows are appended as `tool_start` events arrive and updated when `tool_end` events arrive.

Layout within bubble: `mt-3 space-y-2` for the tool activity section.

---

## 9. ToolActivityRow component

Inline, compact row showing tool execution status. Used both within `StreamingMessageBubble` (live) and within `MessageBubble` (historical, from `ToolCallRecord`).

### Prop interface

```typescript
interface ToolActivityRowProps {
  toolName: string;
  input: Record<string, unknown>;
  output?: string | null;          // from ToolCallRecord.output (historical only)
  error?: string | null;
  durationMs?: number | null;
  status: 'running' | 'done' | 'error';
  defaultExpanded?: boolean;        // false by default
}
```

### Collapsed state (default)

```
┌──────────────────────────────────────────────────────────────────┐
│  [Terminal icon]  web_search       Running...  (animate-pulse)   │
│  OR                                                              │
│  [Terminal icon]  web_search       Completed in 0.3s  [chevron] │
│  OR                                                              │
│  [Terminal icon]  write_file       Error  [chevron]              │
└──────────────────────────────────────────────────────────────────┘
```

| Element | Classes |
|---|---|
| Row container | `flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 cursor-pointer select-none` (clickable to expand) |
| Icon | `Terminal` `w-4 h-4 text-zinc-400` |
| Tool name | `text-sm font-medium text-zinc-700 flex-1 truncate` |
| Status — running | `text-xs text-zinc-400 animate-pulse flex-shrink-0` — text: "Running..." |
| Status — done | `text-xs text-zinc-400 flex-shrink-0` — text: "Completed in {duration}s" |
| Status — error | `text-xs text-red-500 flex-shrink-0` — text: "Error" |
| Expand chevron | `ChevronDown` `w-4 h-4 text-zinc-400 transition-transform duration-200` (hidden while running; `rotate-180` when expanded) |

The expand chevron is hidden while `status === 'running'` — there is nothing to expand yet.

### Expanded state

When expanded, show below the collapsed row (same container, growing):

```
┌────────────────────────────────────────────────────────────────────┐
│  [Terminal]  web_search  Completed in 0.3s  [chevron up]          │
│                                                                    │
│  Input                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  {                                                           │  │
│  │    "query": "climate policy 2025"                            │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Output  (or Error)                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Result: 12 results found...                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

Input section:

```
text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1 mt-3   ("Input" label)
bg-zinc-50 border border-zinc-200 rounded-md p-2 font-mono text-xs overflow-x-auto   (JSON block)
```

Output section (on success):

```
text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1 mt-2   ("Output" label)
bg-zinc-50 border border-zinc-200 rounded-md p-2 font-mono text-xs overflow-x-auto whitespace-pre-wrap   (output block)
```

Error section (on `status === 'error'`):

```
text-xs font-medium text-red-500 uppercase tracking-wide mb-1 mt-2    ("Error" label)
bg-red-50 border border-red-200 rounded-md p-2 font-mono text-xs text-red-700 overflow-x-auto   (error block)
```

Long JSON values in input are rendered in full — no truncation inside the expanded section. The container has `overflow-x-auto` for wide content. Rationale: tool input truncation loses critical debugging information; the collapsed header provides the summary.

Use shadcn/ui `Collapsible` for the expand/collapse behavior.

---

## 10. ToolConfirmationModal component

A blocking `Dialog` that cannot be dismissed by clicking the backdrop or pressing `Escape`. The agent is paused until the user selects one of the six actions.

### Blocking behavior

Achieved by setting `onInteractOutside={(e) => e.preventDefault()}` and `onEscapeKeyDown={(e) => e.preventDefault()}` on the `DialogContent` component. Never suppress the visible close button per design system section 5 — but for this dialog specifically, the X button is **not rendered**. The only exit paths are the six action buttons. Rationale: accidental dismiss leaves the agent permanently blocked; the six actions always include `cancel` as a safe exit.

### Modal anatomy

`max-w-xl` (per design system section 5 — the 6 action buttons require horizontal space).

```
┌──────────────────────────────────────────────────────────────────┐
│  Tool Confirmation Required                                      │
│──────────────────────────────────────────────────────────────────│
│  write_file wants to perform an action.                          │
│  "Write 2 KB to /home/user/report.md"                           │
│                                                                  │
│  Parameters                                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  path     /home/user/report.md                             │  │
│  │  content  # Climate Report\n...  [Show more]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│──────────────────────────────────────────────────────────────────│
│  [Allow]  [Deny]  [Allow All]                                    │
│  [Disable]  [Forbid All]  [Cancel]                               │
└──────────────────────────────────────────────────────────────────┘
```

### Content region

**Tool name line:** `text-base font-semibold text-zinc-900` — "{toolName} wants to perform an action."

**Message:** `text-sm text-zinc-600 mt-1` — the `message` field from `ToolConfirmRequestPayload`, quoted in italics.

**Parameters table:**

Use a styled `div`-based layout (not a `Table` component — the content is too variable for a full table structure):

```
rounded-md border border-zinc-200 overflow-hidden mt-3
```

Each parameter row:

```
flex border-b border-zinc-100 last:border-b-0 text-sm
```

| Cell | Classes |
|---|---|
| Key cell | `w-32 flex-shrink-0 px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-50` |
| Value cell | `flex-1 px-3 py-2 text-sm text-zinc-800 font-mono break-all` |

Long values (over 200 characters) are truncated with a "Show more" toggle link (`text-xs text-violet-600 cursor-pointer`). On click, reveal the full value inline. This is a local toggle — no modal or popover. Rationale: the server already sorts large values last, so truncation rarely hides the most important parameters.

### Footer buttons

Two rows of three buttons each. `DialogFooter` with:

```
flex flex-col gap-2
```

Row 1:

| Button | Variant | `action` value sent |
|---|---|---|
| Allow | `className="bg-violet-600 hover:bg-violet-700 text-white"` (violet primary) | `allow` |
| Deny | `outline` | `deny` |
| Allow All | `secondary` | `allow_all` |

Row 2:

| Button | Variant | `action` value sent |
|---|---|---|
| Disable | `outline` | `disable` |
| Forbid All | `destructive` | `forbid_all` |
| Cancel | `ghost` | `cancel` |

Each button calls `confirmTool(confirmation_id, action)` on click, which sends `tool_confirm` over the WebSocket, then closes the modal.

Row layout: `flex gap-2 w-full`. Each row has `w-full` and its three buttons have `flex-1`. This gives equal-width buttons within each row.

**Allow** is the leftmost button in the primary position and uses the violet primary treatment — it is the default safe choice for most confirmations.

**Forbid All** uses the `destructive` variant (red) because it is the most aggressive safe-for-session-state action.

---

## 11. MessageInput component

### Anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│  [Normal ▾]  [Textarea — auto-grow, max 6 lines]  [Send →]       │
└──────────────────────────────────────────────────────────────────┘
```

During an agent turn (state is not `idle`):

```
┌──────────────────────────────────────────────────────────────────┐
│  [Normal ▾]  [Textarea — disabled, opacity-50]     [■ Cancel]    │
└──────────────────────────────────────────────────────────────────┘
```

### Class specification

| Element | Classes |
|---|---|
| Container | `flex items-end gap-2 px-4 py-3 border-t border-zinc-200 bg-white sticky bottom-0` |
| Mode selector trigger | `Button` variant `outline`, size `sm`, `flex-shrink-0 h-9 gap-1` — shows current mode label + `ChevronDown` `w-3 h-3` |
| Textarea | `flex-1 min-h-[36px] max-h-[144px] resize-none overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2 text-base leading-normal focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 transition-colors duration-150` |
| Send button | `Button` with `className="bg-violet-600 hover:bg-violet-700 text-white flex-shrink-0 h-9 w-9 p-0"` — `SendHorizontal` icon `w-5 h-5`, `aria-label="Send message"` |
| Cancel button | `Button variant="destructive" flex-shrink-0 h-9 gap-1.5"` — `Square` icon `w-4 h-4` + "Cancel" label |

The textarea auto-grows by using `rows={1}` and listening to `onInput` to adjust `element.style.height`. Cap at `max-h-[144px]` (6 lines at `leading-normal` with `py-2`). Reset height to `auto` before recalculating to get correct `scrollHeight`.

**Send button disabled when:** `text.trim().length === 0` or `agentState !== 'idle'`. Use `disabled` attribute — shadcn/ui `Button` applies `opacity-50 cursor-not-allowed pointer-events-none` automatically.

**Submit on:** click Send button or `Ctrl+Enter` / `Cmd+Enter` keydown in textarea. Plain `Enter` adds a newline (standard textarea behavior). Rationale: `Shift+Enter` is the common chat convention for newlines, but many users expect `Enter` to send. We deviate from that convention because the agent responses benefit from multi-paragraph input, and accidental sends are disruptive. `Ctrl+Enter` is explicit without requiring a modifier on newlines.

**Send path:** send via WebSocket `user_message` client message directly (avoids the REST round-trip per design guide section 3.3). Immediately append the user message to the local message list optimistically. On `done`, the server-confirmed message replaces the optimistic one.

### Mode selector

shadcn/ui `DropdownMenu`. Three options:

| Label | `mode` value | Description shown in menu |
|---|---|---|
| Normal | `normal` | Standard agent run |
| Think | `think` | Extended reasoning (deep-think pipeline) |
| Delegate | `delegate` | Task delegation to a sub-agent |

The current mode label is shown in the trigger button. Default is `normal`.

---

## 12. MemoryPanel component

The right panel for memory state. Appears within a `Sheet` on `< lg`, or as an inline right panel at `lg+`.

### Anatomy

```
┌──────────────────────────────────────────┐
│  Memory                             [X]  │  ← panel header
│──────────────────────────────────────────│
│  Mode: ● Conversation                    │  ← current mode badge
│                                          │
│  Switch mode                             │
│  [Conversation] [Code] [Reasoning]       │  ← 3 buttons (Tabs or button group)
│                                          │
│  Context window                          │
│  ████████████░░░░░░░░  1 200 / 4 000    │  ← Progress bar
│  (30%)                                   │
│                                          │
│  Summary                            [▾]  │  ← collapsible
│  ──────────────────────────────────────  │
│  The user is researching climate         │
│  policy...                               │
│                                          │
│  Stats                                   │
│  Window messages: 12                     │
│  Summarized: 34                          │
│                                          │
│──────────────────────────────────────────│
│  [Clear memory]                          │  ← destructive, full width
└──────────────────────────────────────────┘
```

### Class specification

| Element | Classes |
|---|---|
| Panel root | `flex flex-col w-[320px] border-l border-zinc-200 bg-white h-full overflow-y-auto flex-shrink-0` |
| Panel header | `flex items-center justify-between px-4 py-3 border-b border-zinc-200 flex-shrink-0` |
| Panel title | `text-sm font-semibold text-zinc-900` — "Memory" |
| Close button | `Button` variant `ghost`, size `sm`, `aria-label="Close memory panel"` — `X` icon `w-4 h-4` |
| Panel body | `p-4 space-y-5 flex-1` |
| Mode badge | `Badge variant="outline"` — text: active mode name, capitalized |
| Mode switcher label | `text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2` — "Switch mode" |
| Mode buttons | Three `Button` components, variant `outline`, size `sm` — active mode gets `bg-violet-50 border-violet-300 text-violet-700` |
| Context window label | `text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2` — "Context window" |
| Progress bar | shadcn/ui `Progress`, `h-2` — value is `(tokens_used / context_window) * 100` — `className="[&>div]:bg-violet-600"` for violet fill |
| Progress text | `text-xs text-zinc-500 mt-1` — "{tokens_used} / {context_window} tokens ({percent}%)" |
| Summary collapsible | shadcn/ui `Collapsible` — `CollapsibleTrigger` shows "Summary" label with `ChevronDown`; `CollapsibleContent` shows summary text |
| Summary text | `text-sm text-zinc-600 leading-relaxed mt-2 max-h-[200px] overflow-y-auto` |
| Summary empty | `text-sm text-zinc-400 italic` — "No summary yet." |
| Stats section label | `text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2` — "Stats" |
| Stat row | `flex justify-between text-sm` — label `text-zinc-600`, value `text-zinc-900 font-medium` |
| Panel footer | `p-4 border-t border-zinc-200 flex-shrink-0` |
| Clear memory button | `Button variant="destructive" className="w-full"` — "Clear memory" |

### Clear memory confirmation

The "Clear memory" button opens a shadcn/ui `AlertDialog` (not a `Dialog`) with:
- Title: "Clear memory?"
- Description: "This will remove the summary and reset context. Message history is preserved."
- Cancel button: `outline`
- Confirm button: `destructive` — "Clear"

On confirm, call `DELETE /api/v1/sessions/:id/memory` then invalidate the memory query.

### Memory update on WebSocket event

When a `memory_update` event arrives, invalidate the TanStack Query cache for `GET /sessions/:id/memory`. The panel refetches automatically. A brief `animate-pulse` flash on the token usage bar can communicate the update — apply the class for 1 second after the refetch completes, then remove it.

---

## 13. ToolsSidebar component

The right panel for tool management.

### Anatomy

```
┌──────────────────────────────────────────┐
│  Tools                              [X]  │
│──────────────────────────────────────────│
│  ┌──────────────────────────────────┐    │
│  │  🔍 Search tools...              │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Active (3)                              │
│  ──────────────────────────────────────  │
│  web_search  Search the web  ● active  [off toggle]  │
│  read_file   Read files      ● auto    [off toggle]  │
│  write_file  Write files     ● active  [off toggle]  │
│                                          │
│  On demand (2)                           │
│  ──────────────────────────────────────  │
│  python_exec  Run Python     ○ on_demand [on toggle] │
│  ...                                     │
│                                          │
│  Disabled (1)                            │
│  ──────────────────────────────────────  │
│  shell_exec   Run shell      ✕ disabled [on toggle]  │
└──────────────────────────────────────────┘
```

### Class specification

| Element | Classes |
|---|---|
| Panel root | `flex flex-col w-[320px] border-l border-zinc-200 bg-white h-full overflow-hidden flex-shrink-0` |
| Panel header | `flex items-center justify-between px-4 py-3 border-b border-zinc-200 flex-shrink-0` |
| Panel title | `text-sm font-semibold text-zinc-900` — "Tools" |
| Close button | `Button` variant `ghost`, size `sm`, `aria-label="Close tools panel"` |
| Search input | `Input` with `Search` icon left — `px-3 py-2 text-sm`, container `relative` |
| Scrollable list | `flex-1 overflow-y-auto px-4 py-3 space-y-5` |
| Group header | `text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2` — "Active (3)" |
| Group divider | `border-b border-zinc-100 mb-3` |

### Tool row

```
flex items-center gap-3 py-2
```

| Element | Classes |
|---|---|
| Tool name | `text-sm font-medium text-zinc-900 flex-1 min-w-0 truncate` |
| Short description | `text-xs text-zinc-400 truncate` (on second line below name) |
| Status badge | See status badge spec below |
| Toggle | shadcn/ui `Switch`, size default — `checked` when status is `active` or `auto_approved` or `on_demand`; `unchecked` when `disabled` |

The tool name and description stack vertically:

```
flex flex-col flex-1 min-w-0
```

The toggle is on the far right, `flex-shrink-0`.

### Status badge spec

| Status | Badge classes |
|---|---|
| `active` | `text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200` |
| `auto_approved` | `text-xs font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200` |
| `on_demand` | `text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200` |
| `disabled` | `text-xs font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-400 border border-zinc-200` |

The status badge is display-only. Toggle action is via the `Switch`.

### Toggle behavior

`Switch` `checked` logic:
- `active`, `auto_approved`, `on_demand` → `checked={true}`
- `disabled` → `checked={false}`

Toggle from enabled → disabled: call `PATCH /sessions/:id/tools` with `{ disable: [toolName] }`.
Toggle from disabled → enabled: call `PATCH /sessions/:id/tools` with `{ enable: [toolName] }`.

The toggle optimistically updates the local state. On error, revert and show `toast.error`.

### Grouping

Tools are grouped by status in this order: `active` first, then `auto_approved`, then `on_demand`, then `disabled`. Each group renders only if it has at least one tool. The group header shows the count.

### Search/filter

Client-side filter on `name` and `short_description`. Filters across all groups simultaneously. Matching is case-insensitive substring. When a search is active, groups collapse if they have no matching tools.

---

## 14. WebSocket connection state indicator

A subtle connection status indicator is shown in the `SessionHeader`, to the left of the action buttons, only when the connection is not `open`.

| State | Visual |
|---|---|
| `connecting` | `Loader2` `w-4 h-4 text-zinc-400 animate-spin` + `text-xs text-zinc-400` "Connecting" |
| `reconnecting` | `Loader2` `w-4 h-4 text-amber-500 animate-spin` + `text-xs text-amber-600` "Reconnecting" |
| `closed` (after 10 failures) | `AlertCircle` `w-4 h-4 text-red-500` + `Button variant="ghost" size="sm"` "Reconnect" |
| `open` | Nothing rendered |

Rationale: showing a permanent "connected" indicator would add persistent visual noise. Only degraded states require user attention.

---

## 15. Interaction states summary

| Element | Hover | Focus | Disabled | Loading |
|---|---|---|---|---|
| Back button | `text-zinc-700 bg-zinc-100` (ghost hover) | `ring-2 ring-offset-2 ring-zinc-400` | n/a | n/a |
| Session name (display) | `text-zinc-600` | — | n/a | `opacity-50` (while saving) |
| Session name (input) | — | `ring-2 ring-offset-2 ring-zinc-400` | `opacity-50 cursor-not-allowed` | n/a |
| Memory / Tools toggle | `text-zinc-700 bg-zinc-100` | `ring-2 ring-offset-2 ring-zinc-400` | n/a | n/a |
| Send button | `bg-violet-700` | `ring-2 ring-offset-2 ring-zinc-400` | `opacity-50 cursor-not-allowed` | n/a |
| Cancel button | destructive hover | `ring-2 ring-offset-2 ring-zinc-400` | n/a | n/a |
| Tool toggle (Switch) | shadcn/ui defaults | shadcn/ui defaults | `opacity-50` | n/a |
| Mode switcher | `bg-zinc-100` (ghost hover) | `ring-2 ring-offset-2 ring-zinc-400` | n/a | n/a |
| ToolActivityRow (collapsed) | `bg-zinc-100` | `ring-2 ring-offset-2 ring-zinc-400` | n/a | n/a |
| Confirm modal buttons | per variant | `ring-2 ring-offset-2 ring-zinc-400` | `opacity-50` (after selection, while WS sends) | Spinner inside button |

---

## 16. Responsive behavior

| Breakpoint | Layout |
|---|---|
| `< lg` (mobile / tablet) | Sidebar hidden (AppShell handles). Right panels appear as `Sheet` from right edge. Message bubbles `max-w-[90%]`. Input bar full width. |
| `lg` | Left sidebar (220px) + chat area (flex-1). Right panels appear inline at `w-[320px]`. |
| `xl` | Same structure with wider message column. No change in component layout. |

On mobile, the mode selector label may be condensed to a single letter abbreviation ("N" / "T" / "D") to save horizontal space. Tooltip (shadcn/ui `Tooltip`) reveals the full label on long-press / hover.

The `SessionHeader` on `< md` hides the mode indicator text from `AgentStateBadge` (keeps only the dot). The session name truncates at ~16 characters. Rationale: the header must not wrap at small widths — all critical controls must remain on a single line.

---

## 17. Mockup brief for graphic_designer

Produce the following SVG mockups in `docs/web/mockups/`.

Use exact hex values from design system section 1 and the color reference table in brief section 17.5.

### Mockup 1: `sprint-3-chat-desktop.svg`

**Viewport:** 1440px wide, representing `xl` breakpoint (wider desktop).

Show:

- AppShell chrome: sidebar 220px `bg-zinc-50` with nav (Sessions active)
- Chat area with `SessionHeader`:
  - Back arrow, session name "Market Research Report", `AgentStateBadge` in "Writing..." state (green dot, pulsing), Brain and Wrench icons (inactive), MoreVertical icon
- `MessageList` with 4 messages:
  - Message 1 (user): "Can you research the latest climate policy proposals from 2025?" — right-aligned, violet-50 bubble
  - Message 2 (assistant): Multi-paragraph markdown response with a code block, left-aligned, white bubble with shadow-sm
  - Message 3 (user): "Now write a summary in bullet points." — right-aligned
  - Message 4 (`StreamingMessageBubble`): partial text "Here are the key points:\n\n- " with a blinking cursor, and one `ToolActivityRow` showing `web_search` in "Completed in 0.3s" state (collapsed), and one `ToolActivityRow` showing `read_file` in "Running..." state
- `MessageInput` at bottom: Send button visible (violet), textarea empty, mode selector showing "Normal"

No right panel open in this view.

### Mockup 2: `sprint-3-chat-memory-panel.svg`

**Viewport:** 1440px wide.

Same session as Mockup 1, but with the `MemoryPanel` open on the right:

- Memory panel at `w-[320px]` with `border-l border-zinc-200`
- Brain icon in header is highlighted (active state: `bg-violet-50 text-violet-600`)
- Panel shows: mode "Conversation" badge, mode switcher (Conversation active with violet border), context window Progress bar at ~30%, Summary section expanded with sample text, Stats showing 12 window messages / 34 summarized, "Clear memory" destructive button at bottom

### Mockup 3: `sprint-3-chat-tool-confirm.svg`

**Viewport:** 1440px wide.

Show the `ToolConfirmationModal` open over the chat page:

- Background: same chat layout, `bg-black/50` overlay
- Modal centered: `max-w-xl`
- Title: "Tool Confirmation Required"
- Tool name line: "write_file wants to perform an action."
- Message (italic): "Write 2 KB to /home/user/report.md"
- Parameters table: "path" row showing full path value; "content" row showing truncated value with "[Show more]"
- Footer row 1: Allow (violet), Deny (outline), Allow All (secondary)
- Footer row 2: Disable (outline), Forbid All (red destructive), Cancel (ghost)

### Mockup 4: `sprint-3-chat-mobile.svg`

**Viewport:** 390px wide, representing a typical mobile device.

Show:

- AppShell mobile top bar: hamburger icon, "Cogtrix" center, avatar right
- `SessionHeader`: back arrow, truncated session name "Market Research...", agent state dot only (no label text), Brain and Wrench icons
- `MessageList` showing 2 messages: one user and one assistant (bubbles `max-w-[90%]`)
- One `ToolActivityRow` collapsed below the assistant bubble
- `MessageInput` at bottom: full-width textarea, Send button, mode selector showing "N" (abbreviated)

No right panel (right panels are Sheet-only on mobile — do not show in this mockup).

### 17.5 Color reference for graphic_designer

All surfaces, borders, and text must use these values. No other colors.

| Token | Hex | Use |
|---|---|---|
| Page background | `#ffffff` | Main content area |
| Sidebar background | `#fafafa` | Left sidebar |
| Panel background | `#ffffff` | Right panels |
| Card / bubble white | `#ffffff` | Assistant bubble, tool row background |
| Muted surface | `#fafafa` | Tool row bg, code blocks, zinc-50 surfaces |
| Zinc-100 | `#f4f4f5` | Secondary buttons, system message bg |
| Border default | `#e4e4e7` | `border-zinc-200` — all borders |
| Border hover | `#d4d4d8` | `border-zinc-300` — hover borders |
| Text primary | `#18181b` | `text-zinc-900` — all body text, headings |
| Text secondary | `#52525b` | `text-zinc-600` — muted body |
| Text muted | `#71717a` | `text-zinc-500` — labels, captions |
| Text extra muted | `#a1a1aa` | `text-zinc-400` — timestamps, icons |
| Violet-50 | `#f5f3ff` | User bubble bg |
| Violet-200 | `#ddd6fe` | User bubble border |
| Violet-600 | `#7c3aed` | Send button, active panel toggle, progress bar fill, violet primary |
| Violet-700 | `#6d28d9` | Violet hover |
| Green-600 | `#16a34a` | Writing/done state dot, active tool badge |
| Blue-600 | `#2563eb` | Researching state dot, on_demand tool badge |
| Red-600 | `#dc2626` | Error state dot, destructive actions |
| Amber-500 | `#f59e0b` | Reconnecting state indicator |

---

## 18. shadcn/ui components to install

Run the following before implementation begins:

```bash
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add collapsible
pnpm dlx shadcn@latest add switch
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add alert-dialog
pnpm dlx shadcn@latest add sheet
```

`Dialog`, `Button`, `Input`, `Badge`, `Skeleton` are already installed from Sprints 1 and 2. `Select` is already installed from Sprint 2.

---

## 19. Component design system additions

The following entries must be added to `docs/web/design-system.md` section 12 (Component Inventory) before implementation begins:

| Component | Variants | shadcn/ui base | Pages |
|---|---|---|---|
| `SessionHeader` | default | Custom | Session page |
| `MessageList` | default | Custom | Session page |
| `StreamingMessageBubble` | assistant-streaming | Custom (extends MessageBubble) | Session page |
| `ToolActivityRow` | running, done, error | Custom (uses Collapsible) | Session page |
| `ToolConfirmationModal` | default (blocking) | `dialog` | Session page |
| `MessageInput` | idle, agent-running | Custom (uses Textarea, DropdownMenu) | Session page |
| `MemoryPanel` | default | Custom (uses Progress, Collapsible) | Session page |
| `ToolsSidebar` | default | Custom (uses Switch) | Session page |

These are already listed in the task scope and match the component list specified in the user request.

---

## 20. Acceptance criteria

The implementation is accepted when:

1. `SessionPage` mounts, connects the WebSocket to `/ws/v1/sessions/:id?token=<jwt>&last_seq=-1`, and disconnects on unmount.
2. Initial message history loads via `GET /sessions/:id/messages` with `useInfiniteQuery`. Skeleton bubbles show while `isLoading`.
3. Scrolling toward the top of the list triggers upward pagination (`fetchPreviousPage`). Scroll position is preserved after prepend.
4. User messages are right-aligned (`bg-violet-50 border-violet-200 rounded-2xl rounded-br-sm`). Assistant messages are left-aligned (`bg-white border-zinc-200 rounded-2xl rounded-bl-sm shadow-sm`). System messages are centered (`bg-zinc-100 rounded-md italic`).
5. Assistant message content renders Markdown. Code blocks use `font-mono bg-zinc-50 border border-zinc-200`. HTML rendering is disabled in `react-markdown`.
6. While a token stream is active, `StreamingMessageBubble` appends tokens in real time and shows the `.streaming-cursor` blinking cursor. On `done`, the streaming bubble is replaced by a standard `MessageBubble`.
7. `ToolActivityRow` renders collapsed by default. Clicking expands to show JSON input and output/error. The expand chevron rotates on open.
8. On `tool_confirm_request` WebSocket event, `ToolConfirmationModal` opens immediately. Clicking outside the modal or pressing `Escape` does not dismiss it. All six action buttons send `tool_confirm` over the WebSocket and close the modal.
9. `MessageInput` textarea grows to a maximum of 6 lines. `Ctrl+Enter` / `Cmd+Enter` sends the message. `Enter` alone inserts a newline. The Send button is disabled when the textarea is empty or when the agent state is not `idle`. During an agent turn, a `Cancel` button replaces the Send button and sends `cancel` over the WebSocket on click.
10. `SessionHeader` inline name editing works: click to enter edit mode, `Enter` or blur to save, `Escape` to cancel. Empty name is not saved. The `PATCH /sessions/:id` call completes without error before exiting edit mode.
11. Memory panel opens/closes via the Brain icon toggle. Memory state loads from `GET /sessions/:id/memory`. Mode switching calls `PATCH /sessions/:id/memory`. Clear memory shows `AlertDialog` confirmation before calling `DELETE /sessions/:id/memory`.
12. Tools sidebar opens/closes via the Wrench icon toggle. Tool status loads from `GET /sessions/:id/tools`. Switch toggle calls `PATCH /sessions/:id/tools` with `enable` or `disable`. Search filters the list client-side.
13. At `< lg`, right panels render as `Sheet` (not inline). The chat area has `flex-1 min-w-0` and does not overflow horizontally.
14. WebSocket reconnection uses exponential backoff (1s → 2s → 4s → 8s → 16s → 30s cap). After 10 failures, the header shows a manual "Reconnect" button.
15. Zero TypeScript errors (`pnpm build` passes). Zero ESLint warnings.
