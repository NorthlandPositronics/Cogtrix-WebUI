# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] (2026-03-27)

### Added

* **assistant:** admin-only Testing tab (9th tab) with `SimulatorPanel` — run full agent pipeline via `POST /api/v1/assistant/simulate` without real channel delivery; results show response text, suppressed/deferred/guardrail-blocked/memory-persisted status badges, guardrail reason, and duration

### Fixed

* **design:** ProjectForge holistic audit — inline styles → Tailwind (`SimulatorPanel`, `AppShell`), semantic focus ring token (`StatusBar`)
* **design:** DesignForge audit (2026-03-27) — streaming cursor animation rule added to `index.css` (`.streaming-cursor` class was absent, cursor rendered static); 404 page typography corrected (`text-2xl` → `text-3xl` for "404", `text-zinc-900` → `text-zinc-500` for "Page not found" heading per approved mockup S4-M3)

## [0.1.6](https://github.com/NorthlandPositronics/Cogtrix-WebUI/compare/v0.1.5...v0.1.6) (2026-03-26)


### Features

* **ui:** UI consistency, sound scheme, collapsible sidebar, polish ([41b7a2a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/41b7a2a87f73a6ea101b74b05b607020ff373f72))

## [0.1.5](https://github.com/NorthlandPositronics/Cogtrix-WebUI/compare/v0.1.4...v0.1.5) (2026-03-26)


### Features

* **chat:** hide Delegate mode option when delegation is disabled ([18988a9](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/18988a9d78072df5b85108bb4396f29a42691e6d))


### Bug Fixes

* **chat:** Think mode fix + delegate gate + forge pipeline ([5979252](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/597925203f1debe5d8a575c8506f34aa5b8c1ec5))
* **chat:** Think mode response disappear + Delegate mode gate ([1394674](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/1394674ad64ecf5161d62b3d68f8833c0179c463))
* **chat:** use done.payload.text as committed response in think/delegate mode ([0fb4102](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/0fb41026dd4afca29668af9116ee83b793ab23ac))

## [0.1.4](https://github.com/NorthlandPositronics/Cogtrix-WebUI/compare/v0.1.3...v0.1.4) (2026-03-25)


### Features

* **chat:** mode icons, slim status bar, tool name fix, no streaming cursor ([4c35c19](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/4c35c191ca8be1b4d55c5be45e9c498a938bb8a4))
* **sessions:** persist grid/list view mode across page refreshes ([172441a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/172441a1d95b50c7276006bd33a2c423099084fb))
* **ux:** sessions bulk/view/model-edit + settings model-select/YAML/providers ([9ebecd7](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/9ebecd72c149ff21830b4b212ec989c9f039bc11))
* **ux:** UI consistency sprint — sessions, chat, security hardening ([c366edb](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/c366edb920aa50a3feee2f0d588f855928c357be))
* **ux:** UI consistency sprint — sessions, chat, security hardening ([79881ba](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/79881ba2390790bf0171af115e819f2a1660a566))


### Bug Fixes

