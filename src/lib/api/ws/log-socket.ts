import { WS_V1 } from "../config";
import { getAccessToken } from "../tokens";
import type { LogLinePayload } from "../types/system";

export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface LogSocketHandlers {
  onLogLine: (payload: LogLinePayload) => void;
  onOpen: () => void;
  onClose: () => void;
  onError: () => void;
}

const PING_INTERVAL_MS = 30_000;
// The server answers every ping with a pong and drops connections silent for 90 s,
// so no INBOUND frame at all for this long means the socket is half-dead (server
// vanished without a close frame, or the token expired mid-stream). Keyed on any
// inbound frame rather than on log lines — a quiet log is perfectly normal and
// must not be mistaken for a dead connection.
const LIVENESS_TIMEOUT_MS = 90_000;
// If the upgrade never completes (server accepts TCP but never upgrades) no
// event fires at all, so status would stay "connecting" forever — and the UI
// disables its only control in that state, leaving no way to cancel or retry.
const CONNECT_TIMEOUT_MS = 10_000;

// No reconnect logic — log streaming is stateless and user-controlled via the UI connect button.
export class LogSocket {
  private ws: WebSocket | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private errorOccurred = false;
  private lastInboundAt = 0;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly handlers: LogSocketHandlers) {}

  connect(level: LogLevel): void {
    this.disconnect();

    const token = getAccessToken();
    if (!token) {
      this.handlers.onError();
      return;
    }

    const url = `${WS_V1}/logs?token=${encodeURIComponent(token)}&level=${level}`;
    this.ws = new WebSocket(url);

    this.connectTimer = setTimeout(() => {
      this.connectTimer = null;
      this.handleDeadConnection();
    }, CONNECT_TIMEOUT_MS);

    this.ws.onopen = () => {
      this.clearConnectTimer();
      this.lastInboundAt = Date.now();
      this.pingTimer = setInterval(() => {
        if (Date.now() - this.lastInboundAt > LIVENESS_TIMEOUT_MS) {
          this.handleDeadConnection();
          return;
        }
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send("ping");
        }
      }, PING_INTERVAL_MS);
      this.handlers.onOpen();
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      // Any inbound frame (log_line or pong) proves the connection is alive.
      this.lastInboundAt = Date.now();
      try {
        const raw = JSON.parse(event.data) as Record<string, unknown>;
        if (raw.type !== "log_line") return;

        // Protocol spec says log_line messages are flat dicts, but handle
        // an envelope-style `payload` wrapper defensively.
        const payload = (
          raw.payload && typeof raw.payload === "object" ? raw.payload : raw
        ) as LogLinePayload;

        if (payload.message) {
          this.handlers.onLogLine(payload);
        }
      } catch {
        // malformed message — ignore
      }
    };

    this.ws.onclose = () => {
      this.clearPingTimer();
      const hadError = this.errorOccurred;
      this.errorOccurred = false;
      this.ws = null;
      if (!hadError) {
        this.handlers.onClose();
      }
    };

    this.ws.onerror = () => {
      this.errorOccurred = true;
      this.clearPingTimer();
      this.handlers.onError();
    };
  }

  disconnect(): void {
    this.clearPingTimer();
    this.clearConnectTimer();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close(1000);
      this.ws = null;
    }
  }

  /** Tear down a socket that stopped answering and surface it as an error, so the
   *  viewer doesn't sit on a "connected" status that will never produce a line. */
  private handleDeadConnection(): void {
    this.clearPingTimer();
    this.clearConnectTimer();
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close(1000);
    }
    this.errorOccurred = false;
    this.handlers.onError();
  }

  private clearConnectTimer(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}
