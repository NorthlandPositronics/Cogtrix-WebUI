# Cogtrix WebUI — Long-Term Project Plan

**Created**: 2026-03-05
**Author**: manager agent
**Status**: Active

---

## 1. Executive Summary

This document is the authoritative project plan for building the Cogtrix WebUI frontend from its current scaffold state to a fully featured production application. It covers seven pages, 65 REST endpoints, two WebSocket streams, and all shared infrastructure.

The plan is organized into six sprints of descending complexity and risk. Each sprint has a precise scope, agent routing, dependency graph, and acceptance criteria. The plan is designed so that design, architecture, and implementation work can overlap across concerns when there are no hard dependencies between them.

---

## 2. Current State Assessment

### What exists

| File | Status |
|------|--------|
| `src/lib/api/client.ts` | Complete — typed fetch wrapper with 401 refresh and deduplication |
| `src/lib/api/tokens.ts` | Complete — in-memory token store |
| `src/lib/api/config.ts` | Complete — env-sourced base URLs |
| `src/lib/api/types.ts` | Partial — missing many domain types (tool, memory, config, websocket payloads) |
| `src/lib/ws/session-socket.ts` | Partial — event bus present, missing: `last_seq` on reconnect URL, exponential backoff, keepalive ping, close-code routing |
| `src/lib/stores/auth-store.ts` | Partial — login/logout/register present, missing: `isAdmin` derived field, correct `/auth/me` endpoint (currently calls `/auth/profile`) |
| `src/pages/login.tsx` | Skeleton — no shadcn/ui components, no field validation, no email field, no design |
| `src/pages/dashboard.tsx` | Skeleton — no session list, no create/archive, no design |
| `src/App.tsx` | Partial — auth guard present, route structure needs expansion |
| `src/main.tsx` | Complete |

### What is missing

- `src/lib/api/keys.ts` — query key registry (required by architecture invariants)
- `src/lib/stores/streaming-store.ts` — WebSocket streaming state
- `src/lib/stores/ui-store.ts` — toast/modal/sidebar UI state
- All domain type files (`types/auth.ts`, `types/session.ts`, `types/message.ts`, etc.)
- All pages: session chat, settings, admin, assistant, documents
- All hooks in `src/hooks/`
- All shared components beyond login/dashboard placeholders
- `docs/web/design-system.md` — not yet written
- `docs/adr/` — no ADRs exist
- Toast/notification system
- Error boundary infrastructure
- Route-level code splitting

### Known defects in existing code

| Location | Issue |
|----------|-------|
| `auth-store.ts` line 27 | Calls `/auth/profile` — correct endpoint is `/auth/me` |
| `auth-store.ts` line 37 | Same incorrect endpoint on register path |
| `auth-store.ts` | Missing `email` field in `register()` — API requires username + email + password |
| `auth-store.ts` | Missing `isAdmin` derived field — needed for route guards and conditional UI |
| `session-socket.ts` line 50 | WebSocket URL does not include `last_seq` parameter — replay will not work after reconnect |
| `session-socket.ts` | Reconnect uses fixed 3-second delay — spec requires exponential backoff with 10-attempt cap |
| `session-socket.ts` | No keepalive ping on 30-second interval — server drops idle connections after 90 seconds |
| `session-socket.ts` | `_lastSeq` initialised to `0` instead of `-1` — server replays `seq > last_seq`, so 0 will miss the first message |
| `types.ts` | `Session` type uses wrong field names (`title` instead of `name`, missing `state`, `config`, `token_counts`, `active_tools`, `archived_at`) |

These defects will be fixed during Sprint 1 as part of the infrastructure hardening task.

---

## 3. Architecture Constraints (Non-Negotiable)

These invariants are enforced by the `architect` and `tester` agents and must never be violated:

1. All REST calls go through `src/lib/api/client.ts` — never raw `fetch` in components or hooks.
2. All query keys are defined in `src/lib/api/keys.ts` — no inline string query keys.
3. Server state lives in TanStack Query — never duplicated into Zustand.
4. Streaming WebSocket data lives in `src/lib/stores/streaming-store.ts`.
5. `src/components/` has no direct API calls and no Zustand access except `useUIStore`.
6. `src/pages/` owns data-fetching hooks and composes from `src/components/`.
7. `src/hooks/` imports from `src/lib/` only — never from `components/` or `pages/`.
8. One `SessionSocket` instance per active session — managed at the page level.
9. Token refresh stays in `client.ts`. WebSocket reconnect stays in `session-socket.ts`.
10. No `localStorage` or `sessionStorage` usage anywhere.
11. No `useEffect` + `fetch` patterns — all data fetching through TanStack Query hooks.

---

## 4. Phased Roadmap

### Sprint 0 — Foundation (Prerequisite for everything)

**Goal**: Establish the design system, fix known defects, and build all shared infrastructure that every subsequent sprint depends on.

**Duration target**: This sprint is a blocker. It must be completed before any page sprint begins.

**Parallel workstreams possible**:
- Design system (web_designer + graphic_designer) runs in parallel with infrastructure fixes (architect + web_coder)
- ADRs (architect) run in parallel with design system

#### Sprint 0 tasks

| Task | Agent | Depends on |
|------|-------|------------|
| S0-01: Fix known defects in existing code | web_coder | — |
| S0-02: Expand type system — all domain types | web_coder | — |
| S0-03: Create `src/lib/api/keys.ts` | web_coder | — |
| S0-04: Create `src/lib/stores/streaming-store.ts` | web_coder | architect ADR |
| S0-05: Create `src/lib/stores/ui-store.ts` | web_coder | architect ADR |
| S0-06: Harden `SessionSocket` (last_seq, backoff, ping, close codes) | web_coder | — |
| S0-07: Add toast/notification system | web_coder | design system |
| S0-08: Add error boundary infrastructure | web_coder | architect ADR |
| S0-09: Add route-level code splitting | web_coder | App.tsx route expansion |
| S0-10: Write design system document | web_designer | — |
| S0-11: Produce design tokens mockup (color palette, type scale) | graphic_designer | S0-10 |
| S0-12: ADR — state management boundaries | architect | — |
| S0-13: ADR — WebSocket integration pattern | architect | — |
| S0-14: ADR — error boundary strategy | architect | — |
| S0-15: QA pass on all foundation code | tester | S0-01 through S0-09 |