* **api:** APIForge — correct stale types in client-contract.md + format fixes ([bee882f](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/bee882ffc515a2afddcee641aa4f7ad92a3d591a))
* **api:** APIForge contract sync — align frontend types to 2026-03-25 backend schema ([e28ac2d](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/e28ac2d70b1a583332b1aba36718ed08ba0add6f))
* **api:** APIForge regression — restore correct backend schema bindings ([b41c851](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/b41c8515da7c7ae0c708ce96322307202bbd1bde))
* **ci:** harden guard-main-source workflow — CWE-094, CWE-275 ([ca8da23](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/ca8da238f423db5a6d92a9503d8bbee502b66fb1))
* **design:** ConsistencyForge — remaining P2 fixes (missed files) ([51b8766](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/51b8766f973d4be88aa405e53073a492af091910))
* **design:** ConsistencyForge — UI audit fixes, new logo, DS v3.10 ([1862b07](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/1862b07a450cd4465c26f50322dfdf2e004b9c19))
* **design:** ConsistencyForge — UI audit fixes, new logo, DS v3.10 ([a2d478f](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/a2d478f53cf99c227d825809104bbb91eb96c122))
* **design:** DesignForge audit — empty-state icon colors + placeholder text colors ([7dfdee4](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/7dfdee445f08c277ac7f56b29005dd29a8cc5e68))
* **design:** ProjectForge WebUI — holistic UI audit fixes (DS compliance, touch targets, FONT-001) ([8f364e3](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/8f364e31caedafe17902b5c123926f3d739836d1))
* **docker:** DockerForge audit — pin base images, ARG VITE_ vars, update .dockerignore ([65acc0b](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/65acc0b1bf5866d66bf722f5f10a8238e0357186))
* **test:** update tool_start/tool_end mock payloads to use tool_name; fix Prettier ([30bfe85](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/30bfe85c4342f505dc4c65f5ec88828ad95c0b84))
* **wizard:** show api_key field for all provider types (closes [#44](https://github.com/NorthlandPositronics/Cogtrix-WebUI/issues/44)) ([d753329](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/d753329063f27acb17c5422c895f843f3f867288))
* **ws:** prevent reconnect loop when backend replays seq=0 on reconnect ([1dbedb3](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/1dbedb3be53ec545d9a5015f21f12ca4e62e46cb))


### Performance Improvements

* **projectforge:** adaptive polling, statusLog cap, docs interval ([1a0bb2a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/1a0bb2a9981f0ca4ec5004a116bb434038c15093))


## [0.1.3](https://github.com/NorthlandPositronics/Cogtrix-WebUI/compare/v0.1.2...v0.1.3) (2026-03-24)


### Features

* **api-sync:** backend API coverage sprints A–D ([a7cd8ca](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/a7cd8ca48cab43a934f7948a6af6f9d8c8d6202c))
* **api-sync:** project structure migration, DS v3.9, ADR-0008 ([d65774e](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/d65774e904ecff04a90c54b880e33fbae9301693))
* **assistant:** API sync — filter params, new columns, status badges ([e33ec20](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/e33ec20b694dfac006cce9c55014f76ad9339752))
* **brand:** add logomark, PWA manifest, fix favicon inconsistencies ([8d17047](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/8d17047f4c32a778fb9377ccacbfdf7d5fd3080f))
* **brand:** teal rebrand, DesignForge audit, logomark & favicon system ([047b58a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/047b58aa6bbdd3189ffa9f0482e7166922b25fc3))
* **design:** approved SVG mockups for chat page and documents page (D-001, D-002) ([4fe6bda](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/4fe6bdaaf87f827a3043879e5ab889cc50788034))
* **design:** approved SVG mockups for sessions, tools, settings, admin, assistant, 404 ([3c58f61](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/3c58f61c1c732969a82652c58c6180c264c4ab43))
* **design:** rebrand accent color from violet to teal ([e582ec9](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/e582ec9c6b57c11a50d206659e571d55b0303034))
* **design:** rebrand accent from violet to teal ([18cae8f](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/18cae8ff98466d2031386ad0e3065e9f95fd6d37))
* setup form prompts, reconciliation audit, brand mockups, A-001 closure ([52808e5](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/52808e54cca6b5acf3baefda346026a861a4eedf))
* **setup:** replace numbered menu with form-style provider prompts ([d0ee7ab](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/d0ee7ab2a192587776bf633276e5e0c5bd331735))
* **webui:** add favicon — geometric C mark in violet-600 ([843345a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/843345aed36b34767cd91d28139d36bf3a2517ae))


### Bug Fixes

* **api-contract:** sync openapi.yaml + fix CampaignUpdateRequest nullable fields ([9516f1b](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/9516f1b91a8d7bd986fc378365f17de5ebda3d30))
* **api:** API-001 — align UserMessagePayload.optimize_prompt to schema nullable type ([efe7f5a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/efe7f5aae94d5b67fa56469b805ed6aa3b811d62))
* **assistant:** architect ADR-0007 — dynamic channel options, debounced filter ([c5c1865](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/c5c1865b69ed6831ceaa8f03a673fd65c3310396))
* **assistant:** DS v3.8 compliance — compact filter Selects, correct sizing ([7f70040](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/7f7004064cd65eb7e54e15435fe0bd6c34338e04))
* **design:** address graphic designer audit findings post-teal migration ([c592fc5](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/c592fc52ea778196ce672f5f1c56530a34200e67))
* **design:** apply DesignForge audit findings (P1 + P2) ([65695a2](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/65695a225197b3b2d5d9f50e85c6c65ec64a95ac))
* **design:** correct destructive button rest color per DS §5 ruling (GUARDRAIL-001) ([c921fc0](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/c921fc07575c28e0fd9ac039150e4fddaf37b029))
* **design:** DesignForge audit — format failures + DS D-007 closure ([596df1c](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/596df1c8f62a8ba512bfad21f7b39807fdee331f))
* **design:** DesignForge DS v3.8 compliance — 9 P1 + 2 P2 findings resolved (0 P0) ([3653f7f](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/3653f7f481a5bf46b97ff023fc5bf6697ded8c7a))
* **design:** update remaining violet references missed in teal migration ([f9ddfb5](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/f9ddfb56700f0e589ca24cee463d4d078161cbf0))
* **docker:** DockerForge audit — Node 22 LTS, corepack, security headers ([e037b3e](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/e037b3ed5241d0e96292ed7656d2d92101dcd446))
* **forge:** apply ProjectForge WebUI audit findings (P1 + P2) ([62029c4](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/62029c407e34fe38ce95b7d4ba8c48ac3235a02d))
* **forge:** ProjectForge holistic audit — 17 findings resolved (0 P0, 9 P1, 8 P2) ([55ab7ae](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/55ab7aef5867fa5ff456a7fb1c3d022c135ea979))
* **settings:** show inline error when provider health check request fails ([c9d7a94](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/c9d7a945a31cb18758746980329cc3762cca8c63))
* **tests:** apply TestForge Cypress audit findings (E2E 73→109/109) ([a687d09](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/a687d0946b60d7c8e4b6949cb8f318e4bf74a4f4))
* **ui:** reconciliation corrections from chat/documents mockup audit ([8b31a62](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/8b31a625544815f91793235eec20eac1cd94a48a))
* **ui:** reconciliation corrections from sessions/tools/settings/admin/assistant/404 audit ([8ad8a6a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/8ad8a6a77e20e30a27f216c1e8d02a228d3d671a))

### Sprint notes — 2026-03-25 (rolled into v0.1.3 and v0.1.4)

### APIForge — contract doc sync (2026-03-25)

#### Fixed (APIForge — contract doc sync 2026-03-25)
- `docs/api/client-contract.md` — corrected 6 stale TypeScript interfaces that diverged from `openapi.yaml` v1.1.0:
  - `ChatSessionOut`: restored `display_name`, `memory_mode`, `is_locked`; renamed `last_message_at` → `last_activity`; removed `workflow_id`
  - `ContactOut`: restored `identifiers[]` + `channels[]`; removed singular `identifier`/`channel` shape
  - `ViolationRecordOut`: restored per-violation shape (`channel`, `violation_type`, `detail`, `timestamp`); removed aggregated `count`/`last_at`
  - `GuardrailStatusOut`: renamed `violations` → `recent_violations`; added `total_violations`; removed `rate_limit_config`
  - `DeferredRecordOut`: restored `pending_messages` as `string[]`; removed separate `channel`/`chat_id` fields; added `created_at`
  - `KnowledgeFactOut`: renamed `fact_id` → `id`; added `source_channel`, `relevance_score`
- `src/pages/assistant/{AssistantChatList,ContactList,DeferredRecordTable,GuardrailsPanel}.tsx` — Prettier formatting fixes
- TypeScript source (`src/lib/api/types/`) was already correct against the OpenAPI schema — no code changes required

---

### ProjectForge WebUI Holistic Audit — UI consistency, DS compliance, touch targets (2026-03-25)

#### Fixed
- `src/components/Sidebar.tsx` — AUDIT-001: replaced `border-l-2` active indicator with absolute-positioned `w-0.5 h-full rounded-r-full bg-teal-600` accent bar + `bg-teal-50 text-teal-600` background (DS MOCK-011)
- `src/components/SidebarLogo.tsx` — FORGE-002/Phase-8: replaced hardcoded `fill="#0d9488"` with `className="fill-teal-600"`; removed hardcoded `width`/`height` HTML attrs; call sites now pass `className="h-[22px] w-[22px]"`
- `src/pages/settings/ProviderList.tsx` — AUDIT-002/003: secondary columns `type` and `base_url` changed from `text-zinc-900` → `text-zinc-600` (FONT-001); inline add-model form surface `rounded-xl` → `rounded-lg` (DS §14)
- `src/pages/settings/ProviderList.tsx` — AUDIT-004: inline add-model form surface border-radius corrected to `rounded-lg` (DS §14)
- `src/pages/settings/ApiKeyList.tsx` — AUDIT-005: secondary `key_prefix` column `text-zinc-900` → `text-zinc-600` (FONT-001)
- `src/pages/chat/ToolsSidebar.tsx` — AUDIT-006: TriSwitch focus ring changed from `focus-visible:ring-ring` to `focus-visible:ring-teal-600` per DS §5 TriSwitch override
- `src/pages/chat/MessageBubble.tsx`, `src/pages/chat/StreamingMessageBubble.tsx` — AUDIT-007: bubble max-width `max-w-[85%] sm:max-w-[75%]` → `max-w-[75%]` (DS §7 — no mobile exception)
- `src/pages/chat/StreamingMessageBubble.tsx` — AUDIT-014: cursor changed from CSS class `.streaming-cursor` + `motion-reduce:hidden` to `motion-safe:animate-[blink-cursor_1s_step-end_infinite]`; static cursor preserved in reduced-motion mode
- `src/pages/chat/MessageInput.tsx` — AUDIT-008: removed redundant `focus-visible:border-ring` from textarea (ring pattern provides full focus visibility)
- `src/pages/chat/StatusBar.tsx` — AUDIT-009: collapsed width `w-[4.5rem]` → `w-20` (Tailwind scale)
- `src/pages/chat/StatusBar.tsx` — AUDIT-010: expand button `size-6` → `min-h-11 min-w-11` (DS §4 44 px touch target)
- `src/pages/session/index.tsx` — AUDIT-020: model selector `h-8` → `min-h-11` (DS §4 44 px touch target; 32 px was below minimum)
- `src/pages/login.tsx` — AUDIT-017: moved `text-red-700` from `Alert` to `AlertDescription`; added explicit `text-red-700` to `AlertCircle` icon
- `src/index.css` — removed dead `.streaming-cursor { animation: blink-cursor ... }` CSS rule (superseded by Tailwind arbitrary animation on AUDIT-014)
- `src/lib/api/ws/session-socket.ts` — FORGE-003: added clarifying comment on `checkHealth` function

---

### APIForge Contract Sync (2026-03-25)

Full re-sync of frontend TypeScript types and component usage against `docs/api/openapi.yaml` (backend 2026-03-25 snapshot).

#### Breaking (P0) — types updated, all usages fixed

- `ChatSessionOut`: removed `display_name`, `last_activity`, `memory_mode`, `is_locked`; added `last_message_at: string | null`, `workflow_id: string | null` — updated `AssistantChatList.tsx`, `WorkflowsPanel.tsx`
- `DeferredRecordOut.pending_messages`: `string[]` → `number`; added `channel`, `chat_id`; removed `created_at` — updated `DeferredRecordTable.tsx`
- `ContactOut`: `identifiers: string[]` → `identifier: string`; `channels?: string[]` → `channel: string | null`; removed `prompt` — updated `ContactList.tsx`
- `KnowledgeFactOut.id` renamed to `fact_id`; removed `source_channel`, `relevance_score` — updated `KnowledgePanel.tsx`
- `UserMessagePayload.optimize_prompt` removed from WebSocket protocol — updated `websocket.ts`, `session-socket.ts`, `useSessionSocket.ts`; removed per-message optimize toggle from `MessageInput.tsx` and `SessionPage.tsx`
- `ViolationRecordOut`: removed `channel`, `violation_type`, `detail`, `timestamp`; added `count: number`, `last_at: string` — updated `GuardrailsPanel.tsx`
- `GuardrailStatusOut`: `recent_violations` → `violations`; removed `total_violations`; added `rate_limit_config` — updated `GuardrailsPanel.tsx`

#### Changed (P1) — optional fields promoted to required

- `AssistantStatusOut`: `channels?`, `started_at?`, `uptime_s?` → required (nullable)
- `ChannelStatusOut.error`: optional → required
- `WizardStepOut.requires_acceptance`: optional → required

#### Changed (P2) — type refinements

- `LogLevel` union extended with `"CRITICAL"`; `LogLinePayload.type` discriminant added; `LEVEL_BADGE_CLASSES` updated in `LiveLogViewer.tsx`
- `WorkflowDocumentOut.status`: optional → required (nullable)
- `WorkflowCreateRequest`/`UpdateRequest` `tool_policy`/`auto_detect` → `Partial<WorkflowToolPolicy/AutoDetect>`
- `OutboundRequest.channel` narrowed to `"whatsapp" | "telegram" | null`

---

### DesignForge Audit — 2026-03-25

#### Fixed

- `src/pages/assistant/GuardrailsPanel.tsx` lines 97, 148 — DESIGN-001 (P2): empty-state icons `ShieldOff` and `Ban` changed from `text-zinc-300` → `text-zinc-400` (DS §10 minimum legibility floor)
- `src/pages/settings/ProviderList.tsx` lines 132, 316 — DESIGN-001 (P2): empty-state icons `Server` and `Cpu` changed from `text-zinc-300` → `text-zinc-400` (DS §10 minimum legibility floor)
- `src/pages/assistant/KnowledgePanel.tsx` line 61 — DESIGN-002 (P2): `source_chat` column absent-data placeholder `"—"` wrapped in `<span className="text-zinc-500">` (DS §5 Tables placeholder rule)
- `src/pages/assistant/WorkflowsPanel.tsx` line 921 — DESIGN-002 (P2): `assigned_by` column absent-data placeholder `"—"` wrapped in `<span className="text-zinc-500">` (DS §5 Tables placeholder rule)
- `src/index.css` — AUDIT-004/RM-001 (P2): added `transition-duration: 0.01ms !important` to global `@media (prefers-reduced-motion: reduce)` safety net (DS §9 — all three properties now present)

---

### TestForge Audit — 2026-03-25

#### Fixed (selector resilience)

- `cypress/component/TypingIndicator.cy.tsx` — TEST-001 (P1): replaced CSS class selector `span.rounded-full` with `[data-cy='typing-dot']`; added `data-cy="typing-dot"` to all three dot spans in `src/pages/chat/TypingIndicator.tsx`

#### Improved (API stub completeness)

- `cypress/e2e/assistant.cy.ts` — TEST-002 (P2): `AssistantStatusOut` stub updated to include `started_at: null` (field is required in the current type contract)

#### Added (new test scenarios)

- `cypress/component/MessageInput.cy.tsx` — TEST-003 (P2): 3 new tests for mode selector (`data-cy="message-mode"`): default Normal state, Think mode selection via dropdown, send with non-default mode
- `cypress/e2e/streaming.cy.ts` — TEST-004 (P2): `optimize_prompt` absence assertion added to `"sends user_message"` test (regression guard for APIForge 2026-03-25 removal)
- `cypress/e2e/streaming.cy.ts` — TEST-005 (P2): new `"closes socket on seq gap"` test — verifies session-socket closes WebSocket (`readyState === 3`) when a seq gap is detected

---

### DockerForge Audit — 2026-03-25

#### Fixed

- `docker/Dockerfile` — P1-001: `FROM node:22-alpine` → `FROM node:22.13-alpine` — pins builder to the exact Node version in use, preventing unexpected minor-version updates from changing build behaviour
- `docker/Dockerfile` — P1-001 (companion): replaced `corepack enable && corepack prepare pnpm@10.30.3 --activate` with `npm install -g pnpm@10.30.3 --no-update-notifier` — avoids corepack key-rotation failures on pinned Node 22.13 image where bundled corepack cannot verify the pnpm@10.30.3 signing key
- `docker/Dockerfile` — P1-002: `ENV VITE_API_BASE_URL=""` / `ENV VITE_WS_BASE_URL=""` promoted to `ARG` declarations followed by `ENV` assignments — build-time config now overridable via `--build-arg` for standalone (non-proxy) deployments
- `docker/Dockerfile` — P2-001: `FROM nginx:1.29-alpine` → `FROM nginx:1.29.7-alpine` — pins to exact patch version (resolved sha already confirmed as 1.29.7 in baseline build)
- `.dockerignore` — P1-003: added `.cogtrix.yml` — prevents local backend provider config from entering the Docker build context

---

### ProjectForge WebUI Holistic Audit — performance and type fixes (2026-03-25)

#### Fixed
- **perf**: Documents query processing poll reduced 5 s → 15 s (cuts 3× unnecessary `/rag/documents` requests during upload processing)
- **perf**: `statusLog` in streaming store now caps at 100 entries (sliding window) — prevents unbounded memory/DOM growth in very long sessions
- **perf**: AssistantStatus polling now adapts to service state — 3 s during transitions, 10 s when running, 30 s when stopped/error
- **types**: `UseAssistantStatusQueryOptions.refetchInterval` now accepts TanStack Query callback form

---

### APIForge Regression Fix — 2026-03-25

#### Fixed (Critical — schema regressions from commit e28ac2d)

- `src/lib/api/types/assistant.ts` — `ChatSessionOut`: restored `display_name`, `last_activity`, `memory_mode`, `is_locked`; removed incorrect `last_message_at`, `workflow_id`
- `src/lib/api/types/assistant.ts` — `DeferredRecordOut`: `pending_messages` restored to `string[]` (was wrongly `number`); `created_at` restored; `channel`/`chat_id` removed; `status` narrowed back to `"pending" | "firing"`
- `src/lib/api/types/assistant.ts` — `ContactOut`: `identifiers: string[]` restored (was singular); `channels: string[]` restored; `prompt` field restored
- `src/lib/api/types/assistant.ts` — `KnowledgeFactOut`: `id` restored (was `fact_id`); `source_channel` and `relevance_score` restored
- `src/lib/api/types/system.ts` — `ViolationRecordOut`: `channel`, `violation_type`, `detail`, `timestamp` restored; `count`/`last_at` removed
- `src/lib/api/types/system.ts` — `GuardrailStatusOut`: `total_violations` + `recent_violations` restored; `violations`/`rate_limit_config` removed

#### Added

- `src/components/ViolationBadge.tsx` — new component mapping `violation_type` values (`input`, `encoding`, `tool_call`, `rate_limit`, `llm_judge`) to amber/red badge variants
- `AssistantChatList.tsx` — `memory_mode` chip (MemoryModeChip inline) + `is_locked` Lock icon indicator per DS v3.12
- `AssistantChatList.tsx` — `display_name` restored; shows resolved name when available with monospace `chat_id` fallback
- `ContactList.tsx` — multi-identifier display with `+N more` tooltip; per-channel badges
- `DeferredRecordTable.tsx` — pending messages count with tooltip preview of message texts
- `WorkflowsPanel.tsx` — bind dialog Select now shows `display_name ?? session_key`
- `GuardrailsPanel.tsx` — 5-column violations table (Time / Chat ID / Channel / Type / Detail); `total_violations` badge; `ViolationBadge` wired

---

### Sprint notes — 2026-03-24 (rolled into v0.1.3)

#### Test (TestForge — DS v3.8 compliance, 2026-03-24)
- fix: StatusBar component test — update `span.animate-pulse` selector to `span[class*='animate-pulse']` (broken by DesignForge motion-safe prefix addition)
- fix: TypingIndicator component test — scope bare `span.rounded-full` selector to `[role='status']` parent for resilience
- feat: add AgentStateBadge.cy.tsx — 10 new component tests covering all 9 AgentState variants, animated pulse presence/absence, aria-label, and role=status

---

### DesignForge Phase 6 — DS v3.8 compliance (2026-03-24)

#### Fix
- fix(design): DesignForge DS v3.8 compliance — 9 P1 + 2 P2 findings resolved (0 P0)
  - motion-safe: prefix on all ambient animate-pulse indicators (AgentStateBadge ×6, StatusBar, SessionHeader, DocumentCard)
  - FONT-001 typography pass: secondary data columns text-zinc-600 (was text-zinc-900 or text-zinc-500), primary columns font-medium
  - MessageInput textarea text-base (form input body size per DS §2)
  - DS §5 Panel Filter Controls: dedicated filter row separated from header row (CampaignsPanel, AssistantChatList)
  - Neutral badge text-zinc-600: draft + pending campaign/target badges
  - CodeBlock language label text-zinc-500 (text content floor, was text-zinc-400)

---

### APIForge Contract Audit (2026-03-24)

Full holistic audit of frontend API usage against `docs/api/openapi.yaml`:

- **Schema sync status**: `openapi.yaml` identical between WebUI and backend — no drift
- **Type audit**: All TypeScript types correctly typed against schema definitions; schema-optional fields with Pydantic `default_factory` correctly treated as required in TS
- **WebSocket coverage**: All 10 server message types and 4 client message types fully handled
- **Error handling**: All critical error codes handled; non-critical codes fall to default toast (acceptable)
- **Endpoint coverage**: All 65 REST endpoints accounted for; 8 unused detail endpoints are intentional (list-over-detail pattern)
- **Single finding**: API-001 below (P2)

#### Fixed

- **API-001**: `UserMessagePayload.optimize_prompt` typed as `boolean` — aligned to schema (`anyOf: [boolean, null]`); also updated `session-socket.ts` and `useSessionSocket.ts` parameter types (`src/lib/api/types/websocket.ts`, `src/lib/ws/session-socket.ts`, `src/hooks/useSessionSocket.ts`)

---

### ProjectForge Holistic Audit — DS compliance, correctness, performance

#### Fixed
- `src/pages/assistant/WorkflowsPanel.tsx` — GUARD-001/GUARD-002 (P1): ghost destructive icon buttons (unbind, delete workflow) changed from `text-red-600` to `text-zinc-500` at rest (DS §3 guardrail — destructive color must not appear at rest on ghost buttons)
- `src/pages/assistant/ScheduledMessageTable.tsx` — GUARD-003 (P1): cancel button `text-red-600` → `text-zinc-500` at rest
- `src/pages/assistant/KnowledgePanel.tsx` — GUARD-004 (P1): delete-fact button `text-red-600` → `text-zinc-500` at rest
- `src/pages/assistant/DeferredRecordTable.tsx` — GUARD-005 (P1): cancel button `text-red-600` → `text-zinc-500` at rest
- `src/pages/assistant/CampaignsPanel.tsx` — C-001 (P1): numeric data cells `text-zinc-700` → `text-zinc-900` (DS data ink rule)
- `src/pages/assistant/CampaignsPanel.tsx` — C-002 (P1): cancelled badge neutral text `text-zinc-500` → `text-zinc-600`
- `src/pages/assistant/WorkflowsPanel.tsx` — W-001 (P1): neutral badge text `text-zinc-500` → `text-zinc-600`
- `src/pages/chat/ToolsSidebar.tsx` — FOCUS-001 (P1): hardcoded `focus-visible:ring-teal-600` replaced with semantic `focus-visible:ring-ring` (DS §3 focus ring token rule)
- `src/pages/assistant/AssistantChatList.tsx` — A-001 (P2): Channel column `TableCell` was missing `text-sm`
- `src/pages/assistant/DeferredRecordTable.tsx` — D-001 (P2): Depth column `TableCell` was missing `text-sm`
- `src/pages/assistant/ScheduledMessageTable.tsx` — S-001 (P2): Scheduled column `TableCell` was missing `text-sm`
- `src/pages/assistant/KnowledgePanel.tsx` — K-001 (P2): search input row and source_chat filter Select row separated into distinct rows (`min-h-11` / `h-8`) per DS §5 panel filter controls spec
- `src/pages/chat/ToolsSidebar.tsx` — SEARCH-001 (P2): filter input `type="search"` changed to `type="text"` per DS §5 filter input rule

#### Performance
- `src/lib/ws/session-socket.ts` — SEQ-001 (P2): WebSocket seq gap now calls `ws.close()` and returns, triggering server replay from `last_seq`; previously only logged a warning, leaving the client in a silent data-loss state
- `src/lib/stores/streaming-store.ts`, `src/pages/session.tsx` — SELECTOR-001 (P2): added `hasActiveTool` as a first-class boolean field in streaming store, removing an `Array.from(Map.values()).some()` allocation from the hot render selector path

#### Refactored
- `src/pages/assistant/KnowledgePanel.tsx`, `src/pages/assistant.tsx` — AUTH-001 (P2): removed direct `useAuthStore` read from deep sub-component; `isAdmin` is now threaded as a prop from the page root

---

### API sync — assistant panel filters, filter-aware query key factories

#### Added
- `src/hooks/useAssistantChatsQuery.ts` — new `channel?` option; appends `?channel=` query param to `GET /assistant/chats`
- `src/hooks/useDeferredRecordsQuery.ts` — new `channel?` option; appends `?channel=` query param to `GET /assistant/deferred`
- `src/hooks/useKnowledgeQuery.ts` — new `source_chat?` option; appends `?source_chat=` query param to `GET /assistant/knowledge`
- `src/hooks/useScheduledMessagesQuery.ts` — new `channel?` and `chat_id?` options; appended as query params to `GET /assistant/scheduled`
- `src/pages/assistant/ScheduledMessageTable.tsx` — channel filter input; `channel` and `attempts/max_attempts` columns; `firing` (amber) and `failed` (red) badge colors
- `src/pages/assistant/AssistantChatList.tsx` — channel filter input; `display_name` as primary identifier with `chat_id` secondary; `message_count` column
- `src/pages/assistant/DeferredRecordTable.tsx` — channel filter input; `pending_messages` count column; `status` badge column (`pending` = blue, `firing` = amber)
- `src/pages/assistant/KnowledgePanel.tsx` — `source_chat` filter input
- `src/pages/assistant/CampaignsPanel.tsx` — status filter Select (all / draft / active / paused / completed / cancelled)

#### Changed
- `src/lib/api/keys.ts` — `assistant.chats`, `assistant.scheduled`, `assistant.deferred`, and `assistant.knowledge` key factories now accept optional filter params to segregate cache entries per filter state

---

### DockerForge Audit — builder image, pnpm management, nginx security headers

#### Fixed
- `Dockerfile` — DOCKER-001 (P1): builder base image changed from `node:25.8-alpine` (Node 25, non-LTS) to `node:22-alpine` (Node 22 LTS) to match the dev environment and avoid odd-numbered/experimental Node releases
- `Dockerfile` — DOCKER-002 (P2): `npm install -g pnpm` replaced with `corepack enable && corepack prepare pnpm@10.30.3 --activate` — idiomatic Node.js pnpm management without npm dependency
- `nginx.conf` — DOCKER-003 (P2): `X-XSS-Protection: 1; mode=block` response header added to the server block and all location blocks (`/assets/`, `/index.html`)
- `README.md` — DOCKER-004 (P2): Node.js prerequisite corrected from `Node.js 20+` to `Node.js 22+`

---

### DesignForge Audit — design system compliance fixes

#### Fixed
- `src/pages/admin.tsx` — ADMIN-001 (P1): stacked layout replaced with shadcn/ui `Tabs` (System / Live Logs / Users) per DS §14
- `src/pages/login.tsx` — LOGIN-001 (P2): `SidebarLogo` at 40×40px added above "Cogtrix" heading, centered, per DS §0.4
- `src/pages/layout/AppShell.tsx` — MOBILE-001 (P2): mobile header now shows `SidebarLogo` (22×22px) alongside "Cogtrix" wordmark per DS §0.4
- `src/components/MarkdownComponents.tsx` — MD-001 (P1): `th` component was missing `uppercase` class; DS §5 table header spec requires `text-xs font-medium uppercase tracking-wide text-zinc-500`
- `src/pages/settings/ProviderList.tsx` — WCAG-001 (P1): Models `TableRow` now includes `hover:bg-zinc-50` per DS §5 row hover requirement
- `src/pages/not-found.tsx` — NOT-001 (P2): "404" changed from `text-3xl` to `text-2xl` (DS §2 reserves `text-3xl` for auth page); `h1` corrected from `text-zinc-500` to `font-medium text-zinc-900` (DS §2 — headings use zinc-900)
- `src/pages/settings/McpServerList.tsx` — MCP-001 (P2): "Connection" column header renamed to "Transport" per DS §14 MCP table spec

---

### APIForge Contract Sync — schema update, CampaignUpdateRequest nullable fields

#### Changed
- `docs/api/openapi.yaml` — synced from authoritative backend copy (8015 lines → was 7965); additions: `WorkflowDocumentOut` component schema, typed workflow document endpoint responses (`APIResponse_WorkflowDocumentOut_`, `APIResponse_list_WorkflowDocumentOut__`), `WizardStepOut.requires_acceptance` field, two user self-action `400` responses, `ValidationError.input`/`ctx` fields, password description and model description updates
- `src/lib/api/types/assistant.ts` — `CampaignUpdateRequest`: all patch fields typed as `T | null` (was `T`) to match schema's nullable union fields, enabling explicit null to clear field values via `PATCH /assistant/campaigns/{id}`

#### Known limitations
- `ProviderOut.type` description in the backend schema does not mention xAI as an OpenAI-compatible preset (`name: "xai", type: "openai"`) — backend documentation task DOCS-001 filed

---

### ProjectForge WebUI Audit — security, DS, performance, architecture

#### Fixed
- `src/lib/ws/session-socket.ts` — FORGE-SEC-001 (P1): added `VALID_SERVER_MESSAGE_TYPES` array; unknown server message types are now silently dropped before routing, guarding against spoofed or unexpected WebSocket frames
- `src/lib/ws/session-socket.ts` — FORGE-PERF-002 (P2): added seq gap detection in `onmessage`; logs a console warning when `msg.seq !== _lastSeq + 1` to surface silent data loss
- `src/pages/chat/SessionHeader.tsx` — FORGE-DS-001a (P2): moved `text-zinc-500 hover:bg-zinc-100` from `ChevronLeft` icon to the back `Button` wrapper (DS §3 — rest color must be on the interactive element)
- `src/pages/chat/SessionHeader.tsx` — FORGE-DS-001b (P2): added `text-zinc-500` at rest to Brain/Memory and Wrench/Tools toggle buttons (active state still overrides to `text-teal-600`)
- `src/pages/chat/SessionHeader.tsx` — FORGE-DS-001c (P2): added `hover:bg-zinc-100` to Trash2 clear-history button
- `src/pages/sessions.tsx` — FORGE-DS-002 (P2): "Show archived" label hidden on mobile (`hidden sm:inline`) to prevent header overflow
- `src/pages/chat/TypingIndicator.tsx` — FORGE-DS-003 (P2): added `aria-hidden="true"` to each animated dot span; the parent has `aria-label="Assistant is typing"` so dots are purely decorative
- `src/hooks/useSessionsQuery.ts` — FORGE-PERF-001 (P2): increased `staleTime` from 30 s to 5 min; sessions list is stable and invalidated explicitly on mutations
- `src/hooks/useWorkflowsQuery.ts` — FORGE-ARCH-001 (P2): removed `workflowId` parameter from `useWorkflowBindingsQuery`; the endpoint is global (`GET /assistant/workflows/bindings`) and the param was only used to gate `enabled`, not reflected in the queryKey, making it misleading
- `src/pages/assistant/WorkflowsPanel.tsx` — updated `useWorkflowBindingsQuery()` call (no args)

---

### API sync — backend wiring, per-session config, optimize_prompt, archived sessions

#### Added
- `src/pages/chat/SessionSettingsPopover.tsx` — new popover component: gear icon in session header opens an inline editor for per-session `system_prompt`, `max_steps`, and `context_compression` via `PATCH /sessions/{id}`
- `src/components/ui/popover.tsx` — Popover shadcn/ui component
- `src/pages/sessions/NewSessionDialog.tsx` — collapsible "Advanced" section with system prompt textarea, max steps input (1–200), and context compression toggle; all fields map to `SessionConfig` in `SessionCreateRequest`
- `src/pages/chat/MessageInput.tsx` — `Sparkles` icon toggle for `optimize_prompt`; teal active state; initialized from global `config.prompt_optimizer`
- `src/pages/sessions.tsx` — "Show archived" Switch toggle; archived sessions rendered with "Archived" badge and `opacity-60`
- `src/components/SessionCard.tsx` — "Archived" gray badge and `opacity-60` for archived sessions

#### Changed
- `src/pages/assistant/ServiceControlPanel.tsx` — "Force restart" button (amber warning variant) shown only when `status === "error"`; calls `POST /assistant/start` with `{ force_restart: true }`
- `src/pages/chat/SessionHeader.tsx` — clear-history dialog replaced with a Dialog containing a `keep_last` number input (0 = clear all); integrates `SessionSettingsPopover`
- `src/pages/settings/McpServerList.tsx` — "URL" column renamed to "Connection"; stdio servers now show `command + args` in monospace; `connected_at` timestamp shown below status badge
- `src/pages/documents/DocumentCard.tsx` — "Indexed" timestamp (`ingested_at`) shown alongside "Uploaded" (`created_at`) for indexed documents
- `src/lib/api/types/websocket.ts` — `UserMessagePayload` extended with `optimize_prompt?: boolean`
- `src/lib/ws/session-socket.ts` — `sendMessage` signature extended with optional `optimizePrompt?` parameter
- `src/hooks/useSessionSocket.ts` — `sendMessage` forwards `optimizePrompt` to `SessionSocket`; mutations invalidate `keys.sessions.all` instead of only `keys.sessions.list()`
- `src/pages/chat/SessionPage.tsx` — reads `config.prompt_optimizer` via `useConfigQuery`; passes as `defaultOptimizePrompt` to `MessageInput`
- `src/hooks/useSessionsQuery.ts` — accepts `includeArchived?: boolean`; appends `?include_archived=true` when set
- `src/lib/api/keys.ts` — `sessions.list` key includes `includeArchived` to prevent cache conflicts
- `src/pages/sessions/NewSessionDialog.tsx` — mutations invalidate `keys.sessions.all`

---

### Setup script — form-style provider prompts

#### Changed
- `scripts/setup.sh` — replaced numbered menu (1/2/3) with a sequential form: provider type, API key (masked), base URL, provider name, model; supports all five provider types (ollama / openai / anthropic / google / xai) with per-type defaults; provider name is now independent of type and becomes the YAML key, allowing custom names (e.g. `spark` for an OpenAI-compatible endpoint)

---

### Settings — provider health check error handling

#### Fixed
- `ProviderList` — health check API failures now show a persistent inline XCircle + "Check failed" label in the table row instead of a transient toast; distinguishes three states: not yet checked (no indicator), API error ("Check failed"), `reachable: false` ("Unreachable"), `reachable: true` (latency ms)

---

### Approved SVG mockups — sessions, tools, settings, admin, assistant, 404

#### Added
- `docs/web/mockups/sessions-desktop.svg` — 1440×1700 sessions dashboard with grid, empty, loading, and new-session dialog frames
- `docs/web/mockups/chat-tools-panel.svg` — 1440×1100 tools panel showing all five tool status variants and TriSwitch in all three positions
- `docs/web/mockups/settings-desktop.svg` — 1440×2640 three stacked frames: General, Providers & Models, MCP Servers
- `docs/web/mockups/admin-desktop.svg` — 1440×1040 admin page: SystemInfoCard + LiveLogViewer stacked (no tabs)
- `docs/web/mockups/assistant-desktop.svg` — 1440×1900 assistant page: Chats and Guardrails tab frames
- `docs/web/mockups/not-found.svg` — 1440×900 centered 404 error page

#### Changed
- `docs/web/mockups/BACKLOG.md` — S2-M1, S2-M3, S3-M1, S3-M2, S4-M2, S4-M3 updated to APPROVED 2026-03-24

---

### UI reconciliation — sessions, tools, settings, admin, assistant, 404

#### Fixed
- `sessions.tsx` — empty state now includes `MessageSquare` icon (48 px, `text-zinc-400`, `strokeWidth={1.5}`)
- `ToolsSidebar` — `auto_approved` badge label corrected from "Auto" to "Auto-approved"
- `ToolsSidebar` — TriSwitch focus ring changed from `focus-visible:ring-ring` to `focus-visible:ring-teal-600` per DS §5
- `ConfigFlagsForm` — `debug` and `verbose` flags added to the feature flags table
- `ProviderList` — Providers section moved above Models section; Models table columns changed to Alias / Provider / Model name / Status / Action
- `McpServerList` — Add button variant changed to `default` (teal fill); label updated to "Add MCP Server"; columns reordered to Name / URL / Status / Action (Transport and Tools columns removed)
- `admin.tsx` — tabs shell removed; SystemInfoCard, LiveLogViewer, and UserManagementPanel now render as stacked `space-y-6` cards
- `AssistantChatList` — columns updated to Chat ID (monospace) / Channel / Time (`last_activity`); Messages count column removed
- `not-found.tsx` — added `FileQuestion` icon, "404" heading, "Page not found" subtitle, `bg-zinc-50` container, and "Go home" outline button

---

### Accessibility — A-001 closure

#### Resolved
- A-001 closed — `StatusBar` verified to use `text-zinc-500` for all text-content elements (tool names, timestamps, entry labels); `docs/web/mockups/BACKLOG.md` updated accordingly

---

## [0.1.2](https://github.com/NorthlandPositronics/Cogtrix-WebUI/compare/v0.1.1...v0.1.2) (2026-03-23)


### Features

* **webui:** implement API gap sprint — GAP-1 through GAP-5 ([045d644](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/045d644fe18ef9110e2cf13da9c44ea020781bb4))
* **webui:** ProjectForge + TestForge + DockerForge + APIForge audit sprint ([084e185](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/084e185c4f371162aafa74516b2f04b30866c95c))


### Bug Fixes

* **chat:** allow unpinning tools; fix missing DialogDescription aria warnings ([52bbc36](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/52bbc368786732e6a89af1c391219aeae6dd3b22))
* **chat:** disable tool toggles while agent is running; fix unload-by-click ([9535b83](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/9535b835910791b392db9c3312b047087c8e01fe))
* **docker:** DockerForge audit — .dockerignore completeness, nginx gzip_vary ([87f3963](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/87f3963c1979fc6dced5f33c9770e6821645afa1))
* **types:** align WorkflowDocumentOut and UserUpdateRequest with backend schema ([4ccd330](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/4ccd3308d4dc7dbe7e812b2cde634e81bd69ca5a))
* **types:** APIForge contract sync — workflow types, error codes ([7e540f1](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/7e540f15f169fb6b5a5bce3493c0111353ec9620))
* **webui:** DesignForge audit — WCAG contrast, motion, tokens, streaming cursor ([e6d061d](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/e6d061d83a85ed7932f6bdc5eaabcdc5c0cafbd5))
* **webui:** DesignForge audit — WCAG contrast, nested blockquote, DS v3.2 ([463cd9f](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/463cd9fe5dabf1b8b4aade3b1502bc0c7e964e30))
* **webui:** ProjectForge WebUI audit — arch, a11y, DS compliance, mobile ([f559553](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/f559553aaf709311208cdc4511a5e1753e8b0954))

---

### Sprint notes — 2026-03-23

### Brand mark & favicon system

#### Added
- `public/logo.svg` — scalable C-mark logomark (viewBox only, teal-600, two nodes, no connector line)
- `public/manifest.webmanifest` — PWA manifest for Android home screen install; links `favicon-192x192.svg` as the installable icon
- `src/components/SidebarLogo.tsx` — inline SVG React component rendering the C-mark in the sidebar header alongside the "Cogtrix" wordmark
- `docs/web/briefs/brand-mark.md` — graphic designer brief for all favicon and logo assets, including canonical mark construction rules

#### Changed
- `public/favicon-192x192.svg` — removed prohibited `<line stroke-dasharray>` dashed connector element between nodes
- `src/components/Sidebar.tsx` — sidebar header now renders `<SidebarLogo />` alongside the wordmark
- `index.html` — removed 32×32 favicon `<link>`, added `<link rel="manifest">` for PWA
- `docs/web/design-system.md` — bumped to v3.6; added §0 Brand Identity with canonical mark spec, node-count rules, and connector-line prohibition

#### Deleted
- `public/favicon-32x32.svg` — removed as exact duplicate of `favicon.svg` (maintenance debt)

---

### Approved SVG mockups — chat page and documents page

#### Added
- `docs/web/mockups/chat-desktop.svg` — 1440×900 three-column layout showing sidebar, all five message types, StatusBar, MemoryPanel, and MessageInput
- `docs/web/mockups/chat-mobile.svg` — 390×844 mobile layout: no sidebar or panel, collapsed StatusBar
- `docs/web/mockups/documents-desktop.svg` — 1440×900 layout showing SemanticSearchBar, all four DocumentCard states, and DocumentUploadDialog open

#### Changed
- `docs/web/mockups/BACKLOG.md` — S2-M2 (chat) and S4-M1 (documents) status updated to APPROVED 2026-03-23
- `docs/web/design-system.md` §16 — D-001 (Session Chat) and D-002 (Documents) marked RESOLVED with mockup file references

---

### Chat and documents UI reconciliation

#### Changed
- `MessageBubble` — tool call divider color corrected from `border-zinc-100` to `border-zinc-200`
- `MessageBubble`, `StreamingMessageBubble` — bubble max-width changed from `max-w-[75%]` to `max-w-[85%] sm:max-w-[75%]` for mobile responsiveness
- `MessageInput` — mode label text and "Send" button text now visible on `sm+` breakpoints only
- `MemoryPanel` — active mode button changed to outline style with `teal-50`/`teal-200`/`teal-600` active classes
- `documents.tsx` — document list layout changed from CSS grid to `space-y-3` single-column
- `documents.tsx` — document count label added above the list
- `documents.tsx` — empty state updated to two-line hierarchy (bold primary + muted secondary)
- `DocumentCard` — inline status text replaced with colour-coded `Badge` per status (green/amber/red)
- `DocumentCard` — delete button disabled during processing and pending states
- `SemanticSearchBar` — Search icon inset on the left with `pl-9` padding on the input

---

### Brand mark & favicon audit

#### Added
- `public/logo.svg` — scalable C-mark logomark (viewBox 28×28, transparent background, two nodes, no connector line)
- `public/manifest.webmanifest` — PWA manifest linking `favicon-192x192.svg` as the installable icon; activates Android/Chrome install prompt
- `src/components/SidebarLogo.tsx` — inline SVG React component rendering the C-mark for use in the sidebar header alongside the "Cogtrix" wordmark
- `docs/web/briefs/brand-mark.md` — design brief specifying the canonical C-mark construction

#### Changed
- `public/favicon-192x192.svg` — removed `<line stroke-dasharray="4 8">` dashed connector element that visually closed the C gap; desc bumped to v3.6
- `index.html` — removed `<link sizes="32x32" href="/favicon-32x32.svg">`, added `<link rel="manifest" href="/manifest.webmanifest">`
- `src/components/Sidebar.tsx` — sidebar header now renders `<SidebarLogo />` alongside the wordmark
- `docs/web/design-system.md` — bumped to v3.6; added §0 Brand Identity with canonical mark spec, node count rules, and connector-line prohibition

#### Deleted
- `public/favicon-32x32.svg` — removed as maintenance debt (was an exact duplicate of `favicon.svg`)

#### Design rules codified
- ≤32 px: one node (upper tip only); ≥64 px: two nodes (upper r≈0.17×stroke, lower r≈0.13×stroke)
- Dashed connector line prohibited unconditionally in all size tiers

---

### DesignForge — Design audit (teal migration pass)

#### Scope
Holistic design system compliance, accessibility, and formatting audit following the violet→teal
brand color migration. Covered all 80 TSX/CSS source files, design system tokens, ARIA coverage,
animation/motion-reduce compliance, and focus ring consistency.

#### Verdict: PASS — 2 findings fixed, 0 P0s

#### Findings fixed

**P1:**
- Format failures — Prettier reformatted `src/index.css` and `src/pages/chat/ToolsSidebar.tsx`.
  Root cause: code edits in the teal migration were not run through Prettier before commit.

**Documentation:**
- `docs/web/design-system.md` §16 D-007 marked RESOLVED — `DocumentCard.tsx` delete button was
  already corrected to `text-zinc-500` in a prior sprint; §16 entry was never closed.

#### No new findings
Zero contrast failures, zero keyboard traps, zero missing ARIA labels, zero hardcoded hex values,
zero inline styles in user code. All animations respect `prefers-reduced-motion` via global CSS
override and explicit `motion-safe:`/`motion-reduce:` Tailwind utilities where appropriate.

---

### APIForge — API contract validation audit

#### Scope
Full audit of WebUI frontend API usage against the current backend OpenAPI schema and source code.
Covered: 48 query/mutation files, all TypeScript types in `src/lib/api/types/`, WebSocket message
types in `src/lib/api/types/websocket.ts`, and all REST call sites across `src/hooks/` and `src/pages/`.

#### Verdict: PASS — zero breaking changes, zero code fixes required

All frontend API calls map to routes that exist in backend source code. All TypeScript types
match backend Pydantic schemas. WebSocket message types match backend `ws.py` definitions.

#### Findings

**Non-breaking (already handled):**
- `ToolStatus "pinned"` — new enum value in backend; already present in `src/lib/api/types/tool.ts`
- `AssistantStartRequest` body now required (non-nullable) — frontend sends `{}` which is valid
- `POST /api/v1/config/provider` — backend returns 410 GONE; frontend correctly uses
  `POST /config/model` and does not call the deprecated endpoint
- WebSocket types (`tool_end`, `memory_update`, `pong`, `log_line`) — all match backend `ws.py`

**Schema documentation drift (backend-side, flagged for backend team):**
- Backend's `docs/api/openapi.yaml` is 6202 lines vs WebUI's 7965 lines — backend schema
  missing 12 route groups that still exist in backend source code (campaigns, workflows,
  outbound, users CRUD)
- Backend schema incorrectly documents `POST /config/provider` as working (200 OK +
  `ProviderSwitchRequest` body) when the actual handler returns 410 GONE
- WebUI's `openapi.yaml` is MORE accurate — retains all working routes and correctly marks
  the deprecated endpoint; no update needed
- Backend task filed: TASK-001 in Cogtrix backend onetime.md — regenerate schema from live app

#### Build results
- No code changes — no build run needed

---

### DockerForge — Dockerfile audit and nginx hardening

#### Baseline
- Build: PASS | Image: 63.3 MB | User: appuser (uid 1001, non-root) | All smoke tests passing
- No P0 findings — multi-stage build, non-root user, health check, and layer ordering were already correct

#### P1 Fixes
- `.dockerignore`: added `docker-compose.cogtrix.yml`, `.gitignore`, `cypress.config.ts` — prevents these files from being sent to the Docker build context

#### P2 Fixes
- `nginx.conf`: added `server_name _;` directive — explicit catch-all server name per nginx hardening guidelines
- `nginx.conf`: added `gzip_vary on;` — ensures `Vary: Accept-Encoding` is included in responses so CDNs correctly cache both compressed and uncompressed variants

#### Flagged for manager
- **FLAG-001**: Node base image `25.8-alpine` is an odd-numbered (non-LTS) release; dev environment is v22.13.0 (LTS). Confirm whether Node 25.x is intentional or should be pinned to LTS Node 22.

#### Build results
- `docker build --no-cache`: PASS | Image: 63.3 MB | User: appuser (uid 1001) | All validation checks OK

### ProjectForge WebUI Audit — architecture, accessibility, design system, mobile fixes

#### P1 Fixes
- **FORGE-001** (`src/pages/settings/SetupWizard.tsx`): replaced inline `useQuery` duplicating `useConfigQuery` with a call to `useConfigQuery({ enabled, staleTime })`; extended `src/hooks/useConfigQuery.ts` to accept `UseConfigQueryOptions`
- **FORGE-002** (`src/pages/settings/ProviderList.tsx`): `h-9` → `min-h-11` on Add model button, provider `SelectTrigger`, and Add submit button to meet WCAG 2.5.8 44 px minimum touch target
- **FORGE-003** (`src/pages/assistant/WorkflowsPanel.tsx`, `src/pages/admin/UserManagementPanel.tsx`, `src/pages/assistant/CampaignsPanel.tsx`): ghost icon-only `MoreHorizontal` buttons missing `text-zinc-500` rest color added — DS §5, WCAG 1.4.11
- **FORGE-004** (`src/pages/chat/PanelShell.tsx`): close button missing `text-zinc-500` rest color added — DS §5, WCAG 1.4.11
- **FORGE-005** (`src/pages/chat/TypingIndicator.tsx`): bubble wrapper missing `max-w-[75%]` constraint added per DS §7
- **FORGE-006** (`src/pages/chat/SessionHeader.tsx`): model `Select` hidden below `lg` breakpoint (`hidden lg:flex`) to prevent mobile overflow at 390 px

#### P2 Fixes
- **FORGE-007** (`src/index.css`): `@apply [var(...)]` arbitrary syntax replaced with semantic Tailwind tokens (`border-border`, `bg-background`, `text-foreground`)
- **FORGE-008** (`src/components/Sidebar.tsx`, `src/pages/settings/ConfigFlagsForm.tsx`): `aria-hidden="true"` added to decorative icons inside labelled buttons
- **FORGE-009** (`src/pages/chat/StatusBar.tsx`): new `showBorder` prop separates left-border accent from time column; collapsed summary row now shows running/error accent per DS §7
- **FORGE-010** (`src/components/MarkdownComponents.tsx`): CodeBlock language label `text-zinc-500` → `text-zinc-400` per DS §7 (dark `bg-zinc-800` code block header — darker palette forbidden on dark surfaces)
- **FORGE-011** (`src/pages/assistant/OutboundDialog.tsx`): fire-and-forget mutation intent documented in comment
- **FORGE-012** (`src/components/MarkdownComponents.tsx`): `REMARK_PLUGINS`/`REHYPE_PLUGINS` centralized and exported; `MessageBubble.tsx`, `StreamingMessageBubble.tsx`, and `SetupWizard.tsx` updated to import from shared location

#### Architectural debt documented (not fixed)
- `src/lib/stores/auth-store.ts`: `UserOut` stored in Zustand instead of TanStack Query — pre-existing pattern that predates the architectural invariants; requires ADR and coordinated migration of all consumers before implementation can begin

#### Build results
- ESLint: 0 errors — Prettier: all formatted — TypeScript: 0 errors — Vite build: succeeded

### TestForge — Cypress audit and test hardening (109 E2E + 32 component, 0 failures)

#### Source fix
- `src/pages/chat/StreamingMessageBubble.tsx`: added `data-cy="streaming-cursor"` attribute to the streaming cursor span for reliable Cypress targeting

#### Fixed — E2E test root causes (16 → 0 failures across 4 specs)
- `cypress/e2e/admin.cy.ts`: register a seed admin user in `before()` so the test user does not receive the first-user bootstrap admin promotion — fixes 2 failing tests
- `cypress/e2e/assistant.cy.ts`: intercept `GET **/api/v1/assistant/status` with a stub `{ status: "running" }` response so all 8 assistant tabs are enabled during tests — fixes 7 failing tests
- `cypress/e2e/chat.cy.ts`: add `_sessionSeq` counter to `loginAndCreateSession` to produce unique session names per `beforeEach` call, avoiding `SESSION_NAME_DUPLICATE` backend rejections — fixes 3 failing tests (4 unskipped)
- `cypress/e2e/streaming.cy.ts`: add `_streamSeq` counter to `setupAndNavigate` for unique session names; add `.should("be.visible")` guard before `cy.type()` on session name input to prevent `KeyboardEvent` race during page transitions; fix `tool_start`/`tool_end` assertions to target the StatusBar's visible summary row via `button[aria-label='Expand tool history']` parent instead of `cy.contains()` which resolved to the collapsed history panel

#### Added — Component tests (cypress/component/)
- `TypingIndicator.cy.tsx` — 3 tests: animated dots, role/aria-label, dot container structure
- `StreamingMessageBubble.cy.tsx` — 4 tests: empty state, content rendering, cursor existence, cursor aria-hidden
- `StatusBar.cy.tsx` — 5 tests: empty state, tool name display, in-progress indicator, completion duration, expand/collapse toggle
- `MessageInput.cy.tsx` — 7 tests: textarea/button rendering, disabled/enabled states, onSend callback, input clearing, Enter to send, Shift+Enter for newline

#### Added — Test infrastructure
- `cypress/support/component.ts`: `Cypress.on("uncaught:exception")` handler added to suppress inter-spec Zustand store subscriber cleanup errors that occur between test boundaries

#### Results
- E2E: **109/109 passing** (was 80/109; 16 failing and 13 skipped resolved)
- Component: **32/32 passing** (was 13/13; 19 new tests added)
- Build, lint, Prettier: all pass

### DesignForge WebUI Audit — WCAG contrast, animation, and token fixes (design system v3.2)

#### P0 — WCAG contrast (text-zinc-400 → text-zinc-500)
- `src/components/MarkdownComponents.tsx`: language label and copy button icon corrected from `text-zinc-400` to `text-zinc-500` — `text-zinc-400` (#a1a1aa) on `bg-zinc-800` code block header fails WCAG 1.4.11 3:1 non-text contrast minimum
- `src/pages/documents/DocumentCard.tsx`: document type icon and delete button icon corrected from `text-zinc-400` to `text-zinc-500` — fails WCAG 1.4.11 on white card surface
- `src/pages/settings/SetupWizard.tsx`: hint text on Base URL, API key, and provider name fields corrected from `text-zinc-400` to `text-zinc-500` — hint text is text content subject to WCAG AA 4.5:1 minimum
- `src/pages/assistant/CampaignsPanel.tsx`: expand/collapse chevron disclosure controls corrected from `text-zinc-400` to `text-zinc-500` — interactive icon control on white surface fails WCAG 1.4.11

#### P1 — Design system token and animation fixes
- `src/pages/chat/ToolsSidebar.tsx`: hardcoded `ring-violet-600` on tool row focus ring replaced with semantic `ring-ring` token — design system §5 requires the semantic alias, not a hardcoded color
- `src/pages/chat/StatusBar.tsx`: hardcoded `ring-zinc-400` on expand/collapse focus ring replaced with semantic `ring-ring` token
- `src/index.css`: removed global `transition-duration: 0.01ms !important` from `prefers-reduced-motion` block — this override suppressed the DS-required `duration-150` hover transitions for all users with reduced-motion enabled; Tailwind `motion-safe:` and `motion-reduce:` utilities handle per-element reduced-motion compliance without a blanket override
- `src/pages/chat/TypingIndicator.tsx`: migrated from `.typing-dot` CSS keyframe class to `motion-safe:animate-[blink_1.2s_ease-in-out_infinite]` Tailwind utilities per DS §7; moved `role="status"`, `aria-live="polite"`, and `aria-label` attributes to the outer wrapper element (they belong on the live region container, not the visual dot)
- `src/index.css`: removed `.typing-dot` CSS class (replaced by inline Tailwind utilities in `TypingIndicator.tsx`); added `@keyframes blink-cursor` and `.streaming-cursor` class for the streaming message blinking cursor
- `src/pages/chat/StreamingMessageBubble.tsx`: added blinking cursor `<span>` using `streaming-cursor` class with `motion-reduce:hidden` — cursor is suppressed for users with reduced-motion preference

#### P2 — Icon color consistency
- `src/pages/settings/ApiKeyList.tsx`: Key icon corrected from `text-zinc-400` to `text-zinc-500` — icon-only affordance on white surface, WCAG 1.4.11
- `src/pages/chat/ToolsSidebar.tsx`: Search icon in filter bar corrected from `text-zinc-400` to `text-zinc-500`

#### Prettier formatting
- `src/pages/settings/ApiKeyList.tsx`
- `src/pages/settings/SetupWizard.tsx`
- `src/pages/chat/StreamingMessageBubble.tsx`
- `src/pages/chat/TypingIndicator.tsx`
- `src/pages/chat/ToolsSidebar.tsx`
- `src/pages/chat/StatusBar.tsx`

**Audit findings summary**:
- Build at audit start: PASS (0 errors), Build post-fix: PASS (0 errors)
- Lint at audit start: PASS, Lint post-fix: PASS
- P0 fixes applied: 4 (WCAG 1.4.11 non-text contrast)
- P1 fixes applied: 6 (semantic tokens, reduced-motion, animation migration)
- P2 fixes applied: 2 (icon color consistency) + 6 files Prettier-formatted

### Sprint notes — 2026-03-22

### ProjectForge WebUI Audit — cross-cutting fixes

#### Architecture
- Moved `MarkdownComponents` from `src/pages/chat/markdownComponents.tsx` to `src/components/MarkdownComponents.tsx` — shared rendering primitive belongs in the component layer, not the page layer; updated import paths in `MessageBubble`, `StreamingMessageBubble`, and `SetupWizard`
- `src/pages/chat/markdownComponents.tsx` deleted (replaced by `src/components/MarkdownComponents.tsx`)

#### Performance
- `src/main.tsx`: added `gcTime: 5 * 60_000` to `QueryClient` default options — stale query cache now held for 5 minutes before garbage collection

#### Accessibility
- `src/pages/layout/AppShell.tsx`: added `SheetDescription` (sr-only) to mobile sidebar Sheet; eliminates missing ARIA description warning for the Sheet dialog
- `src/pages/assistant/CampaignsPanel.tsx`: added `DialogDescription` to Create and Edit campaign dialogs; resolves missing ARIA description warnings

#### Design System
- `src/pages/assistant/CampaignsPanel.tsx`: added `variant="outline"` to 8 colored badges that were using implicit default variant
- `src/pages/assistant/WorkflowsPanel.tsx`: placeholder text `text-zinc-300` corrected to `text-zinc-400` (design system color floor for muted text); removed `hover:bg-green-50` from non-interactive KB badge
- `src/pages/settings/McpServerList.tsx`: removed `hover:bg-green-50` from non-interactive status badge
- `src/pages/settings/SetupWizard.tsx`: removed no-op `wizard-question` class; added `Warnings` headings; wrapped `ReactMarkdown` output in `div.space-y-3` for consistent block spacing; fixed `strong` className `font-semibold` to `font-bold` inside `MarkdownComponents`

#### UX / Interaction
- `src/components/ConfirmDialog.tsx`: Cancel button now routes through `handleOpenChange` isPending guard — prevents dialog dismissal while a destructive mutation is in flight
- `src/pages/admin/UserManagementPanel.tsx`: destructive `DropdownMenuItem` focus styles corrected to `focus:bg-red-50 focus:text-red-700`
- `src/pages/assistant/CampaignsPanel.tsx`: destructive `DropdownMenuItem` focus styles corrected to `focus:bg-red-50 focus:text-red-700` (two occurrences)
- `src/pages/settings/ApiKeyList.tsx`: added `hover:bg-zinc-50` to `TableRow` for interactive row feedback
- `src/pages/settings/ProviderList.tsx`: added `hover:bg-zinc-50` to provider `TableRow`; corrected button height from `min-h-9` to `h-9`
- `src/pages/chat/ToolsSidebar.tsx`: passed `agentRunning` prop to `ToolRow`; removed pinned-tool interaction block (backend supports unpin via unload endpoint)

### Features

* **api:** extend api.delete to accept optional body for DELETE-with-payload endpoints
* **chat:** add Clear History button to SessionHeader (DELETE /sessions/{id}/messages with ConfirmDialog)
* **settings:** MCP Server Add/Delete UI — McpAddServerDialog with slug-validated name, stdio/sse transport, conditional command/url/args, requires_confirmation checkbox; per-row delete with ConfirmDialog
* **settings:** add shadcn Checkbox component
* **types:** add WizardStepOut.requires_acceptance field (bool)
* **wizard:** detect requires_acceptance=true and render Accept/Cancel flow with prominent YAML preview instead of free-text textarea
* **assistant:** add send_at datetime-local input to scheduled message edit dialog; PATCH now sends both text and send_at

### Contract Sync

APIForge contract validation run — 2026-03-22. 4 P2 deviations found and fixed. No P0 or P1 findings.

- **P2-001** (`src/lib/api/types/workflow.ts`): `WorkflowOut.tool_policy` and `auto_detect` changed from optional to required — backend always returns both fields with defaults
- **P2-002** (`src/lib/api/types/workflow.ts`): `WorkflowUpdateRequest` nullable fields now typed as `string | null`, `boolean | null`, `WorkflowToolPolicy | null`, `WorkflowAutoDetect | null`; `Partial<>` removed from `tool_policy`/`auto_detect` in both `WorkflowCreateRequest` and `WorkflowUpdateRequest`
- **P2-003** (`src/lib/api/client.ts`): `handleApiError` now covers 5 previously unhandled error codes: `MCP_SERVER_NOT_FOUND`, `CAMPAIGN_NOT_FOUND`, `CONFLICT`, `SERVICE_UNAVAILABLE`, `GONE`
- **P2-004** (`src/pages/assistant/WorkflowsPanel.tsx`): upload mutation response typed as `WorkflowDocumentOut` instead of an inline anonymous type

### Design System

**DesignForge audit — 2026-03-22 (design system v3.1 → v3.2)**

- fix(a11y): WorkflowsPanel em-dash placeholder `text-zinc-400` → `text-zinc-500` — fixes WCAG AA contrast failure (was 2.56:1, now 4.7:1) — `WorkflowsPanel.tsx:1081`
- fix(a11y): SessionCard delete button icon `text-zinc-400` → `text-zinc-500` — fixes WCAG 1.4.11 non-text contrast failure on white surface — `SessionCard.tsx:83`
- fix(ui): nested blockquote styling implemented per DS §7 — `[blockquote_&]:border-violet-100 [blockquote_&]:pl-3` CSS descendant selector — `MarkdownComponents.tsx`
- fix(types): remove redundant optional chaining `wf.auto_detect?.enabled ?? false` → `wf.auto_detect.enabled` — field is required in `WorkflowOut` — `WorkflowsPanel.tsx:1087`
- docs(design-system): fix stale file path `src/pages/chat/markdownComponents.tsx` → `src/components/MarkdownComponents.tsx` in §7 and §12
- docs(design-system): mark D-003 (MCP Add Server) and D-006 (CodeBlock copy button) as RESOLVED in §16 Deferred Items
- docs(design-system): add ghost icon-only button rule to §5 — `text-zinc-500` required on white surfaces (WCAG 1.4.11)
- docs(design-system): add nav icon alongside visible label rationale to §10 Iconography
- docs(design-system): add null-state placeholder text rule to §5 Tables — `text-zinc-500` required, `text-zinc-400` prohibited for text content in table cells

**Audit findings summary**:
- Build at audit start: PASS (0 errors), Build post-fix: PASS (0 errors)
- Lint at audit start: PASS, Lint post-fix: PASS
- P2 fixes applied: 4 code + 5 documentation
- FLAGS resolved: FLAG-001 (CodeBlock label — DS specifies zinc-400 on dark bg, COMPLIANT), FLAG-004 (nav icons with labels — COMPLIANT, DS rationale added)

### Tests

**TestForge Cypress Audit — 2026-03-22:**

#### Fixed — E2E selectors and assertions (P0)
- `cypress/e2e/sessions.cy.ts`: `data-cy="archive-session"` selector corrected to `data-cy="delete-session"`; dialog assertions updated from "Archive session"/"Archive" to "Delete session"/"Delete" to match actual `ConfirmDialog` output
- `cypress/e2e/settings.cy.ts`: stale `cy.contains("coming soon")` assertion on MCP Servers tab removed; MCP tab is now fully implemented (`McpServerList`); replaced with content-existence check

#### Fixed — Brittle selectors (P1)
- `cypress/e2e/settings.cy.ts`: `cy.get("code")` replaced with `cy.get("[data-cy='api-key-value']")` for API key display
- `src/pages/settings/ApiKeyList.tsx`: added `data-cy="api-key-value"` to `<code>` element in `CreatedKeyDisplay` (source fix enabling the selector above)

#### Added — Cypress component testing infrastructure
- `cypress.config.ts`: extended with `component:` block for component test runner
- `cypress/support/component.ts`: component test setup entry point
- `cypress/support/mount.tsx`: React mount helper for component tests
- `cypress/support/component-index.html`: HTML fixture for component test runner

#### Added — Component tests
- `cypress/component/SessionCard.cy.tsx`: 7 tests covering render, delete button, WCAG-validated icon color (`text-zinc-500`), ARIA attributes, keyboard navigation, and callback invocation
- `cypress/component/MarkdownComponents.cy.tsx`: 6 tests covering `CodeBlock` copy button, nested blockquote rendering, inline code, and GFM table rendering

## [0.1.1](https://github.com/NorthlandPositronics/Cogtrix-WebUI/compare/v0.1.0...v0.1.1) (2026-03-22)


### Features

* **api:** add per-request timeout support via AbortController ([57a7ff8](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/57a7ff8c8d262e20cb4fab2578d9348556854e51))
* **chat:** add status bar with tool activity history ([23a6c2f](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/23a6c2fee87eb074042cc637d6c3caa72a986108))
* **design:** visual design overhaul — markdown, code blocks, typography ([171c8ef](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/171c8ef9261e72ad5d3d99389e52ae339dab3c49))
* initial commit — Cogtrix WebUI ([c0ddd1a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/c0ddd1a5d6ea5a49884b37db90835ca75beacbd8))
* **settings:** add provider and model configuration panel ([99f90a2](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/99f90a28d5046120674acb23a9edc3fc0e7e255a))


### Bug Fixes

* **a11y:** SetupWizard Ollama hint text zinc-400 → zinc-500 (WCAG AA) ([0652216](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/065221620ea89abab87c87536e15a0847bf0a7ec))
* **a11y:** TriSwitch focus ring ring-ring → ring-violet-600 (WCAG AA) ([0652216](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/065221620ea89abab87c87536e15a0847bf0a7ec))
* **admin:** improve live log viewer UX and default level ([13694d2](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/13694d21d72985baeca76790804e2d8ffbe9d2aa))
* **api:** make WorkflowOut.tool_policy/auto_detect and AssistantStatusOut.channels optional ([a035d10](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/a035d10be7d97993250c233f88bbe1678bec8afb))
* **chat:** apply DesignForge run-2 fixes and close FLAG-001/FLAG-002 ([753f365](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/753f3658e26ee650d564c84c5f97ea2eb93d49eb))
* **chat:** session header stuck on thinking after turn completes ([0652216](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/065221620ea89abab87c87536e15a0847bf0a7ec))
* **ci:** exclude integration tests from CI, fix test mocks, fix Prettier ([7a73f3b](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/7a73f3b052a08adbabc9f0c6f9bd86fd49281d77))
* **design:** WCAG AA contrast fixes and AgentStateBadge delegating state ([9c394a5](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/9c394a53df5ddc9980545df2ef15ae451c93b127))
* **docker:** replace corepack with npm install for pnpm on node 25 alpine ([d50a2ec](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/d50a2ec06e27c108ed4b6f40241bcf1d8137678e))
* **markdown:** add prose styles for p, ul, ol, li, blockquote, h1-h3, strong, em, hr ([555973a](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/555973a67034cded7732f94a4250ec323a583714))
* **sessions:** replace archive with delete, fix dialog layout ([6eebfa7](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/6eebfa776a0dd351db9fb8975c12362f59268301))
* **settings:** fix wizard Step 0 connect hang and use keys.config() ([b806b4b](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/b806b4b69d7b80298b49b481ceb1e75bff41674b))
* **tools:** auto_approved tools now user-adjustable via TriSwitch ([0652216](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/065221620ea89abab87c87536e15a0847bf0a7ec))
* **wizard:** render question as markdown, strip protocol lines, surface 500 errors ([854ea0d](https://github.com/NorthlandPositronics/Cogtrix-WebUI/commit/854ea0d4bfe6b34a561cd97255079a5c6c8f62d0))

### Sprint notes — 2026-03-22

### feat(webui): visual design overhaul — markdown polish, WCAG corrections, design system v3.0

#### Changed — Markdown rendering (`src/pages/chat/markdownComponents.tsx`)
- **Blockquote corrected**: `border-l-4 border-zinc-300` with no background → `border-l-2 border-violet-200 bg-violet-50/40 rounded-r-sm`; the violet-200 border connects blockquotes to the application's violet accent identity. Previous zinc-300 border had no semantic relationship to the design system.
- **Paragraph double-spacing fixed**: removed `mb-3 last:mb-0` from `<p>` elements. The `space-y-3` container on the markdown wrapper is the sole spacing mechanism for top-level blocks — adding `mb-3` to `<p>` created double-spacing (24px instead of 12px between blocks) in all LLM responses.
- **List double-spacing fixed**: same correction applied to `<ul>` and `<ol>` — removed `mb-3 last:mb-0`. `space-y-3` handles inter-block gaps; the `space-y-1` on lists handles intra-list item gaps correctly and is untouched.
- **Heading `leading-tight` added**: h1, h2, h3 now include `leading-tight` (line-height 1.25). Previously they inherited `leading-relaxed` (1.75) from the parent container, causing multi-line headings to look more like paragraph text. Design system §2 specifies `leading-tight` for all headings.
- **Heading first-child `mt-0` added**: h1–h3 now use `[&:first-child]:mt-0` Tailwind modifier to suppress the top margin when the heading opens the content block. Prevents unwanted top padding on messages that begin with a heading.
- **h4, h5, h6 added**: all six heading levels now implemented per design system §7 spec. h4 uses `text-sm font-semibold text-zinc-700`; h5 uses `text-sm font-medium text-zinc-600`; h6 uses `text-sm font-medium text-zinc-500`. Progressive zinc muting signals heading rank.
- **`img` element added**: previously absent from `markdownComponents`. Now renders as `max-w-full rounded-md my-2 loading="lazy"`. Unsafe URLs (non-http/https) return null.
- **`tbody` and `tr` added**: table row hover state (`hover:bg-zinc-50 transition-colors duration-150`) now works. Previously absent `tbody` and `tr` overrides meant no hover state on table rows in LLM-rendered tables.
- **Inline code `text-zinc-900` made explicit**: added to prevent unexpected color inheritance in edge cases.
- **`CodeBlock` component added**: fenced code blocks now render with a header row containing a language label (left, `text-xs font-medium text-zinc-400 font-mono`) and a copy-to-clipboard button (right, 24×24 ghost icon button with `Clipboard`/`Check` icons). Copy feedback shows a green `Check` icon for 2 seconds then reverts. The `extractText` helper safely traverses the React node tree to extract the plaintext content for `navigator.clipboard.writeText`.

#### Fixed — WCAG AA contrast (`src/pages/chat/StatusBar.tsx`)
- StatusBar expand/collapse icon color: `text-zinc-400` → `text-zinc-500`. `text-zinc-400` (#a1a1aa) on `bg-zinc-50` (#fafafa) yields approximately 2.4:1 — below the WCAG AA 3:1 minimum for non-text UI components. `text-zinc-500` (#71717a) yields approximately 4.7:1, meeting WCAG AA.

#### Fixed — Typography (`src/pages/chat/MessageInput.tsx`)
- Textarea `leading-relaxed` added to className. Body text in multi-line input areas benefits from relaxed line-height (1.75) for comfortable reading of multi-line messages before sending. Design system §2 specifies `leading-relaxed` for long-form message content.

#### Documentation — Design system v3.0 (`docs/web/design-system.md`)
- Version bumped from 2.4 to 3.0 (breaking audit findings resolved)
- §3 Spacing: added `StatusBar expanded log list` to component-specific sizing exceptions (`max-h-48`, 192px)
- §7 Markdown: corrected blockquote spec, added CRITICAL SPACING RULE note (no `mb-*` on blocks inside `space-y-3`), added `leading-tight` and first-child `mt-0` requirements to heading spec, added h4/h5/h6, added img spec, added tbody/tr specs, upgraded CodeBlock spec with copy-button requirement
- §7 StatusBar: added complete token specification table for all StatusBar elements
- §12 Component inventory: `MarkdownContent` status upgraded from Partial to Full; `CodeBlock` added as new component
- §16 Deferred items: D-005 marked resolved; D-006 added for CodeBlock (now also resolved)

#### Documentation — Graphic designer brief (`docs/web/briefs/overhaul-2026-03-22.md`)
- Brief produced covering three mockups: `markdown-full-spec.svg`, `code-block-component.svg`, `blockquote-corrected.svg`

#### Documentation — Mockups (`docs/web/mockups/`)
- `markdown-full-spec.svg` — full markdown element reference showing all 16 element types per design system v3.0 spec
- `code-block-component.svg` — CodeBlock component in default and copy-feedback states
- `blockquote-corrected.svg` — side-by-side before/after comparison of incorrect vs correct blockquote rendering

#### Build validation
- `pnpm lint`: 0 errors
- `pnpm build`: 0 TypeScript errors, Vite build clean (2333 modules transformed)

---

### Sprint notes — 2026-03-07

### Fixed
- Error input borders changed from `border-red-500` to `border-red-600` for WCAG AA 3:1 non-text graphics compliance
- PanelShell close button enlarged from 32px to 44px touch target (`h-11 w-11`)
- DocumentUploadDialog drop zone transition now includes explicit `duration-150 ease-in-out`
- Design system §8 updated: error border token corrected to `border-red-600`, version bumped to 1.4
- ServiceControlPanel Start/Stop buttons now have descriptive `aria-label` for screen readers
- ToolsSidebar tool rows now have `min-h-11` for 44px mobile touch target compliance
- ConfigFlagsForm dividers changed from invisible `divide-zinc-100` to `divide-zinc-200` per design system §5
- AssistantChatList chat name button now has descriptive `aria-label` for screen readers
- nginx: removed duplicate `Cache-Control` header on `index.html` (`expires -1` now removed; explicit `no-store, no-cache, must-revalidate` is sufficient)
- nginx: added `text/plain` to `gzip_types` for health endpoint and plain-text responses
- Cypress: fixed broken `Rename session` selector — changed exact match to `^=` (starts-with) after aria-label now includes session name
- DocumentCard delete button enlarged to 44px touch target (`h-11 w-11`)
- GuardrailsPanel remove-from-blacklist button enlarged to 44px touch target (`h-11 w-11`)
- LiveLogViewer Connect/Disconnect and Clear buttons enlarged to 44px touch target (`min-h-11`)
- Table-row action buttons enlarged to 44px touch target across 9 files: DeferredRecordTable, KnowledgePanel, ScheduledMessageTable, ApiKeyList (copy + revoke), McpServerList (restart), ProviderList (health check, switch provider, switch model), ServiceControlPanel (start/stop/stopping), ConfigFlagsForm (reload)
- MemoryPanel mode-switch buttons enlarged to 44px touch target (`min-h-11`)
- MemoryPanel summary collapsible trigger now includes `transition-colors duration-150 ease-in-out` per design system §8
- SemanticSearchBar chunk text changed from `text-zinc-500` to `text-zinc-700` for body content readability
- AppShell sidebar border changed from `border-sidebar-border` to `border-zinc-200` per design system §5
- Sidebar sign-out button enlarged to 44px touch target (`min-h-11`)
- MessageInput mode selector, send, and cancel buttons enlarged to 44px touch target (`min-h-11`)
- NotFoundPage 404 numeral changed from `text-zinc-400` to `text-zinc-500` for WCAG AA contrast, weight demoted to `font-normal` to preserve visual hierarchy below the heading
- SessionHeader rename button uses `py-1 px-2` for compact height within the 56px `h-14` header (44px `min-h-11` was removed as it caused 10px overflow clipping the agent badge)
- ToolConfirmationModal parameter key column now uses `break-all` to prevent horizontal overflow on long keys at 390px
- ToolConfirmationModal "Show more/less" inline button enlarged with `py-2 px-1` for improved touch target
- MemoryPanel summary collapsible trigger enlarged to 44px touch target (`min-h-11`)
- Design system v1.5: documented LiveLogViewer height exception (§3) and ToolConfirmationModal dialog close-button exception (§5)
- Toaster now forces light theme to prevent dark-mode mismatch on dark-OS systems
- Back-to-sessions button in SessionHeader upgraded to 44px touch target
- ToolConfirmationModal now shows per-button loading spinner on the activated action
- ServiceControlPanel start button shows loading spinner while pending
- SemanticSearchBar search button shows loading spinner while pending
- SessionCard aria-label now communicates navigation affordance ("Open session: ...")
- Rename session button aria-label includes session name for screen readers
- Rename session hover state corrected (bg-zinc-100 instead of lighter text)
- NotFoundPage 404 numeral changed from text-3xl to text-2xl per design system §2

---

### Sprint notes — 2026-03-07 (b)

### fix: DesignForge design system compliance audit (2nd pass)

#### Fixed — Design system compliance (P1)
- Replaced `border-border` with `border-zinc-200` in 5 files: `AppShell.tsx`, `PanelShell.tsx`, `SessionHeader.tsx`, `MessageInput.tsx`, `ChatHistoryDrawer.tsx` (6 occurrences total) — design system §5 requires the explicit Tailwind class, not the semantic token alias
- `ToolActivityRow.tsx`: changed `border-zinc-100` → `border-zinc-200` on the collapsible expanded panel and the trigger button — `border-zinc-100` is invisible on the `bg-zinc-50` surface used by tool activity rows

#### Fixed — Touch targets (P1)
- `ToolActivityRow.tsx`: added `min-h-11` to the collapsible trigger button — 44px minimum touch target for mobile
- `SessionCard.tsx`: added `min-h-11 min-w-11` to the archive icon button — 44px × 44px minimum touch target for mobile

#### Fixed — Typography (P2)
- `ToolActivityRow.tsx`: added `text-sm` to the `<pre>` element in the collapsible expanded panel — design system §2 code block typography requires `text-sm`

#### Fixed — Color floor (P2)
- `not-found.tsx`: changed `text-zinc-300` → `text-zinc-400` on the decorative "404" heading — design system §10 specifies `text-zinc-400` as the minimum color floor for decorative elements on white surfaces; `text-zinc-300` is below the legibility threshold

#### Fixed — Spacing grid (P2)
- `LiveLogViewer.tsx`: changed arbitrary `w-[110px]` → `w-28` on the log-level select trigger — design system §3 prohibits arbitrary pixel values outside the documented exceptions; `w-28` (112px) is the nearest grid token

---

### fix: holistic audit — WCAG contrast, accessibility, and architecture cleanup

#### Fixed — Accessibility (P1)
- `AssistantChatList.tsx:80`: focus ring `ring-offset-1` → `ring-offset-2` to match design system §5 standard
- `ToolConfirmationModal.tsx`: added "You must choose one of the actions below to proceed." to `DialogDescription` for screen reader users navigating non-dismissible dialogs

#### Fixed — WCAG AA contrast (P1)
- Changed `text-red-500` → `text-red-600` on `AlertTriangle` error icons across 12 files: `sessions.tsx`, `MessageList.tsx`, `McpServerList.tsx`, `DeferredRecordTable.tsx`, `ApiKeyList.tsx`, `ServiceControlPanel.tsx`, `ChatHistoryDrawer.tsx`, `ContactList.tsx`, `KnowledgePanel.tsx`, `ScheduledMessageTable.tsx`, `DebugToggle.tsx`, `AssistantChatList.tsx`. `text-red-500` (#ef4444) falls below the WCAG AA 3:1 minimum for non-text graphics on white.

#### Fixed — Accessibility (P2)
- `not-found.tsx`: added `aria-hidden="true"` to the decorative "404" paragraph
- `settings.tsx`, `assistant.tsx`: removed `tabIndex={0}` from tab scroll containers — keyboard users navigate via `TabsTrigger` elements; the container does not need a keyboard stop
- `DocumentUploadDialog.tsx`: added `aria-describedby="upload-constraints"` on the drop zone button and `id="upload-constraints"` on the constraint text span

#### Fixed — Design system compliance (P2)
- `MessageBubble.tsx:56`: changed `border-border` → `border-zinc-200` to match the explicit token pattern used throughout the codebase
- Changed `text-zinc-300` → `text-zinc-400` on empty-state icons across 9 files: `documents.tsx`, `McpServerList.tsx`, `AssistantChatList.tsx`, `DeferredRecordTable.tsx`, `ContactList.tsx`, `MessageList.tsx`, `KnowledgePanel.tsx`, `ScheduledMessageTable.tsx`, `ApiKeyList.tsx`

#### Fixed — Architecture (P2)
- Moved `ToolActivity` interface from `src/lib/stores/streaming-store.ts` to `src/lib/api/types/tool.ts`; store now imports and re-exports it. `ToolActivityRow.tsx` now imports from `@/lib/api/types` instead of directly from the store, removing a page→store layer violation

---

### fix: ProjectForge holistic frontend audit (2nd pass)

#### Fixed — Accessibility (P1)
- `MessageBubble.tsx`: system message text `text-zinc-500` → `text-zinc-600` (4.40:1 → 7.03:1 on `bg-zinc-100`, WCAG AA)
- `DocumentCard.tsx`: processing/pending status text `text-amber-500` → `text-amber-700` (~2.4:1 → ~5.3:1 on white, WCAG AA)
- `LiveLogViewer.tsx`: added `aria-label` to Connect/Disconnect button for screen reader context

#### Fixed — Design system compliance (P1)
- `MemoryPanel.tsx`: mode-switch spinner `h-3 w-3` → `size-4` to match design system §8 loading spec

#### Fixed — Design system compliance (P2)
- `not-found.tsx`: 404 numeral `font-bold` → `font-semibold` (bold reserved for auth headlines per §2)
- `PanelShell.tsx`: close button `p-0` → `p-1` for icon breathing room
- `ToolActivityRow.tsx`: added `ease-in-out` to `transition-colors duration-150` per §8 hover spec
- `StreamingMessageBubble.tsx`: added `role="status"`, `aria-label="Assistant response"`, and sr-only "Agent is processing" text for tool-only streaming state
- `ToolConfirmationModal.tsx`: added `overflow-y-auto max-h-[90vh]` to DialogContent for mobile scroll constraint
- `log-socket.ts`: added inline comment documenting intentional absence of reconnect logic

#### Verified — Full audit results
- **Architecture**: zero layer violations, zero cross-boundary imports, all query keys in `keys.ts`, no raw `fetch()`, no `localStorage`/`sessionStorage`
- **Performance**: all 8 pages lazy-loaded, settings tabs nested lazy-loaded, vendor chunks split (5 groups), streaming store uses RAF batching, `MessageBubble` and `ToolActivityRow` memoized
- **Security**: no `dangerouslySetInnerHTML`, no `rehype-raw`, tokens in memory only, no `any` types, no open redirects, CSP in nginx.conf
- **Build**: ESLint 0 errors, Prettier 0 drift, TypeScript 0 errors, Vite build 3.80s

---

### fix: ProjectForge holistic frontend audit

#### Fixed — State management
- `LiveLogViewer.tsx`: removed duplicated local `useState<LogLevel>` that shadowed the Zustand store `level` field, causing a flash of the wrong log level on component remount. Level is now sourced exclusively from `useLogViewerStore`

#### Fixed — Code style
- `ProviderList.tsx`: Prettier formatting applied

#### Verified — Full audit results
- **Architecture**: all layer rules clean — no cross-layer imports, no raw `fetch()`, no inline query keys, no `localStorage` access
- **Performance**: all pages lazy-loaded, vendor chunks split (react/query/markdown/radix/sonner), streaming store uses RAF batching, TanStack Query defaults set (staleTime: 30s, retry: 1)
- **Security**: no XSS vectors, no `dangerouslySetInnerHTML`, tokens in memory only, markdown rendered safely via `react-markdown` (no `rehype-raw`), no open redirect paths, no secrets in VITE_ vars
- **Build**: ESLint 0 errors, Prettier all clean, TypeScript 0 errors, Vite build 3.78s

---

### fix: DesignForge design system compliance audit

#### Fixed — Code style (cn() convention)
- `DocumentUploadDialog.tsx`: converted template literal className to `cn()` utility call
- `ProviderList.tsx`: converted 2 template literal classNames (provider/model status dots) to `cn()`
- `LiveLogViewer.tsx`: converted 2 template literal classNames (log-level badge, connection badge) to `cn()`

#### Fixed — Design system compliance
- `NewSessionDialog.tsx`: changed dialog `max-w-md` → `max-w-lg` to match design system form dialog spec

#### Verified — Full audit results
- **Design system compliance**: all color tokens, typography, spacing, shadows, border radii match `docs/web/design-system.md`
- **Mockup fidelity**: layout, component hierarchy, and visual treatment match approved SVG mockups
- **Responsive layout**: breakpoints, mobile sheet panels, sidebar collapse all correct
- **Animation**: `prefers-reduced-motion` respected; streaming cursor, transitions within spec
- **WCAG AA accessibility**: focus-visible rings on all interactive elements, aria-labels, aria-live regions, keyboard navigation, proper semantic roles
- **FLAG**: system message bubble contrast (`text-zinc-500` on `bg-zinc-100` ≈ 4.16:1) below 4.5:1 WCAG AA minimum — deferred to web_designer as it matches the design system spec

---

### fix: APIForge API contract validation — ReadinessComponentStatus field names

#### Fixed — TypeScript types
- `ReadinessComponentStatus` in `src/lib/api/types/system.ts`: renamed `ready` → `ok` and `error` → `detail` to match OpenAPI schema field names

#### Verified — Full audit results
- **65/65 endpoints** in OpenAPI schema cross-referenced; 61 actively consumed, 4 detail-view endpoints intentionally unused
- **50/50 TypeScript interfaces** match schema definitions (1 fixed, 49 already correct)
- **10/10 WebSocket server message types** handled in `session-socket.ts`
- **4/4 WebSocket client message types** sent correctly
- **6/6 WebSocket close codes** handled with correct behavior
- **Error handling** complete: 401 auto-refresh, 429 rate limit, all named error codes

---

### fix: DockerForge Dockerfile audit — non-root user, healthcheck, nginx hardening

#### Fixed — Dockerfile
- Added non-root user `appuser` (uid 1001); nginx no longer runs as root
- Changed `HEALTHCHECK` target from `localhost` to `127.0.0.1` — Alpine resolves `localhost` to IPv6 `::1` but nginx binds IPv4 only
- Changed `HEALTHCHECK` target path from `/` to `/health` for a lighter, purpose-built probe

#### Fixed — nginx.conf
- Added `/health` location block returning `200 OK` with access logging suppressed
- Added `Cache-Control: no-cache` for `index.html` to prevent a stale shell after redeploy
- Moved security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Content-Security-Policy`) into the `index.html` location block — nginx drops server-level `add_header` directives when a location block defines its own

#### Fixed — .dockerignore
- Added missing entries: `.pnpm-store`, `coverage`, `.vscode`, `.idea`, `*.DS_Store`, `Thumbs.db`

---

### test: Cypress E2E audit — brittle selector hardening and new chat scenarios

#### Fixed — Brittle selectors (4 test files, 5 occurrences)
- `navigation.cy.ts`: replaced `should("have.class", "border-violet-600")` with `should("have.attr", "aria-current", "page")` for active nav link detection
- `auth.cy.ts`: replaced `.text-red-600, .text-red-500` CSS class selectors with `[data-cy='auth-error']`
- `settings.cy.ts`: replaced `[class*='text-zinc-500']` and `[class*='grid']` CSS selectors with content-based assertions
- `documents.cy.ts` + `sessions.cy.ts`: replaced `.closest("[class*='rounded']")` with `.closest("[data-cy='session-card']")`

#### Added — `data-cy` attributes (2 source components)
- `SessionCard.tsx`: `data-cy="session-card"` on card root, `data-cy="archive-session"` on archive button
- `login.tsx`: `data-cy="auth-error"` on both login and register error message elements

#### Added — Test coverage (chat.cy.ts, 5 new scenarios)
- Enter key sends message
- Shift+Enter inserts newline without sending
- Empty state visible with no messages
- User message appears in message list after send
- Agent state badge visible during/after message send

#### Added — Code clarity
- Comments on `force: true` usages in Radix dialog button interactions explaining the required workaround

#### Test counts
- E2E tests: 78 → 83 (all passing)
- Unit tests: 113/113 unchanged and passing

### Sprint notes — 2026-03-05

### ProjectForge WebUI Run 1 — Holistic Frontend Audit

**Audit scope**: Architecture, render performance, correctness, security, design system compliance across all 104 source files.

**Findings**: 0 P0, 2 P1, 6 P2 (8 total findings, 6 fixed, 2 voided after re-evaluation)

#### P1 Fixes
- **FORGE-001**: `MessageInput.tsx` — textarea focus ring missing `ring-offset-2` and non-standard transition; fixed to match design system
- **FORGE-002**: `SemanticSearchBar.tsx` — search input missing `aria-label` for screen readers; added

#### P2 Fixes
- **FORGE-003**: `ApiKeyList.tsx` — undocumented `text-zinc-800` token replaced with `text-zinc-900`
- **FORGE-005**: `ToolConfirmationModal.tsx` — "Show more/less" toggle missing `aria-expanded` attribute; added
- **FORGE-006**: `MemoryPanel.tsx` — decorative chevron icons missing `aria-hidden="true"`; added
- **FORGE-008**: `DocumentUploadDialog.tsx` — file picker button missing `disabled:cursor-not-allowed disabled:opacity-50`; added

#### Voided after re-evaluation
- **FORGE-004**: `ErrorBoundary.tsx` `<a href>` kept as-is (defensive fallback for broken router context)
- **FORGE-007**: `MessageBubble.tsx` ToolBubble `border-l-2` is correctly handled by CSS property specificity

#### Specialist reports
- **Architect**: Zero structural violations across all layers (components, pages, hooks, lib)
- **Tester**: ESLint PASS, Prettier PASS, Build PASS (303 kB / 95 kB gzip)
- **Security**: No XSS, token exposure, open redirect, or CSP issues found
- **Performance**: All pages lazy-loaded, vendor-split, streaming store efficient, no re-render waste

#### Design system documentation gaps identified (for web_designer)
- GAP-01: `text-zinc-300` for empty-state icons (9 files) — needs DS entry
- GAP-02: `text-red-400` for decorative error icons (12 files) — needs DS entry
- GAP-03: `bg-amber-50` for warning badge surfaces — needs DS entry
- GAP-04: Memory token usage warning threshold undefined
- GAP-05: `prefers-reduced-motion` override for streaming cursor undocumented

### Sprint notes — DesignForge Audit Run 3
**Date**: 2026-03-05

### Fixed — Button Loading Pattern (P1)
- DF3-01: `LoginPage` Sign in button — spinner replaces "Signing in..." text
- DF3-02: `LoginPage` Register button — spinner replaces "Creating account..." text
- DF3-03: `ProviderList` health check button — "Check" text hidden during loading

### Fixed — Design System Compliance (P2)
- DF3-04: `ToolActivityRow` border `border-zinc-200` → `border-zinc-100` (per design system Section 7)
- DF3-05: `ToolActivityRow` collapsible content border `border-zinc-200` → `border-zinc-100`
- DF3-06: `ServiceControlPanel` Stopped badge `bg-zinc-100` → `bg-zinc-50` (badge *-50 convention)
- DF3-07: `ToolsSidebar` tool name `text-zinc-800` → `text-zinc-900` (primary text token)
- DF3-08: `SemanticSearchBar` skeleton `rounded-md` → `rounded-xl` (match result card radius)
- DF3-09: `SemanticSearchBar` document ID `text-zinc-400` → `text-zinc-500` (muted text token)

### Fixed — Spacing (P2)
- DF3-10: `KnowledgePanel` Search icon `mr-2` removed — Button `gap-2` handles spacing
- DF3-11: `Sidebar` LogOut icon `mr-2` removed — Button `gap-2` handles spacing

### Fixed — Layout (P2)
- DF3-12: `SessionsPage` — added `max-w-5xl mx-auto` wrapper to match all other content pages

### Flagged for web_designer (mockup-level decisions)
- FLAG-09: `animate-pulse` — define `prefers-reduced-motion` policy; should skeleton/dot pulse be suppressed?
- FLAG-10: `text-zinc-600` — standardize dialog body text color or add to design system token table
- FLAG-11: Missing mockups — Settings, Admin, Documents, Assistant, SessionPage need approved SVGs
- FLAG-12: `AgentStateBadge` — decide whether `aria-live="polite"` should be added for state transitions
- FLAG-13: `text-zinc-700` — codify as approved secondary body text color or prohibit and standardize

### Sprint notes — DesignForge Audit Run 2
**Date**: 2026-03-05

### Fixed — Button Loading Pattern (P1)
Spinner now fully replaces button label text per design system Section 8 ("Replace button label with a size-4 spinner").
- DF2-01: `DocumentUploadDialog` Upload button — spinner replaces "Uploading..." text
- DF2-02: `ServiceControlPanel` Stop button — spinner replaces "Stopping..." text
- DF2-03: `McpServerList` Remove confirm button — spinner replaces "Remove" text
- DF2-04: `McpServerList` Add server button — spinner replaces "Add" text
- DF2-05: `SetupWizard` Cancel button — spinner replaces "Cancel" text
- DF2-06: `SetupWizard` Next/Finish button — spinner replaces label text
- DF2-07: `ConfigFlagsForm` Reload button — spinner replaces icon + label
- DF2-08: `ApiKeyList` Create button — spinner replaces "Create" text
- DF2-09: `ApiKeyList` Revoke button — spinner replaces "Revoke" text

### Fixed — Muted Text Color (P2)
Changed `text-zinc-400` to `text-zinc-500` (`--muted-foreground` token) on non-icon text.
- DF2-10: `MessageBubble` timestamps (all 4 bubble variants: user, assistant, system, tool)
- DF2-11: `MessageList` empty state text
- DF2-12: `SessionCard` relative timestamp
- DF2-13: `MemoryPanel` token count helper text and empty state text
- DF2-14: `ToolsSidebar` empty state text
- DF2-15: `ChatHistoryDrawer` role column header
- DF2-16: `DocumentUploadDialog` file type helper text
- DF2-17: `MessageInput` placeholder text (`placeholder:text-zinc-400` → `placeholder:text-zinc-500`)
- DF2-18: `SetupWizard` step counter text ("Step X of Y")

### Fixed — Border Token (P2)
Changed `border-zinc-100` to `border-zinc-200` on non-table-row dividers.
- DF2-19: `MessageBubble` ToolCallSummary inner divider (`border-t`)
- DF2-20: `ToolsSidebar` search bar bottom border
- DF2-21: `SetupWizard` dialog footer top border
- DF2-22: `ConfigFlagsForm` footer top border

### Fixed — Badge Surface Color (P2)
Changed `bg-*-100` to `bg-*-50` for semantic badge backgrounds.
- DF2-23: `ToolsSidebar` active status badge (`bg-green-100` → `bg-green-50`)
- DF2-24: `ToolsSidebar` on_demand status badge (`bg-blue-100` → `bg-blue-50`)
- DF2-25: `ToolsSidebar` auto_approved status badge (`bg-violet-100` → `bg-violet-50`)
- DF2-26: `ToolsSidebar` disabled status badge (`bg-zinc-100` → `bg-zinc-50`)
- DF2-27: `ScheduledMessageTable` cancelled/default badge (`bg-zinc-100` → `bg-zinc-50`)

### Fixed — Button Loading Pattern (P1, additional)
- DF2-28: `ProviderList` provider "Switch to" button — spinner replaces text
- DF2-29: `ProviderList` model "Switch to" button — spinner replaces text

### Fixed — Skeleton & Text Token (P2, additional)
- DF2-30: `SemanticSearchBar` skeleton radius `rounded-md` → `rounded-xl` to match result card radius
- DF2-31: `SemanticSearchBar` document ID text `text-zinc-400` → `text-zinc-500`

### Flagged for web_designer (mockup-level decisions)
- FLAG-07: Button icon sizing — design system says 20px (`h-5 w-5`) for icons in buttons, but shadcn/ui defaults to 16px (`size-4`). The MessageInput Send/Cancel icons and all sm-sized button icons use 16px. Decision needed on whether to override shadcn default.
- FLAG-08: Sidebar nav icon sizing — design system says 24px for navigation icons, but mockup SVGs show 16px. Decision needed on which takes precedence.

### Sprint notes — DesignForge Audit
**Date**: 2026-03-05

### Fixed
- DF-01 (P0): Added `aria-live="polite"` and `role="status"` to `StreamingMessageBubble` — screen readers now announce streaming content
- DF-02 (P1): Removed violet override from `NewSessionDialog` trigger button — mockup specifies default (zinc) variant for non-AI actions
- DF-03 (P1): Changed mobile sidebar sheet width from `w-[260px]` to `w-[220px]` in `AppShell` — matches desktop sidebar and mockup spec
- DF-04 (P1): Fixed `MemoryPanel` collapsible chevrons from `h-3.5 w-3.5` to `h-4 w-4` (design system inline icon size)
- DF-05 (P1): Fixed `SessionHeader` ConnectionStatusDot from `h-1.5 w-1.5` to `size-2` (design system dot sizing)
- DF-06 (P1): Fixed `ToolActivityRow` running dot from `h-1.5 w-1.5` to `size-2` (design system dot sizing)
- DF-07 (P2): Added `prefers-reduced-motion` media query for streaming cursor animation in `index.css`
- DF-08 (P2): Changed `DocumentUploadDialog` drop zone border from `border-zinc-300` to `border-zinc-200` (design system border token)
- DF-09 (P2): Changed `ServiceControlPanel` Running badge from `bg-green-100` to `bg-green-50` (consistent semantic surface)
- DF-10 (P2): Changed `ToolActivityRow` DurationBadge from `bg-red-100`/`bg-green-100` to `-50` variants
- DF-11 (P2): Changed `ScheduledMessageTable` pending badge text from `text-blue-600` to `text-blue-700` (consistent label weight)
- DF-12 (P2): Changed `SetupWizard` step name label from `text-zinc-400` to `text-zinc-500` (muted-foreground token)
- DF-13 (P2): Added explicit `text-sm` to `DocumentCard` filename for size predictability
- DF-14 (P2): Changed `ToolActivityRow` borders from `border-zinc-100` to `border-zinc-200` (design system border token)
- DF-15 (P2): Changed `MemoryPanel` info box borders from `border-zinc-100` to `border-zinc-200`
- DF-16 (P2): Changed `MessageBubble` ToolCallSummary border from `border-zinc-100` to `border-zinc-200`
- DF-17 (P2): Fixed `DocumentsPage` max-w-5xl pattern to match SettingsPage (inner div constraint)
- DF-18 (P2): Fixed `ToolsSidebar` search icon from `h-3.5 w-3.5` to `h-4 w-4` (design system inline icon size)
- DF-19 (P2): Fixed `ProviderList` health status icons from `h-3.5 w-3.5` to `h-4 w-4`
- DF-20 (P2): Changed `AssistantChatList` chat name button from `rounded-sm` to `rounded-md` (design system interactive radius)
- DF-21 (P2): Changed `ToolConfirmationModal` tool name button from `rounded-sm` to `rounded-md`
- DF-22 (P2): Fixed `KnowledgePanel` search button loading state — spinner now replaces label text per design system

### Flagged for web_designer (mockup-level decisions)
- FLAG-01: Empty-state create button variant unspecified in mockup
- FLAG-02: Auth SVG mockups annotate `rounded-lg` but design system says `rounded-xl` — SVGs need update
- FLAG-03: Sessions grid `xl:grid-cols-3` not reviewed through design pipeline
- FLAG-04: Desktop shell mockup shows separator below PageHeader — code omits it
- FLAG-05: ConfigFlagsForm muted info panel pattern (`bg-zinc-50` without `shadow-sm`) not documented in design system
- FLAG-06: No SVG mockups exist for Session, Settings, Admin, Documents, Assistant, NotFound pages

### Sprint notes — Forge Audit Round 13
**Date**: 2026-03-05

### Fixed
- R13-01 (P2): Changed `MemoryPanel` Progress bar height from `h-1.5` (6px, off 4px grid) to `h-1` (4px) per design system spacing scale
- R13-02 (P2): Added `aria-label` attributes with tool name to `ToolConfirmationModal` action buttons for screen reader context
- R13-03 (P1): Added visually-hidden `SheetTitle` to `AppShell` mobile sidebar Sheet for ARIA dialog accessible name
- R13-04 (P2): Added `aria-label` to `ScheduledMessageTable` Save button so accessible name persists during spinner loading state
- R13-05 (P2): Changed `documents.tsx` skeleton from `rounded-lg` to `rounded-xl` to match DocumentCard radius
- R13-06 (P2): Aligned `ChatHistoryDrawer` SheetHeader padding to `px-4 py-3` matching MemoryPanel and ToolsSidebar pattern
- R13-07 (P2): Added explicit `type="button"` to `AssistantChatList` chat name button

### Accepted Deviations
- `SemanticSearchBar` uses `useMutation` for POST search — valid TanStack Query pattern for transient results not requiring cache sharing
- `useSessionSocket` health poll bypasses TanStack Query — transport-level reconnection probe, not UI state
- `DocumentCard` uses `Card` without `CardHeader` — acceptable for compact content cards
- `LiveLogViewer` inline Tailwind badge classes — diagnostic-only admin component, not design-token-critical

### Sprint notes — Forge Audit Round 12
**Date**: 2026-03-05

### Fixed
- R12-01 (P2): Replaced `ScheduledMessageTable` Save button loading text `"Saving..."` with `Loader2` spinner to match design system button loading pattern
- R12-02 (P1): Changed `SessionCard` and `SessionCardSkeleton` card radius from `rounded-lg` to `rounded-xl` (design system R11-07)
- R12-03 (P2): Changed all table/card container wrappers from `rounded-lg` to `rounded-xl` in `ProviderList`, `ApiKeyList`, `McpServerList`, `ConfigFlagsForm`, and `login` page
- R12-08 (P2): Changed `SemanticSearchBar` search result card from `rounded-md` to `rounded-xl` (card surface radius)

### Sprint notes — Forge Audit Round 11
**Date**: 2026-03-05

### Fixed
- R11-01 (P2): Changed `ApiKeyList` "copy now" helper text from `text-amber-500` to `text-zinc-500` — amber is reserved for warning semantics, instructional copy should use neutral color
- R11-02 (P1): Fixed `ScheduledMessageTable` error state text from `text-zinc-500` to `text-red-600` (design system error text standard)
- R11-04 (P1): Fixed `ContactList` error state text from `text-zinc-500` to `text-red-600`
- R11-05 (P1): Fixed `KnowledgePanel` error state text from `text-zinc-500` to `text-red-600`
- R11-06 (P1): Fixed `DeferredRecordTable` error state text from `text-zinc-500` to `text-red-600`

### Changed (documentation)
- R11-07 (P2): Updated design system card radius from `rounded-lg` to `rounded-xl` to match shadcn/ui default and CSS `--radius` variable
- R11-03: Documented `Switch` `size="sm"` variant in design system component table (accepted in-file shadcn customization)

### Accepted Deviations
- R11-03: Switch `size` prop added in `src/components/ui/switch.tsx` — clean shadcn customization, documented in design system
- R11-08: 404 page `text-3xl font-bold` on decorative "404" numeral — acceptable for decorative use outside auth-only restriction

### Sprint notes — Forge Audit Round 10
**Date**: 2026-03-05

### Fixed
- R10-01 (P2): Fixed `DocumentCard` ghost delete button hover — added `hover:bg-red-50 hover:text-red-700` for destructive icon button pattern
- R10-02 (P2): Fixed `AssistantChatList` error message text color from `text-zinc-500` to `text-red-600` (error states must use red)
- R10-03 (P2): Applied `text-xs font-medium tracking-wide text-zinc-500 uppercase` to `TableHead` cells in `ProviderList` (both Providers and Models tables)
- S-10 (P2): Added missing `void` prefix to `queryClient.invalidateQueries()` calls in `useSessionSocket.ts`
- VIO-004 (P1): Replaced `setTimeout(() => inputRef.current?.select(), 0)` in `SessionHeader.startEditing` with a `useEffect` tied to the `editing` state — eliminates timer-based DOM manipulation

### Accepted Deviations (architectural)
- VIO-001–030 (except VIO-004): Sub-page components under `src/pages/*/` owning queries/mutations accepted as feature modules within the page layer — lifting everything to route files would create god-components

### Sprint notes — Forge Audit Round 9
**Date**: 2026-03-05

### Fixed
- FORGE-080 (P1): Added missing hover treatment (`hover:bg-red-50 hover:text-red-700`) to red ghost icon buttons in `ApiKeyList` and `McpServerList` — icon color now inherits via `currentColor`
- FORGE-081 (P2): Applied `text-xs font-medium tracking-wide text-zinc-500 uppercase` to `TableHead` cells in `ApiKeyList` (design system table header spec)
- FORGE-082 (P2): Applied same `TableHead` typography fix to `McpServerList`
- FORGE-083 (P2): Changed `McpServerList` status badge backgrounds from `bg-{color}-100` to `bg-{color}-50` for lighter tint per design system Section 8
- FORGE-084 (P2): Added `AlertTriangle` error icon to error states in `ApiKeyList` and `McpServerList` (was missing the standard error icon pattern)
- FORGE-085 (P1): Added missing `isError` state with retry button to `ChatHistoryDrawer` — was silently showing "No messages found" on fetch failure
- R9-A (P2): Refactored `InfiniteScrollSentinel` to use callback ref pattern — observer lifetime no longer coupled to `onIntersect` identity, preventing thrash on non-memoized callers
- R9-B (P2): Added missing `void` prefix to `queryClient.invalidateQueries()` in `DocumentUploadDialog.onSuccess`
- R9-C (P2): Added missing `void` prefix to `queryClient.invalidateQueries()` in `documents.tsx` `deleteMutation.onSuccess`
- R9-D (P2): Moved mutual-exclusion panel logic from two `useEffect` blocks with `eslint-disable` in `SessionPage` into atomic `toggleMemoryPanel`/`toggleToolsPanel` actions in `ui-store` — eliminates race conditions and removes lint suppressions
- R9-E (P2): Extracted inline `<StreamingMessageBubble />` JSX from `SessionPage` render body to a `streamingSlot` variable — enables future `MessageList` memoization

### Fixed (Phase 2 late findings)
- R9-001 (P1): Added missing `isError` state with retry to `SessionsPage` — silent empty grid on query failure
- R9-002 (P1): Added missing `isError` state with retry to `DebugToggle` — switch silently defaulted to false on failure
- R9-003 (P1): Added `isError` state with retry to `ServiceControlPanel` — distinguishes error from loading/empty
- R9-004 (P1): Added error indicators below provider and model selects in `NewSessionDialog` when queries fail
- R9-005 (P1): Added missing `isError` state with retry to `MessageList` — failure was indistinguishable from empty session
- FORGE-090 (P1): Changed `ScheduledMessageTable` pending badge from amber (`bg-amber-50 text-amber-500`) to blue (`bg-blue-50 text-blue-600`) — amber reserved for warnings; "pending" is informational
- FORGE-091 (P2): Replaced raw `<input type="search">` in `ToolsSidebar` filter bar with shadcn `Input` component + positioned Search icon
- FORGE-092 (P2): Fixed `SettingsPage` padding from hardcoded `px-6 py-6` to responsive `px-4 py-4 md:px-6 md:py-6`
- FORGE-093 (P2): Fixed `DocumentsPage` padding from `py-6` to responsive `py-4 md:py-6`
- FORGE-094 (P2): Removed redundant `shadow-sm` from `ServiceControlPanel` Card (shadcn New York Card includes shadow by default)
- S-03 (P2): Added missing `void` prefix to `refetch()` calls in `ContactList` and `DeferredRecordTable` for consistency

### Added
- `setExclusivePanel` action in `useUIStore` for explicit panel switching

### Sprint notes — Forge Audit Round 8
**Date**: 2026-03-05

### Fixed
- FORGE-060 (P2): Fixed `ScheduledMessageTable` pending badge from `text-amber-700` to `text-amber-500` (design system amber token alignment)
- FORGE-061 (P2): Changed `LiveLogViewer` connecting badge from amber to neutral zinc (connecting is a status, not a warning)
- FORGE-063 (P1): Changed `ToolConfirmationModal` "Forbid All" from `variant="destructive"` to outline with red text (action is reversible)
- FORGE-064 (P2): Changed `SetupWizard` step warnings from `Alert variant="destructive"` to default Alert (advisory notices, not errors)
- FORGE-065 (P1): Added error state with retry to `AssistantChatList`
- FORGE-066 (P1): Added error state with retry to `ScheduledMessageTable`
- FORGE-067 (P1): Added error state with retry to `KnowledgePanel`
- FORGE-068 (P2): Added explicit error display to `SemanticSearchBar` (was silently showing "No results")
- FORGE-069 (P1): Added error state with retry to `MemoryPanel`
- FORGE-070 (P1): Added error state with retry to `ToolsSidebar`
- FORGE-071 (P1): Added error state with retry to `ProviderList` (both providers and models queries)
- FORGE-072 (P2): Fixed `DocumentCard` padding conflict — removed `py-4` from Card, consolidated to `p-4` on CardContent
- FORGE-073 (P2): Changed error icon color from `text-zinc-400` to `text-red-400` in `DeferredRecordTable` and `ContactList` (differentiate error from empty state)
- FORGE-075 (P2): Replaced raw HTML table elements with shadcn `Table` components in `ToolConfirmationModal`
- FORGE-076 (P2): Corrected `CardTitle` from `text-lg` to `text-xl` across 5 admin/assistant cards per design system spec (card titles = 20px)
- R8-002 (P2): Fixed bare `useAuthStore()` call in `ServiceControlPanel` — now uses fine-grained selector
- R8-003 (P2): Fixed bare `useAuthStore()` call in `KnowledgePanel` — now uses fine-grained selector
- R8-004 (P2): Fixed bare `useAuthStore()` calls in `LoginForm` and `RegisterForm` — split into individual selectors
- R8-005 (P2): Stabilized `handleToggle` callback in `ToolsSidebar` via ref pattern — `ToolRow` memo no longer defeated by unstable mutation dependency
- R8-006 (P2): Extracted inline `onArchive` arrow in `SessionsPage` to `useCallback` — `SessionCard` memo no longer defeated
- R8-007 (P2): Fixed stale closure in `GuardrailsPanel` `removeMutation.onSuccess` — now reads `entry.pattern` from mutation variables instead of closed-over `pendingEntry`

### Refactored
- R8-001 accepted deviation: `ProviderList` `healthResults` Map accumulates per-provider ad-hoc results from multiple mutation calls — not cacheable via TanStack Query's single-result `useMutation`

### Sprint notes — Forge Audit Round 7
**Date**: 2026-03-05

### Fixed
- FORGE-037 (P2): Replaced `streamingBuffer`/`toolActivities` subscriptions in `SessionPage` with a single boolean-returning selector — eliminates re-renders on every streaming token
- FORGE-038 (P2): Memoized `Array.from(toolActivities.values())` in `StreamingMessageBubble` with `useMemo`
- FORGE-039 (P2): Wrapped `ToolActivityRow` in `React.memo` for memoization
- FORGE-040 (P2): Added `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` security headers to `nginx.conf`
- FORGE-041 (P1): Fixed `ConnectionStatusDot` amber color to `zinc-400` (amber reserved for warnings semantic role)
- FORGE-042 (P1): Added `role="status"` to `ConnectionStatusDot` for screen reader announcements of connection state changes
- FORGE-043 (P1): Changed `ServiceControlPanel` Stop button from `variant="destructive"` to `variant="outline"` with red text (Stop is reversible, not destructive)
- FORGE-044 (P2): Fixed `ApiKeyList` "copy now" text from `text-amber-600` to `text-amber-500` (design system token alignment)
- FORGE-045 (P2): Fixed `LiveLogViewer` WARNING badge and connection badge from `text-amber-700` to `text-amber-500`
- FORGE-046 (P2): Changed `ToolConfirmationModal` Cancel button from `variant="ghost"` to `variant="outline"` (modal cancel actions per design system)
- FORGE-047 (P2): Changed `KnowledgePanel` delete button from filled `variant="destructive"` to `variant="ghost"` with Trash2 icon (consistent with all other table row delete patterns)
- FORGE-048 (P2): Changed `ScheduledMessageTable` Cancel button from `variant="destructive"` to ghost with red text
- FORGE-049 (P2): Changed `DeferredRecordTable` Cancel button from `variant="destructive"` to ghost with red text
- FORGE-050 (P2): Fixed `ContactList` error icon from `text-red-300` to `text-zinc-400` (undefined palette token)
- FORGE-051 (P2): Fixed `DeferredRecordTable` error icon from `text-red-300` to `text-zinc-400`
- FORGE-052 (P2): Aligned admin page `CardTitle` sizing to `text-lg` across `DebugToggle`, `GuardrailsPanel`, `SystemInfoCard`, and `LiveLogViewer`
- FORGE-053 (P2): Changed `MessageInput` Cancel generation button from `variant="destructive"` to `variant="outline"` (stop is reversible)

### Refactored
- FORGE-054 (P1): Converted `ScheduledMessageTable` save and cancel from manual async handlers to `useMutation`; removed `isSaving` state
- FORGE-055 (P1): Converted `DeferredRecordTable` cancel from manual async handler to `useMutation`
- FORGE-056 (P1): Converted `GuardrailsPanel` remove from manual async handler to `useMutation`; removed `isDeleting` state
- FORGE-057 (P1): Moved `ProviderList` `setSwitchingProvider`/`setSwitchingModel` side-effects out of `mutationFn`; derived per-row loading from `mutation.isPending && mutation.variables`; removed `switchingProvider`, `switchingModel`, `checkingHealth` state
- FORGE-058 (P1): Converted `ProviderList` `handleHealthCheck` from raw async handler to `useMutation`
- FORGE-059 (P1): Moved `McpServerList` `setRestartingServer` side-effect out of `restartMutation.mutationFn`; derived loading from `mutation.isPending && mutation.variables`; removed `restartingServer` state

### Sprint notes — Forge Audit Round 6
**Date**: 2026-03-05

### Fixed
- FORGE-024 (P1): Fixed `AgentStateBadge` `deep_thinking` color from illegal `indigo` to `blue` (design system two-accent constraint)
- FORGE-025 (P1): Fixed `AgentStateBadge` `delegating` color from illegal `amber` to `violet` (amber reserved for warnings)

### Refactored
- FORGE-026 (P1): Converted `DebugToggle` from manual async handler to `useMutation`
- FORGE-027 (P1): Converted `SessionHeader` rename from manual `saving` state to `useMutation`
- FORGE-028 (P1): Converted `ServiceControlPanel` start/stop from manual `stopping` state to two `useMutation` instances
- FORGE-029 (P1): Converted `KnowledgePanel` search and delete from manual async state to `useMutation`
- FORGE-030 (P1): Converted `MemoryPanel` mode switch and clear from manual async state to `useMutation`
- FORGE-031 (P1): Converted `ToolsSidebar` tool toggle from manual async state to `useMutation`
- FORGE-032 (P1): Converted `SetupWizard` open/advance/cancel from manual `isSubmitting`/`isCancelling` state to `useMutation`
- FORGE-033 (P2): Replaced inline `useQuery` in `NewSessionDialog` with existing `useProvidersQuery`/`useModelsQuery` hooks; updated hooks to accept options
- FORGE-034 (P2): Wrapped `ToolRow` in `React.memo` for memoization
- FORGE-035 (P2): Stabilized `AssistantChatList.openChat` with `useCallback`
- FORGE-036 (P2): Stabilized `ToolsSidebar.handleToggle` with `useCallback`

### Sprint notes — Forge Audit Round 5
**Date**: 2026-03-05

### Fixed
- FORGE-017 (P1): Changed 404 page heading from `text-8xl` to `text-3xl font-bold text-zinc-200` (design system compliance)
- FORGE-018 (P1): Replaced `min-h-[400px]` with `min-h-96` in `ErrorBoundary` fallback (Tailwind token consistency)
- FORGE-019 (P2): Made `SessionCard` archive button aria-label include session name for screen reader disambiguation
- FORGE-020 (P2): Made `ToolConfirmationModal` action grid responsive (`grid-cols-2 sm:grid-cols-3`)
- FORGE-021 (P2): Added error state with retry button to `ContactList`
- FORGE-022 (P2): Added error state with retry button to `DeferredRecordTable`
- FORGE-023 (P2): Added `aria-label` with state name to `AgentStateBadge` outer span

### Refactored
- FORGE-013 (P1): Extracted `useAssistantChatsQuery` hook from `AssistantChatList` inline `useQuery`
- FORGE-014 (P1): Extracted `useAssistantChatMessagesQuery` hook from `ChatHistoryDrawer` inline `useQuery`; moved `AssistantMessageOut` type to `types/assistant.ts`
- FORGE-015 (P1): Extracted `useScheduledMessagesQuery`, `useDeferredRecordsQuery`, `useContactsQuery`, `useKnowledgeQuery` hooks from inline `useQuery` calls
- FORGE-016 (P1): Extracted `useGuardrailsQuery` hook from `GuardrailsPanel` inline `useQuery`

### Sprint notes — Forge Audit Round 4
**Date**: 2026-03-05

### Fixed
- FORGE-001 (P0): Added missing `AgentState` variants (`analyzing`, `deep_thinking`, `delegating`) to `src/lib/api/types/session.ts` and `src/components/AgentStateBadge.tsx` to match the updated OpenAPI spec
- FORGE-002 (P0): Added `try-catch` around `JSON.parse` in `src/lib/ws/session-socket.ts` `onmessage` handler to prevent crashes from malformed WebSocket messages — scoped to parse only, handler exceptions propagate normally
- FORGE-004 (P1): Fixed `MessageInput` textarea auto-resize — removed inline `style` `maxHeight` override that bypassed Tailwind `max-h-36` class
- FORGE-005 (P1): Fixed focus ring opacity on `MessageInput` textarea from 50% to full opacity, aligning with the design system focus treatment
- FORGE-006 (P1): Fixed focus ring opacity on `ToolsSidebar` filter input container from 50% to full opacity, aligning with the design system focus treatment
- FORGE-007 (P1): Added `role="status"` to `AgentStateBadge` outer span for screen reader announcements
- FORGE-008 (P1): Fixed `SessionHeader` rename button aria-label from "Click to rename session" to "Rename session" (imperative verb form per WCAG)
- FORGE-009 (P1): Fixed `DocumentCard` delete button `size="icon-sm"` → `size="sm"` (invalid shadcn variant)
- FORGE-010 (P1): Added scroll wrapper layout to admin and assistant pages
- FORGE-011 (P1): Fixed focus ring opacity on `AssistantChatList` chat button from `violet-600/50` to `zinc-400` (design system alignment)
- FORGE-012 (P1): Fixed focus ring opacity on `ToolConfirmationModal` "Show more/less" button from `violet-600/50` to `zinc-400` (design system alignment)

### Refactored
- FORGE-003 (P0): Extracted duplicate `ReactMarkdown` component configuration from `MessageBubble` and `StreamingMessageBubble` into a shared `src/pages/chat/markdownComponents.tsx` module
- Typed `SessionSocketHandlers.onAgentState` as `(state: AgentState)` instead of `(state: string)` — removed unsafe cast in `useSessionSocket`

### Sprint notes — pre-release (rolled into v0.1.0)

### Changed
- Replaced `SetupWizard` `Loader2` content spinner with `Skeleton` layout
- Added `Loader2` spinner to `KnowledgePanel` search button loading state
- Updated `SystemInfoCard` skeleton to 2-column grid matching live `dl` layout
- Added `MessageSquare` icon to `MessageList` empty state
- Moved `AppShell` from `src/components/` to `src/pages/layout/AppShell.tsx` to enforce architecture layer boundaries
- Moved `NewSessionDialog` from `src/components/` to `src/pages/sessions/` to enforce component layer boundary rules
- Extracted `LogSocket` from `LiveLogViewer` into `src/lib/ws/log-socket.ts` for WebSocket encapsulation consistency
- Converted `Sidebar` to props-based — removed direct Zustand store access from the component layer
- Added `React.memo` to `MessageBubble` and `SessionCard` to prevent unnecessary re-renders during streaming
- Added global `staleTime: 30_000` default to TanStack Query client
- Added vendor chunk splitting in Vite config (`react`, `query`, `markdown` chunks)
- Replaced hand-rolled skeletons and spinners with shadcn/ui `Skeleton` and `Loader2`
- Replaced inline styles with Tailwind utilities in `MessageInput`
- Added scroll wrapper layout to admin and assistant pages
- Hoisted `FactTable` to module scope in `KnowledgePanel` (was recreated every render)
- Added `onOpen` handler to `SessionSocket` — connection status now set only after WebSocket handshake completes
- Replaced `InfiniteScrollSentinel` Loader2 spinner with Skeleton placeholders
- Replaced `text-[8rem]` with `text-8xl` on 404 page
- Removed redundant default export from `useAssistantStatusQuery`

### Fixed
- P0: `ToolsSidebar` input `focus:outline-none` replaced with `focus-visible:outline-none` (keyboard accessibility)
- Added retry buttons to 6 error states (`ApiKeyList`, `McpServerList`, `ConfigFlagsForm`, `SystemInfoCard`, `DocumentsPage`, `GuardrailsPanel`)
- Added `aria-label` to `ProviderList` "Switch to" buttons
- Fixed `MessageList` skeleton container padding to match live layout
- Palette color inconsistencies in `ProviderList` and `SessionHeader`
- Missing focus-visible rings and keyboard handlers on interactive elements (accessibility)
- Missing focus ring on "Show more/less" button in `ToolConfirmationModal`
- Added icon+text empty states to 6 assistant/settings components
- Added aria-labels to repetitive table action buttons in assistant panels
- Fixed invalid `role="button"` on `<tr>` in `AssistantChatList` — replaced with proper `<button>` in cell
- Accepted `attempt` parameter in `onReconnecting` callback (was silently dropped)

## [0.1.0] - 2026-03-05

### Added

**Sprint 0 — Foundation infrastructure**
- Vite 7 + React 19 + TypeScript project scaffold with strict mode (`noUnusedLocals`, `noUncheckedIndexedAccess`)
- Tailwind CSS v4 + shadcn/ui (New York style) with CSS variable theming
- TanStack Query v5, Zustand v5, React Router v7 wired in `src/main.tsx`
- Typed fetch wrapper (`src/lib/api/client.ts`) with `APIResponse<T>` envelope unwrapping, automatic 401/TOKEN_EXPIRED refresh, concurrent-refresh deduplication, and 429 rate-limit handling
- In-memory JWT token store (`src/lib/api/tokens.ts`) — no localStorage
- API config module (`src/lib/api/config.ts`) reading `VITE_API_BASE_URL` and `VITE_WS_BASE_URL`
- Full TypeScript type hierarchy under `src/lib/api/types/` covering auth, session, message, tool, memory, config, rag, assistant, system, and websocket domains
- Query key definitions centralized in `src/lib/api/keys.ts`
- `cn()` class merge helper (`src/lib/utils.ts`)
- `.env.example` with documented environment variables

**Sprint 1 — Authentication pages and app shell**
- Combined login/register page (`src/pages/login.tsx`) — route path determines which form renders
- Zustand auth store (`src/lib/stores/auth-store.ts`) with `login`, `register`, `logout`, `fetchProfile` actions and `isAdmin` derived state
- `AppShell` layout component with collapsible `Sidebar` and `PageHeader`
- `ProtectedRoute` and `AdminRoute` guards in `src/App.tsx`
- Lazy-loaded routes with `Suspense` + `ErrorBoundary` wrappers
- Field-level validation error extraction from `APIError.details` on auth forms

**Sprint 2 — Sessions dashboard**
- Sessions list page (`src/pages/sessions.tsx`) with cursor-based infinite scroll via `useInfiniteQuery`
- `SessionCard` component showing session name, agent state badge, provider/model, and last-updated timestamp
- `NewSessionDialog` for creating sessions with optional name and config override
- `ConfirmDialog` shared component for destructive action confirmations
- `useSessionsQuery` hook with stale-while-revalidate and query invalidation on create/archive
- `InfiniteScrollSentinel` component using `IntersectionObserver` for scroll-triggered page loading
- `AgentStateBadge` component with labelled state variants (idle, thinking, researching, writing, done, error)

**Sprint 3 — Session chat page with real-time streaming**
- Chat page split into sub-components under `src/pages/chat/`: `SessionPage`, `SessionHeader`, `MessageList`, `MessageBubble`, `StreamingMessageBubble`, `MessageInput`, `ToolActivityRow`, `ToolConfirmationModal`, `MemoryPanel`, `ToolsSidebar`
- `SessionSocket` WebSocket client (`src/lib/ws/session-socket.ts`) with exponential backoff reconnection (1 s → 30 s, max 10 attempts), `last_seq` replay on reconnect, 30-second ping keepalive, and typed close-code handling
- `useSessionSocket` hook wrapping `SessionSocket` lifecycle (connect on mount, disconnect on unmount)
- Zustand `useStreamingStore` for token accumulation, agent state, tool activity map, pending tool confirmation, and WebSocket connection status
- Zustand `useUIStore` for sidebar, memory panel, and tools panel open/close state including mobile sheet variants
- Tool confirmation modal with six action buttons (allow, deny, allow_all, disable, forbid_all, cancel) and blocking-modal semantics
- `MemoryPanel` fetching `GET /api/v1/sessions/{id}/memory`, refreshed on `memory_update` WebSocket events
- `ToolsSidebar` with per-session tool status and `ToolActionRequest` bulk operations
- `useSessionSocket`, `useMessagesQuery`, `useMemoryQuery`, `useToolsQuery`, `useSessionQuery` hooks

**Sprint 4 — Settings page**
- Settings page (`src/pages/settings.tsx`) with tabbed layout
- `ConfigFlagsForm` for viewing and patching boolean feature flags (`prompt_optimizer`, `parallel_tool_execution`, `context_compression`, `debug`, `verbose`)
- `ProviderList` showing provider health, active provider switching (admin only)
- `McpServerList` for listing, adding, restarting, and removing MCP servers (admin-gated mutations)
- `ApiKeyList` for managing personal API keys
- `SetupWizard` multi-step configuration wizard driven by `WizardStepOut` responses
- `useConfigQuery`, `useProvidersQuery`, `useModelsQuery`, `useMcpServersQuery`, `useApiKeysQuery` hooks

**Sprint 5 — Admin panel, documents, assistant dashboard**
- Admin panel (`src/pages/admin.tsx`) restricted to `role: 'admin'` via `AdminRoute`; sub-components: `SystemInfoCard`, `DebugToggle`, `LiveLogViewer`, `GuardrailsPanel`
- `LiveLogViewer` connecting to `WS /ws/v1/logs` with level filter and auto-scroll
- Documents page (`src/pages/documents.tsx`) with `DocumentCard` list, `DocumentUploadDialog` (multipart upload), and `SemanticSearchBar`
- Assistant dashboard (`src/pages/assistant.tsx`) with `ServiceControlPanel`, `AssistantChatList`, `ChatHistoryDrawer`, `ScheduledMessageTable`, `DeferredRecordTable`, `ContactList`, `KnowledgePanel`
- `useDocumentsQuery`, `useSystemInfoQuery`, `useAssistantStatusQuery` hooks

**Sprint 6 — Polish, accessibility, and QA fixes**
- `PageSkeleton` loading placeholder used across all lazy-loaded routes
- `ErrorBoundary` component wrapping every route and the app root
- `PageHeader` shared header component
- Accessible form attributes (`aria-invalid`, `aria-label`) on auth and chat input forms
- shadcn/ui component additions: `alert`, `avatar`, `badge`, `collapsible`, `progress`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `tooltip`
- Toast notifications via `sonner` for rate limit feedback, error cases, and session actions
- Mobile-responsive panel layout using shadcn/ui `Sheet` for memory and tools panels on small viewports
