import { useEffect, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ApiError } from "@/lib/api/types/common";
import { useSessionQuery } from "@/hooks/chat/useSessionQuery";
import { useSessionSocket } from "@/hooks/chat/useSessionSocket";
import { useConfigQuery } from "@/hooks/shared/useConfigQuery";
import { useSound } from "@/hooks/shared/useSound";

import { useStreamingStore } from "@/lib/stores/streaming-store";
import { useUIStore } from "@/lib/stores/ui-store";
import type { AgentState } from "@/lib/api/types";
import { SessionHeader } from "./SessionHeader";
import { MessageList } from "./MessageList";
import { StreamingMessageBubble } from "./StreamingMessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";
import { ToolConfirmationModal } from "./ToolConfirmationModal";
import { MemoryPanel } from "./MemoryPanel";
import { ToolsSidebar } from "./ToolsSidebar";
import { StatusBar } from "./StatusBar";

export function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionId = id ?? "";

  const { data: session, isLoading, error } = useSessionQuery(sessionId);
  const { data: config } = useConfigQuery();
  const agentState = useStreamingStore((s) => s.agentState);
  const connectionStatus = useStreamingStore((s) => s.connectionStatus);
  const hasStreamingContent = useStreamingStore((s) => s.streamingBuffer.trimStart().length > 0);
  const hasActiveTool = useStreamingStore((s) => s.hasActiveTool);
  const currentMode = useStreamingStore((s) => s.currentMode);

  const memoryPanelOpen = useUIStore((s) => s.memoryPanelOpen);
  const toolsPanelOpen = useUIStore((s) => s.toolsPanelOpen);
  const mobilePanelSheet = useUIStore((s) => s.mobilePanelSheet);

  const { sendMessage, confirmTool, cancel } = useSessionSocket(
    sessionId,
    !!sessionId && !isLoading && !!session,
    {
      onAuthError: () => navigate("/login", { replace: true }),
      onForbidden: () => navigate("/sessions", { replace: true }),
      onSessionNotFound: () => navigate("/sessions", { replace: true }),
    },
  );

  const { playResponseComplete, playError } = useSound();
  const prevAgentStateRef = useRef<AgentState>(agentState);

  useEffect(() => {
    const prev = prevAgentStateRef.current;
    prevAgentStateRef.current = agentState;
    // Only fire on transition — not on initial render or same-state renders
    if (prev === agentState) return;
    if (agentState === "idle") {
      playResponseComplete();
    } else if (agentState === "error") {
      playError();
    }
  }, [agentState, playResponseComplete, playError]);

  const isAgentRunning = agentState !== "idle" && agentState !== "done" && agentState !== "error";

  useEffect(() => {
    if (!error) return;
    if (error instanceof ApiError && error.code === "SESSION_NOT_FOUND") {
      toast.error("Session not found");
      navigate("/sessions", { replace: true });
    } else if (error) {
      toast.error("Failed to load session");
      navigate("/sessions", { replace: true });
    }
  }, [error, navigate]);

  if (!sessionId) {
    return <Navigate to="/sessions" replace />;
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!session) {
    return null;
  }

  const rightPanelOpen = memoryPanelOpen || toolsPanelOpen;
  // While a tool is in-flight, always show the typing indicator — intermediate
  // tokens (tool call markup, pre-tool reasoning) may be in the buffer but they
  // are not the final response, so StreamingMessageBubble would show confusing content.
  // StreamingMessageBubble only appears for the final response phase (no active tools).
  const streamingSlot = isAgentRunning ? (
    hasActiveTool || !hasStreamingContent ? (
      <TypingIndicator mode={currentMode} />
    ) : (
      <StreamingMessageBubble />
    )
  ) : undefined;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <SessionHeader session={session} />

        <MessageList
          sessionId={sessionId}
          hasStreamingContent={hasStreamingContent}
          streamingSlot={streamingSlot}
        />

        <StatusBar />

        <MessageInput
          onSend={(text, mode) => sendMessage(text, mode)}
          onCancel={cancel}
          disabled={connectionStatus !== "open"}
          isAgentRunning={isAgentRunning}
          delegateEnabled={config?.delegate_enabled ?? true}
        />
      </div>

      {/* Right panels — desktop: inline at lg+, mobile: Sheet drawers */}
      {rightPanelOpen && (
        <div className="hidden lg:flex">
          {memoryPanelOpen && <MemoryPanel sessionId={sessionId} />}
          {toolsPanelOpen && <ToolsSidebar sessionId={sessionId} />}
        </div>
      )}

      {/* Mobile sheet panels — always mounted when a sheet target is set */}
      <div className="lg:hidden">
        {mobilePanelSheet === "memory" && <MemoryPanel sessionId={sessionId} asSheet />}
        {mobilePanelSheet === "tools" && <ToolsSidebar sessionId={sessionId} asSheet />}
      </div>

      {/* Tool confirmation modal */}
      <ToolConfirmationModal onConfirm={confirmTool} />
    </div>
  );
}

export default SessionPage;
