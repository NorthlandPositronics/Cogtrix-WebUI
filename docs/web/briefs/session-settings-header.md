# Layout Brief: SessionHeader — Settings Popover

**Component**: `SessionHeader` (extended)
**Location**: `src/pages/chat/SessionHeader.tsx`
**Pattern reference**: Existing ghost icon button row in `SessionHeader` right slot — button sizing (`h-11 w-11`), icon size (`h-5 w-5`), and icon color (`text-zinc-500`) must match existing buttons exactly.

---

## 1. Context and Purpose

The session header right slot currently contains: model select, clear history button (Trash2), memory panel toggle (Brain), tools panel toggle (Wrench). Three `SessionConfig` fields have no in-session edit UI:

- `system_prompt: string | null` — per-session system prompt override
- `max_steps: number | null` — max agent iterations (1–200, null = global default)
- `context_compression: boolean | null` — null = use global setting

A full dialog for these settings would be disproportionately heavy — the user cannot send messages while a dialog is open, and these settings are secondary to the active conversation. A **Popover** is the correct pattern: it floats adjacent to the trigger, does not block the header or message thread, and can be dismissed by clicking outside.

**Why a popover and not a dialog**: Dialogs carry a modal backdrop that blocks all interaction with the page. Session settings are non-destructive edits that coexist with reading the message thread — the user may want to check the current prompt before saving a new one. Popovers carry `shadow-md` (floating elevation) and appear inline without blocking context.

---

## 2. Trigger Button

A `Settings` gear icon button is added to the right slot of the session header, inserted **between the model select and the Trash2 button**.

```
Button
  variant="ghost"
  size="icon"
  className="h-11 w-11 text-zinc-500 hover:text-zinc-900"
  aria-label="Session settings"
  data-cy="session-settings"
└── Settings  className="h-5 w-5"    ← lucide-react Settings icon (gear)
```

**Active/open state**: When the popover is open, the button receives the same active treatment as the Memory and Tools panel toggles: `bg-teal-50 text-teal-600 hover:bg-teal-100`. This visually communicates that the popover is open and anchored to this button.

**Placement rationale**: The Settings trigger logically precedes the destructive Trash2 button. Grouping it near the model select keeps all session-configuration controls adjacent.

---

## 3. Popover Structure

Uses shadcn/ui `Popover`, `PopoverTrigger`, `PopoverContent`.

```
Popover
├── PopoverTrigger asChild
│   └── [Settings button — §2]
└── PopoverContent
      align="end"
      sideOffset={8}
      className="w-80 p-4"
```

`w-80` (320px) is wide enough to display the system prompt textarea at a readable line length (approximately 40–45 characters per line at `text-sm`) without the popover overflowing the right edge of the viewport on typical desktop widths. On the narrowest supported viewport (375px mobile), the popover would overlap the left panel — see §7 for the mobile treatment.

`align="end"` aligns the popover's right edge with the trigger button's right edge, keeping it within the right-side chrome. `sideOffset={8}` provides 8px clearance from the header bottom border.

`shadow-md` is applied via shadcn/ui `PopoverContent` default — this is the "floating" elevation tier per the design system. No additional shadow override is needed.

---

## 4. Popover Internal Layout

```
PopoverContent  w-80 p-4
└── div.space-y-4
    ├── [Popover header]                  — §4.1
    ├── [System prompt field]             — §4.2
    ├── [Max steps field]                 — §4.3
    ├── [Context compression field]       — §4.4
    └── [Save button row]                 — §4.5
```

Total popover height (estimated): approximately 380–420px depending on the system prompt textarea height. This fits within a 768px viewport with the 56px header offset.

### 4.1 Popover header

```
div.flex.items-center.justify-between.pb-2.border-b.border-zinc-200
├── h3.text-sm.font-semibold.text-zinc-900  "Session settings"
└── span.text-xs.text-zinc-500              "Changes saved on click"
```

The header row uses `pb-2 border-b border-zinc-200` to visually separate it from the fields. The right-side sub-label "Changes saved on click" sets expectations: this is not auto-save. `text-sm font-semibold` for the title (matches pattern used for panel headers throughout the codebase). `text-xs text-zinc-500` for the sub-label (muted, informational).

### 4.2 System prompt field

```
div.space-y-1.5
├── Label htmlFor="sp-system-prompt"  "System prompt"
└── Textarea
      id="sp-system-prompt"
      value={draft.systemPrompt ?? ""}
      onChange={...}
      placeholder="Default system prompt (inherited from global settings)"
      rows={3}
      className="min-h-[72px] resize-none text-sm"
      maxLength={32768}
```

