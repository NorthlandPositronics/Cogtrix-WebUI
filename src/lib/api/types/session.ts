export type MemoryMode = "conversation" | "code" | "reasoning";
export type AgentState =
  | "idle"
  | "thinking"
  | "analyzing"
  | "researching"
  | "deep_thinking"
  | "writing"
  | "delegating"
  | "done"
  | "error";

export interface TokenCounts {
  input_tokens: number;
  output_tokens: number;
  context_window: number;
}

export interface SessionConfig {
  model?: string | null;
  memory_mode?: MemoryMode | null;
  system_prompt?: string | null;
  prompt_optimizer?: boolean | null;
  parallel_tool_execution?: boolean | null;
  context_compression?: boolean | null;
  max_steps?: number | null;
}

export interface SessionOut {
  id: string;
  name: string;
  owner_id: string;
  state: AgentState;
  config: SessionConfig;
  token_counts: TokenCounts;
  active_tools: string[];
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface SessionCreateRequest {
  name?: string;
  config?: SessionConfig;
}

export interface SessionPatchRequest {
  name?: string | null;
  config?: SessionConfig | null;
}
