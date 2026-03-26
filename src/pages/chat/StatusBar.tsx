import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import type { StatusEntry } from "@/lib/stores/streaming-store";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function EntryRow({
  entry,
  showTime,
  showBorder,
}: {
  entry: StatusEntry;
  showTime?: boolean;
  showBorder?: boolean;
}) {
  const isRunning = !entry.done;
  const hasError = entry.done && !!entry.error;
  const durationSec = entry.durationMs != null ? (entry.durationMs / 1000).toFixed(2) + "s" : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-0.5",
        showBorder && isRunning && "border-l-2 border-teal-500 pl-2",
        showBorder && hasError && "border-l-2 border-red-600 pl-2",
        showBorder && !isRunning && !hasError && "pl-2.5",
      )}
    >
      {showTime && (
        <span className="w-[4.5rem] shrink-0 font-mono text-zinc-500 tabular-nums">
          {formatTime(entry.timestamp)}
        </span>
      )}
      <span className="flex w-3 shrink-0 justify-center" aria-hidden="true">
        {isRunning ? (
          <span
            className="inline-block size-1.5 rounded-full bg-teal-500 motion-safe:animate-pulse"
            data-cy="running-dot"
          />
        ) : hasError ? (
          <X className="size-3 text-red-600" />
        ) : (
          <Check className="size-3 text-green-600" />
        )}
      </span>
      <span className="min-w-0 truncate font-sans text-zinc-700">{entry.tool}</span>
      <span className="ml-auto shrink-0 font-mono tabular-nums">
        {isRunning ? (
          <span className="text-zinc-500">…</span>
        ) : hasError ? (
          <span className="text-red-600" title={entry.error ?? undefined}>
            failed
          </span>
        ) : (
          <span className="text-zinc-500">{durationSec}</span>
        )}
      </span>
    </div>
  );
}

export function StatusBar() {
  const statusLog = useStreamingStore((s) => s.statusLog);
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [statusLog.length, expanded]);

  if (statusLog.length === 0) return null;

  const latest = statusLog[statusLog.length - 1]!;

  return (
    <div className="border-t border-zinc-200 bg-zinc-50 text-xs">
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          expanded ? "max-h-48" : "max-h-0",
        )}
      >
        <div
          ref={listRef}
          className="max-h-48 overflow-y-auto border-b border-zinc-200 px-3 py-1"
          role="log"
          aria-label="Tool activity history"
          aria-live="off"
        >
          {statusLog.map((entry) => (
            <EntryRow key={entry.id} entry={entry} showTime showBorder />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 px-3 py-0.5">
        <div className="min-w-0 flex-1">
          <EntryRow entry={latest} showBorder />
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={expanded ? "Collapse tool history" : "Expand tool history"}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default StatusBar;
