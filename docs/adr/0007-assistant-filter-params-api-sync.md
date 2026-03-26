# 0007 — Assistant Panel Filter Params and API Sync (GAP-001 through GAP-006)

**Date**: 2026-03-24
**Status**: Accepted

## Context

The Cogtrix backend added filter query parameters to five assistant endpoints
(`/assistant/scheduled`, `/assistant/chats`, `/assistant/deferred`,
`/assistant/knowledge`, `/assistant/campaigns`) and new fields to several
response types (`ScheduledMessageOut.attempts/max_attempts/status`,
`ChatSessionOut.display_name/message_count/memory_mode`,
`DeferredRecordOut.pending_messages/status`). None of these are currently
exposed in the frontend hooks or UI panels. The `statusBadgeClass()` helper in
`ScheduledMessageTable` is also missing coverage for the `firing` and `failed`
status variants that now exist on the type.

## Options Considered

### Question 1 — Filter state location

**Option A — Component `useState`**

Filter values live as local state inside each panel component
(`ScheduledMessageTable`, `AssistantChatList`, `DeferredRecordTable`,
`KnowledgePanel`, `CampaignsPanel`). Resetting on tab unmount is free. No
cross-tab coordination is needed or desired.

Pros: matches existing pattern for dialog open/close state in these panels;
zero new abstractions; filter resets naturally when the user navigates away from
the tab, which is correct behaviour for transient UI preferences.

Cons: none significant for this scope.

**Option B — `useUIStore` or a new `assistant-filters-store.ts`**

Persist filter selections across tab switches within the same page mount.

Pros: user does not lose the filter when switching tabs briefly.

Cons: duplicates server-state concerns into Zustand; filter values that
differ from the defaults result in a mismatch between what is stored and what
query cache holds, creating a synchronisation risk. The benefit is marginal —
these panels are rarely used with filters set persistently.

**Decision**: Option A. Component `useState` is correct for transient
session-level UI preferences that do not need to survive tab navigation. This
is consistent with how the existing `createOpen` / `editTarget` dialog states
are managed in the same panel files.

---

### Question 2 — Query key structure for filtered variants

**Option A — Object param: `keys.assistant.scheduled(filters?: { channel?: string; chat_id?: string })`**

The filter bag is passed as a single optional object. The key factory spreads
or embeds the object into the tuple, consistent with how
`keys.sessions.list({ includeArchived })` and
`keys.assistant.campaigns.list(status)` are already shaped.

Pros: extensible without a signature change when additional filters are added
later; parallel shape to the existing `sessions.list` key factory; the object
is stable for TanStack Query's structural equality check when values are
primitives.

Cons: slightly more verbose at call sites than positional params.

**Option B — Flat positional params**

`keys.assistant.scheduled(channel?: string, chatId?: string)`

Pros: compact call site for the current two-param case.

Cons: adding a third filter later is a breaking change to the key factory
signature and all callers; inconsistent with `sessions.list` which already uses
the object pattern.

**Decision**: Option A — object param bag for all five key factories.

The canonical shapes are:

```
keys.assistant.scheduled(filters?: { channel?: string; chat_id?: string })
keys.assistant.chats(filters?: { channel?: string })
keys.assistant.deferred(filters?: { channel?: string })
keys.assistant.knowledge(filters?: { source_chat?: string })
```

`keys.assistant.campaigns.list` already accepts a `status?: CampaignStatus`
scalar; that factory should be left as-is because campaigns filter only on a
single typed enum value and changing the signature would be a gratuitous
churn.

When `filters` is `undefined` or an empty object `{}`, the factory must
produce the same key as today's no-arg call so that existing cache entries
remain valid. Concretely: only include the filters object in the tuple when at
least one filter value is defined and non-empty.

---

### Question 3 — Channel filter option source

**Option A — Derive options from `AssistantStatusOut.channels[]`**

The assistant status query (`keys.assistant.status()`) is already fetched
by `ServiceControlPanel` on every `assistant.tsx` mount. Its result is
available in the TanStack Query cache throughout the lifetime of the assistant
page. Each panel that needs channel options calls `useAssistantStatusQuery()`
(no extra network request — cache hit), maps `channels` to their `name` values,
and feeds those strings into the channel `Select`.

Pros: the filter shows only channels that actually exist in the server
configuration; avoids hardcoding stale or environment-specific channel names;
no new data dependency.

Cons: if `AssistantStatusOut.channels` is `undefined` (assistant stopped),
the filter control must still render — fall back to a free-text input or show
a disabled Select with placeholder text.

**Option B — Hardcode `["whatsapp", "telegram"]`**

Pros: simpler rendering path.

Cons: breaks for any deployment that uses only one channel type or adds a
future channel type; diverges from the actual type model where `ChannelStatusOut.type`
is a discriminated union but `name` is an arbitrary string set by the operator.
A channel named `"wa-prod"` would not appear in the hardcoded list.

**Decision**: Option A. Derive options from `AssistantStatusOut.channels[].name`.
The `useAssistantStatusQuery` hook already exists and the status is always
fetched when the assistant page is open; calling it from filter-bearing panels
is a cache hit, not a new request.

