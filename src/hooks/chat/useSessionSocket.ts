import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { SessionSocket } from "@/lib/api/ws/session-socket";
import { useStreamingStore, flushPendingTokens } from "@/lib/stores/streaming-store";
import { keys } from "@/lib/api/keys";
import { api } from "@/lib/api/client";
import type { ToolConfirmPayload, DonePayload, MessageOut } from "@/lib/api/types";

import type { CursorPage } from "@/lib/api/types/common";

interface UseSessionSocketOptions {
  onAuthError?: () => void;
  onForbidden?: () => void;
  onSessionNotFound?: () => void;
}

interface UseSessionSocketResult {
  sendMessage: (text: string, mode: "normal" | "think" | "delegate") => void;
  confirmTool: (confirmationId: string, action: ToolConfirmPayload["action"]) => void;
  cancel: () => void;
  connected: boolean;
}

function getStore() {
  return useStreamingStore.getState();
}

// Maximum time (ms) the agent may stay in a single running state without a transition.
// If exceeded the frontend force-resets and shows an error. Applies to all modes; Think
// mode legitimately takes the longest (deep_thinking can last 2–3 min) so 5 min gives
// ample headroom while still catching genuinely hung requests.
const WATCHDOG_MS = 5 * 60_000;

export function useSessionSocket(
  sessionId: string,
  enabled: boolean,
  options: UseSessionSocketOptions = {},
): UseSessionSocketResult {
  const socketRef = useRef<SessionSocket | null>(null);
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled || !sessionId) return;

    getStore().setConnectionStatus("connecting");

    function startWatchdog() {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      watchdogRef.current = setTimeout(() => {
        watchdogRef.current = null;
        const { agentState } = getStore();
        if (agentState === "idle" || agentState === "done" || agentState === "error") return;
        getStore().reset();
        getStore().setAgentState("error");
        toast.error("The assistant didn't respond in time. Please try again.", {
          description: "The request may still be processing on the server.",
        });
        void queryClient.invalidateQueries({ queryKey: keys.messages.list(sessionId) });
        void queryClient.invalidateQueries({ queryKey: keys.sessions.detail(sessionId) });
        void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      }, WATCHDOG_MS);
    }

    function clearWatchdog() {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
    }

    // Imperative health probe passed to SessionSocket's reconnect logic — intentionally
    // outside TanStack Query since it is a fire-and-forget liveness check with no
    // caching or UI-visible result. Not a data-fetch; result is not stored anywhere.
    async function checkHealth(): Promise<boolean> {
      try {
        await api.get("/health/ready");
        return true;
      } catch {
        return false;
      }
    }

    const socket = new SessionSocket(
      sessionId,
      {
        onToken: (text, _isFinal) => {
          getStore().appendToken(text);
        },

        onToolStart: (tool, toolCallId, input) => {
          getStore().addToolStart(tool, toolCallId, input);
        },

        onToolEnd: (_tool, toolCallId, durationMs, error) => {
          getStore().updateToolEnd(toolCallId, durationMs, error);
        },

        onToolConfirmRequest: (payload) => {
          getStore().setPendingConfirmation(payload);
        },

        onAgentState: (state) => {
          getStore().setAgentState(state);
          if (state === "idle" || state === "done" || state === "error") {
            clearWatchdog();
          } else {
            startWatchdog();
          }
        },

        onMemoryUpdate: () => {
          void queryClient.invalidateQueries({ queryKey: keys.memory(sessionId) });
        },

        onDone: (payload: DonePayload) => {
          clearWatchdog();
          if (cancelTimerRef.current) {
            clearTimeout(cancelTimerRef.current);
            cancelTimerRef.current = null;
          }
          flushPendingTokens();
          // Read buffer BEFORE reset so the streaming bubble unmounts first, then the
          // committed message appears — prevents a 1-2 frame double-display glitch.
          const buffer = getStore().streamingBuffer;
          getStore().reset();
          // prefer payload.text (the server's final content after think/delegate
          // post-processing) over the streaming buffer.  In think mode the backend
          // streams the initial LLM response as tokens, then refines it via
          // force_deep_think — the streamed content and the saved message differ.
          // Using payload.text ensures the optimistic cache entry matches the DB,
          // so the subsequent invalidateQueries refetch produces no visible change.
          const contentToCommit = payload.text?.trim() || buffer;
          if (contentToCommit) {
            // Optimistically write final content to cache for instant display.
            // Always also invalidate messages so the server's full content is fetched —
            // if the user navigated away and reconnected mid-turn, the replay buffer only
            // covers the last 30 s, so `buffer` may be a truncated prefix of the response.
            commitDoneToCache(sessionId, payload, contentToCommit, queryClient);
          }
          // Always fetch authoritative messages from the server — covers both the
          // non-streaming case and the partial-buffer case after navigate-away/reconnect.
          void queryClient.invalidateQueries({ queryKey: keys.messages.list(sessionId) });
          // Refresh session so session.state and header badge reflect the completed turn
          void queryClient.invalidateQueries({ queryKey: keys.sessions.detail(sessionId) });
          void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
        },

        onError: (code, message) => {
          clearWatchdog();
          if (cancelTimerRef.current) {
            clearTimeout(cancelTimerRef.current);
            cancelTimerRef.current = null;
          }
          if (code === "CANCELLED") {
            getStore().reset();
          } else if (code === "TURN_IN_PROGRESS") {
            toast.warning("Please wait for the response to complete.");
          } else {
            getStore().reset();
            getStore().setAgentState("error");
            toast.error(message);
          }
          // Refetch messages to reconcile optimistic inserts with server state
          void queryClient.invalidateQueries({ queryKey: keys.messages.list(sessionId) });
          // Refresh session state in header
          void queryClient.invalidateQueries({ queryKey: keys.sessions.detail(sessionId) });
          void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
        },

        onDisconnect: () => {
          getStore().setConnectionStatus("closed");
        },

        onReconnecting: (_attempt) => {
          getStore().setConnectionStatus("reconnecting");
        },

        onReconnectFailed: () => {
          toast.error("Connection lost. Please refresh the page.");
          getStore().setConnectionStatus("closed");
        },

        onAuthError: () => {
          toast.error("Your session expired. Please sign in again.");
          optionsRef.current.onAuthError?.();
        },

        onForbidden: () => {
          toast.error("Access denied");
          optionsRef.current.onForbidden?.();
        },

        onSessionNotFound: () => {
          toast.error("Session not found");
          optionsRef.current.onSessionNotFound?.();
        },

        onOpen: () => {
          getStore().setConnectionStatus("open");
          // Skip messages refetch if streaming is active — the buffer is the live content
          // and onDone will commit + refetch. Always refresh session state so the header
          // badge doesn't show a stale "thinking" from a previous disconnected turn.
          if (!getStore().streamingBuffer) {
            void queryClient.invalidateQueries({ queryKey: keys.messages.list(sessionId) });
          }
          void queryClient.invalidateQueries({ queryKey: keys.sessions.detail(sessionId) });
        },

        onServerShutdown: () => {
          toast.info("Server is restarting. Reconnecting when ready...");
          getStore().setConnectionStatus("reconnecting");
        },
      },
      checkHealth,
    );

    socket.connect();
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      clearWatchdog();
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
        cancelTimerRef.current = null;
      }
      socketRef.current = null;
      getStore().reset();
      getStore().clearStatusLog();
    };
    // queryClient and navigate are stable references — omitting from deps is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, enabled]);

  const sendMessage = useCallback(
    (text: string, mode: "normal" | "think" | "delegate") => {
      socketRef.current?.sendMessage(text, mode);
      getStore().setCurrentMode(mode);

      // Optimistic: insert the user message into the cache immediately
      const messageKey = keys.messages.list(sessionId);
      const now = new Date().toISOString();
      const optimisticMsg: MessageOut = {
        id: `optimistic-${Date.now()}`,
        session_id: sessionId,
        role: "user",
        content: text,
        tool_calls: [],
        token_counts: null,
        created_at: now,
        mode,
      };

      queryClient.setQueryData<InfiniteData<CursorPage<MessageOut>>>(messageKey, (old) => {
        if (!old) return old;
        const lastIdx = old.pages.length - 1;
        const lastPage = old.pages[lastIdx];
        if (!lastPage) return old;
        return {
          ...old,
          pages: [
            ...old.pages.slice(0, lastIdx),
            {
              ...lastPage,
              items: [...lastPage.items, optimisticMsg],
            },
          ],
        };
      });
    },
    [sessionId, queryClient],
  );

  const confirmTool = useCallback(
    (confirmationId: string, action: ToolConfirmPayload["action"]) => {
      socketRef.current?.confirmTool(confirmationId, action);
      getStore().setPendingConfirmation(null);
    },
    [],
  );

  const cancel = useCallback(() => {
    socketRef.current?.cancel();

    // Cancel also clears the watchdog — we're explicitly stopping the turn
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }

    // Force-reset after timeout if server never responds to cancel
    if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
    cancelTimerRef.current = setTimeout(() => {
      cancelTimerRef.current = null;
      const { agentState } = getStore();
      if (agentState !== "idle" && agentState !== "done") {
        getStore().reset();
        getStore().setAgentState("idle");
        void queryClient.invalidateQueries({ queryKey: keys.messages.list(sessionId) });
        toast.info("Generation cancelled.");
      }
    }, 5_000);
  }, [sessionId, queryClient]);

  return {
    sendMessage,
    confirmTool,
    cancel,
    get connected() {
      return socketRef.current?.connected ?? false;
    },
  };
}

