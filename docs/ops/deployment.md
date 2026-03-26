# Deployment Guide

## Architecture

The WebUI container (nginx) sits in front of both the React app and the Cogtrix API. The browser never talks to the backend directly — all REST and WebSocket traffic is reverse-proxied through nginx:

```
Browser
  │
  ├─ GET /            → nginx → serves React SPA (static files)
  ├─ /api/*           → nginx → http://cogtrix:8000/api/*
  └─ /ws/*            → nginx → ws://cogtrix:8000/ws/*   (WebSocket upgrade)
```

This means there are no CORS issues and no browser-visible backend URL. The API base URL is baked into the image as an empty string (`VITE_API_BASE_URL=""`), so all requests go to the same origin.

---

## Automated Setup Script

`scripts/setup.sh` handles everything interactively — pick a provider, enter credentials, and the script generates the config files, pulls images, and starts the stack.

```bash
# From the repo root (writes files to current directory)
bash scripts/setup.sh

# Or write files to a dedicated directory
bash scripts/setup.sh --dir ~/cogtrix
```

The script will:
1. Verify Docker is running
2. Ask which LLM provider to use: **Ollama** (local), **OpenAI**, or **Anthropic**
3. For Ollama — query `0.0.0.0:11434` and list available models to choose from
4. For OpenAI / Anthropic — prompt for the API key and model name
5. Prompt for an admin password and generate a random JWT secret
6. Ask which host port to expose the WebUI on (default: `3000`)
7. Write `docker-compose.cogtrix.yml`, `.env.cogtrix`, and `.cogtrix.yml` (skips any file that already exists)
8. Pull the GHCR images and run `docker compose up -d`

**Ollama note:** On Linux, Docker cannot reach `localhost` on the host directly. The script injects `host.docker.internal → host-gateway` into the compose file automatically so the container can connect to Ollama running on the host.

After the script completes, open **http://localhost:3000** (or the port you chose) and log in with `admin` / your password.

---

## Quick Start (WebUI + API, minimal)

This uses the `docker-compose.yml` in the root of this repo. It starts the Cogtrix API and the WebUI on port 3000.

### 1. Pull or build the images

**Option A — use prebuilt images from GHCR (recommended):**

```bash
docker pull ghcr.io/northlandpositronics/cogtrix:latest
docker pull ghcr.io/northlandpositronics/cogtrix-webui:latest
```

Then update `docker-compose.yml` to reference the GHCR images:

```yaml
services:
  cogtrix:
    image: ghcr.io/northlandpositronics/cogtrix:latest

  webui:
    image: ghcr.io/northlandpositronics/cogtrix-webui:latest
```

**Option B — build from source:**

```bash
# Build the WebUI image (run from this repo root)
docker build -f docker/Dockerfile -t cogtrix-webui:latest .

# Build or pull the backend (run from the Cogtrix backend repo)
docker build -t cogtrix:latest /path/to/Cogtrix
```

> **Note:** The WebUI builder stage uses `node:22.13-alpine` (Node.js 22 LTS, exact patch pinned). No local Node.js installation is required to build the image.

### 2. Create the backend config file

The Cogtrix container reads its configuration from `.env.cogtrix`. Create this file next to `docker-compose.yml`:

```bash
# .env.cogtrix — minimum required to start the API
COGTRIX_API_SECRET_KEY=<random-secret-at-least-32-chars>
COGTRIX_API_ADMIN_PASSWORD=<your-admin-password>
```

The API needs at least one LLM provider. Add credentials for whichever you use:

```bash
# OpenAI
COGTRIX_PROVIDER_OPENAI_API_KEY=sk-...

# Anthropic
COGTRIX_PROVIDER_ANTHROPIC_API_KEY=sk-ant-...

# Ollama (local, no key needed — just set the base URL)
COGTRIX_PROVIDER_OLLAMA_BASE_URL=http://host.docker.internal:11434
```

