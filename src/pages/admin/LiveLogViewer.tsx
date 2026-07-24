import { memo, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useConfigQuery } from "@/hooks/shared/useConfigQuery";
import type { LogLevel } from "@/lib/api/ws/log-socket";
import { useLogViewerStore, MAX_LOG_LINES, type LogEntry } from "@/lib/stores/log-viewer-store";
import type { LogConnectionStatus } from "@/lib/stores/log-viewer-store";
import { useLogSocket } from "@/hooks/admin/useLogSocket";

const LEVEL_BADGE_CLASSES: Record<LogLevel, string> = {
  DEBUG: "bg-zinc-100 text-zinc-600 border-zinc-200",
  INFO: "bg-blue-50 text-blue-700 border-blue-200",
  WARNING: "bg-amber-50 text-amber-700 border-amber-200",
  ERROR: "bg-red-50 text-red-700 border-red-200",
  CRITICAL: "bg-red-100 text-red-900 border-red-300",
};

function LogLevelBadge({ level }: { level: string }) {
  const cls = LEVEL_BADGE_CLASSES[level as LogLevel] ?? "bg-zinc-100 text-zinc-600";
  return (
    <Badge variant="outline" className={cn("shrink-0 font-mono text-xs", cls)}>
      {level}
    </Badge>
  );
}

// Memoized so appending one line doesn't re-render (and re-format) all 500 rows
// under a busy stream. `line` is a stable object once appended.
const LogRow = memo(function LogRow({ line }: { line: LogEntry }) {
  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="shrink-0 text-zinc-500">{line.displayTime}</span>
      <LogLevelBadge level={line.level} />
      <span className="shrink-0 text-zinc-500">{line.logger}</span>
      <span className="min-w-0 break-all text-zinc-900">{line.message}</span>
    </div>
  );
});

function connBadgeClass(status: LogConnectionStatus): string {
  if (status === "connected") return "bg-green-50 text-green-700 border-green-200";
  if (status === "connecting") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "error") return "bg-red-50 text-red-700 border-red-200";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
}

export function LiveLogViewer() {
  const lines = useLogViewerStore((s) => s.lines);
  const clearLines = useLogViewerStore((s) => s.clearLines);
  const connState = useLogViewerStore((s) => s.connectionStatus);

  const level = useLogViewerStore((s) => s.level);
  const storeSetLevel = useLogViewerStore((s) => s.setLevel);
  const userDisconnected = useLogViewerStore((s) => s.userDisconnected);
  const setUserDisconnected = useLogViewerStore((s) => s.setUserDisconnected);
  const { connect, disconnect } = useLogSocket();

  useEffect(() => {
    // This component unmounts whenever the admin switches tabs, so auto-connect
    // must not undo an explicit Disconnect — `userDisconnected` carries that
    // intent across remounts.
    if (connState === "disconnected" && !userDisconnected) {
      connect(level);
    }
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: config } = useConfigQuery();
  const queryClient = useQueryClient();
  const debugMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      // `verbose` must be a real boolean: the backend only writes cfg.verbose when
      // the field is non-null, so sending null on disable left verbose logging on.
      api.post("/system/debug", { debug: enabled, verbose: enabled }),
    onSuccess: (_data, enabled) => {
      void queryClient.invalidateQueries({ queryKey: keys.config() });
      // SystemInfoOut reports debug/verbose too, and the System tab is served
      // from cache on switch — without this it shows the pre-toggle state.
      void queryClient.invalidateQueries({ queryKey: keys.systemInfo() });
      toast.success(enabled ? "Debug + verbose logging enabled" : "Debug logging disabled");
    },
    onError: () => {
      toast.error("Failed to toggle debug logging");
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || userScrolledUpRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledUpRef.current = !atBottom;
  }, []);

  const handleLevelChange = useCallback(
    (newLevel: string) => {
      const lvl = newLevel as LogLevel;
      storeSetLevel(lvl);
      // Also reconnect while "connecting": the socket is already being opened at
      // the previous level, so skipping here would stream that level while the
      // Select shows the new one.
      if (connState === "connected" || connState === "connecting") {
        connect(lvl);
      }
    },
    [connState, connect, storeSetLevel],
  );

  const handleToggleConnection = useCallback(() => {
    if (connState === "connected" || connState === "connecting") {
      setUserDisconnected(true);
      disconnect();
    } else {
      setUserDisconnected(false);
      connect(level);
    }
  }, [connState, disconnect, connect, level, setUserDisconnected]);

  const connectionLabel =
    connState === "connected"
      ? "Disconnect"
      : connState === "connecting"
        ? "Connecting..."
        : "Connect";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Live Log Stream</CardTitle>
            <p className="mt-0.5 text-xs text-zinc-500">
              Streams <span className="font-mono">cogtrix.*</span> application logs in real time.
              Enable Debug mode for verbose output.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="debug-toggle"
                checked={config?.debug ?? false}
                onCheckedChange={(checked) => debugMutation.mutate(checked)}
                disabled={debugMutation.isPending}
                aria-label="Toggle debug logging"
              />
              <Label htmlFor="debug-toggle" className="text-sm text-zinc-700">
                Debug
              </Label>
            </div>
            <Badge variant="outline" className={cn("text-xs", connBadgeClass(connState))}>
              {connState}
            </Badge>
            <Select value={level} onValueChange={handleLevelChange}>
              <SelectTrigger className="min-h-11 w-28" aria-label="Minimum log level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBUG">DEBUG</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARNING">WARNING</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant={connState === "connected" ? "outline" : "default"}
              onClick={handleToggleConnection}
              disabled={connState === "connecting"}
              className="min-h-11"
              aria-label={
                connState === "connected" ? "Disconnect from log stream" : "Connect to log stream"
              }
            >
              {connectionLabel}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearLines}
              className="min-h-11"
              aria-label="Clear log output"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-64 overflow-x-auto overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed md:max-h-96"
          role="log"
          aria-live="off"
          aria-label="Live log output"
        >
          {lines.length === 0 ? (
            <p className="text-zinc-500 italic">
              {connState === "connected"
                ? "Connected — waiting for application logs. Enable Debug mode and send a chat message to see activity."
                : connState === "connecting"
                  ? "Connecting…"
                  : connState === "error"
                    ? "Connection failed. Check that you are logged in as admin and the backend is reachable."
                    : "Click Connect to start streaming logs."}
            </p>
          ) : (
            lines.map((line) => <LogRow key={line.key} line={line} />)
          )}
        </div>
        {lines.length === MAX_LOG_LINES && (
          <p className="mt-1 text-xs text-zinc-500">
            Showing last {MAX_LOG_LINES} lines. Older entries have been discarded.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default LiveLogViewer;
