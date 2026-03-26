# 0008 — Auth Store: UserOut Stored in Zustand

**Date**: 2026-03-24
**Status**: Accepted

---

## Context

ADR-0001 defines the canonical state boundary: server state belongs in TanStack Query;
client state belongs in Zustand. `UserOut` (the authenticated user object) is returned by
the `/auth/login` and `/auth/register` REST endpoints and is also available via
`GET /auth/me`.

The current implementation (`src/lib/stores/auth-store.ts`) stores `UserOut` directly in
Zustand alongside the login/register/logout actions. This means user data lives outside the
TanStack Query cache and is not automatically refreshed, deduped, or invalidated by the
standard query machinery.

Two approaches were evaluated:

**Option A (current): `UserOut` in Zustand**
- `useAuthStore` holds `user: UserOut | null`, `isAdmin`, and all auth actions.
- No `useQuery` hook required to access the current user.
- On login/register, the response body is stored directly; on logout, it is cleared.
- No background refetch — the user object is stable for the lifetime of a session.

**Option B: `UserOut` in TanStack Query**
- A `useCurrentUserQuery` hook wraps `GET /auth/me`.
- `useAuthStore` holds only tokens and auth actions (`login`, `logout`, etc.).
- The query is enabled only when `isAuthenticated` is true.
- `isAdmin` is derived inside the hook from `user?.is_admin`.

---

## Decision

**Option A is accepted.** `UserOut` stays in Zustand.

### Rationale

1. **The user object is auth state, not server state.** It is acquired during login and
   conceptually belongs to the auth session, not to a cacheable resource. It is written once
   and read many times — the same access pattern as other Zustand client state.

2. **No background refetch is needed.** The fields that matter to the UI (`username`,
   `is_admin`, `email`) do not change during a session. A background `GET /auth/me` poll
   would add latency and complexity with no practical benefit.

3. **Consistency with the existing auth flow.** Tokens (`access_token`, `refresh_token`) are
   already stored in memory outside React state (via `src/lib/api/tokens.ts`). The `user`
   object is a natural companion: both are set on login, both are cleared on logout. Splitting
   them across two state systems would make the auth lifecycle harder to reason about.

4. **Low risk of staleness.** The only user mutation exposed in the UI is password change
   (settings page). Password change does not alter any field stored in `UserOut` that the UI
   renders. If user profile editing is added in future, that action can issue an explicit
   store update alongside the API call.

5. **Simpler component access.** Every component that needs `user` or `isAdmin` calls
   `useAuthStore` with a selector — one import, no `Suspense` boundary, no loading state.

---

## Consequences

- `useAuthStore` is the single source of truth for the authenticated user. It must be updated
  immediately on any mutation that changes a `UserOut` field rendered in the UI.
- If a `GET /auth/me` endpoint call is ever needed (e.g. session restore on hard reload),
  the result must be written to `useAuthStore` via `setUser()`, not cached separately in
  TanStack Query.
- Components must not call `GET /auth/me` directly via `useQuery` for display purposes —
  use `useAuthStore` instead.
- This decision does not affect server state that is merely *associated with* the current user
  (sessions, messages, settings, API keys) — those remain in TanStack Query per ADR-0001.
