# 0002 — WebSocket Integration Pattern

**Date**: 2026-03-05
**Status**: Accepted

> **Path note (2026-03-27)**: File paths referenced throughout this ADR reflect the state at the time of the decision (2026-03-05). The project was later restructured. Current canonical paths:
> - `src/lib/ws/session-socket.ts` → `src/lib/api/ws/session-socket.ts`
> - `src/lib/ws/log-socket.ts` → `src/lib/api/ws/log-socket.ts`
> - `src/hooks/useSessionSocket.ts` → `src/hooks/chat/useSessionSocket.ts`
> - `src/hooks/useLogSocket.ts` → `src/hooks/admin/useLogSocket.ts`

---

## Context

The application uses two WebSocket endpoints:

1. `ws://host/ws/v1/sessions/{session_id}` — per-session streaming endpoint carrying
   `token`, `tool_start`, `tool_end`, `tool_confirm_request`, `agent_state`, `memory_update`,
   `error`, `done`, and `pong` message types.
2. `ws://host/ws/v1/logs` — admin-only log streaming endpoint carrying `log_line` messages.

The `SessionSocket` class in `src/lib/ws/session-socket.ts` already exists (partially) and
handles connection, reconnection, ping, and `seq` tracking. What is not yet defined is:

- How the class is instantiated and tied to the React component tree.
- Which React layer owns the instance and is responsible for teardown.
- How each message type is routed to UI state (TanStack Query cache or Zustand store).
- Which specific Zustand actions are called for each message type.
- Whether the log stream WebSocket should reuse `SessionSocket` or use a separate class.

The project plan (Section 10, risk table) calls out that the `LogSocket` / `SessionSocket`
sharing question is an ADR candidate. Section 6.5 notes the architect must resolve this
before Sprint 5A implementation.

The existing `session-socket.ts` has four defects that must be corrected in Sprint 0
alongside this ADR's decisions:
- `last_seq` is initialised to `0` (should be `-1`; server replays `seq > last_seq`).
- Reconnect uses fixed 3-second delay (must be exponential backoff, cap 30 s, 10 attempts).
- No keepalive ping on 30-second interval.
- Close codes are not yet routed to application-level actions.

---

## Options Considered

### How to expose SessionSocket to React

**Option A: useSessionSocket hook at the page level**

A `useSessionSocket(sessionId: string)` hook in `src/hooks/useSessionSocket.ts` creates a
`SessionSocket` instance in a `useRef`, calls `connect()` in `useEffect` on mount, and calls
`disconnect()` in the cleanup function. The hook also registers all event handlers, routing
each server message type to the correct Zustand action or TanStack Query cache update.
The hook is called once at the `SessionPage` component level.

Pros: Instance lifetime is tied to the page lifecycle. Cleanup is automatic. The hook
encapsulates all routing logic in one file. `SessionSocket` class stays unaware of React.

Cons: None that outweigh the benefits.

**Option B: React context wrapping SessionSocket**

Create a `SessionSocketContext` that holds the `SessionSocket` instance and exposes send
methods to child components.

Pros: Deep components can call `socket.cancel()` or `socket.confirmTool()` without prop
drilling.
Cons: A context provider adds an extra component layer. The same effect is achieved by
having the page pass `onCancel` and `onConfirm` callbacks as props, keeping the component
tree simpler. Callbacks are preferable to context for passing imperative actions.

Option A is the decision. The page holds the socket reference; it passes send callbacks
as props to the components that need them (`MessageInput`, `ToolConfirmationModal`).

### How each server message type routes to state

This is not a true option comparison — it is a specification derived from ADR-0001 (which
established that streaming state lives in `streaming-store` and server-committed data lives
in TanStack Query).

The routing table is:

