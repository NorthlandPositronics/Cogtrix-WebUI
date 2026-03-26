# 0001 — State Management Boundaries

**Date**: 2026-03-05
**Status**: Accepted

---

## Context

The application has two established state management tools: TanStack Query v5 for server
state and Zustand v5 for client state. As the feature set grows to cover sessions, messages,
memory, tools, configuration, streaming output, and UI toggles, the boundary between these
two tools must be defined precisely and non-negotiably. Without a clear rule, developers will
make local judgment calls that lead to server data being duplicated into Zustand stores,
query cache invalidations being missed, and streaming state leaking into wrong layers.

Three specific questions must be resolved:

1. Which state categories belong to TanStack Query, which to Zustand?
2. Should the `streaming-store` reset on session navigate, or persist keyed by `sessionId`?
3. Should the application support multiple simultaneously open sessions (e.g., in browser tabs
   that share the same React tree)?

The project plan (Section 3, invariant 3) states: "Server state lives in TanStack Query —
never duplicated into Zustand." This ADR operationalises that invariant across all domains
present in the API contract.

---

## Options Considered

### Question 1 — State category ownership

**Option A: All server-derived data in TanStack Query; all ephemeral client state in Zustand**

TanStack Query owns every data set that originates from a REST response: session list,
session detail, message history, memory state, tool status, config, providers, models, MCP
servers, API keys, system info, assistant status, documents, and RAG search results.
Zustand owns three bounded domains: auth credentials and user profile (`auth-store`),
WebSocket streaming data (`streaming-store`), and UI panel/toggle state (`ui-store`).

Pros: Clean boundary; no duplication; cache invalidation is always in one place.
Cons: Slightly more hook call sites in page components.

**Option B: Hybrid — session details also stored in Zustand for cross-component access**

Put frequently accessed fields (session name, agent state from the last REST poll) in a
Zustand session slice so deep components can read them without prop drilling.

Pros: Fewer prop-drilled values.
Cons: Violates the single-source-of-truth rule; stale data in Zustand will diverge from the
query cache whenever a mutation fires; any mutation must update two places.

Option A is the only option consistent with the architecture invariants.

### Question 2 — streaming-store reset behaviour on session navigate

**Option A: Reset on session unmount (streaming state is ephemeral)**

When the user navigates away from `/sessions/:id`, the `useSessionSocket` hook tears down
the WebSocket and calls a `reset()` action on `streaming-store` that clears `streamingBuffer`,
`agentState`, `pendingConfirmation`, and `toolRows` back to initial values.
`connectionStatus` is set to `'closed'`.

Pros: No stale state from a previous session bleeds into the next session the user opens.
A tool confirmation dialog from session A cannot reappear when session B is opened.
The store shape stays flat — no `Map<sessionId, StreamingState>` required.

Cons: If the user navigates away mid-stream and immediately returns, the in-progress buffer
is lost. The committed message will appear once `done` fires and the query cache is updated,
but partial tokens are gone.

**Option B: Persist streaming state keyed by sessionId**

`streaming-store` holds `Map<sessionId, SessionStreamingState>`. On navigate, state for the
old session is retained so the user can return to see the in-flight buffer.

Pros: Better UX for accidental navigation during a long agent turn.
Cons: Requires the store shape to be a Map rather than a flat object; every consumer must
look up by `sessionId`; stale confirmations for completed sessions accumulate in memory;
significantly more complex cleanup logic is needed.

The design decision is Option A — reset on unmount. Streaming state is inherently ephemeral:
its purpose is to render in-progress output that has not yet been committed to the query
cache. Once the session page unmounts, that in-progress context is no longer meaningful.
The committed `MessageOut` record appears via query cache on the next mount. The cost of
losing partial tokens on accidental back-navigation is acceptable; the cost of stale
confirmation modals or corrupted buffers across sessions is not.

### Question 3 — Multiple simultaneous open sessions

**Option A: Single active session**

The architecture supports exactly one active `SessionSocket` at a time. The `streaming-store`
is a flat singleton (not keyed by session). Only one session page can be mounted in the
React tree at once.

Pros: Matches the flat store shape decided in Question 2. Matches the backend's own
constraint (close code `4010` — "Already connected — second connection replaced the first").
Simpler WebSocket lifecycle. No need to scope streaming state reads by session.

