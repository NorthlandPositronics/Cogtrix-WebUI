import { WS_V1 } from "../config";
import { getAccessToken } from "../tokens";
import type {
  ServerMessage,
  ClientMessage,
  TokenPayload,
  ToolStartPayload,
  ToolEndPayload,
  ToolConfirmRequestPayload,
  AgentStatePayload,
  MemoryUpdatePayload,
  ErrorPayload,
  DonePayload,
  ToolConfirmPayload,
  UserMessagePayload,
} from "../types";
import type { AgentState } from "../types/session";

export interface SessionSocketHandlers {
  onToken: (text: string, isFinal: boolean) => void;
  onToolStart: (tool: string, toolCallId: string, input: Record<string, unknown>) => void;
  onToolEnd: (tool: string, toolCallId: string, durationMs: number, error: string | null) => void;
  onToolConfirmRequest: (payload: ToolConfirmRequestPayload) => void;
  onAgentState: (state: AgentState) => void;
  onMemoryUpdate: (payload: MemoryUpdatePayload) => void;
  onDone: (payload: DonePayload) => void;
  onError: (code: string, message: string) => void;
  onOpen: () => void;
  onDisconnect: () => void;
  onReconnecting: (attempt: number) => void;
  onReconnectFailed: () => void;
  onAuthError: () => void;
  onForbidden: () => void;
  onSessionNotFound: () => void;
  onServerShutdown: () => void;
}

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL_MS = 30_000;
const HEALTH_POLL_INTERVAL_MS = 5_000;

const VALID_SERVER_MESSAGE_TYPES: readonly string[] = [
  "token",
  "tool_start",
  "tool_end",
  "tool_confirm_request",
  "agent_state",
  "memory_update",
  "error",
  "done",
  "pong",
  "log_line",
] as const;

export class SessionSocket {
  private ws: WebSocket | null = null;
  private _lastSeq = -1;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private healthPollTimer: ReturnType<typeof setInterval> | null = null;
  private intentionallyClosed = false;
  private reconnectAttempts = 0;

  constructor(
    private readonly sessionId: string,
    private readonly handlers: SessionSocketHandlers,
    private readonly checkHealth?: () => Promise<boolean>,
  ) {}

  connect(): void {
    this.intentionallyClosed = false;
    const token = getAccessToken();
    if (!token) {
      this.handlers.onAuthError();
      return;
    }

    const url = `${WS_V1}/sessions/${this.sessionId}?token=${encodeURIComponent(token)}&last_seq=${this._lastSeq}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.pingTimer = setInterval(() => {
        this.send({ type: "ping", payload: {} });
      }, PING_INTERVAL_MS);
      this.handlers.onOpen();
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data) as ServerMessage;
      } catch {
        return; // Malformed message — ignore
      }
      if (!VALID_SERVER_MESSAGE_TYPES.includes(msg.type as string)) {
        return; // Unknown type — ignore to guard against spoofed/unexpected messages
      }
      if (this._lastSeq >= 0) {
        if (msg.seq <= this._lastSeq) {
          // Already-processed message (replay deduplication) — backend resends
          // from last_seq inclusive on reconnect, so skip without closing.
          return;
        }
        if (msg.seq !== this._lastSeq + 1) {
          // True forward gap — close and reconnect so the server replays from
          // last_seq. Do NOT update _lastSeq so replay starts from the correct
          // position.
          this.ws?.close();
          return;
        }
      }
      this._lastSeq = msg.seq;
      this.routeMessage(msg);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.clearPingTimer();
      if (this.intentionallyClosed) return;

      switch (event.code) {
        case 4000:
          this.scheduleReconnect();
          break;
        case 4001:
          this.handlers.onAuthError();
          break;
        case 4003:
          this.handlers.onForbidden();
          break;
        case 4004:
          this.handlers.onSessionNotFound();
          break;
        case 1001:
          this.handlers.onServerShutdown();
          this.startHealthPoll();
          break;
        case 1011:
          this.scheduleReconnect();
          break;
        default:
          this.scheduleReconnect();
          break;
      }

      this.handlers.onDisconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    this.intentionallyClosed = true;
    this.clearReconnectTimer();
    this.clearPingTimer();
    this.clearHealthPoll();
    this.ws?.close(1000);
    this.ws = null;
  }

  sendMessage(text: string, mode: "normal" | "think" | "delegate" = "normal"): void {
    const payload: UserMessagePayload = { text, mode };
    this.send({ type: "user_message", payload: payload as unknown as Record<string, unknown> });
  }

  confirmTool(confirmationId: string, action: ToolConfirmPayload["action"]): void {
    this.send({ type: "tool_confirm", payload: { confirmation_id: confirmationId, action } });
  }

  cancel(): void {
    this.send({ type: "cancel", payload: {} });
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get lastSeq(): number {
    return this._lastSeq;
  }

  private send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private routeMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case "token": {
        const p = msg.payload as TokenPayload;
        this.handlers.onToken(p.text, p.final);
        break;
      }
      case "tool_start": {
        const p = msg.payload as ToolStartPayload;
        this.handlers.onToolStart(p.tool_name, p.tool_call_id, p.input);
        break;
      }
      case "tool_end": {
        const p = msg.payload as ToolEndPayload;
        this.handlers.onToolEnd(p.tool_name, p.tool_call_id, p.duration_ms, p.error);
        break;
      }
      case "tool_confirm_request":
        this.handlers.onToolConfirmRequest(msg.payload as ToolConfirmRequestPayload);
        break;
      case "agent_state":
        this.handlers.onAgentState((msg.payload as AgentStatePayload).state);
        break;
      case "memory_update":
        this.handlers.onMemoryUpdate(msg.payload as MemoryUpdatePayload);
        break;
      case "done":
        this.handlers.onDone(msg.payload as DonePayload);
        break;
      case "error": {
        const p = msg.payload as ErrorPayload;
        this.handlers.onError(p.code, p.message);
        break;
      }
      case "pong":
      case "log_line":
        break;
    }
  }

  private startHealthPoll(): void {
    if (!this.checkHealth) return;
    this.clearHealthPoll();
    this.healthPollTimer = setInterval(() => {
      void this.checkHealth!().then((healthy) => {
        if (healthy) {
          this.clearHealthPoll();
          this.connect();
        }
      });
    }, HEALTH_POLL_INTERVAL_MS);
  }

  private clearHealthPoll(): void {
    if (this.healthPollTimer) {
      clearInterval(this.healthPollTimer);
      this.healthPollTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.handlers.onReconnectFailed();
      return;
    }

    const delayIndex = Math.min(this.reconnectAttempts, BACKOFF_DELAYS.length - 1);
    const delay = BACKOFF_DELAYS[delayIndex] ?? 30000;
    this.reconnectAttempts += 1;
    this.handlers.onReconnecting(this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}