| Server message | Target | Action |
|----------------|--------|--------|
| `token` | `streaming-store` | `appendToken(text)` — concatenates to `streamingBuffer` |
| `tool_start` | `streaming-store` | `addToolRow(id, tool, input)` — adds entry to `toolRows` Map |
| `tool_end` | `streaming-store` | `finalizeToolRow(id, durationMs, error)` — updates entry |
| `tool_confirm_request` | `streaming-store` | `setPendingConfirmation(payload)` |
| `agent_state` | `streaming-store` | `setAgentState(state)` |
| `memory_update` | TanStack Query | `queryClient.invalidateQueries(keys.memory(sessionId))` |
| `error` | `streaming-store` + toast | `setAgentState('error')` + `toast.error(message)` |
| `done` | TanStack Query + `streaming-store` | Commit buffer (see below), then `streaming-store.reset()` |
| `pong` | No-op | Keepalive confirmation; no state update required |

The `done` event requires a two-step operation:
1. Commit the completed assistant message into the TanStack Query message list cache. The
   `DonePayload` contains `message_id`. The hook calls
   `queryClient.setQueryData(keys.messages.list(sessionId), ...)` to prepend the new message
   to the first page of the infinite query cache. This avoids a round-trip fetch to display
   the completed response.
2. Call `streaming-store.reset()` to clear the buffer and tool rows.

If the cache write in step 1 fails for any reason, the hook falls back to
`queryClient.invalidateQueries(keys.messages.list(sessionId))` to trigger a refetch.

### WebSocket close code routing

Close codes are handled inside `SessionSocket.onclose` and translated to typed events that
`useSessionSocket` observes via the `onDisconnect` handler:

| Close code | Action in useSessionSocket |
|------------|---------------------------|
| `4001` | `navigate('/login')` |
| `4003` | `navigate('/sessions')` + `toast.error('Access denied')` |
| `4008` | `streaming-store.setConnectionStatus('closed')` + `toast.error('Connection error')` |
| `4010` | `toast.warning('Connected from another window')` — no redirect, allow UI to show warning |
| `1001` | `streaming-store.setConnectionStatus('reconnecting')` + begin health polling |
| `1011` | `streaming-store.setConnectionStatus('reconnecting')` + attempt reconnect |
| `1000` | Normal close; `streaming-store.setConnectionStatus('closed')` |

Health polling on `1001` (server going away): poll `GET /api/v1/health/ready` via a
`useQuery` with `refetchInterval` active, until the response succeeds. This is implemented
in Sprint 6 (task S6-07) — for Sprint 3, the `1001` handler sets connection status to
`'reconnecting'` and relies on the existing exponential backoff reconnect in `SessionSocket`.

### LogSocket — reuse SessionSocket or create a separate class?

**Option A: Reuse SessionSocket for the log stream**

Instantiate `SessionSocket` with a dummy `sessionId` (empty string) pointed at
`/ws/v1/logs`. The `onToken` and other session-specific handlers are left as no-ops. Only
`onDisconnect` is wired. The `log_line` handler is added as a generic fallback.

Pros: No new class. One reconnect/ping implementation.
Cons: `SessionSocket` constructor requires `sessionId`; passing an empty string is a semantic
lie. The URL construction in `SessionSocket` bakes in `/sessions/{sessionId}` — overriding
this requires either a constructor parameter or subclassing. `SessionSocket` carries handler
slots for `onToken`, `onToolStart`, `onDone`, etc., that are all unused for log streaming,
making the instantiation confusing. The `session_id` field in log messages is always an empty
string, yet `SessionSocket` types it as a session UUID. This is a typing and semantic
mismatch with no offsetting benefit.

**Option B: A separate thin LogSocket class**

Create `src/lib/ws/log-socket.ts` as a self-contained class with a `connect()` /
`disconnect()` interface. It accepts only the handlers it needs: `onLogLine`, `onDisconnect`.
It reuses the same reconnect and ping logic via a small shared utility (or by duplicating the
~20 lines of backoff logic, which is acceptable at this scale).

