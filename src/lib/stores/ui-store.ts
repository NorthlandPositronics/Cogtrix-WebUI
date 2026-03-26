import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  /** Desktop only — whether the left nav rail is collapsed to 48px icon-only mode */
  sidebarCollapsed: boolean;
  memoryPanelOpen: boolean;
  toolsPanelOpen: boolean;
  /** Mobile sheet state — panels render as Sheets on < lg */
  mobilePanelSheet: "memory" | "tools" | null;
  /** Persisted layout preference for the sessions list page */
  sessionsViewMode: "grid" | "list";
  /** Persisted user preference — play subtle audio cues for async completions */
  soundEnabled: boolean;

  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  toggleMemoryPanel: () => void;
  toggleToolsPanel: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobilePanelSheet: (panel: "memory" | "tools" | null) => void;
  setExclusivePanel: (panel: "memory" | "tools" | null) => void;
  setSessionsViewMode: (mode: "grid" | "list") => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      memoryPanelOpen: false,
      toolsPanelOpen: false,
      mobilePanelSheet: null,
      sessionsViewMode: "grid",
      soundEnabled: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleMemoryPanel: () =>
        set((state) => ({
          memoryPanelOpen: !state.memoryPanelOpen,
          toolsPanelOpen: !state.memoryPanelOpen ? false : state.toolsPanelOpen,
        })),
      toggleToolsPanel: () =>
        set((state) => ({
          toolsPanelOpen: !state.toolsPanelOpen,
          memoryPanelOpen: !state.toolsPanelOpen ? false : state.memoryPanelOpen,
        })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setMobilePanelSheet: (panel) => set({ mobilePanelSheet: panel }),
      setExclusivePanel: (panel) =>
        set({ memoryPanelOpen: panel === "memory", toolsPanelOpen: panel === "tools" }),
      setSessionsViewMode: (mode) => set({ sessionsViewMode: mode }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
    }),
    {
      name: "cogtrix-ui-prefs",
      // Only persist user preferences — ephemeral panel/sidebar state is not saved
      partialize: (state) => ({
        sessionsViewMode: state.sessionsViewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
