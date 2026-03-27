# Stage 1 — Build
FROM node:25.8-alpine AS build
RUN npm install -g pnpm@10.30.3 --no-update-notifier
WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build with empty base URLs so the app uses same-origin requests.
# nginx will proxy /api/ and /ws/ to the backend.
# Override via --build-arg VITE_API_BASE_URL=https://api.example.com for
# standalone (non-proxy) deployments.
ARG VITE_API_BASE_URL=""
ARG VITE_WS_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_WS_BASE_URL=$VITE_WS_BASE_URL
RUN pnpm build

# Stage 2 — Serve
FROM nginx:1.29.7-alpine

# Non-root user for production security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && chown appuser:appgroup /var/run/nginx.pid

COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

ENV BACKEND_HOST=cogtrix \
    BACKEND_PORT=8000

EXPOSE 80
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
