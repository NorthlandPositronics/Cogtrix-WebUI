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
  /** Server discarded the in-progress final answer (opt-in stream_final_answer);
   *  the client must clear its streaming buffer. Optional — only fired when the
   *  server sends a `discard_pending` frame. */
  onDiscardPending?: () => void;
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
  "discard_pending",
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
  private healthProbeInFlight = false;
  // True after we closed for a forward gap and are awaiting the server's replay.
  // If the next connection STILL shows a gap, the replay buffer expired and we
  // resync instead of re-closing (prevents a reconnect livelock). Persists across
  // the reconnect on purpose; cleared once any frame is accepted.
  private awaitingGapReplay = false;

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

    // Tear down any existing socket first. connect() is re-entrant (two health
    // probes can resolve in the same tick, or a reconnect can race a manual
    // connect); without this the previous socket is orphaned — its ping timer
    // reference is overwritten so it can never be cleared, and its handlers keep
    // writing into the shared streaming store.
    this.teardownSocket();

    const url = `${WS_V1}/sessions/${this.sessionId}?last_seq=${this._lastSeq}`;
    this.ws = new WebSocket(url, ["bearer", token]);

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
      // Seq tracking runs BEFORE the type check so an unrecognised but
      // seq-bearing frame (e.g. a server message type this client version
      // doesn't know) still consumes its sequence slot. Dropping it before
      // advancing _lastSeq would leave the counter stale, making the next
      // frame look like a forward gap and triggering a needless
      // close/reconnect loop.
      if (typeof msg.seq === "number") {
        if (this._lastSeq >= 0) {
          if (msg.seq <= this._lastSeq) {
            // Already-processed message (replay deduplication) — backend resends
            // from last_seq inclusive on reconnect, so skip without closing.
            return;
          }
          if (msg.seq !== this._lastSeq + 1) {
            // Forward gap. First time: close so the server replays from last_seq
            // on reconnect (do NOT advance _lastSeq, so replay resumes correctly).
            // But if we ALREADY closed for a gap and reconnected and the gap is
            // STILL here, the server's replay buffer has expired — per the WS
            // protocol it then sends current state only, at a seq beyond
            // last_seq+1. Closing again would livelock forever (and onopen resets
            // reconnectAttempts, so the circuit breaker never trips). Resync
            // instead: adopt the server's seq and let the onOpen REST refetch
            // fill the history hole.
            if (!this.awaitingGapReplay) {
              this.awaitingGapReplay = true;
              this.ws?.close();
              return;
            }
          }
        }
        // In-order frame, or a resync after an unfillable gap: accept it.
        this.awaitingGapReplay = false;
        this._lastSeq = msg.seq;
      }
      if (!VALID_SERVER_MESSAGE_TYPES.includes(msg.type as string)) {
        // Unknown type — its seq slot is already consumed above; nothing to route.
        return;
      }
      this.routeMessage(msg);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.clearPingTimer();
      if (this.intentionallyClosed) return;

      // Publish the generic "disconnected" status FIRST: the branches below set
      // more specific statuses (reconnecting / server-restarting) and running
      // this afterwards would immediately overwrite them with "closed", so the
      // user never saw the reconnecting indicator during a recoverable drop.
      this.handlers.onDisconnect();

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
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    this.intentionallyClosed = true;
    this.clearReconnectTimer();
    this.clearHealthPoll();
    this.teardownSocket();
  }

  /** Detach handlers BEFORE closing, then drop the socket. Frames already sitting
   *  in the receive buffer are still dispatched during the closing handshake, and
   *  the handlers write into a single global streaming store that isn't keyed by
   *  session — so a closing socket could otherwise inject the previous session's
   *  tokens into the one the user just opened. */
  private teardownSocket(): void {
    this.clearPingTimer();
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close(1000);
    }
  }

  sendMessage(text: string, mode: "normal" | "think" | "delegate" = "normal"): void {
    const payload: UserMessagePayload = { text, mode };
    this.send({ type: "user_message", payload: payload as unknown as Record<string, unknown> });
  }

  /** @returns false when the socket wasn't OPEN, so the caller can keep the
   *  confirmation prompt open instead of pretending the answer was delivered.
   *  The frame is NOT recoverable on reconnect — _lastSeq has already advanced
   *  past the tool_confirm_request, so the server replay won't re-send it. */
  confirmTool(confirmationId: string, action: ToolConfirmPayload["action"]): boolean {
    return this.send({
      type: "tool_confirm",
      payload: { confirmation_id: confirmationId, action },
    });
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

  /** @returns false when the socket wasn't OPEN and the frame was dropped. */
  private send(msg: ClientMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  private routeMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case "token": {
        const p = msg.payload as TokenPayload;
        this.handlers.onToken(p.text, p.final);
        break;
      }
      case "discard_pending":
        this.handlers.onDiscardPending?.();
        break;
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
      // The probe has no timeout, so it can outlive the poll interval. Without
      // this guard several stack up while the backend boots and then all resolve
      // together, each calling connect().
      if (this.healthProbeInFlight) return;
      this.healthProbeInFlight = true;
      void this.checkHealth!()
        .then((healthy) => {
          // disconnect() cannot cancel an in-flight probe, so re-check here —
          // otherwise a probe resolving after teardown resurrects a socket for a
          // session the user already left, with nothing left to close it.
          if (this.intentionallyClosed) return;
          if (healthy) {
            this.clearHealthPoll();
            this.connect();
          }
        })
        .finally(() => {
          this.healthProbeInFlight = false;
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
