#!/usr/bin/env bash
# setup.sh — Bootstrap Cogtrix API + WebUI in Docker
# Usage: bash setup.sh [--dir <output-dir>]
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { printf "${CYAN}%s${RESET}\n" "$*"; }
success() { printf "${GREEN}✔  %s${RESET}\n" "$*"; }
warn()    { printf "${YELLOW}⚠  %s${RESET}\n" "$*"; }
error()   { printf "${RED}✘  %s${RESET}\n" "$*" >&2; exit 1; }
prompt()  { printf "${BOLD}%s${RESET} " "$*"; }

# ── Output directory ──────────────────────────────────────────────────────────
OUTDIR="$PWD"
if [[ "${1:-}" == "--dir" && -n "${2:-}" ]]; then
  OUTDIR="$2"
  mkdir -p "$OUTDIR"
fi

COMPOSE_FILE="$OUTDIR/docker-compose.cogtrix.yml"
ENV_FILE="$OUTDIR/.env.cogtrix"
CONFIG_FILE="$OUTDIR/.cogtrix.yml"

printf "\n${BOLD}Cogtrix Setup${RESET}\n"
printf "This script will generate config files, pull the Cogtrix images from GHCR,\n"
printf "and start the API + WebUI stack in Docker.\n"
printf "Files will be written to: ${CYAN}%s${RESET}\n\n" "$OUTDIR"

# ── Prerequisites ─────────────────────────────────────────────────────────────
info "Checking prerequisites…"
command -v docker >/dev/null 2>&1 \
  || error "Docker is not installed. Download it from https://docs.docker.com/get-docker/ and re-run this script."
docker info >/dev/null 2>&1 \
  || error "Docker daemon is not running. Start Docker Desktop (or run 'sudo systemctl start docker' on Linux) and try again."
docker compose version >/dev/null 2>&1 \
  || error "docker compose v2 plugin is required but was not found. Update Docker Desktop to the latest version, or install the plugin: https://docs.docker.com/compose/install/"
success "Docker is ready"

# ── Detect OS — used later if Ollama is local on Linux ────────────────────────
OS="$(uname -s)"

# ── Provider configuration ────────────────────────────────────────────────────
printf "\n${BOLD}LLM Provider Configuration${RESET}\n"
prompt "Provider type ( ollama / openai / anthropic / google / xai ) [openai]:"
read -r PROVIDER_TYPE_INPUT
PROVIDER_TYPE="${PROVIDER_TYPE_INPUT:-openai}"

case "$PROVIDER_TYPE" in
  ollama|openai|anthropic|google|xai) ;;
  *) error "Unknown provider type '${PROVIDER_TYPE}'. Supported: ollama, openai, anthropic, google, xai" ;;
esac

# Defaults per provider type
case "$PROVIDER_TYPE" in
  ollama)    DEFAULT_BASE_URL="http://localhost:11434"; DEFAULT_MODEL="qwen3:8b"        ;;
  openai)    DEFAULT_BASE_URL="https://api.openai.com/v1"; DEFAULT_MODEL="gpt-4.1-mini" ;;
  anthropic) DEFAULT_BASE_URL=""; DEFAULT_MODEL="claude-sonnet-4-6"                     ;;
  google)    DEFAULT_BASE_URL=""; DEFAULT_MODEL="gemini-2.5-pro"                        ;;
  xai)       DEFAULT_BASE_URL="https://api.x.ai/v1"; DEFAULT_MODEL="grok-3-mini"        ;;
esac

# API key (not needed for Ollama)
API_KEY=""
if [[ "$PROVIDER_TYPE" != "ollama" ]]; then
  prompt "API key:"
  read -rs API_KEY; echo
  [[ -z "$API_KEY" ]] && error "API key cannot be empty for provider type '${PROVIDER_TYPE}'."
fi

# Base URL
if [[ -n "$DEFAULT_BASE_URL" ]]; then
  prompt "Base URL [${DEFAULT_BASE_URL}]:"
else
  prompt "Base URL (leave blank for provider default):"
fi
read -r BASE_URL_INPUT
BASE_URL="${BASE_URL_INPUT:-$DEFAULT_BASE_URL}"

# Provider name (used as YAML key — allows multiple providers of the same type)
prompt "Provider name [${PROVIDER_TYPE}]:"
read -r PROVIDER_NAME_INPUT
PROVIDER_NAME="${PROVIDER_NAME_INPUT:-$PROVIDER_TYPE}"