---

### Sprint 1 — Authentication and App Shell

**Goal**: Complete, production-quality login and register pages, plus the application shell (sidebar, header, layout) that all authenticated pages share.

**Pages**: `/login`, `/register`
**Shared**: `AppShell`, `Sidebar`, `Header`, `AdminRoute`

**Dependencies**: Sprint 0 complete

#### Sprint 1 tasks

| Task | Agent | Depends on |
|------|-------|------------|
| S1-01: Design login/register page | web_designer | design system |
| S1-02: Design app shell (sidebar + header) | web_designer | design system |
| S1-03: Mockup — login/register page SVG | graphic_designer | S1-01 |
| S1-04: Mockup — app shell SVG | graphic_designer | S1-02 |
| S1-05: Implement login/register page | web_coder | S1-03 |
| S1-06: Implement app shell layout components | web_coder | S1-04 |
| S1-07: Add `AdminRoute` guard and `isAdmin` to auth store | web_coder | S1-06 |
| S1-08: Update route definitions in App.tsx | web_coder | S1-06 |
| S1-09: QA pass | tester | S1-05 through S1-08 |

---

### Sprint 2 — Sessions Dashboard

**Goal**: A complete, functional sessions list page with infinite scroll, session creation, and session archival.

**Page**: `/sessions`

**Dependencies**: Sprint 1 complete

#### Sprint 2 tasks

| Task | Agent | Depends on |
|------|-------|------------|
| S2-01: Design sessions page | web_designer | design system, app shell |
| S2-02: Mockup — sessions list SVG | graphic_designer | S2-01 |
| S2-03: ADR — cursor pagination pattern | architect | — |
| S2-04: Implement `useSessionsQuery` hook | web_coder | S2-03 |
| S2-05: Implement `SessionCard` component | web_coder | S2-02 |
| S2-06: Implement `NewSessionDialog` component | web_coder | S2-02 |
| S2-07: Implement `SessionsPage` | web_coder | S2-04, S2-05, S2-06 |
| S2-08: QA pass | tester | S2-04 through S2-07 |

---

### Sprint 3 — Session Chat Page (Core)

**Goal**: The primary session/chat page with message history, message input, real-time token streaming, agent state indicator, and tool activity display. This is the most complex page in the application.

**Page**: `/sessions/{id}`

**Dependencies**: Sprint 2 complete, Sprint 0 streaming-store complete

This sprint is split into two sub-sprints to manage complexity:

**Sprint 3A — Message display and history**
- Load and display message history with cursor-based infinite scroll (scroll upward)
- Markdown rendering with react-markdown (HTML plugin disabled for security)
- Message bubbles for user, assistant, system, and tool roles
- Empty state and loading skeleton

**Sprint 3B — Real-time streaming and WebSocket integration**
- `useSessionSocket` hook wrapping `SessionSocket`
- Token streaming — accumulate in `streaming-store`, render with blinking cursor
- Agent state badge in session header
- Tool activity rows (tool_start / tool_end events)
- Tool confirmation modal (blocking dialog, 6 action buttons)
- Memory panel (collapsible sidebar, refresh on `memory_update`)
- Tools sidebar (session tool status, enable/disable/approve)
- Cancel turn button
- Message input with mode selector (normal / think / delegate)

#### Sprint 3A tasks

| Task | Agent | Depends on |
|------|-------|------------|
| S3A-01: Design session page layout | web_designer | design system, app shell |
| S3A-02: Mockup — session page SVG (initial, message states) | graphic_designer | S3A-01 |
| S3A-03: ADR — message history and streaming state ownership | architect | — |
| S3A-04: Implement `useMessagesQuery` hook | web_coder | S3A-03 |
| S3A-05: Implement `MessageBubble` component | web_coder | S3A-02 |
| S3A-06: Implement `MessageList` with scroll-up infinite loading | web_coder | S3A-05 |
| S3A-07: Implement `SessionPage` skeleton with history | web_coder | S3A-06 |
| S3A-08: QA pass | tester | S3A-04 through S3A-07 |

#### Sprint 3B tasks

| Task | Agent | Depends on |
|------|-------|------------|
| S3B-01: Design streaming, tools sidebar, memory panel, confirmation modal | web_designer | S3A-01 |
| S3B-02: Mockup — streaming state, tool activity, confirmation modal SVGs | graphic_designer | S3B-01 |
| S3B-03: Implement `useSessionSocket` hook | web_coder | streaming-store, S3B-02 |
| S3B-04: Implement `StreamingMessageBubble` component | web_coder | S3B-03 |
| S3B-05: Implement `AgentStateBadge` component | web_coder | S3B-03 |
| S3B-06: Implement `ToolActivityRow` component | web_coder | S3B-03 |
| S3B-07: Implement `ToolConfirmationModal` component | web_coder | S3B-02 |
| S3B-08: Implement `MemoryPanel` component | web_coder | S3B-03 |
| S3B-09: Implement `ToolsSidebar` component | web_coder | S3B-02 |
| S3B-10: Implement `MessageInput` with mode selector | web_coder | S3B-02 |
| S3B-11: Wire all Sprint 3B components into `SessionPage` | web_coder | S3B-03 through S3B-10 |
| S3B-12: QA pass | tester | S3B-11 |

---

### Sprint 4 — Settings Page

**Goal**: Complete settings page covering configuration flags, provider management, model switching, MCP server management, and the setup wizard.

**Page**: `/settings`

**Dependencies**: Sprint 1 app shell complete

The settings page has four distinct sections that can be designed and partially implemented in parallel:

1. **General config** — feature flag toggles (`debug`, `verbose`, `prompt_optimizer`, `parallel_tool_execution`, `context_compression`). Admin-only write access; all users can read.
2. **Providers and models** — list providers with health check status, switch active provider/model. Admin-only for switching.
3. **MCP servers** — list, add, remove, restart. Admin-only for mutations.
4. **Setup wizard** — multi-step form flow. Admin-only.

