# DesignForge Audit Flags — 2026-03-24

These items require web_designer decisions before code changes can be made.

## FLAG-001: Global prefers-reduced-motion CSS vs per-component motion-safe:

`src/index.css` contains a global `@media (prefers-reduced-motion: reduce)` block (lines 130–137) that sets `animation-duration: 0.01ms !important` for all elements. DS §9 requires per-component `motion-safe:` prefixes for all animations.

**Current state:** Both exist. DesignForge sprint added `motion-safe:` per-component (compliant). Global override remains as safety net.

**Question:** Should the global `@media` override be retained alongside the per-component `motion-safe:` prefixes (belt-and-suspenders for shadcn/ui defaults), or removed in favour of exclusive per-component control?

## FLAG-002: Labeled destructive outline button rest color (MemoryPanel)

`src/pages/chat/MemoryPanel.tsx` line 193: "Clear memory" uses `variant="outline"` with `text-red-600` at rest. This button has a ConfirmDialog gate. DS §5 GUARDRAIL-001 specifies `text-zinc-500` at rest for **ghost icon-only** buttons backed by ConfirmDialog. The ruling's scope for labeled outline buttons is ambiguous.

**Question:** Does GUARDRAIL-001 extend to labeled destructive `variant="outline"` buttons with ConfirmDialog? Or is `text-red-600` at rest acceptable for clearly labeled destructive actions in panel contexts?

## FLAG-003: Scheduled message status badge colors (undocumented)

`src/pages/assistant/ScheduledMessageTable.tsx` uses:
- `pending` → `bg-blue-50 text-blue-700 border-blue-200`
- `firing` → `bg-amber-50 text-amber-700 border-amber-200`
- `sent` → `bg-green-50 text-green-700 border-green-200`
- `failed` → `bg-red-50 text-red-700 border-red-200`
- `cancelled` → `bg-zinc-50 text-zinc-600 border-zinc-200`

These are not documented in DS §5. Semantics appear reasonable (blue=info/pending, amber=in-progress, green=success, red=error, zinc=neutral).

**Question:** Should these badge colors be documented in DS §5 as the scheduled message status badge table?

## FLAG-004: Deferred record status badge colors (undocumented)

`src/pages/assistant/DeferredRecordTable.tsx` uses:
- `firing` → `bg-amber-50 text-amber-700 border-amber-200`
- default/pending → `bg-blue-50 text-blue-700 border-blue-200`

Same documentation gap as FLAG-003.

**Question:** Should deferred record status badge colors be documented in DS §5 alongside the scheduled message badge table?

## FLAG-005: MessageInput textarea font size — text-base at mobile

DesignForge sprint changed `MessageInput` textarea from `text-sm` to `text-base` per DS §2 (form inputs use text-base). On iOS/Safari mobile, `text-base` (16px) prevents auto-zoom on input focus; `text-sm` (14px) triggers zoom. The `text-base` fix is correct per DS §2 and also a UX improvement on mobile.

**No action required.** Documenting for awareness. The fix is confirmed correct.
