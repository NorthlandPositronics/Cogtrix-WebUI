# Testing Tab — Sprint Scope Document

**Date**: 2026-03-27
**Author**: manager
**Status**: Planning — no implementation may begin until design is approved
**Design system version**: 3.15
**Sprint type**: New feature — UI only (backend endpoint already specified)

---

## 1. Feature Summary

Add a ninth tab, "Testing", to the Assistant page (`/assistant`). The tab exposes a simulation form that calls `POST /api/v1/assistant/simulate` — an admin-only endpoint that runs the full agent pipeline (LLM included) without delivering a real channel message.

Operators use this to verify agent behavior for a given `channel` + `chat_id` context before going live: they type a test message, optionally supply outbound operator instructions, and see the full pipeline result including guardrail hits, suppression status, deferred state, and the LLM response text.

Because the endpoint is admin-only and the `persist` flag can mutate live conversation memory, both must be protected with explicit UI affordances.

---

## 2. Affected Files

### Files to modify

| File | Change |
|---|---|
| `src/pages/assistant/index.tsx` | Add `SimulatorPanel` lazy import, add `TabsTrigger value="testing"` (admin-only), add `TabsContent value="testing"` |
| `src/lib/api/types/assistant.ts` | Append `SimulateRequest` and `SimulateOut` type definitions |
| `src/lib/api/keys.ts` | No key needed — mutation only, no query cache entry |
| `CHANGELOG.md` | Sprint entry after validation |
| `docs/api/client-contract.md` | Add `SimulateRequest` / `SimulateOut` to §3.9 and `POST /api/v1/assistant/simulate` to §7 (Assistant Mode endpoint table) |
| `docs/web/design-system.md` | §14 Assistant page: note that the Testing tab is admin-only and does not follow the `serviceRunning` disabled gate (see §5.2 below); register new §16 entry for mockup |

### Files to create

| File | Purpose |
|---|---|
| `src/pages/assistant/SimulatorPanel.tsx` | New panel component (lazy-loaded) containing the full simulate form + result display |
| `docs/web/mockups/assistant-testing-tab.svg` | Approved SVG mockup — required before `web_coder` starts |

---

## 3. API Surface

### 3.1 TypeScript types

Append to `src/lib/api/types/assistant.ts`:

```typescript
// ---------------------------------------------------------------------------
// Pipeline simulator (admin-only)
// ---------------------------------------------------------------------------

export interface SimulateRequest {
  channel: string;                        // "whatsapp" | "telegram"
  chat_id: string;                        // e.g. "+1234567890@c.us"
  message: string;                        // 1–8192 chars
  direction?: "inbound" | "outbound";     // default "inbound"
  instructions?: string | null;           // operator instructions (outbound only)
  sender_name?: string;                   // default "Simulator"
  sender_id?: string;                     // default "simulator"
  persist?: boolean;                      // default false — writes to live memory when true
}

export interface SimulateOut {
  channel: string;
  chat_id: string;
  session_key: string;
  direction: "inbound" | "outbound";
  response: string;                       // empty string when suppressed
  suppressed: boolean;
  deferred: boolean;
  blocked_by_guardrails: boolean;
  guardrail_reason: string | null;
  duration_ms: number;
  memory_persisted: boolean;
}
```

### 3.2 Query key

No query key is needed. The simulate endpoint is a pure mutation with no cached response to invalidate. Use `useMutation` directly — do not add an entry to `src/lib/api/keys.ts`.

### 3.3 Mutation hook

Inline the mutation inside `SimulatorPanel.tsx` following the project pattern (no separate hook file for CRUD mutations):

```typescript
const simulateMutation = useMutation({
  mutationFn: (body: SimulateRequest) =>
    api.post<SimulateOut>("/assistant/simulate", body),
});
```

No query invalidation is needed on success (the endpoint does not affect any cached list).

---

## 4. Component List

### New components

| Component | File | Description |
|---|---|---|
| `SimulatorPanel` | `src/pages/assistant/SimulatorPanel.tsx` | Self-contained panel. Contains the form, persist warning, loading skeleton, and result card. No sub-components required. |

### Modified components

| Component | File | Change |
|---|---|---|
| `AssistantPage` | `src/pages/assistant/index.tsx` | Lazy-import `SimulatorPanel`; add Testing tab trigger and content |

---

## 5. Design Decisions

### 5.1 Tab placement and admin gate

The Testing tab must only be visible to admin users. Non-admin users must not see the tab trigger at all (not disabled — hidden).

Rationale: The tab calls an LLM-backed endpoint that can mutate live memory. Disabling-and-showing the tab for non-admins adds confusion with no benefit. The pattern used in `KnowledgePanel` (passing `isAdmin` as a prop to control inner edit actions) is insufficient here — the entire tab surface is admin-only.

Implementation gate in `index.tsx`:
```tsx
{isAdmin && (
  <TabsTrigger value="testing" data-cy="tab-testing">
    Testing
  </TabsTrigger>
)}
```
`TabsContent value="testing"` is always rendered (Tabs suppresses hidden content naturally), but `SimulatorPanel` itself also reads `isAdmin` and renders null if false — belt-and-suspenders.