A fifth section for **API keys** belongs here as well: list, create (show key once on creation), revoke.

#### Sprint 4 tasks

| Task | Agent | Depends on |
|------|-------|------------|
| S4-01: Design settings page (all four sections) | web_designer | design system |
| S4-02: Mockup — config flags section SVG | graphic_designer | S4-01 |
| S4-03: Mockup — providers/models section SVG | graphic_designer | S4-01 |
| S4-04: Mockup — MCP servers section SVG | graphic_designer | S4-01 |
| S4-05: Mockup — setup wizard flow SVG | graphic_designer | S4-01 |
| S4-06: Mockup — API keys section SVG | graphic_designer | S4-01 |
| S4-07: Implement `useConfigQuery` hook | web_coder | — |
| S4-08: Implement config flags section | web_coder | S4-02, S4-07 |
| S4-09: Implement providers and models section | web_coder | S4-03, S4-07 |
| S4-10: Implement MCP servers section | web_coder | S4-04 |
| S4-11: Implement setup wizard multi-step flow | web_coder | S4-05 |
| S4-12: Implement API keys section | web_coder | S4-06 |
| S4-13: Assemble `SettingsPage` with tabbed navigation | web_coder | S4-08 through S4-12 |
| S4-14: QA pass | tester | S4-13 |

---

### Sprint 5 — Admin Panel, Documents, and Assistant Dashboard

**Goal**: Build the three secondary pages. These have lower complexity than the session page and can be developed with reduced design effort since the design system and layout patterns are fully established by this sprint.

**Pages**: `/admin`, `/documents`, `/assistant`

**Dependencies**: Sprint 1 app shell complete, Sprint 4 design system fully established

These three pages can be built in parallel across agents because they share no state or components.

#### Sprint 5A — Admin Panel

| Task | Agent | Depends on |
|------|-------|------------|
| S5A-01: Design admin panel | web_designer | design system |
| S5A-02: Mockup — system info, log stream SVGs | graphic_designer | S5A-01 |
| S5A-03: Implement `useLogSocket` hook (wrapping SessionSocket for log stream) | web_coder | S5A-02 |
| S5A-04: Implement `SystemInfoPanel` component | web_coder | S5A-02 |
| S5A-05: Implement `LiveLogViewer` component | web_coder | S5A-03 |
| S5A-06: Implement `GuardrailsPanel` component | web_coder | S5A-02 |
| S5A-07: Implement `AdminPage` | web_coder | S5A-04 through S5A-06 |
| S5A-08: QA pass | tester | S5A-07 |

#### Sprint 5B — Documents Page

| Task | Agent | Depends on |
|------|-------|------------|
| S5B-01: Design documents page | web_designer | design system |
| S5B-02: Mockup — document list, upload, search SVGs | graphic_designer | S5B-01 |
| S5B-03: Implement `useDocumentsQuery` hook | web_coder | S5B-02 |
| S5B-04: Implement `DocumentCard` component | web_coder | S5B-02 |
| S5B-05: Implement `DocumentUploadDialog` component | web_coder | S5B-02 |
| S5B-06: Implement `SemanticSearchBar` component | web_coder | S5B-02 |
| S5B-07: Implement `DocumentsPage` | web_coder | S5B-03 through S5B-06 |
| S5B-08: QA pass | tester | S5B-07 |

#### Sprint 5C — Assistant Dashboard

| Task | Agent | Depends on |
|------|-------|------------|
| S5C-01: Design assistant dashboard | web_designer | design system |
| S5C-02: Mockup — service control, chat list, scheduled messages SVGs | graphic_designer | S5C-01 |
| S5C-03: Implement service control panel | web_coder | S5C-02 |
| S5C-04: Implement chat history viewer | web_coder | S5C-02 |
| S5C-05: Implement scheduled messages table | web_coder | S5C-02 |
| S5C-06: Implement deferred records panel | web_coder | S5C-02 |
| S5C-07: Implement contacts and knowledge panels | web_coder | S5C-02 |
| S5C-08: Implement `AssistantPage` | web_coder | S5C-03 through S5C-07 |
| S5C-09: QA pass | tester | S5C-08 |

---

### Sprint 6 — Polish, Performance, and Documentation

**Goal**: Cross-cutting quality improvements, performance optimizations, and documentation completion.

**Dependencies**: All page sprints complete

| Task | Agent | Depends on |
|------|-------|------------|
| S6-01: Audit and complete accessibility (aria, keyboard nav, focus rings) | web_coder | all sprints |
| S6-02: Audit and complete responsive layout (mobile/tablet/desktop) | web_coder | all sprints |
| S6-03: Implement 404 and error pages | web_coder | design system |
| S6-04: Performance audit — bundle analysis, lazy loading review | web_coder | all sprints |
| S6-05: WebSocket edge cases — server shutdown (1001), token expiry mid-session | web_coder | Sprint 3 |
| S6-06: Rate-limit handling — 429 with Retry-After, display countdown | web_coder | all sprints |
| S6-07: Health polling for server restart (poll `/health/ready` on 1001 close) | web_coder | Sprint 3 |
| S6-08: Final QA pass | tester | S6-01 through S6-07 |
| S6-09: Update changelog and development guide | docs_writer | S6-08 |
| S6-10: Update component documentation | docs_writer | S6-08 |

---

## 5. Design System

### When it is established

The design system document (`docs/web/design-system.md`) is established in Sprint 0 by `web_designer`. It is the single source of truth for all visual decisions and must be complete before any mockup is produced.

### Visual identity decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Primary surfaces | `white`, `zinc-50` | Clean, minimal background hierarchy |
| Neutral scale | `zinc-*` | Single coherent grey scale for text, borders, muted elements |
| Accent color | `teal-600` | Teal; matches Cogtrix TUI brand; 5.22:1 contrast on white (WCAG AA) |
| Accent hover | `teal-700` | Single-step darkening, no hue shift |
| Destructive | `red-600` | Standard danger convention |
| Success | `green-600` | Standard success convention |
| Border | `zinc-200` | Subtle separation, not decorative |
| Font family | System font stack (Geist if available) | shadcn/ui default |
| Font size scale | `xs`(0.75) / `sm`(0.875) / `base`(1) / `lg`(1.125) / `xl`(1.25) / `2xl`(1.5) rem | 4-step scale |
| Line width | 100 characters | Prettier config |
| Component style | shadcn/ui New York | Already configured |

