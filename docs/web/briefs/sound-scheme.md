# Sound Scheme — Design Brief

**Status**: Ready for implementation
**Author**: web_designer
**Date**: 2026-03-27
**Target**: web_coder
**Design system version**: 3.14

---

## 1. Philosophy

Cogtrix WebUI is a professional productivity tool. It is used by people who may have many browser tabs, meetings, or terminal windows open alongside it. Sound in this context serves one purpose: to offload a small amount of attention from the screen. When an assistant response arrives after a long tool-chain, the user should not have to poll the UI — they can hear that it is ready.

This is the only valid justification for any sound in this application. Sounds that are rewards, surprises, or decorations are excluded. Sounds that accompany every interaction (clicks, hovers, navigation) are excluded. Only asynchronous completions and state transitions that the user cannot observe while looking away warrant a cue.

**Tonal target.**
The iPhone system sound palette is the character benchmark for this scheme. iPhone system sounds are short, warm, sine-based, high-frequency-forward, and non-jarring — they convey state without commanding attention. This is exactly the register Cogtrix sounds must occupy. The iPhone palette is named here as a reference point for character only; the actual Apple sounds are proprietary and must not be used (see §2.3).

**Guiding principles:**

1. **Opt-in by default.** Sounds are disabled on first load. The user consciously enables them. This respects the professional setting where unexpected audio is disruptive.

2. **Non-interruptive.** Every sound is extremely short (under 300 ms) and low-volume. No sound should compete with speech, music, or a colleague speaking.

3. **Functional, not expressive.** Sounds convey state, not emotion. A completion cue signals "done". An error cue signals "something needs your attention". Neither should feel congratulatory or alarming.

4. **Silence is the default response.** UI events that the user is already watching — button presses, form validation, navigation — get no sound. Audio adds zero value when the eyes are already on the outcome.

5. **No `prefers-reduced-motion` equivalence.** There is no `prefers-reduced-sound` media query in any current browser. The opt-in toggle is the sole accessibility mechanism. This is by design — the brief documents the rationale in §4.

---

## 2. Event Catalogue

### 2.1 Events that receive a sound

#### EVT-001 — Assistant response complete

| Property | Value |
|---|---|
| Trigger | The WebSocket `done` event fires for the active session (streaming ends, `AgentState` transitions to `idle`). |
| Character | Soft, high-pitched two-note chime. The interval is a gentle major second or minor third — not a full chord, not a single flat beep. The attack is immediate, the decay is smooth over ~200 ms. Think: a muted glass tap. In iPhone terms, the closest analogue in character is "Tri-tone" or the subtle built-in "Note" sound — two warm soft high tones with a clean attack. Match that register, not that exact pitch. |
| Relative volume | Very quiet (master 0.25–0.30 of Web Audio gain). |
| Rationale | The primary use case for sound in this UI. The user sent a message and switched focus. The chime signals they can come back. |

#### EVT-002 — Tool execution error / agent-level error

| Property | Value |
|---|---|
| Trigger | The WebSocket delivers an `error` event, or `AgentState` transitions to `error`. |
| Character | Two descending soft tones, slightly lower pitch than EVT-001. The interval conveys "not right" without being alarming. Duration ~220 ms total. In iPhone terms, aim for the character of a muted, descending version of an iPhone alert tone — not a harsh buzz, not a full-volume ding. Warmth and brevity take priority over urgency. |
| Relative volume | Quiet (master 0.30). Slightly louder than EVT-001 because it warrants faster attention, but still well below a notification ding. |
| Rationale | Errors during long tool chains may happen while the user is away. A distinct (but calm) cue distinguishes failure from success without requiring the user to read a status bar. |

#### EVT-003 — Inbound assistant chat message (Assistant page only)

| Property | Value |
|---|---|
| Trigger | A new chat arrives in `AssistantChatList` from the polling hook (`useAssistantChatsQuery`) — specifically, a chat transitions to a terminal state (`completed`, `failed`) that the user had not yet seen. |
| Character | Single very soft low-pitched tone, short decay (~150 ms). Distinctly different from EVT-001 to avoid confusion between a session response and an assistant-mode completion. In iPhone terms, the closest character reference is "Chime" or "Aurora" — a single gentle, low note that registers as a notification without demanding attention. |
| Relative volume | Very quiet (master 0.20). This is a background notification, not a call to action. |
| Rationale | The Assistant page handles outbound-campaign and scheduled-message completions that run entirely in the background. A subtle cue avoids requiring the user to keep watching the table. |

#### EVT-004 — Destructive action confirmed (optional, lowest priority)

