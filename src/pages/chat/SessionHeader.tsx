import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Brain, Wrench, Trash2, Loader2 } from "lucide-react";
import { SessionSettingsPopover } from "./SessionSettingsPopover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentStateBadge } from "@/components/AgentStateBadge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/types/common";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useMediaQuery } from "@/hooks/shared/useMediaQuery";
import { cn } from "@/lib/utils";
import type { SessionOut, SessionConfig } from "@/lib/api/types/session";

interface SessionHeaderProps {
  session: SessionOut;
}

function ConnectionStatusDot({ status }: { status: string }) {
  if (status === "open") return null;

  const label =
    status === "reconnecting"
      ? "Reconnecting..."
      : status === "connecting"
        ? "Connecting..."
        : "Disconnected";

  const dotClass =
    status === "closed" || status === "error"
      ? "bg-red-600"
      : "bg-zinc-400 motion-safe:animate-pulse";

  return (
    <span
      className="flex items-center gap-1.5 text-xs text-zinc-500"
      role="status"
      title={label}
      aria-label={label}
    >
      <span className={cn("inline-block size-2 rounded-full", dotClass)} aria-hidden="true" />
      {label}
    </span>
  );
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(session.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [keepLast, setKeepLast] = useState("0");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const connectionStatus = useStreamingStore((s) => s.connectionStatus);
  const agentState = useStreamingStore((s) => s.agentState);
  const memoryPanelOpen = useUIStore((s) => s.memoryPanelOpen);
  const toolsPanelOpen = useUIStore((s) => s.toolsPanelOpen);
  const mobilePanelSheet = useUIStore((s) => s.mobilePanelSheet);
  const toggleMemoryPanel = useUIStore((s) => s.toggleMemoryPanel);
  const toggleToolsPanel = useUIStore((s) => s.toggleToolsPanel);
  const setMobilePanelSheet = useUIStore((s) => s.setMobilePanelSheet);

  const isMobile = useMediaQuery("(max-width: 1023px)");

  const renameMutation = useMutation({
    mutationFn: (name: string) => api.patch(`/sessions/${session.id}`, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.detail(session.id) });
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      setEditing(false);
      setNameError(null);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "SESSION_NAME_DUPLICATE") {
        setNameError(err.message);
      } else {
        toast.error(err instanceof ApiError ? err.message : "Failed to rename session");
        setDraftName(session.name);
        setEditing(false);
      }
    },
  });

  const settingsMutation = useMutation({
    mutationFn: (config: Partial<SessionConfig>) =>
      api.patch<SessionOut>(`/sessions/${session.id}`, { config }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.detail(session.id) });
      toast.success("Settings saved");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings");
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: (keepLastN: number) =>
      api.delete(`/sessions/${session.id}/messages`, { body: { keep_last: keepLastN } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.messages.list(session.id) });
      void queryClient.invalidateQueries({ queryKey: keys.memory(session.id) });
      setClearHistoryOpen(false);
      toast.success("Chat history cleared");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to clear history");
    },
  });

  function handleClearHistoryOpen(open: boolean) {
    if (clearHistoryMutation.isPending) return;
    setClearHistoryOpen(open);
    if (!open) setKeepLast("0");
  }

  function handleClearHistoryConfirm() {
    const n = parseInt(keepLast, 10);
    clearHistoryMutation.mutate(isNaN(n) || n < 0 ? 0 : n);
  }

  function handleMemoryClick() {
    if (isMobile) {
      setMobilePanelSheet(mobilePanelSheet === "memory" ? null : "memory");
    } else {
      toggleMemoryPanel();
    }
  }

  function handleToolsClick() {
    if (isMobile) {
      setMobilePanelSheet(mobilePanelSheet === "tools" ? null : "tools");
    } else {
      toggleToolsPanel();
    }
  }

  const liveState = agentState !== "idle" ? agentState : session.state;

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function startEditing() {
    setDraftName(session.name);
    setNameError(null);
    setEditing(true);
  }

  function commitEdit() {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === session.name) {
      setEditing(false);
      return;
    }
    renameMutation.mutate(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
      setDraftName(session.name);
      setNameError(null);
    }
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4">
        {/* Left: back button */}
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-zinc-500 hover:bg-zinc-100"
            asChild
            aria-label="Back to sessions"
            data-cy="back-to-sessions"
          >
            <Link to="/sessions">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Center: session name + agent state + connection status */}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
          {editing ? (
            <>
              <Input
                ref={inputRef}
                value={draftName}
                onChange={(e) => {
                  setDraftName(e.target.value);
                  setNameError(null);
                }}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                disabled={renameMutation.isPending}
                className="min-h-11 w-full max-w-48 text-center text-sm font-medium"
                aria-label="Session name"
                aria-invalid={nameError !== null}
                aria-describedby={nameError ? "session-rename-error" : "session-name-hint"}
              />
              {nameError ? (
                <p id="session-rename-error" className="text-xs text-red-600">
                  {nameError}
                </p>
              ) : (
                <span id="session-name-hint" className="sr-only">
                  Press Enter to save, Escape to cancel
                </span>
              )}
            </>
          ) : (
            <button
              type="button"
              data-cy="rename-session"
              onClick={startEditing}
              className="focus-visible:ring-ring inline-flex max-w-full items-center truncate rounded-sm px-2 py-1 text-base font-medium text-zinc-900 transition-colors duration-150 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
              aria-label={`Rename session: ${session.name}`}
            >
              {session.name}
            </button>
          )}
          <div className="flex min-h-5 items-center gap-2">
            {connectionStatus === "open" ? (
              <AgentStateBadge state={liveState} />
            ) : (
              <ConnectionStatusDot status={connectionStatus} />
            )}
          </div>
        </div>

        {/* Right: panel toggles + settings + clear history */}
        <div className="flex shrink-0 items-center gap-1">
          <SessionSettingsPopover
            session={session}
            onSave={(config) => settingsMutation.mutateAsync(config)}
            isSaving={settingsMutation.isPending}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setClearHistoryOpen(true)}
            aria-label="Clear chat history"
            className="h-11 w-11 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            data-cy="toggle-memory"
            variant="ghost"
            size="icon"
            onClick={handleMemoryClick}
            aria-label="Toggle memory panel"
            aria-pressed={memoryPanelOpen || mobilePanelSheet === "memory"}
            className={cn(
              "h-11 w-11 text-zinc-500",
              (memoryPanelOpen || mobilePanelSheet === "memory") &&
                "bg-teal-50 text-teal-600 hover:bg-teal-100",
            )}
          >
            <Brain className="h-5 w-5" />
          </Button>
          <Button
            data-cy="toggle-tools"
            variant="ghost"
            size="icon"
            onClick={handleToolsClick}
            aria-label="Toggle tools panel"
            aria-pressed={toolsPanelOpen || mobilePanelSheet === "tools"}
            className={cn(
              "h-11 w-11 text-zinc-500",
              (toolsPanelOpen || mobilePanelSheet === "tools") &&
                "bg-teal-50 text-teal-600 hover:bg-teal-100",
            )}
          >
            <Wrench className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Dialog open={clearHistoryOpen} onOpenChange={handleClearHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear chat history</DialogTitle>
            <DialogDescription>
              Permanently delete messages in this session. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="keep-last-input" className="mb-1.5 block text-sm font-medium">
              Keep last N messages (0 = clear all)
            </Label>
            <Input
              id="keep-last-input"
              type="number"
              min={0}
              step={1}
              value={keepLast}
              onChange={(e) => setKeepLast(e.target.value)}
              disabled={clearHistoryMutation.isPending}
              className="min-h-11 w-32"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => handleClearHistoryOpen(false)}
              disabled={clearHistoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="min-h-11"
              onClick={handleClearHistoryConfirm}
              disabled={clearHistoryMutation.isPending}
              aria-busy={clearHistoryMutation.isPending}
            >
              {clearHistoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SessionHeader;
