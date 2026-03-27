# 0010 — Testing Tab: SimulatorPanel Architecture

**Date**: 2026-03-27
**Status**: Accepted

---

## Context

The Assistant page (`/assistant`) is gaining a ninth tab, "Testing", which exposes a
pipeline simulation form that calls `POST /api/v1/assistant/simulate`. The endpoint is
admin-only, LLM-backed (1–30 s latency), can mutate live conversation memory when `persist`
is true, and returns a rich structured result (`SimulateOut`). Because the panel introduces
several concerns not present in any existing assistant panel — conditional field display,
a `persist` mutation-safety toggle, long-duration pending state, per-field 422 error
mapping, and a security gate tighter than the existing `isAdmin`-prop pattern — seven
architectural questions are answered here before implementation begins.

The sprint scope document (`docs/web/briefs/testing-tab-sprint.md`) provides the API
surface and field specification. This ADR governs form state ownership, the admin guard
strategy, error boundary scope, type placement, mutation hook locality, long-poll UX,
and tab persistence.

---

## Options Considered and Decisions

### D1 — Form state: `useState` vs `useReducer` vs Zustand

**Option A: Individual `useState` per field**

Seven independent `useState` calls inside `SimulatorPanel`. Simple, familiar, sufficient
for a form that has no cross-field derived state beyond the `direction === "outbound"`
condition for the Instructions field.

Pros: Readable, zero boilerplate, matches how every other form in the project manages
local state (`SessionNameForm`, outbound dialog, etc.).
Cons: Seven declarations at the top of the component; some developers find this verbose
for forms with more than four fields.

**Option B: `useReducer` with a form state object**

A single `useReducer` with a `FormState` type and `SET_FIELD` / `RESET` actions.

Pros: All field state in one object; easy to reset on submit.
Cons: Introduces a dispatch/action pattern for a form that has no complex state transitions.
The project has no existing `useReducer` form pattern — this would be a new convention
introduced for a single instance, violating the "prefer existing patterns over new
abstractions" rule.

**Option C: Dedicated Zustand store**

A `simulator-store.ts` holding form field values and result state.

Pros: Accessible from any component without prop drilling.
Cons: `SimulatorPanel` is a self-contained page-level panel — there are no other
components that share this state. Putting transient, panel-scoped form state in a Zustand
store violates ADR-0001's anti-pattern rule ("No Zustand store may hold a copy of any
data available from a TanStack Query key" and more generally that Zustand is for
cross-component or streaming state, not local form state). The result returned by the
simulate endpoint is a transient response, not a cached resource — it must not live in
any Zustand store.

**Decision: Option A — individual `useState` per field.**

Seven fields is within the readable range for a single panel component. Mutation state
(`isPending`, `data`, `error`) comes from `useMutation` and does not need separate
`useState` declarations. The `direction` field's conditional rendering of Instructions
does not require anything beyond reading the `direction` state value inline. If a future
form in this area grows beyond ten fields or requires cross-field validation, a form
library (`react-hook-form`) should be evaluated via a new ADR at that time — not
preemptively introduced here.

---

### D2 — Admin guard: tab trigger hide vs content guard

**Option A: Guard only the tab trigger**

`{isAdmin && <TabsTrigger value="testing">}` in `index.tsx`. Non-admins never see the
trigger, but `<TabsContent value="testing">` is always rendered (Radix suppresses
non-active tab content naturally).

Pros: Minimal code.
Cons: A non-admin who navigates directly to `/assistant` and somehow activates the
`testing` tab value — via a URL param in a future implementation, a browser extension
manipulating the DOM, or a developer console call — would see `SimulatorPanel` render
without restriction.

**Option B: Guard only the panel content**

`SimulatorPanel` itself reads `isAdmin` from `useAuthStore` and returns `null` if false.
The tab trigger is always rendered.

Pros: Hard gate in the component.
Cons: Non-admin users see a "Testing" tab trigger that does nothing — confusing and a UX
regression relative to the "hidden, not disabled" design decision in the sprint doc.

**Option C: Two-layer guard — hide trigger AND guard panel**

`{isAdmin && <TabsTrigger ...>}` in `index.tsx` hides the tab from non-admins. Inside
`SimulatorPanel`, an early `if (!isAdmin) return null;` is the definitive security gate.
The two layers serve different purposes: the trigger hide is a UX decision; the panel
guard is a security decision. Either layer in isolation is insufficient.

