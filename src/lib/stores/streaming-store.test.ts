import { useStreamingStore, flushPendingTokens } from "./streaming-store";
import { act } from "@testing-library/react";

function getStore() {
  return useStreamingStore.getState();
}

describe("streaming store", () => {
  beforeEach(() => {
    act(() => {
      getStore().reset();
      getStore().setConnectionStatus("closed");
    });
  });

  it("starts with idle state and empty buffer", () => {
    const state = getStore();
    expect(state.agentState).toBe("idle");
    expect(state.streamingBuffer).toBe("");
    expect(state.pendingConfirmation).toBeNull();
    expect(state.connectionStatus).toBe("closed");
    expect(state.toolActivities.size).toBe(0);
  });

  it("appends tokens to streaming buffer", () => {
    act(() => {
      getStore().appendToken("Hello");
      getStore().appendToken(" world");
      flushPendingTokens();
    });

    expect(getStore().streamingBuffer).toBe("Hello world");
  });

  it("sets agent state", () => {
    act(() => {
      getStore().setAgentState("thinking");
    });
    expect(getStore().agentState).toBe("thinking");

    act(() => {
      getStore().setAgentState("writing");
    });
    expect(getStore().agentState).toBe("writing");
  });

  it("manages pending confirmation", () => {
    const payload = {
      confirmation_id: "c1",
      tool: "file_write",
      parameters: { path: "/tmp/test" },
      message: "Write file?",
    };

    act(() => {
      getStore().setPendingConfirmation(payload);
    });
    expect(getStore().pendingConfirmation).toEqual(payload);

    act(() => {
      getStore().setPendingConfirmation(null);
    });
    expect(getStore().pendingConfirmation).toBeNull();
  });

  it("tracks tool activities lifecycle", () => {
    act(() => {
      getStore().addToolStart("search", "tc-1", { query: "test" });
    });

    const activity = getStore().toolActivities.get("tc-1");
    expect(activity).toBeDefined();
    expect(activity!.tool).toBe("search");
    expect(activity!.done).toBe(false);
    expect(activity!.durationMs).toBeNull();

    act(() => {
      getStore().updateToolEnd("tc-1", 150, null);
    });

    const updated = getStore().toolActivities.get("tc-1");
    expect(updated!.done).toBe(true);
    expect(updated!.durationMs).toBe(150);
    expect(updated!.error).toBeNull();
  });

  it("tracks tool activity errors", () => {
    act(() => {
      getStore().addToolStart("risky_tool", "tc-err", {});
      getStore().updateToolEnd("tc-err", 50, "Permission denied");
    });

    const activity = getStore().toolActivities.get("tc-err");
    expect(activity!.done).toBe(true);
    expect(activity!.error).toBe("Permission denied");
  });

  it("ignores updateToolEnd for unknown tool call ids", () => {
    act(() => {
      getStore().updateToolEnd("nonexistent", 100, null);
    });

    expect(getStore().toolActivities.size).toBe(0);
  });

  it("sets connection status", () => {
    act(() => {
      getStore().setConnectionStatus("connecting");
    });
    expect(getStore().connectionStatus).toBe("connecting");

    act(() => {
      getStore().setConnectionStatus("open");
    });
    expect(getStore().connectionStatus).toBe("open");
  });

  it("resets streaming state but preserves connectionStatus", () => {
    act(() => {
      getStore().appendToken("some text");
      flushPendingTokens();
      getStore().setAgentState("thinking");
      getStore().setConnectionStatus("open");
      getStore().addToolStart("t", "tc-1", {});
    });

    act(() => {
      getStore().reset();
    });

    const state = getStore();
    expect(state.streamingBuffer).toBe("");
    expect(state.agentState).toBe("idle");
    expect(state.pendingConfirmation).toBeNull();
    expect(state.toolActivities.size).toBe(0);
    expect(state.connectionStatus).toBe("open");
  });
});