Cons: Browser tab isolation is left to the OS — two browser tabs each connect their own
socket normally, but the same React tree cannot render two sessions simultaneously.

**Option B: Multi-session support**

Allow multiple sessions to be opened in a tabbed UI within the same React tree. Each session
tab maintains its own `SessionSocket` and a slot in a keyed streaming store.

Pros: Power-user feature.
Cons: The backend drops the older connection when a second one opens (close code `4010`),
making this impossible without per-tab `sessionId` isolation. Would require a keyed streaming
store, complex mount/unmount lifecycle, and a tabbed UI that is not in scope.

Option A — single active session — is the decision. The backend protocol enforces it.

---

## Decision

**State ownership by domain:**

| Data | Owner | Store / Key pattern |
|------|-------|---------------------|
| Session list | TanStack Query | `keys.sessions.list()` |
| Session detail | TanStack Query | `keys.sessions.detail(id)` |
| Message history | TanStack Query | `keys.messages.list(sessionId)` |
| Memory state | TanStack Query | `keys.memory(sessionId)` |
| Session tool status | TanStack Query | `keys.tools.session(sessionId)` |
| Global config | TanStack Query | `keys.config()` |
| Providers | TanStack Query | `keys.providers()` |
| Models | TanStack Query | `keys.models()` |
| MCP servers | TanStack Query | `keys.mcpServers()` |
| API keys | TanStack Query | `keys.apiKeys()` |
| System info | TanStack Query | `keys.systemInfo()` |
| Assistant status | TanStack Query | `keys.assistantStatus()` |
| Documents | TanStack Query | `keys.documents.list()` |
| Auth user + tokens | Zustand `auth-store` | `user`, `isAuthenticated`, `isAdmin` |
| Streaming buffer | Zustand `streaming-store` | `streamingBuffer` (string) |
| Agent state (live) | Zustand `streaming-store` | `agentState` |
| Pending confirmation | Zustand `streaming-store` | `pendingConfirmation` |
| Active tool rows | Zustand `streaming-store` | `toolRows` (Map) |
| WS connection status | Zustand `streaming-store` | `connectionStatus` |
| UI panel toggles | Zustand `ui-store` | `sidebarOpen`, `memoryPanelOpen`, `toolsPanelOpen` |

**Zustand store files:**

- `src/lib/stores/auth-store.ts` — auth domain only
- `src/lib/stores/streaming-store.ts` — WebSocket streaming domain only
- `src/lib/stores/ui-store.ts` — UI toggle domain only

**Reset rule:** `streaming-store.reset()` is called by `useSessionSocket` on hook cleanup
(React `useEffect` cleanup function). This fires on session page unmount and on hot
`sessionId` change within a mounted page.

**Single active session:** Only one `SessionSocket` instance is alive at any time. This is
enforced by managing the socket entirely within `useSessionSocket`, which is called once at
the `SessionPage` level.

**Anti-patterns that are prohibited:**

- No Zustand store may hold a copy of any data available from a TanStack Query key.
- No component may read server data from a Zustand store.
- `auth-store`, `streaming-store`, and `ui-store` must never import from each other.
- No new monolithic store. Each new state domain gets its own `<domain>-store.ts`.

---

## Consequences

**Enables:**
- A single call to `queryClient.invalidateQueries(keys.memory(sessionId))` is sufficient to
  refresh memory state after a `memory_update` WebSocket event — no secondary Zustand update
  is needed.
- Mutations (session create, message send, tool action) need only invalidate the relevant
  query keys; no Zustand sync is required.
- The streaming store's flat shape allows every component on the session page to subscribe
  to exactly the slice it needs with no extra lookup by session.

**Constrains:**
- Components deep in the chat page that need session name or session config must receive
  it via props from the page, or call `useSessionQuery` themselves. They may not read it
  from a Zustand store.
- If a future feature requires rendering two sessions simultaneously, this ADR must be
  superseded and the streaming store redesigned before implementation begins.

**Defers:**
- The exact shape of `ToolActivityRow` entries in `streaming-store.toolRows` is specified
  in ADR-0002.
- The full query key factory structure in `keys.ts` is an implementation detail for Sprint 0,
  not an architectural decision.
