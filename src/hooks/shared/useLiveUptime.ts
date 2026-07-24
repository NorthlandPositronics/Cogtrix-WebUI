import { useState, useSyncExternalStore } from "react";
import { formatUptime } from "@/lib/utils";

let tick = 0;
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (listeners.size === 1) {
    intervalId = setInterval(() => {
      tick += 1;
      for (const fn of listeners) fn();
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot(): number {
  return tick;
}

export function useLiveUptime(baseSeconds: number | undefined, dataUpdatedAt: number): string {
  const currentTick = useSyncExternalStore(subscribe, getSnapshot);
  // Anchor the tick at the moment fresh data arrived. useMemo must NOT be used
  // here: React may discard a memo and recompute it for unchanged deps, which
  // would re-anchor to "now" and make the displayed uptime jump backward toward
  // baseSeconds. This is the documented adjust-state-when-props-change pattern.
  const [anchor, setAnchor] = useState({ updatedAt: dataUpdatedAt, tick: currentTick });
  if (anchor.updatedAt !== dataUpdatedAt) {
    setAnchor({ updatedAt: dataUpdatedAt, tick: currentTick });
  }

  if (baseSeconds === undefined) return "—";
  return formatUptime(baseSeconds + Math.max(0, currentTick - anchor.tick));
}