### Streaming-specific design decisions

- Streaming text is rendered at the same size and weight as settled assistant messages.
- A blinking cursor (1s opacity cycle) appears at the end of the streaming buffer while `agentState !== 'idle'`.
- Agent state transitions are shown in a persistent badge in the session header, not as popups.
- Tool activity rows expand inline within the message list — they are not modal or sidebar elements.
- Memory panel is a collapsible right panel, hidden by default on screens narrower than `lg`.
- Tools sidebar is a collapsible right panel, toggled by a header button.

### Responsive layout

| Breakpoint | Layout |
|------------|--------|
| `< lg` (< 1024px) | Single-column; sidebar navigation in a hamburger menu; memory/tools panels hidden behind buttons |
| `lg+` (>= 1024px) | Left sidebar (220px) + main content + optional right panels |
| Max content width | `max-w-5xl` centered in the main area |

---

## 6. Per-Page Component Breakdown

### 6.1 Login / Register (`/login`, `/register`)

**Components**:
- `LoginForm` — controlled form with username, password, error display. Calls `useAuthStore.login()`.
- `RegisterForm` — controlled form with username, email, password, field-level validation from API 422 responses.
- `AuthPage` — centered card layout wrapping either form. Toggle link between login and register.

**Shared shadcn/ui installs**: `button`, `input`, `label`, `card`

**State**: All local `useState`. No TanStack Query — login/register are mutations that update Zustand directly.

**API**: `POST /auth/login`, `POST /auth/register`, then `GET /auth/me` to populate `user`.

**Edge cases**:
- 422 validation: show field-level errors from `details` object.
- First registered user becomes admin — no special handling needed, auth store picks up `role: 'admin'` from `/auth/me`.

---

### 6.2 Dashboard / Sessions List (`/sessions`)

**Components**:
- `SessionCard` — displays `name`, `state` badge, `config.provider`, `config.model`, `updated_at`. Archive button (admin or owner).
- `NewSessionDialog` — modal with name input and optional config overrides (provider, model, memory mode).
- `SessionsPage` — infinite scroll list using `useInfiniteQuery`.
- `AgentStateBadge` — small colored badge for `AgentState` values (reused on session page header).

**Shared shadcn/ui installs**: `dialog`, `badge`, `skeleton`, `scroll-area`

**State**: TanStack Query `useInfiniteQuery` with `queryKey: keys.sessions.list()`. Invalidate on create/archive mutations.

**Stale time**: 30 seconds — sessions change infrequently.

**API**: `GET /sessions` (paginated), `POST /sessions`, `DELETE /sessions/{id}`.

**Performance**: Scroll sentinel via `IntersectionObserver` to trigger `fetchNextPage`.

---

### 6.3 Session / Chat Page (`/sessions/{id}`)

This is the most complex page. It is composed from many focused components.

**Layout**: Three-column at `lg+` — left sidebar (navigation), main chat area, optional right panels (memory / tools).

**Components (chat area)**:
- `MessageList` — reversed infinite scroll; new messages at bottom; scroll up loads older history.
- `MessageBubble` — polymorphic: user / assistant / system / tool roles. Renders Markdown via `react-markdown`.
- `StreamingMessageBubble` — reads from `streaming-store`; shows token accumulation and blinking cursor.
- `ToolActivityRow` — inline collapsible row showing tool name, input args, duration, error.
- `MessageInput` — textarea with send button, mode selector (normal/think/delegate), cancel button.

**Components (right panels)**:
- `MemoryPanel` — collapsible; shows mode, summary, token usage bar, clear/switch controls.
- `ToolsSidebar` — scrollable list of `ToolRow` items; enable/disable/approve toggles.

**Components (overlays)**:
- `ToolConfirmationModal` — blocking dialog, cannot be dismissed. Six action buttons. Parameters table.
- `SessionHeader` — session name (editable inline), `AgentStateBadge`, panel toggle buttons, actions menu.

**Hooks**:
- `useMessagesQuery` — `useInfiniteQuery` for message history. Key: `keys.messages.list(sessionId)`.
- `useSessionQuery` — `useQuery` for session details. Key: `keys.sessions.detail(sessionId)`.
- `useSessionSocket` — mounts/unmounts `SessionSocket`, routes messages to `streaming-store` and query cache.
- `useMemoryQuery` — `useQuery` for memory state. Key: `keys.memory(sessionId)`. Refetch on `memory_update` WS event.
- `useToolsQuery` — `useQuery` for session tool status. Key: `keys.tools.session(sessionId)`.

**State**:
- Message history: TanStack Query `useInfiniteQuery`.
- Streaming buffer: `streaming-store.ts` (Zustand).
- Agent state: `streaming-store.ts`.
- Pending tool confirmation: `streaming-store.ts` — `pendingConfirmation: ToolConfirmRequestPayload | null`.
- Active tool rows: `streaming-store.ts` — `Map<tool_call_id, ToolActivityRow>`.
- WebSocket connection status: `streaming-store.ts`.

**WebSocket lifecycle**:
1. `useSessionSocket` mounts on page mount, disconnects on unmount.
2. `token` events append to `streaming-store.streamingBuffer`.
3. `done` event: commit buffer to query cache as new message, clear buffer.
4. `agent_state` events update `streaming-store.agentState`.
5. `tool_start` / `tool_end` events update `streaming-store.toolRows`.
6. `tool_confirm_request` sets `streaming-store.pendingConfirmation`.
7. Close code `4001` → redirect to login. Close code `4003` → redirect to sessions.

---

### 6.4 Settings Page (`/settings`)

**Layout**: Tabbed layout with five tabs: General, Providers, Models, MCP Servers, API Keys. Setup wizard is a modal/drawer overlay.

