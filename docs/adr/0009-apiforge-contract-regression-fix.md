# 0009 — APIForge Contract Regression Fix

**Date**: 2026-03-25
**Status**: Accepted

## Context

Commit `e28ac2d` (APIForge contract sync) introduced TypeScript types that diverged from the
actual backend OpenAPI schema. Six schemas were replaced with shapes that never existed in the
backend, breaking every component on the assistant page at runtime:

| Type | Wrong field(s) | Correct field(s) |
|---|---|---|
| `ChatSessionOut` | `last_message_at`, `workflow_id` (no display name, no lock) | `last_activity`, `display_name`, `memory_mode`, `is_locked` |
| `DeferredRecordOut` | `channel`, `chat_id`, `pending_messages: number` | `pending_messages: string[]`, `created_at` (no `channel`/`chat_id`) |
| `ContactOut` | `channel: string \| null`, `identifier: string` (singular) | `identifiers: string[]`, `channels: string[]` (both plural) |
| `KnowledgeFactOut` | `fact_id` | `id`, `source_channel`, `relevance_score` |
| `ViolationRecordOut` | `count: number`, `last_at: string` | `channel`, `violation_type`, `detail`, `timestamp` |
| `GuardrailStatusOut` | `violations`, `rate_limit_config` | `recent_violations`, `total_violations` |

The `ChatSessionOut` schema also surfaces two fields (`memory_mode`, `is_locked`) not previously
shown anywhere in the UI.

This ADR records the agreed correction strategy and answers four design questions that arose from
the corrected shapes.

## Options Considered

### Q1 — `memory_mode` and `is_locked` in `ChatSessionOut`

**Option A — Informational columns only**
Add `memory_mode` as a plain-text secondary column and `is_locked` as a lock icon next to the
chat identifier in `AssistantChatList`. No new reusable components needed.

**Option B — Dedicated reusable components**
Introduce a `MemoryModeChip` and a `LockIndicatorBadge` in `src/components/`.

Option A is correct at this stage. Only one consumer exists (`AssistantChatList`). Per the
architecture rule, a new reusable component is only warranted when two or more concrete cases
share the same shape. Neither field appears anywhere else in the codebase.

### Q2 — Violation type display (`ViolationBadge` vs inline text)

The corrected `ViolationRecordOut` now exposes `violation_type` with values
`input | encoding | tool_call | rate_limit | llm_judge`.

DS v3.11 documents `ViolationBadge` with variants `rate_limit, content_filter, spam, unknown`.
These variant names were written against a hypothetical schema. The actual backend values do not
match (`content_filter` and `spam` do not exist; `input`, `encoding`, `tool_call`, `llm_judge`
do not have mapped variants).

**Option A — Activate `ViolationBadge` with a corrected variant mapping**
Remap all five real values to the DS color table. New mapping:
- `rate_limit` → `bg-amber-50 text-amber-700 border-amber-200` (matches existing DS entry)
- `input` → `bg-red-50 text-red-700 border-red-200` (content blocked at input layer)
- `encoding` → `bg-red-50 text-red-700 border-red-200` (same severity as input)
- `tool_call` → `bg-orange-50 text-orange-700 border-orange-200` (tool-layer violation)
- `llm_judge` → `bg-purple-50 text-purple-700 border-purple-200` (model-evaluated; distinct)
- fallback/unknown → `bg-zinc-100 text-zinc-700 border-zinc-200`

**Option B — Inline `<Badge variant="outline">` with plain text, no dedicated component**
Render the raw `violation_type` string in a plain `Badge variant="outline"` with no color
semantics. Simple, no DS update required.

Option A is the decision. The DS already defines `ViolationBadge` as a named component and its
dormancy note was written explicitly pending the `violation_type` field. Now that the field is
present the badge should be activated. The colour mapping above supersedes the dormancy note in
DS v3.11 and must be applied as a DS v3.12 update.

`ViolationBadge` is a component (`src/components/ViolationBadge.tsx`) with a single prop
`type: string`. It renders a `Badge` from shadcn with the color class determined by a lookup
map. No `variant` prop on the shadcn `Badge` is required — use `className` overrides only.
The component lives in `src/components/` because it has two consumers (`GuardrailsPanel`
current; any future violation surface).

### Q3 — `DeferredRecordTable` pending_messages display

The corrected `pending_messages` field is `string[]` (an array of raw message texts), not a
pre-computed count.

**Option A — Count only**
Render `record.pending_messages.length`. Simple integer, no extra UI.

**Option B — Count with hover tooltip listing the messages**
Render `record.pending_messages.length` in a `<TooltipTrigger>` that shows the individual
message strings in a `<TooltipContent>`. Uses the existing shadcn Tooltip primitive.

