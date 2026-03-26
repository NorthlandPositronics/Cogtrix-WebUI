export interface ToolCallRecord {
  tool_call_id: string;
  tool_name: string;
  input: Record<string, unknown>;
  output: string | null;
  duration_ms: number | null;
  error: string | null;
}

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageMode = "normal" | "think" | "delegate";

export interface MessageOut {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  tool_calls: ToolCallRecord[];
  token_counts: { input: number; output: number } | null;
  created_at: string;
  /** Client-side only — set on optimistic inserts; not returned by the server. */
  mode?: MessageMode;
}

export interface SendMessageRequest {
  content: string;
  mode?: "normal" | "think" | "delegate";
  optimize_prompt?: boolean | null;
}

export interface ClearHistoryRequest {
  keep_last?: number | null;
}

export type ToolConfirmAction =
  | "allow"
  | "deny"
  | "allow_all"
  | "disable"
  | "forbid_all"
  | "cancel";