function commitDoneToCache(
  sessionId: string,
  payload: DonePayload,
  currentBuffer: string,
  queryClient: QueryClient,
) {
  const messageKey = keys.messages.list(sessionId);
  const now = new Date().toISOString();

  const newMessage: MessageOut = {
    id: payload.message_id,
    session_id: sessionId,
    role: "assistant",
    content: currentBuffer,
    tool_calls: [],
    token_counts: {
      input: payload.input_tokens,
      output: payload.output_tokens,
    },
    created_at: now,
  };

  try {
    queryClient.setQueryData<InfiniteData<CursorPage<MessageOut>>>(messageKey, (old) => {
      if (!old) return old;

      // Deduplicate: skip if this message_id already exists in any page
      const alreadyExists = old.pages.some((page) =>
        page.items.some((m) => m.id === newMessage.id),
      );
      if (alreadyExists) return old;

      const lastIdx = old.pages.length - 1;
      const lastPage = old.pages[lastIdx];
      if (!lastPage) return old;
      return {
        ...old,
        pages: [
          ...old.pages.slice(0, lastIdx),
          {
            ...lastPage,
            items: [...lastPage.items, newMessage],
          },
        ],
      };
    });
  } catch {
    void queryClient.invalidateQueries({ queryKey: messageKey });
  }
}