Option B is the decision. The count alone loses operationally useful information (operators need
to know what messages are pending to understand whether cancellation is safe). The shadcn
`Tooltip` is already installed. The tooltip content should render each message on its own line,
capped at a reasonable visual limit (first 5 messages; if `length > 5` append "+ N more").

No new custom component is required — the tooltip is inlined in `DeferredRecordTable`.
Install command is not needed; `@/components/ui/tooltip` already exists.

### Q4 — `ContactList` multi-value identifiers and channels

The corrected `ContactOut` has `identifiers: string[]` and `channels: string[]`.

**Option A — Comma-separated joined text**
`identifiers.join(", ")` in a single table cell. No new markup, easy to scan for 1–2 values.
Falls apart visually when there are more than 3 values.

**Option B — Individual `<Badge>` per value**
Each identifier and channel rendered as an inline `Badge variant="outline"` inside a
`flex flex-wrap gap-1` container.

Option B is the decision for both columns. Contacts are typically keyed by phone/telegram IDs;
showing them as distinct badges avoids ambiguity (a comma in a phone number would be confusing).
`channels` values are short strings (`whatsapp`, `telegram`) that scan well as badges.

This is a purely local rendering change inside `ContactList` — no new component, just inline
markup. The `Identifier` column header should be renamed to `Identifiers` and the `Channel`
column (previously singular) should be renamed to `Channels`. A new `Channels` column must be
added; the existing table had only a `channel` scalar which is being dropped.

## Decision

1. Apply all six type corrections verbatim in `src/lib/api/types/assistant.ts` and
   `src/lib/api/types/system.ts`.

2. `memory_mode` and `is_locked`: add as informational columns in `AssistantChatList` only —
   no new reusable components. `is_locked` renders as a `Lock` lucide icon (`h-4 w-4
   text-zinc-500`) when `true`, absent when `false`. `memory_mode` renders as a plain secondary
   text cell (`text-sm text-zinc-600`). The `aria-label` on the chat-row button must use
   `display_name ?? chat_id` rather than `chat_id` alone.

3. Activate `ViolationBadge` as a new file `src/components/ViolationBadge.tsx`. DS must be
   updated to v3.12 with the corrected variant mapping before implementation. The `GuardrailsPanel`
   violations table columns change from `[Chat ID, Count, Last Violation]` to
   `[Chat ID, Channel, Type, Detail, Timestamp]`. The `total_violations` integer from
   `GuardrailStatusOut` replaces the previous `violations.length` count badge in the card header.

4. `DeferredRecordTable` renders `record.pending_messages.length` inside a shadcn `Tooltip`. No
   new component file. The `channel` and `chat_id` columns are removed (those fields no longer
   exist on the type). `created_at` replaces them as a new secondary column.

5. `ContactList` renders `identifiers` and `channels` as inline badge lists. Two column headers
   renamed (`Identifier` → `Identifiers`, `Channel` → `Channels`). Filter-row channel
   Select must be updated: previously it could filter by `contact.channel`; with the corrected
   type the filter against `channels` array requires `channels.includes(filterValue)`. If the
   contacts query accepts a `channel` query parameter the filter can remain server-side — check
   `useContactsQuery` before implementing client-side filtering.

6. `WorkflowsPanel` bind-session `SelectItem` label: use `c.display_name ?? c.session_key`.
   The bound-sessions table row label also changes to `display_name ?? session_key`.

7. `KnowledgePanel` key and delete references: `fact.fact_id` → `fact.id`. The two new fields
   `source_channel` and `relevance_score` are informational. `relevance_score` should be
   displayed only in the semantic search results view (where it is meaningful), not in the
   full fact list (where it is always `null`).

## Consequences

- All six broken assistant-page components will type-check and render correctly once the types
  and component patches are applied.
- `ViolationBadge` transitions from dormant/planned to active. DS v3.12 must be produced by
  `web_designer` before `web_coder` implements it.
- The `GuardrailsPanel` table schema changes significantly (5 columns instead of 3); a design
  review or updated mockup is required before implementation to confirm the column widths and
  `detail` truncation behaviour.
- `DeferredRecordTable` loses two columns and gains one; the table is narrower and less
  redundant.
- `ContactList` gains a `channels` column. The existing single-channel filter row must be
  audited: if `useContactsQuery` does not support multi-value channel filtering the filter
  should be removed or converted to a client-side `array.includes` check.
- No new stores, hooks, or query key changes are required — this is a type and rendering
  correction only.
- The `activeChatName` local variable in `AssistantChatList` (currently `activeChat?.chat_id`)
  must be changed to `activeChat?.display_name ?? activeChat?.chat_id ?? ""` so that
  `ChatHistoryDrawer` receives a human-readable title.