# ── Ollama: replace localhost with host.docker.internal + probe for models ────
AVAILABLE_MODELS=""
OLLAMA_IS_LOCAL=false
if [[ "$PROVIDER_TYPE" == "ollama" ]]; then
  if echo "$BASE_URL" | grep -qE '(localhost|127\.0\.0\.1)'; then
    OLLAMA_IS_LOCAL=true
    PROBE_URL="$BASE_URL"
    BASE_URL=$(echo "$BASE_URL" | sed 's/localhost/host.docker.internal/g; s/127\.0\.0\.1/host.docker.internal/g')
    PROBE_HOSTS=("0.0.0.0" "localhost")
  else
    PROBE_HOSTS=("$(echo "$BASE_URL" | sed 's|http://||; s|:.*||')")
  fi

  for probe_host in "${PROBE_HOSTS[@]}"; do
    if curl -sf "http://${probe_host}:11434/api/tags" >/dev/null 2>&1; then
      AVAILABLE_MODELS=$(curl -s "http://${probe_host}:11434/api/tags" \
        | python3 -c "import sys,json; [print(m['name']) for m in json.load(sys.stdin).get('models',[])]" 2>/dev/null || true)
      break
    fi
  done

  if [[ -n "$AVAILABLE_MODELS" ]]; then
    printf "\n${BOLD}Models available:${RESET}\n"
    echo "$AVAILABLE_MODELS" | nl -ba
    printf "\n  You can type the model name or its number from the list above.\n"
  else
    warn "Could not reach Ollama — make sure it is running and reachable."
    printf "  Start it with:  ${CYAN}ollama serve${RESET}\n"
    printf "  Pull a model:   ${CYAN}ollama pull qwen3:8b${RESET}\n"
    printf "  Common models:  qwen3:8b, llama3.2:3b, llama3.1:8b, mistral\n\n"
    printf "  You can continue — Ollama will be contacted once the stack starts.\n\n"
  fi
fi

# Model
prompt "Model [${DEFAULT_MODEL}]:"
read -r MODEL_INPUT
MODEL="${MODEL_INPUT:-$DEFAULT_MODEL}"

# If user entered a number and Ollama returned a list, resolve it to model name
if [[ -n "$AVAILABLE_MODELS" && "$MODEL" =~ ^[0-9]+$ ]]; then
  RESOLVED=$(echo "$AVAILABLE_MODELS" | sed -n "${MODEL}p")
  [[ -z "$RESOLVED" ]] && error "No model with number ${MODEL} in the list."
  MODEL="$RESOLVED"
  printf "  Selected: ${CYAN}%s${RESET}\n" "$MODEL"
fi

# ── Build PROVIDER_CONFIG YAML ────────────────────────────────────────────────
PROVIDER_ENTRY="providers:
  ${PROVIDER_NAME}:
    type: ${PROVIDER_TYPE}"
[[ -n "$API_KEY"  ]] && PROVIDER_ENTRY+="
    api_key: ${API_KEY}"
[[ -n "$BASE_URL" ]] && PROVIDER_ENTRY+="
    base_url: ${BASE_URL}"

if [[ "$PROVIDER_TYPE" == "ollama" && -n "$AVAILABLE_MODELS" ]]; then
  MODELS_YAML=$(echo "$AVAILABLE_MODELS" | python3 -c "
import sys
models = [l.strip() for l in sys.stdin if l.strip()]
active = '''${MODEL}'''
provider = '''${PROVIDER_NAME}'''
def alias(m):
    a = m[:-7] if m.endswith(':latest') else m
    return a.replace(':', '-')
active_alias = alias(active)
lines = ['models:', '  default: ' + active_alias]
for m in models:
    a = alias(m)
    lines.append(f'  {a}:')
    lines.append(f'    provider: {provider}')
    lines.append(f'    model: {m}')
print('\n'.join(lines))
")
else
  MODELS_YAML="models:
  default: chat
  chat:
    provider: ${PROVIDER_NAME}
    model: ${MODEL}"
fi

PROVIDER_CONFIG="${PROVIDER_ENTRY}

${MODELS_YAML}"

# ── Generate a random JWT secret ──────────────────────────────────────────────
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null \
  || openssl rand -hex 32 2>/dev/null \
  || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 64)

# ── Port ──────────────────────────────────────────────────────────────────────
printf "\n"
printf "The WebUI will be available at http://localhost:<port> on this machine.\n"
prompt "Host port for the WebUI [default: 3000]:"
read -r HOST_PORT
HOST_PORT="${HOST_PORT:-3000}"

