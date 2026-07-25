import { describe, it, expect, beforeEach } from "vitest";
import { useLogViewerStore, MAX_LOG_LINES } from "./log-viewer-store";
import type { LogLinePayload } from "@/lib/api/types/system";

function line(overrides: Partial<LogLinePayload> = {}): LogLinePayload {
  return {
    type: "log_line",
    level: "INFO",
    logger: "cogtrix",
    message: "hello",
    timestamp: "2026-07-24T12:00:00Z",
    ...overrides,
  };
}

describe("log-viewer-store", () => {
  beforeEach(() => {
    useLogViewerStore.getState().reset();
  });

  it("appends lines with a monotonic key and a precomputed displayTime", () => {
    useLogViewerStore.getState().appendLine(line({ message: "a" }));
    useLogViewerStore.getState().appendLine(line({ message: "b" }));
    const { lines } = useLogViewerStore.getState();
    expect(lines.map((l) => l.message)).toEqual(["a", "b"]);
    expect(lines[0]!.key).not.toBe(lines[1]!.key);
    // displayTime is derived once at append (formatted HH:MM:SS), not the raw ISO.
    expect(lines[0]!.displayTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it("caps the ring buffer at MAX_LOG_LINES, keeping the most recent", () => {
    for (let i = 0; i < MAX_LOG_LINES + 50; i++) {
      useLogViewerStore.getState().appendLine(line({ message: `m${i}` }));
    }
    const { lines } = useLogViewerStore.getState();
    expect(lines.length).toBe(MAX_LOG_LINES);
    expect(lines.slice(-1)[0]!.message).toBe(`m${MAX_LOG_LINES + 49}`);
  });

  it("formats a Python comma-millisecond timestamp", () => {
    useLogViewerStore.getState().appendLine(line({ timestamp: "2026-07-24 12:34:56,789" }));
    expect(useLogViewerStore.getState().lines.slice(-1)[0]!.displayTime).toBe("12:34:56");
  });

  it("passes an unparseable timestamp through unchanged", () => {
    useLogViewerStore.getState().appendLine(line({ timestamp: "not-a-date" }));
    expect(useLogViewerStore.getState().lines.slice(-1)[0]!.displayTime).toBe("not-a-date");
  });

  it("reset() clears lines, keys, and connection state (cross-user leak guard)", () => {
    const s = useLogViewerStore.getState();
    s.appendLine(line());
    s.setConnectionStatus("connected");
    s.setUserDisconnected(true);
    s.reset();
    const after = useLogViewerStore.getState();
    expect(after.lines).toEqual([]);
    expect(after.nextLineKey).toBe(0);
    expect(after.connectionStatus).toBe("disconnected");
    expect(after.userDisconnected).toBe(false);
  });
});