| Property | Value |
|---|---|
| Trigger | The user confirms a destructive action in `ConfirmDialog` (e.g., delete session, revoke API key). |
| Character | Single quiet mid-pitched soft click, ~80 ms. No decay — immediately silent. In iPhone terms, the character reference is the iPhone keyboard click — very short, mid-pitched, immediate silence after the transient. The click confirms the action closed without lingering. |
| Relative volume | Very quiet (master 0.20). |
| Rationale | Provides tactile-equivalent closure for irreversible actions. Very low priority — if implementation complexity is high, this event should be dropped first. |

### 2.2 Events that do NOT receive a sound

The following are explicitly excluded. Any proposal to add sound to these must update this brief first.

| Event | Reason for exclusion |
|---|---|
| Button click (any) | User is already watching the result — sound adds nothing. |
| Form submission / save success | Toast provides sufficient feedback; user initiated and is watching. |
| Navigation / page change | Sound on routing is universally disliked in productivity tools. |
| Session created | Instantaneous, user-initiated, result is immediately visible. |
| WebSocket connected / reconnected | Connection events are infrastructure, not content. |
| Typing indicator appears | The user already sent a message and is watching the stream. |
| Tool activity started/updated | Rapid, frequent events — even EVT-001 fires only once per response. |
| New session in list (sessions page) | Background refresh, not user-relevant unless they are on that page. |
| Login / logout | Authentication events are modal — the page changes entirely. |
| Toast / notification appeared | Toast is visual; doubling with audio would double-notify. |
| Any hover or focus event | Hover/focus sounds are a known accessibility anti-pattern. |

### 2.3 Tonal Reference

**iPhone system sounds are the tonal benchmark for this scheme.**

The iPhone system sound palette — including tones such as Tri-tone, Note, Chime, Aurora, and the keyboard click — defines the character register that Cogtrix sounds must inhabit: short, warm, sine-based, high-frequency-forward, and non-jarring. These sounds are universally recognised as unobtrusive notification cues, which is exactly the register required here.

**The actual iPhone sounds are Apple's proprietary intellectual property and must NOT be used directly** — not as embedded audio files, not as recordings, not as transcriptions. Using them without a licence is a copyright violation.

**Implementation must achieve equivalent character through one of the following two approaches:**

(a) **Web Audio API synthesis.** Synthesise the envelope, pitch character, and tone quality using `OscillatorNode` (type `sine`) + `GainNode`. The §5 implementation sketch already mandates this approach for Cogtrix. A skilled implementer can match the warmth and brevity of iPhone tones entirely in code. This is the preferred approach.

(b) **Commercially licensed sound library.** If the synthesis approach does not achieve satisfactory warmth, substitute with short UI sound files from a library that provides a commercial licence covering web application use. Acceptable examples include Zapsplat (standard licence) or the Sonniss GDC game audio bundle. Selected files must be solo sine-character tones of duration ≤ 300 ms with no reverb tail, matching the warmth and brevity described in §2.1.

No other sources (free sound sites, converted Apple system files, YouTube rips) are acceptable.

---

## 3. Settings Integration

### 3.1 Toggle placement

The sound toggle lives in **Settings > General** tab, inside `ConfigFlagsForm`. It sits at the bottom of the General tab's divided-list form, below existing config flags. It is a single labeled row following the DS §5 Divided List pattern (`divide-y divide-zinc-200`).

Label: "Audio cues"
Description (muted text below label): "Play subtle sounds for response completion and errors."
Control: shadcn `Switch` component, `size` default.

This placement is correct because sound is a user-interface preference (not a system config or an API/model setting) and General is where the user expects UI-level preferences.

### 3.2 State persistence

Add `soundEnabled: boolean` to `useUIStore` in `src/lib/stores/ui-store.ts`, defaulting to `false`.

Add `setSoundEnabled: (enabled: boolean) => void` action.

Persist `soundEnabled` alongside `sessionsViewMode` and `sidebarCollapsed` in the `partialize` function. The existing `persist` middleware with key `"cogtrix-ui-prefs"` in localStorage handles this — no new storage key needed.

**Default**: `false`. Sounds are off until the user consciously enables them.

---

## 4. Accessibility

### 4.1 No `prefers-reduced-sound` equivalent

As of 2026, no browser implements a `prefers-reduced-sound` or `prefers-no-audio` media query. CSS media queries cannot suppress sound. This means the system cannot automatically respect a user's operating-system preference to reduce audio. The explicit opt-in toggle (disabled by default) is therefore the correct and complete accessibility mechanism — it gives every user full control without requiring any OS-level knowledge.

### 4.2 Screen reader interaction

Sounds are supplementary — they never replace visible state changes. Every event that triggers a sound (EVT-001 through EVT-004) already has a corresponding visible state change (streaming cursor disappears, error badge appears, table row updates, dialog closes). Screen readers announce these state changes via existing ARIA attributes (`aria-live`, `role="status"` on `AgentStateBadge`, etc.). The sound system must never be the sole signal for any state.

