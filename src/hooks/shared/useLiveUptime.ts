import { useMemo, useSyncExternalStore } from "react";
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
  // Capture the tick value when dataUpdatedAt changes (i.e. when fresh data arrives).
  // dataUpdatedAt is intentionally the only dep — tick is read as a side effect to snapshot it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const anchorTick = useMemo(() => tick, [dataUpdatedAt]);

  if (baseSeconds === undefined) return "—";
  return formatUptime(baseSeconds + Math.max(0, currentTick - anchorTick));
}