Pros: Belt-and-suspenders. The panel cannot render for non-admins regardless of how the
tab becomes active. Consistent with the `KnowledgePanel` `isAdmin` prop pattern, but
stronger — `KnowledgePanel` gates edit actions inside an already-visible panel, whereas
here the entire surface is gated.
Cons: Two places to update if the admin requirement changes. Acceptable cost given the
risk of the `persist` flag.

**Decision: Option C — two-layer guard.**

The tab trigger is hidden via `{isAdmin && ...}` in `index.tsx`. `SimulatorPanel`'s
first executable line is `const isAdmin = useAuthStore((s) => s.isAdmin)` followed by
`if (!isAdmin) return null`. The component-level `null` return is the definitive gate;
the trigger hide is the UX layer. No route-level guard is introduced — the Testing tab
is a panel within `/assistant`, not a separate route.

Note: `SimulatorPanel` reads `isAdmin` directly from `useAuthStore`. This is the one
sanctioned exception per the architecture invariants: `components/` may access `useUIStore`
for theme/modal state, but `pages/` sub-components may also access `useAuthStore` for
auth-conditional rendering since `isAdmin` is auth state, not server state.

---

### D3 — Error boundary scope for SimulatorPanel

The existing error boundary strategy (ADR-0003) establishes route-level `ErrorBoundary`
wrappers in `App.tsx` as the primary render-crash fence. Component-level boundaries were
explicitly deferred.

**Option A: Rely on the existing route-level ErrorBoundary**

`/assistant` is already wrapped. A render crash in `SimulatorPanel` (e.g., a type mismatch
while destructuring `SimulateOut`) propagates to the route boundary, replaces the entire
assistant page with the fallback, and lets the user navigate away.

Pros: Zero additional code. Consistent with ADR-0003.
Cons: A render bug in the result card display crashes the entire Assistant page, losing
the user's context in other tabs.

**Option B: Wrap SimulatorPanel in its own ErrorBoundary inside TabsContent**

A boundary wrapping only `<TabsContent value="testing">` would isolate a crash to the
Testing tab content area, leaving all other tabs functional.

Pros: Better isolation for an admin-only developer panel. A result display bug does not
affect operators using Chats or Campaigns.
Cons: ADR-0003 explicitly deferred component-level boundaries. Adding one here would
be a special case that could proliferate. The Testing tab also renders very little static
structure — the risk surface is primarily the result card, which is only shown after a
successful mutation.

**Decision: Option A — rely on the existing route-level ErrorBoundary.**

The Testing tab is admin-only and operator-facing; a full-page fallback is acceptable for
this user class. Mutation errors (ApiError) are handled inline and do not reach the
boundary at all. The only crash risk is a render-time bug in result display — this risk
is mitigated by the result card only rendering after a successful, typed `SimulateOut`
response. If result rendering proves unstable after implementation, a component-level
boundary can be added without an ADR amendment (ADR-0003 §Defers explicitly allows this).

---

### D4 — TypeScript type placement: `assistant.ts` vs new `simulate.ts`

**Option A: Append to `src/lib/api/types/assistant.ts`**

`SimulateRequest` and `SimulateOut` are assistant-domain types. The existing file already
contains `OutboundRequest`/`OutboundResponse` (also single-use mutation types).
The barrel `index.ts` re-exports all types from `assistant.ts` already.

Pros: No new file; consistent with how outbound types are co-located with other assistant
types; no changes to the barrel export.
Cons: The file grows with each new endpoint type; may require splitting later.

**Option B: New `src/lib/api/types/simulate.ts`**

Isolate the simulate types in their own module.

Pros: Clear file-level ownership.
Cons: Creates a new file for two interfaces; the outbound types did not get their own
file either; premature separation for two types that are strictly in the assistant domain.
Splitting at two types does not meet the "two or more concrete cases share the same shape"
bar for a new abstraction.

**Decision: Option A — append to `src/lib/api/types/assistant.ts`.**

Both `SimulateRequest` and `SimulateOut` are appended to the existing file under a
`// Pipeline simulator (admin-only)` section comment. No changes to `index.ts` are
required — `assistant.ts` is already re-exported. No entry in `keys.ts` is needed; the
simulate endpoint is a pure mutation with no query cache entry.