### 5.2 Service-running gate

Unlike all other eight tabs, the Testing tab is NOT disabled when `serviceRunning` is false. The simulate endpoint runs the agent pipeline independently — it does not require the real-time assistant service to be running. The `disabled={!serviceRunning}` prop must not be added to the Testing tab trigger.

This is a deliberate deviation from the existing tab pattern and must be noted in both the DS §14 update and as a code comment in `index.tsx`.

### 5.3 Persist warning

The `persist` checkbox must always render an inline amber warning banner (DS §5 — Inline Warning Banner, DS-001) directly below it, regardless of whether the checkbox is checked. The banner text:

> "When enabled, the simulation writes to live conversation memory for this chat. This cannot be undone."

Do not conditionally show/hide the banner based on checkbox state — the risk exists even before the user checks the box, and hiding it would require the user to check the box first to learn about the danger.

The banner uses the DS-001 `Alert` pattern:
```tsx
<Alert className="border-amber-200 bg-amber-50 text-amber-800">
  <AlertTriangle className="h-4 w-4 text-amber-700" />
  <AlertDescription className="text-amber-800 text-sm">
    When enabled, the simulation writes to live conversation memory for this
    chat. This cannot be undone.
  </AlertDescription>
</Alert>
```

### 5.4 Loading state during LLM call

The simulate endpoint runs the full LLM pipeline. Expected latency: 1–5 seconds. The submit button must show a loading spinner and be disabled while the mutation is pending. The result area must not flash stale content from a previous run during the new pending state — clear the previous result on new submission start (`simulateMutation.reset()` before `mutate()`).

Do not use a skeleton for the result card — the result appears in a single card after the mutation resolves. Show nothing in the result area until the first result arrives.

### 5.5 Error handling

| Error | Display |
|---|---|
| `VALIDATION_ERROR` (400/422) | Inline `text-sm text-red-600` below the erroring field, following DS §5 Forms pattern. Map `details.fields` to per-field errors. |
| `ASSISTANT_NOT_RUNNING` (409) | Toast: "The assistant service must be running to simulate." |
| `FORBIDDEN` (403) | Toast: "Access denied." (should not occur in practice due to admin gate, but must be handled) |
| `PROVIDER_UNREACHABLE` (422) | Inline error above the submit button: "LLM provider unreachable. Check configuration." (same class as wizard step error treatment) |
| Network/`INTERNAL_ERROR` | Toast: `error.message` |

### 5.6 Result display

The result card renders below the form after a successful mutation. It is NOT a modal — inline in the panel. The card uses `rounded-lg border border-zinc-200 bg-white` (DS §5 inline form widget surface).

Result card sections:

1. **Response text** — prominently displayed. When `suppressed` is true and `response` is empty, show italic placeholder: `"(No response — message was suppressed)"` in `text-zinc-500`.
2. **Status row** — four badges in a `flex flex-wrap gap-2`:
   - Guardrail blocked: red badge (`bg-red-50 text-red-700 border-red-200`) when `blocked_by_guardrails`, zinc outline otherwise.
   - Suppressed: amber badge (`bg-amber-50 text-amber-700 border-amber-200`) when `suppressed`, zinc outline otherwise.
   - Deferred: blue badge (`bg-blue-50 text-blue-700 border-blue-200`) when `deferred`, zinc outline otherwise.
   - Memory persisted: teal badge (`bg-teal-50 text-teal-700 border-teal-200`) when `memory_persisted`, zinc outline otherwise.
3. **Guardrail reason** — visible only when `guardrail_reason` is non-null. Label: `text-xs text-zinc-500 uppercase tracking-wide`. Value: `text-sm text-zinc-900`.
4. **Duration** — right-aligned `text-xs text-zinc-500 tabular-nums`. Format: `{duration_ms.toFixed(0)} ms`.
5. **Session key** — `text-xs font-mono text-zinc-500` below duration.

---

## 6. Form Field Specification

All fields follow DS §5 Forms (`Label` above `Input`, `space-y-4` between fields, `gap-1.5` between label and control).

| Field | Control | Constraints | Notes |
|---|---|---|---|
| Channel | `Select` | "whatsapp" \| "telegram" | Required. Options: "WhatsApp", "Telegram". Default: "whatsapp". |
| Chat ID | `Input` | Required, 1–256 chars | Placeholder: `+1234567890@c.us`. Help text: `text-xs text-zinc-500` "The channel-specific contact identifier (e.g. WhatsApp number or Telegram chat ID)." |
| Direction | `Select` | "inbound" \| "outbound" | Default: "inbound". When "outbound" is selected, show the Instructions field. |
| Message | `Textarea` | Required, 1–8192 chars | Label: "Message". Grows with content (`min-h-[80px]`). |
| Instructions | `Textarea` | Optional, max 8192 chars | Conditional — only shown when `direction === "outbound"`. Label: "Operator instructions". Help text: "Instructions for the outbound operator persona." |
| Sender name | `Input` | Optional, default "Simulator" | Collapsed under a `<details>` / disclosure element labeled "Advanced options". |
| Sender ID | `Input` | Optional, default "simulator" | Same `<details>` block. |
| Persist memory | `Checkbox` + `Label` | Default unchecked | Outside the `<details>`. Always-visible amber warning banner below (§5.3). |