**Components**:
- `ConfigFlagsForm` — toggles for 5 boolean flags. Disabled for non-admin users. Admin sees a "Reload config" button.
- `ProviderList` — table of providers with health-check button per row. Active provider highlighted. Switch button (admin).
- `ModelList` — table of models with switch button (admin).
- `McpServerList` — table with add/remove/restart. Add server form in a dialog (admin).
- `SetupWizard` — drawer with step progress, question display, answer input, yaml preview, cancel button.
- `ApiKeyList` — table of keys (prefix only). Create button shows full key once in a dialog. Revoke button.

**Hooks**:
- `useConfigQuery` — `useQuery`, key: `keys.config()`, stale time 5 minutes.
- `useProvidersQuery` — `useQuery`, key: `keys.providers()`.
- `useModelsQuery` — `useQuery`, key: `keys.models()`.
- `useMcpServersQuery` — `useQuery`, key: `keys.mcpServers()`.
- `useApiKeysQuery` — `useQuery`, key: `keys.apiKeys()`.

**State**: All server state via TanStack Query. Wizard step state is local to `SetupWizard`.

---

### 6.5 Admin Panel (`/admin`)

**Guard**: `AdminRoute` — redirects non-admin users to `/sessions`.

**Components**:
- `SystemInfoCard` — displays system info fields from `/system/info`.
- `DebugToggle` — button to toggle debug logging. Calls `POST /system/debug`.
- `LiveLogViewer` — virtualized log line list. Level filter dropdown. Connected to `/ws/v1/logs`.
- `GuardrailsTable` — blacklist entries with remove button per row.

**Hooks**:
- `useSystemInfoQuery` — `useQuery`, key: `keys.systemInfo()`.
- `useLogSocket` — custom hook wrapping `SessionSocket` (or a parallel implementation) for the log stream WebSocket. Appends `log_line` payloads to a bounded ring buffer in local state.

**Note on `useLogSocket`**: The log stream WebSocket (`/ws/v1/logs`) uses the same message envelope as the session WebSocket but is a separate endpoint. The architect must decide whether to extend `SessionSocket` or create a thin `LogSocket` class. This is an ADR candidate.

---

### 6.6 Assistant Dashboard (`/assistant`)

**Guard**: Authenticated user only (not admin-only, but some actions are admin-only).

**Components**:
- `ServiceControlPanel` — status indicator (running/stopped), start/stop buttons. Shows "stopping..." during async stop and polls `GET /assistant/status`.
- `AssistantChatList` — list of active chats with last message preview. Click to open `ChatHistoryDrawer`.
- `ChatHistoryDrawer` — side drawer showing per-chat message history.
- `ScheduledMessageTable` — list of scheduled messages, edit and cancel actions.
- `DeferredRecordTable` — list of deferred records with cancel action.
- `ContactList` — read-only phonebook.
- `KnowledgePanel` — list of knowledge facts with search and delete (admin).

**State**: All server state via TanStack Query. Stop-status polling: use `useQuery` with `refetchInterval` enabled until `running === false`.

---

### 6.7 RAG / Documents Page (`/documents`)

**Components**:
- `DocumentList` — infinite scroll list of `DocumentCard` items.
- `DocumentCard` — filename, size, upload date, delete button (admin).
- `DocumentUploadDialog` — file picker (PDF, TXT, MD), client-side type/size validation, upload progress indicator.
- `SemanticSearchBar` — text input, submit button, results list below.

**State**: TanStack Query for document list and search results. Upload is a `useMutation` that invalidates the list on success.

**File upload**: Uses `multipart/form-data` — requires a special `api.upload()` method that does not set `Content-Type: application/json`. This is a new method on the `api` object.

---

## 7. Shared Infrastructure

### 7.1 API layer additions needed

| File | What to add |
|------|-------------|
| `src/lib/api/keys.ts` | Query key factory for all domains. Must be created in Sprint 0. |
| `src/lib/api/client.ts` | Add `api.upload(path, formData)` method for multipart POST. Add `handleApiError(error, navigate)` utility. |
| `src/lib/api/types/` | Expand into domain-specific files: `auth.ts`, `session.ts`, `message.ts`, `tool.ts`, `memory.ts`, `config.ts`, `websocket.ts`, `rag.ts`, `assistant.ts`, `system.ts`. |
| `src/lib/api/pagination.ts` | `fetchAllPages` utility (from client contract Section 5). |

### 7.2 Zustand stores needed

| Store | Contents |
|-------|---------|
| `auth-store.ts` | Already exists — fix defects, add `isAdmin` derived field, add `email` to `register()` |
| `streaming-store.ts` | `streamingBuffer: string`, `agentState: AgentState`, `pendingConfirmation: ToolConfirmRequestPayload \| null`, `toolRows: Map<string, ToolActivityRow>`, `connectionStatus: 'connecting' \| 'open' \| 'reconnecting' \| 'closed'` |
| `ui-store.ts` | `sidebarOpen: boolean`, `memoryPanelOpen: boolean`, `toolsPanelOpen: boolean`, `toasts: Toast[]`. Manages global UI toggles. |

### 7.3 Custom hooks needed

| Hook | Location | Purpose |
|------|----------|---------|
| `useSessionsQuery` | `hooks/` | `useInfiniteQuery` for session list |
| `useSessionQuery` | `hooks/` | `useQuery` for single session |
| `useMessagesQuery` | `hooks/` | `useInfiniteQuery` for message history |
| `useSessionSocket` | `hooks/` | Mount/unmount `SessionSocket`, route events to stores |
| `useMemoryQuery` | `hooks/` | `useQuery` for memory state |
| `useToolsQuery` | `hooks/` | `useQuery` for session tools |
| `useConfigQuery` | `hooks/` | `useQuery` for global config |
| `useProvidersQuery` | `hooks/` | `useQuery` for provider list |
| `useModelsQuery` | `hooks/` | `useQuery` for model list |
| `useMcpServersQuery` | `hooks/` | `useQuery` for MCP server list |
| `useApiKeysQuery` | `hooks/` | `useQuery` for API key list |
| `useDocumentsQuery` | `hooks/` | `useInfiniteQuery` for document list |
| `useSystemInfoQuery` | `hooks/` | `useQuery` for system info |
| `useLogSocket` | `hooks/` | Connect to log stream WebSocket |
| `useAssistantStatusQuery` | `hooks/` | `useQuery` for assistant service status with optional polling |
| `useScrollSentinel` | `hooks/` | `IntersectionObserver` wrapper for infinite scroll trigger |

