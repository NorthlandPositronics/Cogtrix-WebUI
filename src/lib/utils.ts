import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a server timestamp as UTC.
 *
 * ES2016+ parses a date-TIME string with no offset (`2026-07-24T12:00:00`) as
 * LOCAL time, while a date-only string is UTC. The backend can emit naive UTC
 * timestamps, so parsing them raw shifts every value by the viewer's offset —
 * west of UTC that makes recent items appear in the future, which relative-time
 * formatters then render as "just now" indefinitely.
 */
export function parseServerDate(iso: string): Date {
  const hasOffset = iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso);
  return new Date(hasOffset ? iso : iso + "Z");
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
