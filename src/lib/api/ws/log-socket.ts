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

// No reconnect logic — log streaming is stateless and user-controlled via the UI connect button.
export class LogSocket {
  private ws: WebSocket | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private errorOccurred = false;

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

    this.ws.onopen = () => {
      this.pingTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send("ping");
        }
      }, PING_INTERVAL_MS);
      this.handlers.onOpen();
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
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
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close(1000);
      this.ws = null;
    }
  }

  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}
