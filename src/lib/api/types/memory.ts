import type { MemoryMode } from "./session";

export interface MemoryStateOut {
  session_id: string;
  mode: MemoryMode;
  summary: string | null;
  window_messages: number;
  summarized_messages: number;
  tokens_used: number;
  context_window: number;
  vector_recall_enabled: boolean;
  mode_meta: Record<string, unknown>;
  updated_at: string;
}

export interface MemoryModeSwitchRequest {
  mode: MemoryMode;
}