When `channels` is `undefined` or empty, render the Select with a single
placeholder option ("All channels") and no filterable items — do not disable
the filter control entirely, so the UX shape is stable regardless of assistant
state.

---

### Question 4 — Structural concerns

**GAP-001 `statusBadgeClass` — incomplete enum coverage**

`statusBadgeClass` in `ScheduledMessageTable.tsx` is a plain function returning
a class string. The type `ScheduledMessageOut.status` is now
`"pending" | "firing" | "sent" | "failed" | "cancelled"`. The function's
default fallback silently renders `firing` and `failed` as neutral zinc — this
is a data correctness bug, not a display preference.

This should be converted to a `Record<ScheduledMessageOut["status"], string>`
lookup table (matching the `STATUS_BADGE` record pattern already used in
`CampaignsPanel`) so TypeScript enforces exhaustive coverage. The two missing
variants are: `firing` → amber (`bg-amber-50 text-amber-700 border-amber-200`),
`failed` → red (`bg-red-50 text-red-700 border-red-200`).

**Hook param passing — URLSearchParams discipline**

`useCampaignsQuery` builds query strings by string concatenation
(`?status_filter=${status}`). The four new filtered hooks must use
`URLSearchParams` construction instead, passing the params object or string to
`api.get`. This keeps encoding correct for values that might contain special
characters and keeps the pattern consistent.

Confirm with `client.ts` that `api.get` accepts a URL with a query string
appended directly — this is the current pattern and it does work, but the
implementation note stands: prefer `new URLSearchParams(params).toString()`
over template-literal concatenation.

**New fields in existing types — no type changes needed**

`ChatSessionOut.display_name`, `message_count`, and `memory_mode` are already
present on the type in `assistant.ts`. `DeferredRecordOut.pending_messages` and
`status` are also present. `ScheduledMessageOut.attempts` and `max_attempts`
are already typed. No type file changes are needed — only the UI panels and
hooks need updates.

**`display_name` in `AssistantChatList` — nullable handling**

`ChatSessionOut.display_name` is `string | null`. When rendered in the table
it must fall back to `chat_id` (not to an em-dash) because `chat_id` is the
meaningful identifier when no display name is set. Use
`display_name ?? chat_id`.

**`pending_messages` in `DeferredRecordTable` — render strategy**

`DeferredRecordOut.pending_messages` is `string[]`. Rendering the full array
inline in a table cell risks overflow. Show a count badge (e.g. "3 messages")
in the table row and expose the full list in a tooltip or expandable detail,
consistent with how `CampaignDetail` handles the targets array.

**`source_chat` filter in `KnowledgePanel` (GAP-004)**

`source_chat` is a free-text string (a `session_key` value), not a bounded
enum like channel. Render this as a plain text `Input` with debounced state,
not a Select. Wire the debounced value into the hook param — do not fire a
new query on every keystroke; use a 300 ms debounce with a local `useState`
split from the query input.

**`CampaignsPanel` status filter (GAP-005)**

`useCampaignsQuery` already accepts `status?: CampaignStatus`. Adding a filter
Select in `CampaignsPanel` that drives the `status` state is a pure UI change.
The `useCampaignsQuery` hook and its key factory need no changes. The
`invalidateQueries` calls in mutation handlers use
`keys.assistant.campaigns.list()` (no-arg) which correctly matches all cached
variants because TanStack Query's invalidation uses prefix matching on the
key tuple.

**Invalidation scope after mutations**

When a filtered query is active, mutation `onSuccess` handlers that call
`invalidateQueries({ queryKey: keys.assistant.campaigns.list() })` will
invalidate all `["assistant", "campaigns", "list", ...]` entries regardless of
filter. This is correct and desirable — a campaign status change should refresh
all cached filter views.

The same applies to the other four query families once filter-aware keys are
in place: invalidation should always target the `all` ancestor key of the
domain (e.g. `["assistant", "scheduled"]`) rather than a specific filter
variant, to avoid stale entries in sibling filter caches.

## Decision

1. Filter state: component `useState` in each panel.
2. Query key shape: object param bag `filters?: { ... }` for all four new
   filtered key factories; campaigns key factory unchanged.
3. Channel options: derived from `useAssistantStatusQuery().data?.channels`,
   falling back to an "All channels" placeholder when unavailable.
4. `statusBadgeClass` converted to an exhaustive `Record` lookup with amber
   for `firing` and red for `failed`.
5. `pending_messages` rendered as count badge with tooltip/expand pattern.
6. `source_chat` filter uses debounced text Input.
7. Mutation invalidations target domain-level ancestor keys, not filter-specific
   leaf keys.

## Consequences

- Five hooks gain an optional filter param; their public signatures remain
  backward-compatible (all new params are optional).
- Six query key factory functions change; all existing call sites that pass no
  args continue to work unchanged.
- No new Zustand stores. No new TanStack Query caches beyond what the filter
  variants produce automatically.
- `ScheduledMessageOut["status"]` exhaustiveness is now enforced by TypeScript
  rather than relying on a runtime fallback.
- `useAssistantStatusQuery` gains a second call site (each filter-bearing
  panel); all calls are cache hits after the first.
