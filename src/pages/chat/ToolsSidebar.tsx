import { memo, useCallback, useState } from "react";
import { Search, Wrench } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolsQuery } from "@/hooks/chat/useToolsQuery";
import { useUIStore } from "@/lib/stores/ui-store";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { ApiError } from "@/lib/api/types/common";
import { PanelShell } from "./PanelShell";
import type { ToolStatus, ToolSummary, ToolActionRequest } from "@/lib/api/types/tool";
import { cn } from "@/lib/utils";

interface ToolsSidebarProps {
  sessionId: string;
  /** When true the panel renders inside a Sheet (mobile). */
  asSheet?: boolean;
}

type TriPosition = 0 | 1 | 2;

const TRI_LABELS = ["Disabled", "On demand", "Loaded"] as const;

function statusToPosition(status: ToolStatus): TriPosition {
  if (status === "disabled") return 0;
  if (status === "on_demand") return 1;
  return 2;
}

function buildAction(
  name: string,
  from: TriPosition,
  to: TriPosition,
  status?: ToolStatus,
): ToolActionRequest {
  const isAutoApproved = status === "auto_approved";
  if (from === 0 && to === 1) return { enable: [name] };
  if (from === 0 && to === 2) return { enable: [name], load: [name] };
  if (from === 1 && to === 0) return { disable: [name] };
  if (from === 1 && to === 2) return { load: [name] };
  if (from === 2 && to === 1)
    return isAutoApproved ? { revoke_approval: [name], unload: [name] } : { unload: [name] };
  if (from === 2 && to === 0)
    return isAutoApproved
      ? { revoke_approval: [name], unload: [name], disable: [name] }
      : { unload: [name], disable: [name] };
  return {};
}

const TRACK_FILL: Record<TriPosition, string> = {
  0: "bg-zinc-200",
  1: "bg-blue-100",
  2: "bg-green-100",
};

const THUMB_FILL: Record<TriPosition, string> = {
  0: "bg-white border border-zinc-300",
  1: "bg-blue-600",
  2: "bg-green-600",
};

const THUMB_TRANSLATE: Record<TriPosition, string> = {
  0: "translate-x-[2px]",
  1: "translate-x-[22px]",
  2: "translate-x-[42px]",
};

interface TriSwitchProps {
  position: TriPosition;
  onChange: (pos: TriPosition) => void;
  disabled?: boolean;
  toolName: string;
}

function TriSwitch({ position, onChange, disabled, toolName }: TriSwitchProps) {
  function handleKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      if (position < 2) onChange((position + 1) as TriPosition);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      if (position > 0) onChange((position - 1) as TriPosition);
    }
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;
    const clicked: TriPosition = x < third ? 0 : x < third * 2 ? 1 : 2;
    if (clicked !== position) {
      onChange(clicked);
    } else if (position > 0) {
      // Clicking the active zone decrements — lets the user "undo" by clicking the thumb
      onChange((position - 1) as TriPosition);
    }
  }

  return (
    <div
      role="slider"
      aria-label={`${toolName} status`}
      aria-valuemin={0}
      aria-valuemax={2}
      aria-valuenow={position}
      aria-valuetext={TRI_LABELS[position]}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKey}
      onClick={handleClick}
      title={TRI_LABELS[position]}
      className={cn(
        "group relative min-h-11 w-16 shrink-0 cursor-pointer rounded-full",
        "focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
      )}
    >
      {/* Track — pill, full width, centered vertically */}
      <span
        className={cn(
          "absolute top-1/2 left-0 h-6 w-16 -translate-y-1/2 rounded-full border border-zinc-200 transition-colors duration-150 group-hover:border-zinc-400",
          TRACK_FILL[position],
        )}
        aria-hidden="true"
      >
        {/* Tick dots — mark the three discrete positions */}
        {(["left-[12px]", "left-[32px]", "left-[52px]"] as const).map((cls) => (
          <span
            key={cls}
            className={cn(
              "absolute top-1/2 block size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25",
              cls,
            )}
            aria-hidden="true"
          />
        ))}
      </span>
      {/* Thumb — 20px circle, sits inside the track */}
      <span
        className={cn(
          "absolute top-1/2 left-0 block size-5 -translate-y-1/2 rounded-full shadow-sm transition-transform duration-150 ease-in-out group-active:scale-90",
          THUMB_FILL[position],
          THUMB_TRANSLATE[position],
        )}
        aria-hidden="true"
      />
    </div>
  );
}