---

### D5 — Mutation hook: inline vs extracted hook file

**Option A: Inline `useMutation` inside `SimulatorPanel.tsx`**

Direct `useMutation` call in the panel component body, consistent with the project
pattern documented in CLAUDE.md ("Mutations inline in components — no separate hook
files for CRUD mutations").

Evidence from codebase: `WorkflowsPanel.tsx` contains five inline `useMutation` calls.
`GuardrailsPanel.tsx` contains at least one. No assistant-domain mutation has been
extracted to `src/hooks/assistant/`.

Pros: Consistent with the established pattern. No new file. The mutation is used exactly
once.
Cons: None relative to project conventions.

**Option B: Extract to `src/hooks/assistant/useSimulateMutation.ts`**

Pros: Testable in isolation; reusable if another panel ever needs to trigger a simulation.
Cons: There is currently no second caller. Extracting a mutation hook for a single-use
case violates the "only introduce a new abstraction when two or more concrete cases share
the same shape" rule. The project memory explicitly states mutations are inline.

**Decision: Option A — inline `useMutation` in `SimulatorPanel.tsx`.**

The mutation is defined inline following the exact pattern from `WorkflowsPanel`:

```
const simulateMutation = useMutation({
  mutationFn: (body: SimulateRequest) =>
    api.post<SimulateOut>("/assistant/simulate", body),
});
```

Error handling is inline in the component, not via `handleApiError`, because `VALIDATION_ERROR`
requires per-field state that only the component can manage (see error handling spec in D3
and the sprint doc §5.5). Other error codes (`ASSISTANT_NOT_RUNNING`, `FORBIDDEN`,
`PROVIDER_UNREACHABLE`, `INTERNAL_ERROR`) are handled with targeted `toast.error()` calls
and one inline error element, without delegating to `handleApiError`. This is consistent
with the mutation pattern in `WorkflowsPanel` which uses `err instanceof ApiError ?
err.message : "..."` inline toast calls.

---

### D6 — Loading state for a 1–30 second LLM mutation

**Option A: Button spinner + disabled button only**

The submit button shows a `Loader2 animate-spin` icon and "Running..." label while
`simulateMutation.isPending`. No other loading indicator.

Pros: Simple. Consistent with how `WorkflowsPanel` shows mutation pending state (spinner
in button). The sprint doc §5.4 specifies exactly this pattern and adds that the result
area shows nothing — no stale flash — because `simulateMutation.reset()` is called before
`mutate()`.
Cons: For calls approaching 30 seconds the button gives no sense of elapsed time.

**Option B: Indeterminate progress bar below the submit button**

A thin `h-1` indeterminate bar appears below the button while pending.

Pros: More visible feedback for long calls.
Cons: Introduces a visual pattern not used anywhere else in the project. There is no
existing indeterminate progress component in the shadcn/ui installation. The sprint doc
does not specify this.

**Option C: Elapsed time counter**

A `text-xs text-zinc-500` elapsed counter that ticks up while pending.

Pros: Tells the user exactly how long they've waited.
Cons: Requires a `useEffect` + `setInterval` + `useState` just for the counter — added
complexity for a non-critical polish feature.

**Decision: Option A — button spinner and disabled button only.**

The sprint doc specifies this pattern (§5.4) and it is the project-wide convention. The
expected latency is described as 1–5 seconds in §5.4 (not 30 — the 1–30 range is a
worst-case bound noted in the question). A spinner is sufficient for sub-5-second
operations. The `simulateMutation.reset()` call before each `mutate()` is the key
correctness requirement: it prevents stale results from rendering during the new pending
state. If operators report the endpoint regularly takes 15+ seconds and the spinner is
insufficient feedback, a progress bar can be added as a follow-up without an ADR change.

---

### D7 — Tab value persistence

**Option A: No persistence (match all existing tabs)**

All eight existing assistant tabs use `defaultValue="chats"` with no URL param or
`useUIStore` persistence. Navigating away from `/assistant` and returning resets to the
Chats tab.

Pros: Zero new state. Consistent with the pattern in every other multi-tab page in the
project (Admin, Settings).
Cons: An admin who is actively using the Testing tab and navigates to a session to check
a chat, then returns, must manually re-select the Testing tab.

**Option B: URL param persistence (`?tab=testing`)**

Read/write `?tab=` query parameter via React Router's `useSearchParams`.

Pros: Deep-linkable. Back button restores the tab. An admin can bookmark the Testing tab
directly.
Cons: This would be the first tab group in the project to use URL state. Introduces a new
pattern for a single specialist tab. All other eight tabs would silently ignore the `?tab=`
param, which is inconsistent. Would require updating `App.tsx` route definitions or
the `AssistantPage` component to read search params — non-trivial change.

**Option C: `useUIStore` persistence**

Store the last active assistant tab in `useUIStore`.

Pros: Survives navigation within the app.
Cons: Violates the `useUIStore` scope: the store is for sidebar and panel open/close state,
not for tab selection. Storing tab selection in `ui-store` would be the first use of that
store for navigation memory rather than toggle state. Also, `useUIStore` is the one store
that `components/` may access — using it in a page for tab state crosses a concern boundary.

**Decision: Option A — no persistence.**

The Testing tab follows the same non-persistent pattern as all other assistant tabs.
The admin UX cost of re-selecting the tab after navigation is acceptable given that the
simulation form retains its field values in local `useState` for the lifetime of the
assistant page mount (navigating to `/sessions/:id` and back triggers an unmount/remount
and clears the form, but navigating within `/assistant` does not). If URL-based tab
persistence becomes a project-wide need, it should be introduced for all tabbed pages
simultaneously via a shared hook or router-level solution, not prototyped on a single tab.

---

## Consequences

**Enables:**
- `SimulatorPanel` is a self-contained page-level component with no external state
  dependencies beyond `useAuthStore` for the admin guard and `useMutation` for the API
  call. It can be tested in isolation by mocking those two dependencies.
- The two-layer admin guard (hidden trigger + null return) means that even if a future
  change accidentally adds `value="testing"` to the tab default or URL params are
  introduced, non-admin users cannot render the panel.
- Inline mutation state (`isPending`, `data`, `error`) keeps all loading, success, and
  error rendering co-located in one file, making the component self-documenting.

**Constrains:**
- `SimulateRequest` and `SimulateOut` live in `assistant.ts`. If a second simulate-class
  endpoint is added (e.g., a dry-run for campaign messages), types for that endpoint
  should also go in `assistant.ts` unless the file grows large enough to justify splitting
  the entire assistant types domain — at that point a new ADR should govern the split.
- Per-field `VALIDATION_ERROR` handling must be implemented inline in `SimulatorPanel`.
  The `handleApiError` utility in `client.ts` must NOT be called for 422 responses from
  this mutation (consistent with the constraint in ADR-0003 §Constrains).
- A new Zustand store must NOT be created for this feature. Any developer adding
  simulator-related state to a store is introducing a structural regression.
- The Testing tab must NOT receive a `disabled={!serviceRunning}` prop on its
  `TabsTrigger`. This is a documented deliberate deviation from the eight existing tabs
  (sprint doc §5.2) and must be preserved as a code comment in `index.tsx`.

**Defers:**
- If the simulate endpoint latency regularly exceeds 10 seconds in production, an
  indeterminate progress indicator can be added without revisiting this ADR.
- Component-level `ErrorBoundary` around the result card is deferred per ADR-0003.
- URL-based tab persistence for the entire Assistant page is deferred until a project-wide
  tabbed-navigation strategy is defined.

---

## Files to Create / Modify

| Action | File | Change |
|--------|------|--------|
| Create | `src/pages/assistant/SimulatorPanel.tsx` | New panel: `useState` form fields, inline `useMutation`, `isAdmin` guard, result card, per-field 422 errors |
| Modify | `src/pages/assistant/index.tsx` | `React.lazy` import for `SimulatorPanel`; `{isAdmin && <TabsTrigger value="testing" ...>}`; `<TabsContent value="testing">` with `<Suspense>`; NO `disabled={!serviceRunning}` on the trigger (add inline comment explaining the deviation) |
| Modify | `src/lib/api/types/assistant.ts` | Append `SimulateRequest` and `SimulateOut` interfaces under `// Pipeline simulator (admin-only)` section comment |
| No change | `src/lib/api/keys.ts` | Pure mutation — no query key entry required |
| No change | `src/lib/stores/` | No new store; no changes to existing stores |
