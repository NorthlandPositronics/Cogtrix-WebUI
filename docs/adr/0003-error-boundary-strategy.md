# 0003 — Error Boundary Strategy

**Date**: 2026-03-05
**Status**: Accepted

---

## Context

The application surfaces errors from three distinct sources:

1. **Render-time exceptions** — unexpected exceptions thrown during React component
   rendering (e.g., accessing a property of `undefined`, a missing context value, a broken
   third-party component). These are invisible to TanStack Query and async error handlers.

2. **Async / network errors** — HTTP errors from the REST API, including structured `ApiError`
   objects with machine-readable codes. These are managed by TanStack Query's `error` state
   on queries and `onError` callbacks on mutations.

3. **WebSocket errors** — agent-level `error` messages (turn-scoped, connection stays open),
   and protocol-level close codes (connection terminated, may require navigation).

Each source requires a different interception mechanism, fallback strategy, and recovery
path. Without explicit decisions, these error types will be handled inconsistently — some
swallowed silently, some shown as raw stack traces, some incorrectly mapped to user-facing
messages.

The project plan (Section 7.5, 7.6) specifies `sonner` for toasts and a route-level
`ErrorBoundary` for render exceptions. This ADR formalises those decisions into a binding
pattern and adds the WebSocket close code routing table that Sprint 3B must implement.

---

## Options Considered

### React ErrorBoundary placement

**Option A: Single top-level ErrorBoundary in App.tsx**

One boundary wrapping the entire application.

Pros: Minimal setup.
Cons: A render error in any page crashes the entire UI, including the navigation sidebar.
The user loses all navigation context and cannot move to another page without a full reload.

**Option B: Route-level ErrorBoundary per lazy-loaded page**

Each `React.lazy()` page import is wrapped in its own `<ErrorBoundary>` within `App.tsx`,
outside the `<Suspense>` boundary. A render error in `SessionPage` shows a fallback only in
the main content area; the `AppShell` (sidebar, header) remains mounted and functional.

Pros: Isolated fault domain. Users can navigate to another page after a page-level render
crash without reloading the browser. Consistent with the way React Router recommends error
boundaries for data-layer errors.
Cons: Requires one `<ErrorBoundary>` wrapper per route entry point in `App.tsx`.

Option B is the decision. A top-level boundary is added as a final safety net only — it
catches errors in `AppShell` itself, which should be rare but possible.

**Option C: Component-level ErrorBoundaries inside pages**

Wrap individual complex components (e.g., `MessageList`, `LiveLogViewer`) in boundaries.

Pros: Even more granular isolation.
Cons: Significant boilerplate. Render errors in individual components are almost always
programming bugs that warrant a page-level reset, not a partial component fallback. Deferred
to Sprint 6 polish if specific components demonstrate instability.

### Fallback UI for render errors

The fallback component rendered by each route-level `ErrorBoundary` shows:
- A neutral message: "Something went wrong on this page."
- A "Reload page" button that calls `window.location.reload()`.
- In development: the error message and component stack (gated on `import.meta.env.DEV`).

No stack trace is shown in production. The `meta.request_id` from API errors is not
available at the ErrorBoundary level (render errors are not API errors) — this field is
surfaced only in toast messages from the async error layer.

### API error handling pattern

**Option A: Each TanStack Query hook handles its own errors inline**

Each hook passes `onError` to its `useQuery` or `useMutation` call and maps error codes to
toasts or navigation locally.

Pros: Explicit, co-located.
Cons: Duplicates error-code-to-action mapping across many hooks. A change to how `SESSION_NOT_FOUND`
is handled requires updating multiple files.

**Option B: Centralised handleApiError utility in client.ts**

A `handleApiError(error: ApiError, navigate: NavigateFn)` function in
`src/lib/api/client.ts` maps known error codes to their correct actions (toast, navigation,
banner). Hooks call this utility in their `onError` callback.

Pros: One place to update when error codes are added or remapped. The utility can be tested
in isolation. Matches the pattern documented in `client-contract.md` Section 6.
Cons: `handleApiError` needs a `navigate` function, which means it requires a caller-supplied
navigation callback. It cannot call `useNavigate()` directly because it lives in `lib/`,
not in a React hook.

Option B is the decision. The utility signature is:

```
handleApiError(error: ApiError, navigate: (path: string) => void): void
```

Hooks in `src/hooks/` call `useNavigate()` and pass the result into `handleApiError`.
The utility itself lives in `src/lib/api/client.ts` and has no React imports.

The standard error code mapping (from `client-contract.md` Section 6):

| HTTP status | Error code | handleApiError action |
|-------------|------------|-----------------------|
| 401 | UNAUTHORIZED | `navigate('/login')` |
| 401 | TOKEN_EXPIRED | Not reached — handled by client interceptor before throwing |
| 403 | FORBIDDEN | `toast.error('Access denied')` |
| 404 | *_NOT_FOUND | `toast.error('Not found')` or route-specific navigation |
| 409 | *_ALREADY_* | `toast.error(error.message)` |
| 422 | VALIDATION_ERROR | Return `details` to caller — field-level display is form responsibility |
| 503 | PROVIDER_UNREACHABLE | Show sticky banner (not a toast) in session page header |
| 500 | INTERNAL_ERROR | `toast.error('Server error (ID: ' + requestId + ')')` |
| any | (default) | `toast.error(error.message)` |

