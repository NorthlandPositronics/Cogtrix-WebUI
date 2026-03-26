export interface SystemInfoOut {
  version: string;
  api_version: string;
  platform: string;
  python_version: string;
  debug: boolean;
  verbose: boolean;
  uptime_s: number;
  started_at: string;
}

export interface HealthOut {
  status: string;
  timestamp: string;
}

export interface ReadinessComponentStatus {
  name: string;
  ok: boolean;
  latency_ms: number | null;
  detail: string | null;
}

export interface ReadinessOut {
  ready: boolean;
  components: ReadinessComponentStatus[];
}

export interface LogLinePayload {
  type: "log_line";
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  logger: string;
  message: string;
  timestamp: string;
}

export interface ViolationRecordOut {
  chat_id: string;
  channel: string;
  violation_type: string;
  /** Required per schema — guardrail pipeline always provides a description. */
  detail: string;
  timestamp: string;
}

export interface GuardrailStatusOut {
  blacklisted_chats: string[];
  total_violations: number;
  recent_violations: ViolationRecordOut[];
}
