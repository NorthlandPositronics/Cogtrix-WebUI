import { create } from "zustand";
import type { LogLevel } from "@/lib/api/ws/log-socket";
import type { LogLinePayload } from "@/lib/api/types/system";

export interface LogEntry extends LogLinePayload {
  key: number;
  /** Timestamp formatted once at append time, so rows don't re-parse a Date on
   *  every render of the (up to 500-row) list under a busy stream. */
  displayTime: string;
}

export const MAX_LOG_LINES = 500;

function formatLogTime(raw: string): string {
  const d = new Date(raw.replace(",", "."));
  if (!isNaN(d.getTime())) return d.toLocaleTimeString("en-US", { hour12: false });
  const epoch = Number(raw);
  if (!isNaN(epoch) && epoch > 1e9) {
    return new Date(epoch * 1000).toLocaleTimeString("en-US", { hour12: false });
  }
  return raw;
}

export type LogConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface LogViewerState {
  level: LogLevel;
  lines: LogEntry[];
  nextLineKey: number;
  connectionStatus: LogConnectionStatus;
  /** True once the user has explicitly disconnected. The viewer unmounts when its
   *  tab is switched away, so this must live in the store for that intent to
   *  survive a remount and not be undone by auto-connect. */
  userDisconnected: boolean;
  setLevel: (level: LogLevel) => void;
  setConnectionStatus: (status: LogConnectionStatus) => void;
  setUserDisconnected: (value: boolean) => void;
  appendLine: (payload: LogLinePayload) => void;
  clearLines: () => void;
}

export const useLogViewerStore = create<LogViewerState>((set) => ({
  level: "DEBUG",
  lines: [],
  nextLineKey: 0,
  connectionStatus: "disconnected",
  userDisconnected: false,

  setLevel: (level) => set({ level }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setUserDisconnected: (value) => set({ userDisconnected: value }),

  appendLine: (payload) => {
    set((state) => {
      const entry: LogEntry = {
        ...payload,
        key: state.nextLineKey,
        displayTime: formatLogTime(payload.timestamp),
      };
      const next = [...state.lines, entry];
      return {
        lines: next.length > MAX_LOG_LINES ? next.slice(next.length - MAX_LOG_LINES) : next,
        nextLineKey: state.nextLineKey + 1,
      };
    });
  },

  clearLines: () => set({ lines: [], nextLineKey: 0 }),
}));
