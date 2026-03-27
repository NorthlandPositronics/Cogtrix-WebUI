export interface AssistantStatusOut {
  status: "running" | "stopped" | "starting" | "stopping" | "error";
  channels: ChannelStatusOut[];
  started_at: string | null;
  uptime_s: number | null;
}

export interface ChannelStatusOut {
  name: string;
  type: "whatsapp" | "telegram";
  enabled: boolean;
  connected: boolean;
  active_chats: number;
  poll_interval_s: number;
  error: string | null;
}

export interface ChatSessionOut {
  session_key: string;
  channel: string;
  chat_id: string;
  display_name: string | null;
  message_count: number;
  last_activity: string | null;
  memory_mode: string;
  is_locked: boolean;
}

export interface ScheduledMessageOut {
  id: string;
  chat_id: string;
  channel: string;
  recipient: string;
  text: string;
  send_at: string;
  created_at: string;
  attempts: number;
  max_attempts: number;
  status: "pending" | "firing" | "sent" | "failed" | "cancelled";
}

export interface DeferredRecordOut {
  session_key: string;
  fire_at: string;
  pending_messages: string[];
  depth: number;
  max_depth: number;
  status: "pending" | "firing";
  created_at: string;
}

export interface ContactOut {
  name: string;
  identifiers: string[];
  /** Optional — not present for all contacts in the phonebook. */
  channels?: string[];
  prompt: string | null;
  filter_mode: "none" | "allow" | "ignore" | "blacklist" | null;
}

export interface KnowledgeFactOut {
  id: string;
  text: string;
  source_chat: string | null;
  source_channel: string | null;
  created_at: string;
  relevance_score: number | null;
}

export interface AssistantStartRequest {
  force_restart?: boolean;
}

export interface ScheduledMessageEditRequest {
  text?: string | null;
  send_at?: string | null;
}

export interface KnowledgeSearchRequest {
  query: string;
  top_k?: number;
}

// ---------------------------------------------------------------------------
// Outbound messaging
// ---------------------------------------------------------------------------

export interface OutboundRequest {
  contact_name: string;
  instructions: string;
  channel?: "whatsapp" | "telegram" | null;
}

export interface OutboundResponse {
  session_key: string;
  channel: string;
  chat_id: string;
  contact_name: string;
  response_text: string;
  message_id: string | null;
}

// ---------------------------------------------------------------------------
// Pipeline simulator (admin-only)
// ---------------------------------------------------------------------------

export type SimulateDirection = "inbound" | "outbound";

export interface SimulateRequest {
  channel: string;
  chat_id: string;
  message: string;
  direction?: SimulateDirection;
  instructions?: string | null;
  sender_name?: string;
  sender_id?: string;
  persist?: boolean;
}

export interface SimulateOut {
  channel: string;
  chat_id: string;
  session_key: string;
  direction: SimulateDirection;
  response: string;
  suppressed: boolean;
  deferred: boolean;
  blocked_by_guardrails: boolean;
  guardrail_reason: string | null;
  duration_ms: number;
  memory_persisted: boolean;
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled";
export type CampaignTargetStatus = "pending" | "active" | "completed" | "failed" | "escalated";

export interface CampaignTargetIn {
  contact_name: string;
  channel?: string | null;
}

export interface CampaignTargetOut {
  contact_name: string;
  channel: string;
  chat_id: string;
  status: CampaignTargetStatus;
  follow_ups_sent: number;
  last_outbound_at: string | null;
  last_reply_at: string | null;
  completion_reason: string | null;
}

export interface CampaignCreateRequest {
  name: string;
  goal: string;
  instructions: string;
  targets: CampaignTargetIn[];
  max_follow_ups?: number;
  follow_up_interval_hours?: number;
  auto_launch?: boolean;
}

export interface CampaignUpdateRequest {
  name?: string | null;
  goal?: string | null;
  instructions?: string | null;
  status?: CampaignStatus | null;
  max_follow_ups?: number | null;
  follow_up_interval_hours?: number | null;
}

export interface CampaignOut {
  id: string;
  name: string;
  goal: string;
  instructions: string;
  targets: CampaignTargetOut[];
  max_follow_ups: number;
  follow_up_interval_hours: number;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}