- `rows={3}` (72px min height — 3 lines of `text-sm` at `leading-normal`). This is intentionally shorter than the NewSessionDialog textarea (4 rows) because the popover has limited vertical budget.
- `resize-none` because the popover has a fixed width and a flexible height — allowing resize would make the popover unpredictably large and break the `align="end"` positioning.
- Placeholder text describes what the null/empty value means: "Default system prompt (inherited from global settings)". This is more informative than a generic optional label because the user needs to understand that clearing the field restores global behavior.
- `maxLength={32768}` matches the backend constraint.

### 4.3 Max steps field

```
div.space-y-1.5
├── Label htmlFor="sp-max-steps"  "Max steps"
└── div.flex.items-center.gap-3
    ├── Input
    │     id="sp-max-steps"
    │     type="number"
    │     min={1}
    │     max={200}
    │     value={draft.maxSteps ?? ""}
    │     onChange={...}
    │     placeholder="100"
    │     className="w-24"
    └── span.text-sm.text-zinc-500  "default: 100, max: 200"
```

Identical layout to the NewSessionDialog field (§3.4 of `session-config-dialog.md`). `w-24` for the input, helper span to the right. An empty/null value means "use global default".

### 4.4 Context compression field

```
div.flex.items-center.justify-between
├── div.space-y-0.5
│   ├── Label htmlFor="sp-context-compression"  "Context compression"
│   └── p.text-xs.text-zinc-500  "Use global setting when off"
└── Switch
      id="sp-context-compression"
      checked={draft.contextCompression ?? false}
      onCheckedChange={...}
```

Identical pattern to the NewSessionDialog field. Label left, Switch right. Sub-label explains the null-as-unchecked convention. Initial state reflects the current `session.config.context_compression` value (null renders as unchecked).

### 4.5 Save button row

```
div.flex.justify-end.pt-2
└── Button
      className="gap-1.5"
      size="sm"
      disabled={!isDirty || saveMutation.isPending}
      onClick={handleSave}
├── [pending]  Loader2 className="h-4 w-4 animate-spin"
└── [idle]     "Save"
```

- `size="sm"` keeps the button compact and proportional to the popover context.
- `disabled={!isDirty}` prevents accidental no-op saves — the button is only active when the draft state differs from the saved state.
- `pt-2` above the button row provides 8px breathing room from the context compression field.
- On save: `PATCH /sessions/{id}` with `{ config: { system_prompt, max_steps, context_compression } }`. On success: toast ("Settings saved"), invalidate `keys.sessions.detail(id)`, close the popover. On error: toast.error.

**Why the popover closes on successful save**: The popover's purpose is a one-shot edit — not a persistent side panel. Closing it on success returns focus to the message thread immediately, which is the most common next action.

---

## 5. Draft State and Dirty Detection

The popover manages a local draft state initialised from the current `session.config` whenever the popover opens. This ensures the user always sees the current server state as the starting point, even if a previous session rendered this component with stale data.

```
// initialised on PopoverContent mount (or when open → true):
draft = {
  systemPrompt: session.config.system_prompt ?? null,
  maxSteps: session.config.max_steps ?? null,
  contextCompression: session.config.context_compression ?? null,
}
```

`isDirty` is true when any draft value differs from the corresponding `session.config` field. The Save button becomes enabled only when dirty.

The draft is discarded on popover close without saving (user clicks outside or presses Escape). No confirmation is shown for unsaved changes — the fields are non-destructive and easy to re-enter.

---

## 6. Complete Popover Layout (Annotation for Mockup)

```
┌────────────────────────────────────────────────┐
│  Session settings              Changes saved on click │
│ ──────────────────────────────────────────────│
│                                                │
│  System prompt                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Default system prompt (inherited from    │  │
│  │ global settings)                         │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  Max steps                                     │
│  ┌────────┐  default: 100, max: 200            │
│  │        │                                    │
│  └────────┘                                    │
│                                                │
│  Context compression             ┌──┐          │
│  Use global setting when off     │  │          │
│                                  └──┘          │
│                                                │
│                               [Save]           │
└────────────────────────────────────────────────┘
```

The popover appears directly below the Settings button, aligned to its right edge, with an 8px gap from the header bottom border.

The settings button in the header shows the active teal state (`bg-teal-50 text-teal-600`) while the popover is open.

---

## 7. Responsive Behavior

**Desktop (`lg+`)**: Popover appears as described above. `align="end"` keeps it within the right-side chrome.

**Mobile (`< lg`)**: On narrow viewports, the right-slot buttons are still rendered in the header. The popover at `w-80` (320px) may cause overflow at 375px viewport width. Two options:

1. Use `align="center"` at mobile breakpoints so the popover centers under the trigger rather than aligning to its right edge.
2. Use `w-[calc(100vw-2rem)]` at mobile so the popover fills the viewport width minus page margins.

**Recommended**: Option 1 (`align="center"` at mobile). This is simpler and avoids a dynamic width calculation. The `graphic_designer` mockup should show the desktop state only — the mobile variant is an implementation detail for `web_coder` to handle via a `useMediaQuery` guard on the `align` prop.

