# Cogtrix WebUI

React web frontend for the Cogtrix AI assistant. Communicates with the Cogtrix backend API over REST and WebSocket.

## Build & Run

```bash
pnpm install        # install dependencies
pnpm dev            # start dev server (localhost:5173)
pnpm build          # type-check + production build
pnpm preview        # preview production build
```

## Test

```bash
pnpm test           # run all tests (unit + integration)
pnpm test:watch     # run tests in watch mode
pnpm cy:open        # open Cypress UI for interactive E2E testing
pnpm cy:run         # run Cypress E2E tests headless
```

Integration tests in `src/test/integration/` require the backend at localhost:8000.
Cypress E2E tests in `cypress/e2e/` require both `pnpm dev` (localhost:5173) and the backend (localhost:8000).

## Lint & Format

```bash
pnpm lint           # ESLint
pnpm format         # Prettier (write)
pnpm format:check   # Prettier (check only)
```

## Code Style

- TypeScript strict mode (`noUnusedLocals`, `noUncheckedIndexedAccess`)
- Prettier (100 char line width, double quotes, trailing commas)
- Tailwind CSS v4 with shadcn/ui components (`@/components/ui/`)
- Path alias: `@/` maps to `src/`
- No comments that just narrate what the code does — only explain non-obvious intent

## Project Structure

```
src/
├── main.tsx                    # App entry point (React Query, Router)
├── App.tsx                     # Route definitions, auth guard, lazy routes
├── index.css                   # Tailwind directives + CSS variables
├── lib/
│   ├── api/
│   │   ├── config.ts           # API_BASE_URL, WS_BASE_URL from env
│   │   ├── client.ts           # Typed fetch wrapper with 401 refresh; api object
│   │   ├── tokens.ts           # In-memory JWT storage
│   │   ├── keys.ts             # TanStack Query key factory
│   │   ├── types/              # Per-domain TypeScript types (index.ts re-exports all)
│   │   └── ws/
│   │       ├── session-socket.ts   # WebSocket client with reconnect and ping
│   │       └── log-socket.ts       # WebSocket client for admin live log stream
│   ├── stores/
│   │   ├── auth-store.ts       # Zustand auth state (user, isAdmin, login, register, logout)
│   │   ├── streaming-store.ts  # Zustand streaming state (token buffer, agent state, tools)
│   │   ├── ui-store.ts         # Zustand UI state (sidebar, panel open/close)
│   │   └── log-viewer-store.ts # Zustand log viewer state (lines, level, connection status)
│   └── utils.ts                # cn() class merge helper
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── Sidebar.tsx             # Navigation sidebar (props-based, no direct store access)
│   ├── SidebarLogo.tsx         # Inline SVG C-mark logomark rendered in the sidebar header
│   ├── AgentStateBadge.tsx     # State badge (idle/thinking/...)
│   ├── SessionCard.tsx         # Session list card (also exports SessionRow for list view)
│   ├── ConfirmDialog.tsx       # Generic confirm dialog
│   ├── InfiniteScrollSentinel.tsx  # IntersectionObserver scroll trigger
│   ├── ErrorBoundary.tsx       # Route-level error boundary
│   ├── MarkdownComponents.tsx  # Shared ReactMarkdown component map + remark/rehype plugin arrays
│   ├── PageSkeleton.tsx        # Suspense fallback skeleton
│   ├── PageHeader.tsx          # Shared page header
│   ├── Toaster.tsx             # Sonner toast provider wrapper
│   ├── ViolationBadge.tsx      # Guardrail violation type badge
│   └── YamlBlock.tsx           # Dark YAML preview with copy + download (Light SyntaxHighlighter)
├── pages/
│   ├── login.tsx               # /login and /register (single file, route-determined)
│   ├── not-found.tsx           # 404
│   ├── layout/                 # Authenticated layout components
│   │   └── AppShell.tsx        # Authenticated layout with sidebar
│   ├── sessions/               # /sessions — session list dashboard
│   │   ├── index.tsx
│   │   ├── NewSessionDialog.tsx        # New session creation modal
│   │   ├── SessionActionDialog.tsx     # 3-option remove dialog (archive / delete permanently)
│   │   └── SessionBulkBar.tsx          # Fixed bottom toolbar for bulk selection operations
│   ├── session/                # /sessions/:id — re-exports SessionPage from chat/
│   │   └── index.tsx
│   ├── settings/               # /settings + sub-components
│   │   ├── index.tsx
│   │   ├── ApiKeyList.tsx              # API key management tab
│   │   ├── ConfigFlagsForm.tsx         # Boolean config flag toggles
│   │   ├── McpAddServerDialog.tsx      # MCP server add dialog (501 stub)
│   │   ├── McpServerList.tsx           # MCP server list with restart
│   │   ├── ProviderList.tsx            # Provider + model management with CRUD
│   │   └── SetupWizard.tsx             # Multi-step YAML config wizard
│   ├── admin/                  # /admin
│   │   ├── index.tsx
│   │   ├── LiveLogViewer.tsx           # Live log stream viewer (WS /ws/v1/logs)
│   │   ├── SystemInfoCard.tsx          # System info display
│   │   └── UserManagementPanel.tsx     # Admin user CRUD
│   ├── assistant/              # /assistant — AssistantChatList, CampaignsPanel, ChatHistoryDrawer, ContactList, DeferredRecordTable, GuardrailsPanel, KnowledgePanel, OutboundDialog, ScheduledMessageTable, ServiceControlPanel, SimulatorPanel, WorkflowsPanel
│   │   └── index.tsx
│   ├── documents/              # /documents + DocumentCard, DocumentUploadDialog, SemanticSearchBar
│   │   └── index.tsx
│   └── chat/                   # Chat UI sub-components (SessionPage, MessageList, StatusBar, MessageBubble, StreamingMessageBubble, TypingIndicator, ToolConfirmationModal, ToolsSidebar, MemoryPanel, …)
└── hooks/                      # Custom React hooks grouped by domain
    ├── chat/                   # useSessionSocket, useSessionQuery, useMessagesQuery, useMemoryQuery, useToolsQuery
    ├── assistant/              # useAssistantChatsQuery, useAssistantStatusQuery, useCampaignsQuery, …
    ├── admin/                  # useLogSocket, useSystemInfoQuery, useUsersQuery
    ├── settings/               # useApiKeysQuery, useMcpServersQuery, useProvidersQuery
    └── shared/                 # useConfigQuery, useModelsQuery, useMediaQuery, useLiveUptime, useDocumentsQuery, useSessionsQuery, useSound
```

