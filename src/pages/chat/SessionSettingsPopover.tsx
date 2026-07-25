import { useState } from "react";
import { Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/shared/useMediaQuery";
import { useModelsQuery } from "@/hooks/shared/useModelsQuery";
import type { SessionOut, SessionConfig } from "@/lib/api/types/session";

const DEFAULT_MODEL = "__default__";

interface SessionSettingsPopoverProps {
  session: SessionOut;
  onSave: (config: Partial<SessionConfig>) => Promise<unknown>;
  isSaving: boolean;
}

interface DraftState {
  model: string | null;
  systemPrompt: string | null;
  maxSteps: string;
  contextCompression: boolean | null;
}

function draftFromConfig(config: SessionConfig): DraftState {
  return {
    model: config.model ?? null,
    systemPrompt: config.system_prompt ?? null,
    maxSteps: config.max_steps != null ? String(config.max_steps) : "",
    contextCompression: config.context_compression ?? null,
  };
}

function isDirtyCheck(draft: DraftState, config: SessionConfig): boolean {
  if ((draft.model ?? null) !== (config.model ?? null)) return true;

  const draftSystemPrompt = draft.systemPrompt?.trim() || null;
  const configSystemPrompt = config.system_prompt ?? null;
  if (draftSystemPrompt !== configSystemPrompt) return true;

  const draftMaxSteps = draft.maxSteps !== "" ? parseInt(draft.maxSteps, 10) : null;
  const configMaxSteps = config.max_steps ?? null;
  if (draftMaxSteps !== configMaxSteps) return true;

  const draftCompression = draft.contextCompression;
  const configCompression = config.context_compression ?? null;
  if (draftCompression !== configCompression) return true;

  return false;
}

export function SessionSettingsPopover({ session, onSave, isSaving }: SessionSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(() => draftFromConfig(session.config));
  const [maxStepsError, setMaxStepsError] = useState<string | null>(null);

  const isMobile = useMediaQuery("(max-width: 1023px)");
  const modelsQuery = useModelsQuery({ staleTime: 5 * 60_000 });

  const isDirty = isDirtyCheck(draft, session.config);

  async function handleSave() {
    const systemPrompt = draft.systemPrompt?.trim() || null;
    // Number(), not parseInt(): <input type="number"> accepts exponent notation
    // and parseInt("1e3") silently yields 1. An out-of-range value must block the
    // save rather than collapse to null — null means "reset to the global
    // default", so the old code discarded the entry and still toasted success.
    const maxStepsRaw = draft.maxSteps !== "" ? Number(draft.maxSteps) : null;
    if (
      maxStepsRaw !== null &&
      (!Number.isInteger(maxStepsRaw) || maxStepsRaw < 1 || maxStepsRaw > 200)
    ) {
      setMaxStepsError("Enter a whole number between 1 and 200, or leave blank for the default.");
      return;
    }
    setMaxStepsError(null);
    const maxSteps = maxStepsRaw;
    const contextCompression = draft.contextCompression;

    try {
      await onSave({
        model: draft.model,
        system_prompt: systemPrompt,
        max_steps: maxSteps,
        context_compression: contextCompression,
      });
      setOpen(false);
    } catch {
      // onSave surfaces the error via toast in the parent mutation's onError handler
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(draftFromConfig(session.config));
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-11 w-11 text-zinc-500 hover:text-zinc-900",
            open && "bg-teal-50 text-teal-600 hover:bg-teal-100",
          )}
          aria-label="Session settings"
          data-cy="session-settings"
          aria-pressed={open}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={isMobile ? "center" : "end"} sideOffset={8} className="w-80 p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h3 className="text-sm font-semibold text-zinc-900">Session settings</h3>
            <span className="text-xs text-zinc-500">Changes saved on click</span>
          </div>

          {/* Model */}
          {modelsQuery.data && modelsQuery.data.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="sp-model">Model</Label>
              <Select
                value={draft.model ?? DEFAULT_MODEL}
                onValueChange={(v) =>
                  setDraft((prev) => ({ ...prev, model: v === DEFAULT_MODEL ? null : v }))
                }
                disabled={isSaving}
              >
                <SelectTrigger id="sp-model" className="w-full" data-cy="session-model-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_MODEL}>Default</SelectItem>
                  {modelsQuery.data.map((m) => (
                    <SelectItem key={m.alias} value={m.alias}>
                      {m.alias}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* System prompt */}
          <div className="space-y-1.5">
            <Label htmlFor="sp-system-prompt">System prompt</Label>
            <Textarea
              id="sp-system-prompt"
              value={draft.systemPrompt ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, systemPrompt: e.target.value || null }))
              }
              placeholder="Default system prompt (inherited from global settings)"
              rows={3}
              className="min-h-[72px] resize-none text-sm"
              maxLength={32768}
              disabled={isSaving}
            />
          </div>

          {/* Max steps */}
          <div className="space-y-1.5">
            <Label htmlFor="sp-max-steps">Max steps</Label>
            <div className="flex items-center gap-3">
              <Input
                id="sp-max-steps"
                type="number"
                min={1}
                max={200}
                value={draft.maxSteps}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, maxSteps: e.target.value }));
                  setMaxStepsError(null);
                }}
                placeholder="100"
                className="w-24"
                disabled={isSaving}
                aria-invalid={maxStepsError !== null}
              />
              <span className="text-sm text-zinc-500">default: 100, max: 200</span>
            </div>
            {maxStepsError && <p className="mt-1.5 text-sm text-red-600">{maxStepsError}</p>}
          </div>

          {/* Context compression */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sp-context-compression">Context compression</Label>
              <p className="text-xs text-zinc-500">Use global setting when off</p>
            </div>
            <Switch
              id="sp-context-compression"
              checked={draft.contextCompression ?? false}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, contextCompression: checked }))
              }
              disabled={isSaving}
            />
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!isDirty || isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SessionSettingsPopover;