Pros: Clean separation. `LogSocket` has its own typed handler interface that exactly matches
the `log_line` event payload. No dead handler slots. No URL template coupling to session
endpoints. The `useLogSocket` hook mirrors `useSessionSocket` in structure but is independent
in implementation. Adding log-stream-specific features (level filter, ring buffer) stays
contained to `log-socket.ts`.
Cons: Two classes instead of one. ~20 lines of reconnect/ping logic to keep in sync (or to
extract into a shared helper).

Option B — a separate `LogSocket` class — is the decision. The log stream is a different
endpoint, a different authentication context (`admin` role required), a different event set,
and a different lifecycle (mounted on the admin page, not the session page). Sharing
`SessionSocket` would couple unrelated concerns and force the class to accept configuration
paths (custom URL, subset of handlers) that make it harder to reason about in either use
case. The reconnect/ping logic is small enough that duplication is acceptable; if it grows
beyond ~30 lines it should be extracted to `src/lib/ws/ws-base.ts`.

The `useLogSocket` hook appends `log_line` payloads to a local `useState` ring buffer
capped at 500 entries. This local state does not belong in `streaming-store` — it is
consumed only by `LiveLogViewer` and has no cross-component relevance.

---

## Decision

**Session WebSocket:**
- `SessionSocket` class in `src/lib/ws/session-socket.ts` manages the connection for a
  single session. It handles reconnection with exponential backoff (1 s → 2 s → 4 s → ...
  → cap 30 s, 10-attempt limit), keepalive ping every 30 seconds, `seq` tracking via
  `last_seq` initialised to `-1`, and typed close-code callbacks.
- `useSessionSocket(sessionId: string)` hook in `src/hooks/useSessionSocket.ts` owns the
  instance via `useRef`. It mounts the socket in `useEffect` and disconnects in the cleanup.
  It routes all server messages to the targets in the routing table above.
- The hook is called once at `SessionPage` level. No child component holds a socket
  reference. Send capabilities (cancel, confirmTool) are passed as callbacks.

**Log WebSocket:**
- `LogSocket` class in `src/lib/ws/log-socket.ts` is a thin, independent class for the
  `/ws/v1/logs` endpoint. Constructor accepts `getToken`, `level`, and `onLogLine` /
  `onDisconnect` handlers.
- `useLogSocket(level: string)` hook in `src/hooks/useLogSocket.ts` owns the instance,
  mounts on `AdminPage`, disconnects on unmount. Maintains a local `useState` ring buffer
  of up to 500 `LogLinePayload` entries. The ring buffer is not in any Zustand store.

**Connection status:**
- `streaming-store.connectionStatus` is the single source of truth for the session
  WebSocket connection state. It is `'connecting' | 'open' | 'reconnecting' | 'closed'`.
  `SessionHeader` reads it to show a status indicator. It is updated by `useSessionSocket`.
- The log stream does not expose a connection status to the broader application; its
  connected/disconnected state is local to `useLogSocket`.

---

## Consequences

**Enables:**
- A clear implementation guide for Sprint 3B (`useSessionSocket`) and Sprint 5A
  (`useLogSocket`) with no ambiguity about class reuse.
- The `streaming-store` reset on `done` means message history is always authoritative from
  TanStack Query after a turn completes; no synchronisation is needed.
- `memory_update` routing to query invalidation means `MemoryPanel` refreshes automatically
  without any extra prop or effect in the component.

**Constrains:**
- `SessionSocket` and `LogSocket` may not import from `components/`, `pages/`, or `hooks/`.
  They are pure `lib/` code.
- If a third WebSocket endpoint is added in a future API version, it gets its own class and
  hook following the same pattern. `SessionSocket` is not extended to cover new endpoints.
- The `done` cache write targets the first page of the infinite message query. If the
  message list is paginated and the user has scrolled far into history, the new message is
  still inserted correctly because infinite queries prepend or append to a specific page
  slice — this must be validated in Sprint 3B QA.

**Defers:**
- Health polling strategy on `1001` close code is deferred to Sprint 6 (task S6-07).
- Virtualization of the message list (`@tanstack/react-virtual`) is deferred to Sprint 6 if
  performance issues are observed.
