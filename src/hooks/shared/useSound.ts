import { useUIStore } from "@/lib/stores/ui-store";

// Module-level singleton — not recreated on re-renders or remounts
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

async function resumeIfSuspended(ctx: AudioContext): Promise<void> {
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

/** Play a single sine tone with a linear-ramp gain envelope. */
function playTone(
  ctx: AudioContext,
  frequency: number,
  gain: number,
  startOffset: number,
  duration: number,
): void {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;

  // Hard ceiling — no event may exceed 0.30
  const clampedGain = Math.min(gain, 0.3);
  gainNode.gain.setValueAtTime(clampedGain, ctx.currentTime + startOffset);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startOffset + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime + startOffset);
  osc.stop(ctx.currentTime + startOffset + duration);
}

export interface SoundHook {
  playResponseComplete: () => void;
  playError: () => void;
  playInboundChat: () => void;
  playDestructiveConfirm: () => void;
}

export function useSound(): SoundHook {
  const soundEnabled = useUIStore((s) => s.soundEnabled);

  function playResponseComplete(): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx).then(() => {
      // EVT-001: Two-note ascending chime, major second interval
      // First note: ~1200 Hz, second note: ~1350 Hz (major second up)
      // Total ~220 ms, gain 0.25
      playTone(ctx, 1200, 0.25, 0, 0.12);
      playTone(ctx, 1350, 0.25, 0.1, 0.12);
    });
  }

  function playError(): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx).then(() => {
      // EVT-002: Two descending tones, slightly lower than EVT-001
      // First note: ~900 Hz, second note: ~780 Hz (minor second down)
      // Total ~220 ms, gain 0.30
      playTone(ctx, 900, 0.3, 0, 0.12);
      playTone(ctx, 780, 0.3, 0.1, 0.12);
    });
  }

  function playInboundChat(): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx).then(() => {
      // EVT-003: Single low-pitched soft tone, ~150 ms
      // Lower frequency to distinguish from EVT-001, gain 0.20
      playTone(ctx, 660, 0.2, 0, 0.15);
    });
  }

  function playDestructiveConfirm(): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx).then(() => {
      // EVT-004: Single mid-pitched short click, ~80 ms, no decay tail
      playTone(ctx, 800, 0.2, 0, 0.08);
    });
  }

  return { playResponseComplete, playError, playInboundChat, playDestructiveConfirm };
}