No ARIA attributes are required on the sound system itself. `<audio>` elements, if used, must have no visible rendering and no accessible name — they are purely programmatic. Web Audio API nodes have no DOM presence.

### 4.3 `prefers-reduced-motion` interaction

`prefers-reduced-motion` is a motion preference, not an audio preference. The sound system must not be gated on it. Do not suppress sound when `prefers-reduced-motion: reduce` is active — these are independent sensory dimensions. A user may want reduced animation while still wanting audio cues.

### 4.4 Volume ceiling

All sounds operate at a gain of ≤ 0.30 relative to Web Audio's full scale. This is a hard ceiling enforced in the hook — no event may exceed gain 0.30. This prevents jarring volume if the user's system audio is turned up high.

### 4.5 Focus management

Sounds must never trigger focus changes, scroll positions, or any DOM side-effect. They are fire-and-forget audio events only.

---

## 5. Implementation Sketch

This section is a brief for web_coder. It defines architecture decisions, not implementation details.

### 5.1 Hook location

`src/hooks/shared/useSound.ts`

The hook reads `soundEnabled` from `useUIStore`. If `false`, every call is a no-op. If `true`, it synthesises or plays the requested sound.

Signature (intent only — exact types are web_coder's decision):

```
useSound() => {
  playResponseComplete: () => void   // EVT-001
  playError: () => void              // EVT-002
  playInboundChat: () => void        // EVT-003
  playDestructiveConfirm: () => void // EVT-004
}
```

### 5.2 Web Audio API vs `<audio>` elements

Use the **Web Audio API** (`AudioContext`, `OscillatorNode`, `GainNode`). Do not use `<audio>` elements.

Rationale:
- `<audio>` elements require audio files. Audio files are binary assets that must be hosted, versioned, and loaded — adding deployment complexity for four 150 ms sounds is unjustified.
- Web Audio API synthesises tones programmatically. The sounds specified in §2.1 are simple sinusoidal tones — they are fully expressible with `OscillatorNode` (type `sine`) + `GainNode` envelope shaping. No file assets needed.
- Web Audio gives precise gain control (enforcing the §4.4 ceiling trivially).
- Web Audio latency is lower than `<audio>` element playback for short programmatic sounds.

### 5.3 AudioContext lifecycle

- Create the `AudioContext` lazily on first `play*` call, not at module load. Browsers require a user gesture before an `AudioContext` can produce sound. Since the user must have interacted with the settings toggle to enable sound, the first `play*` call after that toggle is guaranteed to be in a user-gesture context (or at most one interaction removed — which modern browsers permit).
- Store the `AudioContext` instance in a module-level ref inside the hook (or in a singleton outside React) so it is not recreated on re-renders.
- Handle the `suspended` state: if `audioContext.state === "suspended"`, call `audioContext.resume()` before scheduling nodes.

### 5.4 Preloading

No preloading is required or applicable. Web Audio API tones are synthesised at play time — there is nothing to preload. This is an advantage over the `<audio>` file approach.

### 5.5 Call sites

| Hook call | Call site file | Trigger condition |
|---|---|---|
| `playResponseComplete` | `src/pages/chat/SessionPage.tsx` (or wherever `AgentState` transitions to `idle` are observed) | `agentState` transitions from a non-idle state to `idle` |
| `playError` | Same location — observe `agentState === "error"` transition | `agentState` transitions to `error` |
| `playInboundChat` | `src/pages/assistant/AssistantChatList.tsx` | New completed/failed chat detected by polling diff |
| `playDestructiveConfirm` | `src/components/ConfirmDialog.tsx` | `onConfirm` callback fires |

For the `agentState` transition cases: use a `useEffect` that tracks the previous value of `agentState` (via a `useRef`) and fires the sound only on the transition, not on every render where the state happens to be `idle`.

### 5.6 Settings page wiring

In `ConfigFlagsForm.tsx`, add a row at the bottom of the divided-list form. The row calls `useUIStore`'s `soundEnabled` and `setSoundEnabled` directly — no separate query or mutation is needed (this is a local preference, not a backend config flag).

---

## 6. Out of Scope

The following are explicitly deferred and must not be implemented as part of this feature:

- Volume slider (beyond the hard-coded gain ceiling). The binary toggle is sufficient for v1.
- Per-event enable/disable granularity. The single toggle covers all four events.
- Custom sound upload or selection. This is a productivity tool, not a customisation platform.
- Spatial audio or stereo panning. Mono synthesis only.
- Sound on mobile / touch devices. EVT-001 through EVT-004 are all valid on mobile in principle, but mobile browsers have stricter `AudioContext` autoplay policies. If the first play attempt fails silently, that is acceptable — do not add complex mobile-specific workarounds in v1.