### 7.4 Shared components needed

| Component | Location | Purpose |
|-----------|----------|---------|
| `AgentStateBadge` | `components/` | Colored badge for `AgentState` values |
| `CursorLoader` | `components/` | Blinking text cursor for streaming |
| `SkeletonList` | `components/` | Generic skeleton placeholder for list loading states |
| `InfiniteScrollSentinel` | `components/` | Invisible sentinel element triggering load-more |
| `ErrorMessage` | `components/` | Inline error display for failed queries |
| `EmptyState` | `components/` | Illustrated empty state for empty lists |
| `ConfirmDialog` | `components/` | Generic confirmation dialog (used for delete, archive) |
| `AppShell` | `components/` | Layout wrapper: sidebar + header + main content |
| `Sidebar` | `components/` | Left navigation sidebar with route links |
| `PageHeader` | `components/` | Consistent page header with title and action area |

### 7.5 Toast and notification system

Use `sonner` (the standard shadcn/ui toast library). Install with `pnpm dlx shadcn@latest add sonner`. The `<Toaster />` component renders in `main.tsx`. Invoke with `toast.error()`, `toast.success()`, `toast.info()`.

A global `handleApiError(error: ApiError)` utility in `src/lib/api/client.ts` routes known error codes to appropriate toast messages or navigation actions.

### 7.6 Error boundaries

One `ErrorBoundary` component at the route level (wrapping each page). Catches render-time errors. Displays a fallback UI with a "Reload" button. Does not catch async errors — those are handled in query error states.

Specific error states per page:
- 404 on session not found: redirect to `/sessions` with toast.
- 403 on admin page: redirect to `/sessions` with toast.
- 503 provider unreachable: show sticky banner in the session page header.

### 7.7 Code splitting

Each route-level page is lazy-loaded with `React.lazy()` and `<Suspense>`. This is configured in `src/App.tsx` during Sprint 0. Estimated bundle reduction: each page is approximately 15–40 KB pre-gzip; code splitting keeps the initial load under 100 KB.

---

## 8. Testing Strategy

The tester agent runs `pnpm lint && pnpm format:check && pnpm build` after every implementation task. This is the quality gate for merge.

### What the automated suite catches

- TypeScript strict mode violations (`noUnusedLocals`, `noUncheckedIndexedAccess`)
- ESLint rule violations
- Prettier formatting divergence
- Vite production build failures (dead imports, circular dependencies, missing assets)

### What requires structural review (tester flags, manager routes to web_coder)

- Raw `fetch()` calls bypassing `client.ts`
- Inline query key strings
- `useEffect` + `fetch` patterns
- API logic inside `src/components/`
- `localStorage` / `sessionStorage` access
- Hardcoded hex values or pixel sizes
- Multiple Zustand stores mutating each other

### Manual review gates

Before each sprint closes, the manager reviews the implemented pages against:
1. The approved SVG mockup.
2. The design system token usage.
3. The architecture invariants list.

### Security review items (each sprint)

- Markdown rendering: confirm `react-markdown` is used without `rehype-raw` on agent output.
- Tool confirmation parameters: confirm they are rendered as text, not injected into DOM.
- No `dangerouslySetInnerHTML` anywhere in the codebase.
- WebSocket URL construction: confirm `encodeURIComponent(token)` is used.

---

## 9. Performance Considerations

### Bundle size

- Code splitting per route (Sprint 0).
- `react-markdown` and its dependencies are large — ensure it is loaded only in the session page chunk, not the initial bundle.
- shadcn/ui components are tree-shakeable; only installed components are included.
- Target: initial load (login page) under 100 KB gzip.

### Query caching strategy

| Query | Stale time | Cache time |
|-------|-----------|------------|
| Session list | 30 seconds | 5 minutes |
| Session detail | 10 seconds | 2 minutes |
| Message history | 60 seconds | 10 minutes |
| Config | 5 minutes | 15 minutes |
| Providers / models | 5 minutes | 15 minutes |
| System info | 60 seconds | 5 minutes |
| Memory state | Fresh after WS event | 2 minutes |
| Tool status | 30 seconds | 5 minutes |

### Streaming performance

- Token accumulation in `streaming-store` uses a string concatenation buffer. For very long responses (10,000+ tokens), string concatenation in a tight loop can cause GC pressure. If this becomes an observable problem, switch to an array of strings joined on render.
- The `MessageList` component must not re-render the entire list on every token — the `StreamingMessageBubble` must be isolated so only it re-renders during streaming.
- Virtualization: the session message list should use `@tanstack/react-virtual` if message counts exceed 200 in a session. This is a Sprint 6 polish item — implement only if observable performance issues arise.

### WebSocket efficiency

- One WebSocket per active session page — not per component.
- Keepalive ping at 30-second intervals (implemented in `session-socket.ts`).
- On page navigate away from session, disconnect the WebSocket.
- The log stream WebSocket (admin panel) buffers a maximum of 500 log lines in memory — oldest entries are dropped. This prevents memory leaks in long admin sessions.

### Image and asset loading

No user-uploaded images are rendered in the current scope. SVG icons from Lucide (bundled with shadcn/ui) are tree-shaken.

---

## 10. Risk Analysis

### High risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session chat page complexity | Highest-effort page; risk of scope creep or missed edge cases | Split into 3A/3B sub-sprints; each has discrete acceptance criteria |
| WebSocket seq replay correctness | Missed messages during reconnect cause data loss visible to user | Fix `last_seq` initialization in Sprint 0; write targeted integration notes; tester flags any reconnect regression |
| Streaming store state races | Token events arriving during navigation can corrupt store | `streaming-store` resets on session unmount; validate this in Sprint 3B QA |
| Tool confirmation blocking | If a `tool_confirm_request` is missed or the modal dismissed by accident, agent is permanently blocked for the turn | Modal must not be dismissible by clicking outside; only the six action buttons close it |