The `<details>` element for advanced options uses a `<summary>` styled as `text-sm text-zinc-500 cursor-pointer hover:text-zinc-900` with a `ChevronDown` icon that rotates on open.

Submit button: `Button` full-width, `size="default"`, label "Run simulation". Shows `Loader2` spinner (`animate-spin h-4 w-4 mr-2`) and text "Running…" while `simulateMutation.isPending`. Disabled while pending.

---

## 7. State Management

- **Form state**: `useState` for each field value within `SimulatorPanel`. No form library required — the form is simple enough for manual state.
- **Mutation state**: `simulateMutation.isPending`, `simulateMutation.data`, `simulateMutation.error` from `useMutation`.
- **No query cache**: the simulate endpoint returns a transient result, not a resource. Do not cache.
- **Direction toggle**: local `useState("inbound" | "outbound")` — used to conditionally show the Instructions field.
- **No Zustand**: this feature adds no global state. All state is local to `SimulatorPanel`.

---

## 8. Admin-Only Guard Approach

Two layers:

1. **Tab trigger hidden**: `{isAdmin && <TabsTrigger ...>}` in `index.tsx`. Non-admins never see the tab.
2. **Component-level guard**: `SimulatorPanel` reads `const isAdmin = useAuthStore((s) => s.isAdmin)` and returns `null` if false. This prevents accidental rendering if the tab content is reached via URL manipulation.

The component-level `null` return is the definitive gate. The tab trigger hiding is a UX layer.

Do not use a route-level guard — the Testing tab is a panel within the existing `/assistant` route, not a separate route.

---

## 9. Open Questions

### For `architect`

**Q1 — Form state approach**: The form has 7 fields plus conditional rendering. Is manual `useState` per field acceptable, or should the `web_coder` use a lightweight solution like `useReducer` to keep `SimulatorPanel` readable? There is no existing form library in the project.

**Q2 — Error boundary**: Should `SimulatorPanel` be wrapped in `ErrorBoundary` separately, or is the existing route-level `ErrorBoundary` in `App.tsx` sufficient? The mutation error is handled inline, but a render error in result display could crash the tab.

**Q3 — Tab value persistence**: Other tabs do not persist the active tab to URL or `useUIStore`. Should the Testing tab follow the same convention (no persistence), or does it warrant URL persistence (e.g., `?tab=testing`) since it is admin-only and a specialist workflow?

### For `web_designer`

**Q4 — Tab ordering**: The current 8 tabs end with "Workflows". Should "Testing" be placed last (position 9) or near "Guardrails" (position 6) given its thematic proximity to guardrail validation? Recommend last — it is a developer-facing tool, not a content-management tab.

**Q5 — Result card placement**: Should the result card appear below the form in the same scroll area, or in a side-by-side split layout at wider viewports? A split layout avoids scroll but adds layout complexity. Recommend single-column (form above, result below) for simplicity — the mockup should confirm.

**Q6 — Empty state before first run**: Should the result area show a placeholder illustration/text before the first simulation runs, or simply render nothing? Recommend a subtle empty-state paragraph (`text-sm text-zinc-500 text-center py-8`) reading "Run a simulation to see the pipeline response." — consistent with other empty states in the assistant panel. The mockup should include both empty and populated states.

**Q7 — Advanced options disclosure**: The `<details>` / `<summary>` pattern for Sender name and Sender ID is proposed for simplicity. The web_designer should evaluate whether a shadcn/ui `Collapsible` is preferable for consistency with other expand/collapse patterns in the app (e.g., StatusBar uses a custom button, not `Collapsible`).

---

## 10. Sprint Task Sequence

The following sequence must be followed. No step may begin before the previous is complete and approved.

1. **architect** — review §9 open questions Q1–Q3; produce ADR or brief ruling for each; confirm no structural concerns with the two-layer admin guard approach and the inline mutation pattern.
2. **web_designer** — answer Q4–Q7; update DS §14 (Assistant page section) to document the Testing tab; update DS §16 to register the mockup requirement as a new deferred item; write a brief for `graphic_designer` covering both empty-state and populated-state mockup scenes.
3. **graphic_designer** — produce `docs/web/mockups/assistant-testing-tab.svg` per the `web_designer` brief. Must include: (a) form with all fields visible including the open advanced-options disclosure, (b) `persist` checkbox checked with amber warning banner, (c) result card with a blocked-by-guardrails outcome, (d) result card with a clean inbound response.
4. **web_designer** — review and approve the mockup before step 5 begins.
5. **web_coder** — implement per this document, the approved mockup, DS v3.15, and `docs/api/client-contract.md`. Touch only the files listed in §2.
6. **tester** — run `pnpm lint && pnpm build`. Zero errors required. If failures occur, route back to `web_coder`.
7. **docs_writer** — update `docs/api/client-contract.md` (§3.9 types, §7 endpoint table), DS §14 and §16, and `CHANGELOG.md`.
