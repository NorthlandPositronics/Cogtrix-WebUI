export interface WorkflowToolPolicy {
  excluded_tools: string[];
  additional_approved_tools: string[];
}

export interface WorkflowAutoDetect {
  enabled: boolean;
  keywords: string[];
  patterns: string[];
  min_confidence: number;
}

export interface WorkflowOut {
  id: string;
  name: string;
  description: string;
  system_prompt: string | null;
  system_prompt_file: string | null;
  knowledge_base: boolean;
  /** Optional — not all workflow responses include policy/auto_detect sub-objects. */
  tool_policy?: WorkflowToolPolicy;
  auto_detect?: WorkflowAutoDetect;
  created_at: string;
  updated_at: string;
}

export interface WorkflowCreateRequest {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string | null;
  system_prompt_file?: string | null;
  knowledge_base?: boolean;
  tool_policy?: Partial<WorkflowToolPolicy>;
  auto_detect?: Partial<WorkflowAutoDetect>;
}

export interface WorkflowUpdateRequest {
  name?: string | null;
  description?: string | null;
  system_prompt?: string | null;
  system_prompt_file?: string | null;
  knowledge_base?: boolean | null;
  tool_policy?: Partial<WorkflowToolPolicy> | null;
  auto_detect?: Partial<WorkflowAutoDetect> | null;
}

export interface WorkflowBindingOut {
  session_key: string;
  workflow_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface BindWorkflowRequest {
  workflow_id: string;
}

export interface WorkflowDocumentOut {
  doc_id: string;
  filename: string;
  size_bytes: number;
  content_type: string | null;
  status: string | null;
}
