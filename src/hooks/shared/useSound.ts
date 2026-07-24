import { useCallback } from "react";
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
  // Release the graph once the tone ends — the AudioContext is a long-lived
  // module singleton, so without this the destination's input list grows for
  // every chime played over the life of the tab.
  osc.onended = () => {
    osc.disconnect();
    gainNode.disconnect();
  };
}

export interface SoundHook {
  playResponseComplete: () => void;
  playError: () => void;
  playInboundChat: () => void;
  playDestructiveConfirm: () => void;
}

export function useSound(): SoundHook {
  const soundEnabled = useUIStore((s) => s.soundEnabled);

  // Stable identities keyed on soundEnabled — consumers list these in effect
  // deps (SessionPage, AssistantChatList), so fresh identities each render made
  // those effects re-run every render.
  const playResponseComplete = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx)
      .then(() => {
        // EVT-001: Two-note ascending chime, major second interval
        playTone(ctx, 1200, 0.25, 0, 0.12);
        playTone(ctx, 1350, 0.25, 0.1, 0.12);
      })
      .catch(() => {});
  }, [soundEnabled]);

  const playError = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx)
      .then(() => {
        // EVT-002: Two descending tones, slightly lower than EVT-001
        playTone(ctx, 900, 0.3, 0, 0.12);
        playTone(ctx, 780, 0.3, 0.1, 0.12);
      })
      .catch(() => {});
  }, [soundEnabled]);

  const playInboundChat = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx)
      .then(() => {
        // EVT-003: Single low-pitched soft tone, ~150 ms
        playTone(ctx, 660, 0.2, 0, 0.15);
      })
      .catch(() => {});
  }, [soundEnabled]);

  const playDestructiveConfirm = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void resumeIfSuspended(ctx)
      .then(() => {
        // EVT-004: Single mid-pitched short click, ~80 ms, no decay tail
        playTone(ctx, 800, 0.2, 0, 0.08);
      })
      .catch(() => {});
  }, [soundEnabled]);

  return { playResponseComplete, playError, playInboundChat, playDestructiveConfirm };
}