`VALIDATION_ERROR` is the one code that `handleApiError` does not handle directly — it
returns the `details` object to the calling mutation hook so the form can display field-level
errors. The hook decides whether to call `handleApiError` or handle the 422 itself.

### Toast system

`sonner` is the decision (shadcn/ui standard). Install command:

```
pnpm dlx shadcn@latest add sonner
```

The `<Toaster />` component is rendered once in `main.tsx`, outside the router, so it
persists across route transitions. Individual toasts are triggered by calling
`toast.error()`, `toast.success()`, `toast.info()`, or `toast.warning()` from any hook or
utility. Toasts are not stored in `ui-store` — `sonner` manages its own internal queue.
The previous `toasts: Toast[]` field described in early project notes is not implemented in
`ui-store`; `sonner` makes it unnecessary.

### WebSocket error and close code routing

WebSocket errors fall into two categories:

**Agent-level errors** (connection stays open, `type: "error"` message):
These are handled inside `useSessionSocket`. On receiving an `error` message type, the hook:
1. Calls `streaming-store.setAgentState('error')`.
2. Calls `toast.error(payload.message)`.
3. Does not close the socket. The connection remains open for the next turn.

**Protocol-level close codes** (connection terminated):
Handled in the `onDisconnect` / `onClose` callback passed to `SessionSocket`. The
`useSessionSocket` hook receives a typed close event and acts as follows:

| Close code | Action |
|------------|--------|
| `4001` | `navigate('/login')` — token invalid or missing |
| `4003` | `navigate('/sessions')` + `toast.error('Access denied')` — session ownership violation |
| `4008` | `streaming-store.setConnectionStatus('closed')` + `toast.error('Connection error')` — malformed client message; do not retry automatically |
| `4010` | `toast.warning('Session connected from another window')` — no redirect; show status in session header |
| `1001` | `streaming-store.setConnectionStatus('reconnecting')` — server shutdown; `SessionSocket` exponential backoff handles reconnect; health polling activated in Sprint 6 |
| `1011` | `streaming-store.setConnectionStatus('reconnecting')` — internal server error; `SessionSocket` attempts reconnect |
| `1000` | `streaming-store.setConnectionStatus('closed')` — normal closure; no action needed |

The close code `4003` warrants a redirect because the session is no longer accessible, not
just temporarily unavailable. Codes `1001` and `1011` are recoverable via reconnect.
Code `4008` indicates a bug in the client's message formatting — it is not retried
automatically to avoid an error loop.

---

## Decision

**Render errors:** Route-level `ErrorBoundary` per lazy-loaded page in `App.tsx`. A
top-level boundary also wraps the entire tree as a last resort. Fallback UI: brief message +
"Reload page" button. Development builds additionally show error detail.

**Async/network errors:** Handled by TanStack Query error states. Mutations and queries call
`handleApiError(error, navigate)` from `src/lib/api/client.ts` for standard code-to-action
mapping. Form-level 422 errors are returned as structured data to the calling hook.

**Toast system:** `sonner` via `pnpm dlx shadcn@latest add sonner`. `<Toaster />` in
`main.tsx`. No toast state in `ui-store`.

**WebSocket agent-level errors:** `useSessionSocket` sets `agentState` to `'error'` in
`streaming-store` and fires a `toast.error()`. The connection stays open.

**WebSocket close codes:** Routed per the table above. `4001` and `4003` navigate the user
away. `1001` and `1011` trigger reconnect via `SessionSocket` backoff logic. `4010` shows a
warning toast but takes no further action.

---

## Consequences

**Enables:**
- A render crash in `SessionPage` (e.g., from a malformed message in the query cache) does
  not destroy the sidebar or the URL — the user can navigate to another session without a
  browser reload.
- All error code handling is testable from `client.ts` without mounting React components.
- The `streaming-store` connection status field gives `SessionHeader` a reactive signal for
  showing a "Reconnecting..." indicator without any additional prop threading.

**Constrains:**
- `handleApiError` must not call `useNavigate()` or any React hook. It is a plain function
  in `lib/`. Callers supply `navigate`.
- `VALIDATION_ERROR` (422) is explicitly excluded from `handleApiError` — forms handle it
  directly. Any hook that passes a 422 to `handleApiError` is a structural regression.
- `toast.error()` is the only mechanism for surfacing API errors to the user. No custom
  notification system, no `ui-store` toast queue.

**Defers:**
- Component-level ErrorBoundaries for individual high-risk components (`LiveLogViewer`,
  `MessageList`) are deferred to Sprint 6.
- The specific React component implementing `ErrorBoundary` (class component or library
  such as `react-error-boundary`) is an implementation detail for Sprint 0, not an
  architectural decision. Either is acceptable provided the boundary catches render
  exceptions and displays the specified fallback UI.
- Health polling on `1001` close code is deferred to Sprint 6 (task S6-07).