## Key Patterns

### API Client

All REST calls go through `src/lib/api/client.ts`. The `api` object provides typed `get`, `post`, `put`, `patch`, `delete`, and `upload` methods. Every response is unwrapped from the `APIResponse<T>` envelope — callers receive `T` directly or get an `ApiError` thrown.

Token refresh is automatic: on 401 with `TOKEN_EXPIRED`, the client refreshes the access token and retries the request. Concurrent refresh attempts are deduplicated.

### State Management

- **Server state**: TanStack Query (API data, caching, refetching)
- **Client state**: Zustand stores
  - `useAuthStore` — user identity, auth status, login/register/logout actions
  - `useStreamingStore` — WebSocket token buffer, agent state, tool activities, pending confirmation, connection status
  - `useUIStore` — sidebar and panel open/close state, mobile sheet panel selection
  - `useLogViewerStore` — admin live log viewer state (lines ring buffer, level, connection status)

### WebSocket

`SessionSocket` (`src/lib/api/ws/session-socket.ts`) manages the real-time connection for a chat session. It handles reconnection, message routing, and seq tracking. Server messages are typed via `ServerMessageType`.

`LogSocket` (`src/lib/api/ws/log-socket.ts`) manages the admin live-log WebSocket stream (`WS /ws/v1/logs`). It is used by `LiveLogViewer` in `src/pages/admin/`.

### Authentication

JWT tokens (access + refresh) stored in memory only — no localStorage. The auth flow is:
1. Login/register → receive `TokenPair` → store via `setTokens()`
2. Every REST request attaches `Authorization: Bearer <token>`
3. WebSocket passes token as `?token=<jwt>` query param
4. On 401/TOKEN_EXPIRED → auto-refresh → retry

### Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add button    # adds src/components/ui/button.tsx
```

## API Contract

The backend API is documented in `docs/api/`:

- `client-contract.md` — TypeScript types and API client patterns
- `webui-development-guide.md` — page-by-page integration guide
- `websocket-protocol.md` — WebSocket message types and lifecycle
- `openapi.yaml` / `openapi.json` — OpenAPI 3.1 schema (65 REST endpoints + 2 WebSocket streams)

## Environment Variables

Set in `.env` (see `.env.example`):

- `VITE_API_BASE_URL` — Backend REST base URL (default: `http://localhost:8000`)
- `VITE_WS_BASE_URL` — Backend WebSocket base URL (default: `ws://localhost:8000`)

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4 + shadcn/ui (New York style)
- TanStack Query v5
- Zustand v5
- React Router v7
- pnpm

## Workflow Rules

- Run `pnpm build` after code changes to verify types and build
- Run `pnpm lint` and `pnpm format` before committing
- Use conventional commit messages (fix:, feat:, refactor:, test:, docs:)
- Never commit `.env` files or secrets

## Subagents

During implementation, delegate tasks to the following subagents based on their expertise:

- Use `manager` agent to plan sprints, coordinate all agents, track progress, and write reports.
- Use `architect` agent to design component boundaries, review structural changes, and produce Architecture Decision Records before implementation begins.
- Use `web_designer` agent to define and maintain the visual design system, page architecture, and component hierarchy before any new page or component area is built.
- Use `graphic_designer` agent to produce SVG mockups and visual assets from the web designer's layout briefs — approved mockups are the build target for web_coder.
- Use `web_coder` agent to implement React components and pages in TypeScript against approved SVG mockups and the design system.
- Use `tester` agent to run lint, type-check, and build validation after every code change.
- Use `docs_writer` agent to keep `docs/api/`, component documentation, and the changelog accurate after each sprint.

### Feature workflow

1. **manager** scopes the feature and identifies affected pages, components, and API surfaces.
2. **architect** reviews structural impact — flags any component boundary or state management concerns.
3. **web_designer** updates `docs/web/design-system.md` if needed and briefs `graphic_designer`.
4. **graphic_designer** produces SVG mockups in `docs/web/mockups/`; `web_designer` reviews and approves.
5. **web_coder** implements in React against approved mockups, the design system, and `docs/api/client-contract.md`.
6. **tester** runs `pnpm lint && pnpm build` — zero errors required before merge.
7. **docs_writer** updates the development guide and changelog once the sprint is confirmed closed.