interface ToolRowProps {
  tool: ToolSummary;
  onStatusChange: (name: string, from: TriPosition, to: TriPosition, status: ToolStatus) => void;
  toggling: boolean;
  agentRunning: boolean;
}

const ToolRow = memo(function ToolRow({
  tool,
  onStatusChange,
  toggling,
  agentRunning,
}: ToolRowProps) {
  const position = statusToPosition(tool.status);

  return (
    <div className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-150 ease-in-out hover:bg-zinc-50">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-zinc-900">{tool.name}</span>
          {tool.status === "pinned" && (
            <Badge variant="outline" className="border-zinc-300 bg-zinc-100 text-xs text-zinc-700">
              Pinned
            </Badge>
          )}
          {tool.status === "auto_approved" && (
            <Badge variant="outline" className="border-teal-200 bg-teal-50 text-xs text-teal-700">
              Auto-approved
            </Badge>
          )}
          {tool.is_mcp && (
            <Badge variant="outline" className="text-xs">
              MCP
            </Badge>
          )}
        </div>
        {tool.short_description && (
          <p className="mt-0.5 truncate text-xs text-zinc-500">{tool.short_description}</p>
        )}
      </div>
      <TriSwitch
        position={position}
        onChange={(to) => onStatusChange(tool.name, position, to, tool.status)}
        disabled={toggling || agentRunning}
        toolName={tool.name}
      />
    </div>
  );
});

export function ToolsSidebar({ sessionId, asSheet = false }: ToolsSidebarProps) {
  const { data: tools, isLoading, isError, refetch } = useToolsQuery(sessionId);
  const toggleToolsPanel = useUIStore((s) => s.toggleToolsPanel);
  const mobilePanelSheet = useUIStore((s) => s.mobilePanelSheet);
  const setMobilePanelSheet = useUIStore((s) => s.setMobilePanelSheet);
  const agentState = useStreamingStore((s) => s.agentState);
  const agentRunning = agentState !== "idle" && agentState !== "done" && agentState !== "error";
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");

  const statusMutation = useMutation({
    mutationFn: (action: ToolActionRequest) => api.patch(`/sessions/${sessionId}/tools`, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.tools.session(sessionId) });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update tool");
    },
  });

  const handleStatusChange = useCallback(
    (name: string, from: TriPosition, to: TriPosition, status: ToolStatus) => {
      statusMutation.mutate(buildAction(name, from, to, status));
    },
    [statusMutation],
  );

  const filtered = tools
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(filter.toLowerCase()) ||
          t.short_description.toLowerCase().includes(filter.toLowerCase()),
      )
    : [];

  function handleClose() {
    if (asSheet) {
      setMobilePanelSheet(null);
    } else {
      toggleToolsPanel();
    }
  }

  const filterBar = (
    <div className="border-b border-zinc-200 px-4 py-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter tools..."
          aria-label="Filter tools"
          className="min-h-11 pl-9 text-sm"
        />
      </div>
    </div>
  );

  const toolList = (
    <div className="flex-1 overflow-y-auto">
      {isError ? (
        <div className="flex flex-col items-center gap-3 p-4 py-8 text-center">
          <p className="text-sm text-red-600">Failed to load tools.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <Wrench className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">
            {filter ? "No matching tools" : "No tools available"}
          </p>
        </div>
      ) : (
        <div className="py-1">
          {filtered.map((tool) => (
            <ToolRow
              key={tool.name}
              tool={tool}
              onStatusChange={handleStatusChange}
              toggling={statusMutation.isPending}
              agentRunning={agentRunning}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PanelShell
      title="Tools"
      asSheet={asSheet}
      sheetOpen={mobilePanelSheet === "tools"}
      onSheetOpenChange={(open) => !open && setMobilePanelSheet(null)}
      onClose={handleClose}
    >
      {filterBar}
      {toolList}
    </PanelShell>
  );
}

export default ToolsSidebar;
