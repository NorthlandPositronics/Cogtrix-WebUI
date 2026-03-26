# Cogtrix WebUI

Web user interface for [Cogtrix](https://github.com/NorthlandPositronics/Cogtrix) — a modular AI assistant with 52 built-in tools, multi-provider LLM support, and hybrid memory.

## Prerequisites

- Node.js 22+
- pnpm 10+
- A running Cogtrix backend API (`localhost:8000` by default)

## Quick Start

```bash
pnpm install
cp .env.example .env        # edit API URL if needed
pnpm dev                    # opens http://localhost:5173
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Routing | React Router v7 |
| Icons | Lucide React |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |

## Features

- **Authentication** — login and registration with JWT, in-memory token storage, automatic silent refresh
- **Sessions dashboard** — infinite-scroll session list with create and archive actions
- **Chat page** — real-time token streaming, tool activity display, tool confirmation modal, memory panel, tools sidebar
- **Settings** — config flag editor, provider and model switcher, MCP server management, API key management, multi-step setup wizard
- **Admin panel** — system info, debug toggle, live log stream, guardrail management (admin role only)
- **Assistant dashboard** — service control, active chat list, chat history, scheduled messages, deferred records, contacts, knowledge base
- **Documents** — file upload and ingestion, document list, semantic search

## API Documentation

The backend API contract is in [`docs/api/`](docs/api/):

- [Development Guide](docs/api/webui-development-guide.md) — page-by-page integration guide
- [Client Contract](docs/api/client-contract.md) — TypeScript types and patterns
- [WebSocket Protocol](docs/api/websocket-protocol.md) — real-time streaming protocol
- [OpenAPI Schema](docs/api/openapi.yaml) — full REST API specification

## License

See [LICENSE](LICENSE).
