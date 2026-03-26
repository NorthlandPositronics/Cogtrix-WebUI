import { create } from "zustand";
import type { AgentState, ToolConfirmRequestPayload, ToolActivity } from "@/lib/api/types";
import type { MessageMode } from "@/lib/api/types/message";

export type { ToolActivity };

export interface StatusEntry {
  id: string;
  timestamp: number;
  tool: string;
  done: boolean;
  error: string | null;
  durationMs: number | null;
}

interface StreamingState {
  streamingBuffer: string;
  agentState: AgentState;
  pendingConfirmation: ToolConfirmRequestPayload | null;
  toolActivities: Map<string, ToolActivity>;
  /** True while at least one tool activity is in-flight (not done). Avoids Map iteration in selectors. */
  hasActiveTool: boolean;
  connectionStatus: "connecting" | "open" | "reconnecting" | "closed";
  /** Accumulated tool activity log — persists across turns, cleared on session navigation. */
  statusLog: StatusEntry[];
  /** Mode of the currently in-flight user request — null when idle. */
  currentMode: MessageMode | null;

  appendToken: (text: string) => void;
  setAgentState: (state: AgentState) => void;
  setPendingConfirmation: (payload: ToolConfirmRequestPayload | null) => void;
  addToolStart: (tool: string, toolCallId: string, input: Record<string, unknown>) => void;
  updateToolEnd: (toolCallId: string, durationMs: number, error: string | null) => void;
  setConnectionStatus: (status: StreamingState["connectionStatus"]) => void;
  setCurrentMode: (mode: MessageMode | null) => void;
  clearStatusLog: () => void;
  reset: () => void;
}

const initialState = {
  streamingBuffer: "",
  agentState: "idle" as AgentState,
  pendingConfirmation: null,
  toolActivities: new Map<string, ToolActivity>(),
  hasActiveTool: false,
  connectionStatus: "closed" as const,
  currentMode: null as MessageMode | null,
};

let pendingTokens = "";
let rafId: ReturnType<typeof requestAnimationFrame> | null = null;

function flushTokens() {
  rafId = null;
  if (!pendingTokens) return;
  const batch = pendingTokens;
  pendingTokens = "";
  useStreamingStore.setState((state) => ({
    streamingBuffer: state.streamingBuffer + batch,
  }));
}

export function flushPendingTokens(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  flushTokens();
}

export const useStreamingStore = create<StreamingState>((set) => ({
  ...initialState,
  statusLog: [],

  appendToken: (text) => {
    pendingTokens += text;
    if (rafId === null) {
      rafId = requestAnimationFrame(flushTokens);
    }
  },

  setAgentState: (state) => set({ agentState: state }),

  setPendingConfirmation: (payload) => set({ pendingConfirmation: payload }),

  addToolStart: (tool, toolCallId, input) =>
    set((state) => {
      const next = new Map(state.toolActivities);
      const now = Date.now();
      next.set(toolCallId, {
        tool,
        toolCallId,
        input,
        startedAt: now,
        durationMs: null,
        error: null,
        done: false,
      });
      const entry: StatusEntry = {
        id: toolCallId,
        timestamp: now,
        tool,
        done: false,
        error: null,
        durationMs: null,
      };
      const prevLog = state.statusLog.length >= 100 ? state.statusLog.slice(-99) : state.statusLog;
      return { toolActivities: next, hasActiveTool: true, statusLog: [...prevLog, entry] };
    }),

  updateToolEnd: (toolCallId, durationMs, error) =>
    set((state) => {
      const existing = state.toolActivities.get(toolCallId);
      if (!existing) return {};
      const next = new Map(state.toolActivities);
      next.set(toolCallId, { ...existing, durationMs, error, done: true });
      let hasActiveTool = false;
      for (const t of next.values()) {
        if (!t.done) {
          hasActiveTool = true;
          break;
        }
      }
      const statusLog = state.statusLog.map((e) =>
        e.id === toolCallId ? { ...e, done: true, error, durationMs } : e,
      );
      return { toolActivities: next, hasActiveTool, statusLog };
    }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setCurrentMode: (mode) => set({ currentMode: mode }),

  clearStatusLog: () => set({ statusLog: [] }),

  reset: () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pendingTokens = "";
    set((state) => ({
      ...initialState,
      toolActivities: new Map<string, ToolActivity>(),
      connectionStatus: state.connectionStatus,
    }));
  },
}));