---

## 8. Header Right Slot — Final Button Order

After this change, the right slot reads left to right:

1. Model select (`w-24 lg:w-32`)
2. Settings button (`h-11 w-11`) — NEW
3. Trash2 / Clear history button (`h-11 w-11`)
4. Brain / Memory panel toggle (`h-11 w-11`)
5. Wrench / Tools panel toggle (`h-11 w-11`)

The model select stays leftmost (it is the most prominent in-session setting). The Settings gear comes immediately after — it is thematically grouped with model selection as a "configuration" cluster. Destructive (Trash2) and panel toggles follow.

---

## 9. Token and Class Reference

| Element | Classes |
|---|---|
| Trigger button (rest) | `h-11 w-11 text-zinc-500 hover:text-zinc-900` |
| Trigger button (popover open) | `bg-teal-50 text-teal-600 hover:bg-teal-100` |
| PopoverContent | `w-80 p-4` |
| Popover header row | `flex items-center justify-between pb-2 border-b border-zinc-200` |
| Popover title | `text-sm font-semibold text-zinc-900` |
| Popover sub-label | `text-xs text-zinc-500` |
| Field container | `space-y-4` |
| Label | shadcn/ui default (`text-sm font-medium`) |
| Helper / sub-label text | `text-xs text-zinc-500` |
| Textarea | `min-h-[72px] resize-none text-sm` |
| Number input | `w-24` |
| Number input helper span | `text-sm text-zinc-500` |
| Switch row | `flex items-center justify-between` |
| Save button row | `flex justify-end pt-2` |
| Save button | `size="sm" gap-1.5` |

---

## 10. Mockup Deliverables

The `graphic_designer` must produce one SVG file:

**`docs/web/mockups/session-settings-popover.svg`**

The SVG must contain two frames:

1. **Frame A — Header context**: A cropped view of the session header (full header bar width, 56px tall) showing the right-slot buttons including the new Settings gear button in its active/open state (`bg-teal-50 text-teal-600`). The popover renders below it, connected visually by the 8px gap. The existing model select, Trash2, Brain, and Wrench buttons are shown in their normal rest state.

2. **Frame B — Popover close-up**: The popover at full fidelity — all fields filled with representative placeholder content to show the layout at rest. System prompt textarea shows a two-line example prompt. Max steps shows "50". Context compression Switch shows checked (teal). Save button is enabled (solid teal background, `text-white`).

SVG dimensions: Frame A approximately 900px wide × 120px tall (header + popover attached). Frame B approximately 360px wide × 450px tall. Total canvas approximately 1320px wide × 500px tall with labels between frames.

Use the established mockup palette: white surfaces, `#e4e4e7` borders, `#18181b` primary text, `#71717a` muted text, `#0d9488` for the Settings button active state and the Save button fill, `#f0fdfa` (`teal-50`) for the active button background. The popover box uses `shadow-md` — represent with a subtle dropped shadow in the SVG.

---

## 11. Interaction States

| State | Behavior |
|---|---|
| Popover closed | Settings button at rest (`text-zinc-500`) |
| Popover open | Settings button teal active state; popover visible with current config values |
| Draft unchanged | Save button disabled |
| Draft changed | Save button enabled |
| Save pending | Loader2 spinner in Save button; all fields disabled |
| Save success | Toast "Settings saved"; popover closes; button returns to rest state |
| Save error | Toast error message; popover remains open; fields re-enabled |
| Click outside popover | Popover closes; draft discarded silently |
| Escape key | Popover closes; draft discarded silently |
| Agent active (non-idle state) | Settings button remains interactive — these are non-streaming fields and can be changed mid-session. The model select is already disabled when the agent is not idle; this popover does not carry that restriction because system_prompt/max_steps/context_compression only take effect on the next invocation. |

---

## 12. Implementation Notes (for web_coder, not for graphic_designer)

- The popover uses the `open`/`onOpenChange` controlled pattern so the active button state can be tied to `open`.
- Draft state is initialized in a `useEffect` on `open` changing to `true` — ensures stale draft does not persist if the session prop updates between popover opens.
- The mutation calls `api.patch<SessionOut>(\`/sessions/${session.id}\`, { config: { system_prompt: draft.systemPrompt, max_steps: draft.maxSteps, context_compression: draft.contextCompression } })`. Null values in the payload should be sent as `null` (not omitted) because the PATCH semantics for `SessionConfig` use null to mean "clear this override and use the global setting".
- Invalidate `keys.sessions.detail(session.id)` on success so the header's `session` prop re-fetches the updated config.
- Extract to a new component `src/pages/chat/SessionSettingsPopover.tsx` to keep `SessionHeader.tsx` from growing too large.
