import { create } from "zustand";
import type { LogLevel } from "@/lib/api/ws/log-socket";
import type { LogLinePayload } from "@/lib/api/types/system";

export interface LogEntry extends LogLinePayload {
  key: number;
}

export const MAX_LOG_LINES = 500;

export type LogConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface LogViewerState {
  level: LogLevel;
  lines: LogEntry[];
  nextLineKey: number;
  connectionStatus: LogConnectionStatus;
  setLevel: (level: LogLevel) => void;
  setConnectionStatus: (status: LogConnectionStatus) => void;
  appendLine: (payload: LogLinePayload) => void;
  clearLines: () => void;
}

export const useLogViewerStore = create<LogViewerState>((set) => ({
  level: "DEBUG",
  lines: [],
  nextLineKey: 0,
  connectionStatus: "disconnected",

  setLevel: (level) => set({ level }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  appendLine: (payload) => {
    set((state) => {
      const entry: LogEntry = { ...payload, key: state.nextLineKey };
      const next = [...state.lines, entry];
      return {
        lines: next.length > MAX_LOG_LINES ? next.slice(next.length - MAX_LOG_LINES) : next,
        nextLineKey: state.nextLineKey + 1,
      };
    });
  },

  clearLines: () => set({ lines: [], nextLineKey: 0 }),
}));
