import type { AgentState } from "./session";
import type { ToolConfirmAction } from "./message";

export type ServerMessageType =
  | "token"
  | "tool_start"
  | "tool_end"
  | "tool_confirm_request"
  | "agent_state"
  | "memory_update"
  | "error"
  | "done"
  | "pong"
  | "log_line";

export interface ServerMessage<P = unknown> {
  type: ServerMessageType;
  session_id: string;
  payload: P;
  seq: number;
  ts: string;
}

export interface TokenPayload {
  text: string;
  final: boolean;
}

export interface ToolStartPayload {
  tool_name: string;
  tool_call_id: string;
  input: Record<string, unknown>;
}

export interface ToolEndPayload {
  tool_name: string;
  tool_call_id: string;
  duration_ms: number;
  error: string | null;
}

export interface ToolConfirmRequestPayload {
  confirmation_id: string;
  tool: string;
  parameters: Record<string, unknown>;
  message: string;
}

export interface AgentStatePayload {
  state: AgentState;
}

export interface MemoryUpdatePayload {
  mode: string;
  tokens_used: number;
  summarized: boolean;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export interface DonePayload {
  message_id: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  duration_ms: number;
  tool_calls: number;
  /** Final response content after post-processing (think/delegate pipeline). May differ from
   *  the streamed token buffer when think mode rewrites the initial response. Always prefer
   *  this over the streaming buffer when committing to cache. */
  text?: string;
}

export type ClientMessageType = "user_message" | "tool_confirm" | "ping" | "cancel";

export interface ClientMessage<P = Record<string, unknown>> {
  type: ClientMessageType;
  payload: P;
}

export interface UserMessagePayload {
  text: string;
  mode?: "normal" | "think" | "delegate";
}

export interface ToolConfirmPayload {
  confirmation_id: string;
  action: ToolConfirmAction;
}
