import type { AgentState } from "@/lib/api/types/session";

interface AgentStateBadgeProps {
  state: AgentState;
}

interface StateConfig {
  dotClass: string;
  label: string;
  labelClass: string;
}

const STATE_CONFIG: Record<AgentState, StateConfig> = {
  idle: {
    dotClass: "size-2 rounded-full bg-green-600",
    label: "Ready",
    labelClass: "text-sm font-medium text-green-700",
  },
  thinking: {
    dotClass: "size-2 rounded-full bg-teal-600 motion-safe:animate-pulse",
    label: "Thinking...",
    labelClass: "text-sm font-medium text-teal-700",
  },
  analyzing: {
    dotClass: "size-2 rounded-full bg-teal-600 motion-safe:animate-pulse",
    label: "Analyzing...",
    labelClass: "text-sm font-medium text-teal-700",
  },
  researching: {
    dotClass: "size-2 rounded-full bg-blue-600 motion-safe:animate-pulse",
    label: "Researching...",
    labelClass: "text-sm font-medium text-blue-700",
  },
  deep_thinking: {
    dotClass: "size-2 rounded-full bg-amber-600 motion-safe:animate-pulse",
    label: "Deep thinking...",
    labelClass: "text-sm font-medium text-amber-700",
  },
  writing: {
    dotClass: "size-2 rounded-full bg-green-600 motion-safe:animate-pulse",
    label: "Writing...",
    labelClass: "text-sm font-medium text-green-700",
  },
  delegating: {
    dotClass: "size-2 rounded-full bg-indigo-600 motion-safe:animate-pulse",
    label: "Delegating...",
    labelClass: "text-sm font-medium text-indigo-700",
  },
  done: {
    dotClass: "size-2 rounded-full bg-green-600",
    label: "Done",
    labelClass: "text-sm font-medium text-green-700",
  },
  error: {
    dotClass: "size-2 rounded-full bg-red-600",
    label: "Error",
    labelClass: "text-sm font-medium text-red-600",
  },
};

const FALLBACK_CONFIG: StateConfig = {
  dotClass: "size-2 rounded-full bg-green-600",
  label: "Ready",
  labelClass: "text-sm font-medium text-green-700",
};

const ACTIVE_STATES: AgentState[] = [
  "thinking",
  "analyzing",
  "researching",
  "deep_thinking",
  "writing",
  "delegating",
];

export function AgentStateBadge({ state }: AgentStateBadgeProps) {
  const config = STATE_CONFIG[state] ?? FALLBACK_CONFIG;
  const isActive = ACTIVE_STATES.includes(state);

  return (
    <span
      className="inline-flex items-center gap-1.5"
      role="status"
      aria-label={`Agent state: ${config.label}`}
    >
      <span
        className={config.dotClass}
        aria-hidden="true"
        data-cy="state-dot"
        data-active={String(isActive)}
      />
      <span className={config.labelClass}>{config.label}</span>
    </span>
  );
}

export default AgentStateBadge;
