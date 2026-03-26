export interface ProviderOut {
  name: string;
  type: "openai" | "ollama" | "anthropic" | "google";
  base_url: string | null;
  has_api_key: boolean;
}

export interface ProviderHealthOut {
  name: string;
  reachable: boolean;
  latency_ms: number | null;
  error: string | null;
}

/** POST /api/v1/config/providers request body (admin only).
 *  Error codes: PROVIDER_EXISTS (409), CONFIG_INVALID (422) */
export interface ProviderCreateRequest {
  /** Unique alias: 1–64 chars, pattern ^[a-zA-Z0-9][a-zA-Z0-9_-]*$ */
  name: string;
  type: "openai" | "ollama" | "anthropic" | "google";
  base_url?: string | null;
  api_key?: string | null;
}

/** PATCH /api/v1/config/providers/{name} request body (admin only).
 *  null base_url reverts to provider-type default; empty string api_key removes the key. */
export interface ProviderPatchRequest {
  base_url?: string | null;
  api_key?: string | null;
}

export interface ModelOut {
  alias: string;
  provider: string;
  model_name: string;
  num_ctx: number | null;
  temperature: number | null;
  max_tokens: number | null;
  is_active: boolean;
}

export interface ConfigOut {
  active_model: string | null;
  memory_mode: string;
  prompt_optimizer: boolean;
  parallel_tool_execution: boolean;
  context_compression: boolean;
  debug: boolean;
  verbose: boolean;
  config_file_path: string | null;
  providers: ProviderOut[];
  models: ModelOut[];
  raw_yaml: string | null;
  system_prompt: string | null;
  guardrails: Record<string, unknown> | null;
  /** Whether the delegate (parallel delegation) mode is enabled server-side.
   *  When false, the Delegate option should be hidden in the chat UI. */
  delegate_enabled: boolean;
}

export interface ConfigPatchRequest {
  debug?: boolean | null;
  verbose?: boolean | null;
  prompt_optimizer?: boolean | null;
  parallel_tool_execution?: boolean | null;
  context_compression?: boolean | null;
}

export interface MCPToolSummary {
  name: string;
  description: string;
}

export interface McpServerOut {
  name: string;
  status: "connected" | "disconnected" | "error" | "connecting";
  transport: "stdio" | "sse";
  url?: string | null;
  command?: string | null;
  args?: string[];
  requires_confirmation: boolean;
  tools?: MCPToolSummary[];
  error?: string | null;
  connected_at?: string | null;
}

export interface ConfigReloadResponse {
  reloaded: boolean;
  config_file_path: string | null;
  warnings: string[];
}

export interface DebugToggleRequest {
  debug?: boolean | null;
  verbose?: boolean | null;
}

export interface ModelSwitchRequest {
  model: string;
}

export interface MCPServerAddRequest {
  name: string;
  transport: "stdio" | "sse";
  url?: string | null;
  command?: string | null;
  args?: string[];
  requires_confirmation?: boolean;
  env?: Record<string, string> | null;
}

export interface WizardStartRequest {
  docs_url?: string | null;
  edit_existing?: boolean;
}

export interface WizardStepRequest {
  answer?: string | null;
  data?: Record<string, unknown> | null;
}

export interface WizardStepOut {
  wizard_id: string;
  step: number;
  total_steps: number;
  step_name: string;
  question: string | null;
  yaml_preview: string | null;
  complete: boolean;
  warnings: string[];
  requires_acceptance: boolean;
}