For full configuration options see [`docs/CONFIGURATION.md`](../../Cogtrix/docs/CONFIGURATION.md) in the Cogtrix backend repo.

### 3. Start the stack

```bash
docker compose up -d
```

### 4. Open the UI

Navigate to **http://localhost:3000** in your browser.

Log in with the admin credentials you set in `COGTRIX_API_ADMIN_PASSWORD`.

---

## Full-Stack Deployment (production)

For production use, use the `docker-compose.yml` from the Cogtrix backend repo. It includes the WebUI, WhatsApp gateway (Waha), MCP filesystem server, and proper data volume layout.

```
Cogtrix/
├── docker-compose.yml       # Full stack compose
├── config/
│   ├── cogtrix.env          # Backend env vars
│   └── cogtrix.yml          # Backend config file (providers, models, etc.)
└── data/
    ├── log/
    ├── output/
    ├── prompts/
    └── documents/
```

### 1. Set up config files

```bash
mkdir -p config data/log data/output data/prompts data/documents
```

Create `config/cogtrix.env`:

```bash
COGTRIX_API_SECRET_KEY=<random-secret-at-least-32-chars>
COGTRIX_API_ADMIN_PASSWORD=<your-admin-password>
```

Create `config/cogtrix.yml` with at least one provider and model:

```yaml
providers:
  openai:
    type: openai
    api_key: sk-...

models:
  default:
    provider: openai
    model: gpt-4.1-mini
```

### 2. Pull images

```bash
docker pull ghcr.io/northlandpositronics/cogtrix:latest
docker pull ghcr.io/northlandpositronics/cogtrix-webui:latest
```

### 3. Start

```bash
docker compose up -d
```

The WebUI is accessible at **http://localhost:80** (or just `http://localhost`).

---

## Environment Variables

### WebUI container (`cogtrix-webui`)

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_HOST` | `cogtrix` | Hostname of the Cogtrix API container (Docker service name) |
| `BACKEND_PORT` | `8000` | Port the Cogtrix API listens on |

These are injected into the nginx config at container startup via `envsubst`. The React app itself has no runtime env vars — API URLs are resolved at the nginx proxy layer.

### Backend container (`cogtrix`)

See [Cogtrix configuration docs](../../Cogtrix/docs/CONFIGURATION.md) for the full list. The most common vars:

| Variable | Description |
|----------|-------------|
| `COGTRIX_API_SECRET_KEY` | JWT signing secret (required, min 32 chars) |
| `COGTRIX_API_ADMIN_PASSWORD` | Password for the built-in admin account |
| `COGTRIX_PROVIDER_OPENAI_API_KEY` | OpenAI API key |
| `COGTRIX_PROVIDER_ANTHROPIC_API_KEY` | Anthropic API key |
| `COGTRIX_PROVIDER_OLLAMA_BASE_URL` | Ollama base URL (default: `http://localhost:11434`) |
| `COGTRIX_WHATSAPP_URL` | Waha gateway URL (default: `http://waha:3000`) |

---

## Exposed Ports

| Service | Container port | Host port (minimal compose) | Host port (full-stack compose) |
|---------|---------------|------------------------------|-------------------------------|
| WebUI (nginx) | 80 | 3000 | 80 |
| Cogtrix API | 8000 | not exposed | not exposed |
| Waha gateway | 3000 | not included | 3000 |

The Cogtrix API port is intentionally not published to the host — all access goes through the nginx proxy inside the Docker network.

---

## Health Check

The WebUI container has a built-in health check:

```bash
docker inspect --format='{{.State.Health.Status}}' cogtrix-webui
```

The `/health` endpoint on port 80 returns `200 OK` when nginx is running.

---

## Updating Images

```bash
docker pull ghcr.io/northlandpositronics/cogtrix:latest
docker pull ghcr.io/northlandpositronics/cogtrix-webui:latest
docker compose up -d
```

Docker Compose will restart only the containers whose image has changed.