### Medium risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Setup wizard UX complexity | Multi-step wizard with YAML preview is unusual UX; risk of poor usability | Design mockup covers all steps including error/warning states; `web_designer` reviews before implementation |
| Admin log stream memory growth | Log viewer receiving high-volume DEBUG logs can bloat memory | Bounded ring buffer (500 entries max) in `useLogSocket`; configurable via log level filter |
| React 19 compatibility | React 19 is relatively new; some shadcn/ui components or third-party libraries may have friction | Catch during Sprint 0 `pnpm build` baseline; escalate to architect if shadcn component install fails |
| Type coverage gaps | `src/lib/api/types.ts` currently has wrong field names; partial fixes may leave inconsistencies | Full type expansion in Sprint 0 before any page work begins |

### Low risk (monitor)

| Risk | Mitigation |
|------|------------|
| Tailwind v4 API differences from v3 | Tailwind v4 changes utility syntax; ensure web_coder is aware of v4 conventions before writing CSS |
| MCP server restart UX | `POST /mcp/servers/{name}/restart` is synchronous — no progress indicator needed; simpler than assistant stop |
| Rate limiting (429) | Currently "planned" in API — implement graceful handling in Sprint 6 when it is confirmed active |

### Unknowns that require architect review

1. Whether `LogSocket` should reuse the `SessionSocket` class or be a separate lightweight class. The session-specific `session_id` field in the envelope is unused for log messages — this is a minor coupling concern.
2. Whether the setup wizard should be a modal/drawer or a separate route (`/settings/wizard`). Full-page wizard is more accessible for multi-step flows.
3. Whether the memory panel and tools sidebar should be collapsible right panels or a tabbed bottom drawer on the session page. The web designer must decide this before Sprint 3B mockups.

---

## 11. Parallel Work Opportunities

The following tasks have no dependencies on each other and can proceed simultaneously once Sprint 0 is complete:

| Parallel group | Tasks |
|----------------|-------|
| After Sprint 0: Design | S1-01, S1-02, S2-01, S4-01 can all start simultaneously |
| Sprint 5 pages | 5A, 5B, 5C are fully independent |
| Settings sections | S4-08, S4-09, S4-10, S4-12 can be implemented in parallel after S4-01 mockups complete |
| Sprint 3B components | S3B-04 through S3B-10 are all independent implementations; only S3B-11 requires them all |

---

## 12. File Structure Target (end state)

```
src/
├── main.tsx                    # App entry — QueryClient, Router, Toaster
├── App.tsx                     # Route definitions, auth guard, admin guard, lazy routes
├── index.css                   # Tailwind directives + CSS custom properties
├── lib/
│   ├── api/
│   │   ├── config.ts           # API_BASE_URL, WS_BASE_URL, API_V1, WS_V1
│   │   ├── client.ts           # request(), api object, handleApiError(), api.upload()
│   │   ├── tokens.ts           # getAccessToken(), getRefreshToken(), setTokens(), clearTokens()
│   │   ├── keys.ts             # Query key factory — all domains
│   │   ├── pagination.ts       # fetchAllPages utility
│   │   └── types/
│   │       ├── common.ts       # APIError, APIResponse, CursorPage, ResponseMeta
│   │       ├── auth.ts         # UserOut, TokenPair, APIKeyOut, RegisterRequest, LoginRequest
│   │       ├── session.ts      # SessionOut, SessionCreateRequest, AgentState, SessionConfig
│   │       ├── message.ts      # MessageOut, SendMessageRequest, ToolCallRecord, ToolConfirmAction
│   │       ├── tool.ts         # ToolOut, ToolSummary, ToolActionRequest, ToolStatus
│   │       ├── memory.ts       # MemoryStateOut, MemoryModeSwitchRequest
│   │       ├── config.ts       # ConfigOut, ConfigPatchRequest, ProviderOut, ModelOut, WizardStepOut
│   │       ├── websocket.ts    # ServerMessage, ClientMessage, all payload types
│   │       ├── rag.ts          # DocumentOut, SearchRequest, SearchResult
│   │       ├── assistant.ts    # AssistantStatusOut, ChatOut, ScheduledMessageOut, etc.
│   │       └── system.ts       # SystemInfoOut, LogLinePayload
│   ├── ws/
│   │   └── session-socket.ts   # SessionSocket class — reconnect, ping, seq tracking
│   └── stores/
│       ├── auth-store.ts       # user, isAuthenticated, isAdmin, login, logout, register
│       ├── streaming-store.ts  # streamingBuffer, agentState, pendingConfirmation, toolRows
│       └── ui-store.ts         # sidebarOpen, memoryPanelOpen, toolsPanelOpen, toasts
├── hooks/
│   ├── useSessionsQuery.ts
│   ├── useSessionQuery.ts
│   ├── useMessagesQuery.ts
│   ├── useSessionSocket.ts
│   ├── useMemoryQuery.ts
│   ├── useToolsQuery.ts
│   ├── useConfigQuery.ts
│   ├── useProvidersQuery.ts
│   ├── useModelsQuery.ts
│   ├── useMcpServersQuery.ts
│   ├── useApiKeysQuery.ts
│   ├── useDocumentsQuery.ts
│   ├── useSystemInfoQuery.ts
│   ├── useLogSocket.ts
│   ├── useAssistantStatusQuery.ts
│   └── useScrollSentinel.ts
├── components/
│   ├── ui/                     # shadcn/ui — never modify directly
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── PageHeader.tsx
│   ├── AgentStateBadge.tsx
│   ├── CursorLoader.tsx
│   ├── SkeletonList.tsx
│   ├── InfiniteScrollSentinel.tsx
│   ├── ErrorMessage.tsx
│   ├── EmptyState.tsx
│   └── ConfirmDialog.tsx
└── pages/
    ├── auth/
    │   ├── LoginPage.tsx
    │   └── RegisterPage.tsx
    ├── sessions/
    │   ├── SessionsPage.tsx
    │   ├── SessionCard.tsx
    │   └── NewSessionDialog.tsx
    ├── chat/
    │   ├── SessionPage.tsx
    │   ├── SessionHeader.tsx
    │   ├── MessageList.tsx
    │   ├── MessageBubble.tsx
    │   ├── StreamingMessageBubble.tsx
    │   ├── ToolActivityRow.tsx
    │   ├── ToolConfirmationModal.tsx
    │   ├── MemoryPanel.tsx
    │   ├── ToolsSidebar.tsx
    │   └── MessageInput.tsx
    ├── settings/
    │   ├── SettingsPage.tsx
    │   ├── ConfigFlagsForm.tsx
    │   ├── ProviderList.tsx
    │   ├── ModelList.tsx
    │   ├── McpServerList.tsx
    │   ├── SetupWizard.tsx
    │   └── ApiKeyList.tsx
    ├── admin/
    │   ├── AdminPage.tsx
    │   ├── SystemInfoCard.tsx
    │   ├── LiveLogViewer.tsx
    │   └── GuardrailsTable.tsx
    ├── documents/
    │   ├── DocumentsPage.tsx
    │   ├── DocumentCard.tsx
    │   ├── DocumentUploadDialog.tsx
    │   └── SemanticSearchBar.tsx
    ├── assistant/
    │   ├── AssistantPage.tsx
    │   ├── ServiceControlPanel.tsx
    │   ├── AssistantChatList.tsx
    │   ├── ChatHistoryDrawer.tsx
    │   ├── ScheduledMessageTable.tsx
    │   ├── DeferredRecordTable.tsx
    │   ├── ContactList.tsx
    │   └── KnowledgePanel.tsx
    └── ErrorPage.tsx
```

