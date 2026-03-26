import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMemoryQuery } from "@/hooks/chat/useMemoryQuery";
import { useUIStore } from "@/lib/stores/ui-store";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { ApiError } from "@/lib/api/types/common";
import { PanelShell } from "./PanelShell";
import type { MemoryMode } from "@/lib/api/types/session";

interface MemoryPanelProps {
  sessionId: string;
  /** When true the panel renders inside a Sheet (mobile). */
  asSheet?: boolean;
}

const MEMORY_MODES: { value: MemoryMode; label: string }[] = [
  { value: "conversation", label: "Conversation" },
  { value: "code", label: "Code" },
  { value: "reasoning", label: "Reasoning" },
];

export function MemoryPanel({ sessionId, asSheet = false }: MemoryPanelProps) {
  const { data: memory, isLoading, isError, refetch } = useMemoryQuery(sessionId);
  const toggleMemoryPanel = useUIStore((s) => s.toggleMemoryPanel);
  const mobilePanelSheet = useUIStore((s) => s.mobilePanelSheet);
  const setMobilePanelSheet = useUIStore((s) => s.setMobilePanelSheet);
  const queryClient = useQueryClient();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const modeSwitchMutation = useMutation({
    mutationFn: (mode: MemoryMode) => api.patch(`/sessions/${sessionId}/memory`, { mode }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.memory(sessionId) });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to switch memory mode");
    },
  });

  const clearMemoryMutation = useMutation({
    mutationFn: () => api.delete(`/sessions/${sessionId}/memory`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.memory(sessionId) });
      setConfirmClearOpen(false);
      toast.success("Memory cleared");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to clear memory");
    },
  });

  const usagePercent =
    memory && memory.context_window > 0
      ? Math.round((memory.tokens_used / memory.context_window) * 100)
      : 0;

  function handleClose() {
    if (asSheet) {
      setMobilePanelSheet(null);
    } else {
      toggleMemoryPanel();
    }
  }

  const panelContent = (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : memory ? (
        <>
          {/* Current mode badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Mode</span>
            <Badge variant="outline" className="text-xs capitalize">
              {memory.mode}
            </Badge>
          </div>

          {/* Mode switcher */}
          <div className="flex gap-1" role="group" aria-label="Memory mode">
            {MEMORY_MODES.map(({ value, label }) => (
              <Button
                key={value}
                variant="outline"
                onClick={() => modeSwitchMutation.mutate(value)}
                disabled={modeSwitchMutation.isPending}
                className={cn(
                  "min-h-11 flex-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap",
                  memory.mode === value &&
                    "border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700",
                )}
                aria-pressed={memory.mode === value}
                aria-label={`${label} memory mode`}
              >
                {modeSwitchMutation.isPending && modeSwitchMutation.variables === value ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  label
                )}
              </Button>
            ))}
          </div>

          {/* Token usage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Token usage</span>
              <span className="text-xs font-medium text-zinc-900">{usagePercent}%</span>
            </div>
            <Progress
              value={usagePercent}
              aria-label="Token usage"
              className={cn(
                "h-1",
                usagePercent > 90
                  ? "[&_[data-slot=progress-indicator]]:bg-red-600"
                  : usagePercent > 75
                    ? "[&_[data-slot=progress-indicator]]:bg-amber-600"
                    : "[&_[data-slot=progress-indicator]]:bg-zinc-400",
              )}
            />
            <p className="text-xs text-zinc-500">
              {memory.tokens_used.toLocaleString()} / {memory.context_window.toLocaleString()}{" "}
              tokens
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900">
            <p>
              <span className="font-medium">Window:</span> {memory.window_messages} messages
            </p>
            <p>
              <span className="font-medium">Summarized:</span> {memory.summarized_messages} messages
            </p>
          </div>

          {/* Summary collapsible */}
          {memory.summary && (
            <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  aria-expanded={summaryOpen}
                  className="focus-visible:ring-ring flex min-h-11 w-full items-center gap-1.5 rounded-lg text-xs font-medium text-zinc-500 transition-colors duration-150 ease-in-out hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
                >
                  {summaryOpen ? (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  )}
                  Summary
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-900">
                  {memory.summary}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Clear button */}
          <div className="mt-auto pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
              className="w-full gap-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              aria-label="Clear memory"
            >
              <Trash2 className="h-4 w-4" />
              Clear memory
            </Button>
          </div>
        </>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-red-600">Failed to load memory.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No memory data available</p>
      )}
    </div>
  );

  const confirmDialog = (
    <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clear memory?</DialogTitle>
          <DialogDescription>
            This will erase all memory state for this session. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setConfirmClearOpen(false)}
            disabled={clearMemoryMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => clearMemoryMutation.mutate()}
            disabled={clearMemoryMutation.isPending}
          >
            {clearMemoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Clear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <PanelShell
        title="Memory"
        asSheet={asSheet}
        sheetOpen={mobilePanelSheet === "memory"}
        onSheetOpenChange={(open) => !open && setMobilePanelSheet(null)}
        onClose={handleClose}
      >
        {panelContent}
      </PanelShell>
      {confirmDialog}
    </>
  );
}

export default MemoryPanel;
