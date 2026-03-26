export interface ToolActivity {
  tool: string;
  toolCallId: string;
  input: Record<string, unknown>;
  startedAt: number;
  durationMs: number | null;
  error: string | null;
  done: boolean;
}

export type ToolStatus = "active" | "pinned" | "on_demand" | "disabled" | "auto_approved";

export interface ToolParameterSchema {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default: unknown | null;
  enum: unknown[] | null;
}

export interface ToolOut {
  name: string;
  description: string;
  short_description: string;
  status: ToolStatus;
  requires_confirmation: boolean;
  parameters: ToolParameterSchema[];
  module: string | null;
  is_mcp: boolean;
  mcp_server: string | null;
}

export interface ToolSummary {
  name: string;
  short_description: string;
  status: ToolStatus;
  requires_confirmation: boolean;
  is_mcp: boolean;
}

export interface ToolActionRequest {
  load?: string[] | null;
  unload?: string[] | null;
  enable?: string[] | null;
  disable?: string[] | null;
  auto_approve?: string[] | null;
  revoke_approval?: string[] | null;
}