---

## 13. Agent Routing Summary

| Sprint | Task type | Primary agent | Follow-up |
|--------|-----------|---------------|-----------|
| 0 | Defect fixes, new stores, type expansion | web_coder | tester |
| 0 | Design system document | web_designer | — |
| 0 | ADRs (state, WebSocket, error boundary) | architect | — |
| 1–5 | Page design briefs | web_designer | graphic_designer |
| 1–5 | SVG mockup production | graphic_designer | web_designer (review) |
| 1–5 | React implementation | web_coder | tester |
| 6 | Accessibility, performance, polish | web_coder | tester |
| 6 | Changelog and documentation | docs_writer | — |

---

## 14. Sprint Acceptance Criteria Summary

### Sprint 0 done when
- `pnpm build` passes cleanly on the corrected codebase.
- `auth-store.ts` calls `/auth/me`, includes `email` in register, exposes `isAdmin`.
- `session-socket.ts` includes `last_seq` on reconnect URL, exponential backoff, keepalive ping, close-code routing.
- `src/lib/api/keys.ts` exists with key factories for all domains.
- `src/lib/stores/streaming-store.ts` and `ui-store.ts` exist.
- All domain type files exist under `src/lib/api/types/`.
- `docs/web/design-system.md` is written and reviewed.
- Three ADRs are written in `docs/adr/`.

### Sprint 1 done when
- Login page uses shadcn/ui components, renders field-level API validation errors, and redirects to `/sessions` on success.
- Register page includes email field.
- `AppShell` renders correctly at all breakpoints.
- Sidebar shows correct navigation links with active state highlighting.
- `AdminRoute` redirects non-admin users.
- `pnpm build` passes.

### Sprint 2 done when
- Sessions list loads with infinite scroll and a scroll sentinel.
- Session creation dialog works and invalidates the session list.
- Session archival works with a confirm dialog.
- `AgentStateBadge` renders all six states correctly.
- `pnpm build` passes.

### Sprint 3 done when
- Message history loads with scroll-up infinite loading.
- Markdown renders safely (no raw HTML injection).
- Token streaming appears in real time with blinking cursor.
- Agent state badge transitions match the WebSocket `agent_state` events.
- Tool activity rows expand and collapse correctly.
- Tool confirmation modal is blocking, non-dismissible by outside click, and sends `tool_confirm` on action.
- Memory panel shows correct token usage from `memory_update` events.
- Tools sidebar enables/disables tools and reflects the session tool status.
- Message input sends via WebSocket with correct `mode`.
- Cancel button sends `cancel` client message.
- WebSocket reconnect uses exponential backoff and `last_seq`.
- `pnpm build` passes.

### Sprint 4 done when
- All five settings tabs render.
- Config flag toggles call `PATCH /config` for admin users and are disabled for non-admin.
- Provider health check triggers and shows latency/error.
- Setup wizard completes a full multi-step flow.
- API key creation shows the full key exactly once in a modal.
- `pnpm build` passes.

### Sprint 5 done when
- Admin panel renders system info and live log stream.
- Log level filter changes the WebSocket query parameter and reconnects.
- Guardrails table lists and removes blacklist entries (admin).
- Documents page uploads, lists, and deletes documents.
- Semantic search returns results inline.
- Assistant dashboard shows service status, chat list, scheduled messages, and deferred records.
- Stop assistant polls status until `running === false`.
- `pnpm build` passes.

### Sprint 6 done when
- All interactive elements are keyboard-navigable.
- All pages render correctly at mobile width (375px) and desktop width (1440px).
- 404 and generic error pages exist.
- WebSocket close code 1001 triggers health polling and reconnect UI.
- Changelog is updated.
- `pnpm build` passes.

---

## 15. Open Questions (Require Architect Decision Before Sprint Start)

| Question | Blocking | Earliest sprint |
|----------|---------|-----------------|
| `LogSocket`: reuse `SessionSocket` or create separate class? | Sprint 5A | Sprint 0 ADR |
| Setup wizard: modal/drawer or dedicated route? | Sprint 4 | Sprint 4 design |
| Memory/tools panels: right column or tabbed bottom drawer on session page? | Sprint 3B | Sprint 3A design |
| Should `streaming-store` reset on session navigate, or persist per sessionId? | Sprint 3B | Sprint 0 ADR |
| Should the app support multiple simultaneous open sessions (tabs)? Currently assumed single active session. | Sprint 3B | Sprint 0 ADR |

---

*This plan will be updated by the `docs_writer` agent at the end of each sprint to reflect completed tasks and any scope changes.*