# ── host.docker.internal — only needed when Ollama is local on Linux ──────────
# On Linux without Docker Desktop, host.docker.internal is not set automatically.
# We inject it via extra_hosts so the container can reach the host's Ollama.
LINUX_EXTRA_HOSTS=""
if [[ "$PROVIDER_TYPE" == "ollama" && "$OLLAMA_IS_LOCAL" == "true" && "$OS" == "Linux" ]]; then
  LINUX_EXTRA_HOSTS='
    extra_hosts:
      - "host.docker.internal:host-gateway"'
fi

# ── Write .cogtrix.yml ────────────────────────────────────────────────────────
printf "\n"
info "Writing config files…"
if [[ -f "$CONFIG_FILE" ]]; then
  warn "$CONFIG_FILE already exists — skipping. Delete it and re-run to regenerate."
else
  cat > "$CONFIG_FILE" <<EOF
# Cogtrix provider & model configuration
# Generated by setup.sh — edit freely.

${PROVIDER_CONFIG}
EOF
  success "Created $CONFIG_FILE"
fi

# ── Write .env.cogtrix ────────────────────────────────────────────────────────
if [[ -f "$ENV_FILE" ]]; then
  warn "$ENV_FILE already exists — skipping. Delete it and re-run to regenerate."
else
  cat > "$ENV_FILE" <<EOF
# Cogtrix API environment — generated by setup.sh
COGTRIX_JWT_SECRET=${JWT_SECRET}
EOF
  chmod 600 "$ENV_FILE"
  success "Created $ENV_FILE  (permissions set to 600 — readable only by you)"
fi

# ── Write docker-compose.yml ──────────────────────────────────────────────────
if [[ -f "$COMPOSE_FILE" ]]; then
  warn "$COMPOSE_FILE already exists — skipping. Delete it and re-run to regenerate."
else
  cat > "$COMPOSE_FILE" <<EOF
# Generated by setup.sh
services:
  cogtrix:
    image: ghcr.io/northlandpositronics/cogtrix:latest
    command: api
    env_file: .env.cogtrix
    volumes:
      - cogtrix-data:/app/data
      - ./.cogtrix.yml:/app/.cogtrix.yaml:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python3", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s${LINUX_EXTRA_HOSTS}

  webui:
    image: ghcr.io/northlandpositronics/cogtrix-webui:latest
    ports:
      - "${HOST_PORT}:80"
    environment:
      BACKEND_HOST: cogtrix
      BACKEND_PORT: 8000
    depends_on:
      cogtrix:
        condition: service_healthy
    restart: unless-stopped

volumes:
  cogtrix-data:
EOF
  success "Created $COMPOSE_FILE"
fi

# ── Check port availability ───────────────────────────────────────────────────
if ss -tlnH "sport = :${HOST_PORT}" 2>/dev/null | grep -q .; then
  error "Port ${HOST_PORT} is already in use on this machine. Stop the process using it, or re-run and choose a different port."
fi

# ── Pull images ───────────────────────────────────────────────────────────────
printf "\n"
info "Pulling the latest images from GHCR (this may take a minute on first run)…"
docker pull ghcr.io/northlandpositronics/cogtrix:latest
docker pull ghcr.io/northlandpositronics/cogtrix-webui:latest
success "Images downloaded and ready"

# ── Start stack ───────────────────────────────────────────────────────────────
printf "\n"
info "Starting the stack in the background…"
docker compose -f "$COMPOSE_FILE" up -d
success "Stack is running"

# ── Done ──────────────────────────────────────────────────────────────────────
printf "\n${BOLD}${GREEN}Setup complete.${RESET}\n\n"
printf "  Open in your browser: ${CYAN}http://localhost:${HOST_PORT}${RESET}\n\n"
printf "  ${BOLD}First run:${RESET} register an account — the first user to sign up becomes the admin.\n"
printf "  The API may take a few seconds to finish starting.\n"
printf "  If the page doesn't load immediately, wait a moment and refresh.\n\n"
printf "${BOLD}Useful commands:${RESET}\n"
printf "  Follow logs:    ${CYAN}docker compose -f %s logs -f${RESET}\n" "$COMPOSE_FILE"
printf "  Stop the stack: ${CYAN}docker compose -f %s down${RESET}\n" "$COMPOSE_FILE"
printf "  Update images:  ${CYAN}docker compose -f %s pull && docker compose -f %s up -d${RESET}\n" "$COMPOSE_FILE" "$COMPOSE_FILE"
printf "  Edit config:    ${CYAN}%s${RESET}  (restart the stack after changes)\n" "$CONFIG_FILE"
