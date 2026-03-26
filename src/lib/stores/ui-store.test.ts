import { useUIStore } from "./ui-store";
import { act } from "@testing-library/react";

function getStore() {
  return useUIStore.getState();
}

describe("UI store", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useUIStore.setState({
        sidebarOpen: true,
        memoryPanelOpen: false,
        toolsPanelOpen: false,
        mobilePanelSheet: null,
        sessionsViewMode: "grid",
      });
    });
  });

  it("starts with sidebar open and panels closed", () => {
    expect(getStore().sidebarOpen).toBe(true);
    expect(getStore().memoryPanelOpen).toBe(false);
    expect(getStore().toolsPanelOpen).toBe(false);
    expect(getStore().mobilePanelSheet).toBeNull();
  });

  it("toggles sidebar", () => {
    act(() => getStore().toggleSidebar());
    expect(getStore().sidebarOpen).toBe(false);

    act(() => getStore().toggleSidebar());
    expect(getStore().sidebarOpen).toBe(true);
  });

  it("toggles memory panel and closes tools panel", () => {
    act(() => {
      useUIStore.setState({ toolsPanelOpen: true });
    });

    act(() => getStore().toggleMemoryPanel());
    expect(getStore().memoryPanelOpen).toBe(true);
    expect(getStore().toolsPanelOpen).toBe(false);
  });

  it("toggles tools panel and closes memory panel", () => {
    act(() => {
      useUIStore.setState({ memoryPanelOpen: true });
    });

    act(() => getStore().toggleToolsPanel());
    expect(getStore().toolsPanelOpen).toBe(true);
    expect(getStore().memoryPanelOpen).toBe(false);
  });

  it("closing memory panel does not affect tools panel", () => {
    act(() => {
      useUIStore.setState({ memoryPanelOpen: true, toolsPanelOpen: false });
    });

    act(() => getStore().toggleMemoryPanel());
    expect(getStore().memoryPanelOpen).toBe(false);
    expect(getStore().toolsPanelOpen).toBe(false);
  });

  it("sets sidebar open state directly", () => {
    act(() => getStore().setSidebarOpen(false));
    expect(getStore().sidebarOpen).toBe(false);

    act(() => getStore().setSidebarOpen(true));
    expect(getStore().sidebarOpen).toBe(true);
  });

  it("sets mobile panel sheet", () => {
    act(() => getStore().setMobilePanelSheet("memory"));
    expect(getStore().mobilePanelSheet).toBe("memory");

    act(() => getStore().setMobilePanelSheet("tools"));
    expect(getStore().mobilePanelSheet).toBe("tools");

    act(() => getStore().setMobilePanelSheet(null));
    expect(getStore().mobilePanelSheet).toBeNull();
  });

  it("sets exclusive panel", () => {
    act(() => getStore().setExclusivePanel("memory"));
    expect(getStore().memoryPanelOpen).toBe(true);
    expect(getStore().toolsPanelOpen).toBe(false);

    act(() => getStore().setExclusivePanel("tools"));
    expect(getStore().memoryPanelOpen).toBe(false);
    expect(getStore().toolsPanelOpen).toBe(true);

    act(() => getStore().setExclusivePanel(null));
    expect(getStore().memoryPanelOpen).toBe(false);
    expect(getStore().toolsPanelOpen).toBe(false);
  });

  describe("sessionsViewMode", () => {
    it("defaults to grid", () => {
      expect(getStore().sessionsViewMode).toBe("grid");
    });

    it("switches to list mode", () => {
      act(() => getStore().setSessionsViewMode("list"));
      expect(getStore().sessionsViewMode).toBe("list");
    });

    it("switches back to grid mode", () => {
      act(() => useUIStore.setState({ sessionsViewMode: "list" }));
      act(() => getStore().setSessionsViewMode("grid"));
      expect(getStore().sessionsViewMode).toBe("grid");
    });

    it("persists the view mode to localStorage", () => {
      act(() => getStore().setSessionsViewMode("list"));

      const stored = localStorage.getItem("cogtrix-ui-prefs");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { state: { sessionsViewMode: string } };
      expect(parsed.state.sessionsViewMode).toBe("list");
    });

    it("only persists sessionsViewMode — not ephemeral panel state", () => {
      act(() => {
        useUIStore.setState({ sidebarOpen: false, sessionsViewMode: "list" });
      });

      const stored = localStorage.getItem("cogtrix-ui-prefs");
      const parsed = JSON.parse(stored!) as { state: Record<string, unknown> };
      expect(parsed.state).toHaveProperty("sessionsViewMode", "list");
      expect(parsed.state).not.toHaveProperty("sidebarOpen");
      expect(parsed.state).not.toHaveProperty("memoryPanelOpen");
      expect(parsed.state).not.toHaveProperty("toolsPanelOpen");
    });
  });
});
