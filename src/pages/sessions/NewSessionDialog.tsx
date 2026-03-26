import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useModelsQuery } from "@/hooks/shared/useModelsQuery";
import { ApiError } from "@/lib/api/types/common";
import { cn } from "@/lib/utils";
import type { SessionOut, SessionCreateRequest, MemoryMode } from "@/lib/api/types/session";

const DEFAULT_VALUE = "__default__";

interface FormState {
  name: string;
  model: string;
  memoryMode: string;
  systemPrompt: string;
  maxSteps: string;
  contextCompression: boolean | null;
}

const INITIAL_FORM: FormState = {
  name: "",
  model: DEFAULT_VALUE,
  memoryMode: DEFAULT_VALUE,
  systemPrompt: "",
  maxSteps: "",
  contextCompression: null,
};

function toApiValue(value: string): string | undefined {
  return value === DEFAULT_VALUE ? undefined : value;
}

export function NewSessionDialog({ triggerCy }: { triggerCy?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [nameError, setNameError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const modelsQuery = useModelsQuery({ enabled: open, staleTime: 60_000 });

  const createMutation = useMutation({
    mutationFn: (req: SessionCreateRequest) => api.post<SessionOut>("/sessions", req),
    onSuccess: (session) => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      setOpen(false);
      setForm(INITIAL_FORM);
      setNameError(null);
      navigate(`/sessions/${session.id}`);
    },
    onError: (error: Error) => {
      if (error instanceof ApiError && error.code === "SESSION_NAME_DUPLICATE") {
        setNameError(error.message);
      } else {
        toast.error(error.message);
      }
    },
  });

  function handleCreate() {
    const model = toApiValue(form.model);
    const memoryMode = toApiValue(form.memoryMode) as MemoryMode | undefined;
    const systemPrompt = form.systemPrompt.trim() || null;
    const maxStepsRaw = parseInt(form.maxSteps, 10);
    const maxSteps =
      !isNaN(maxStepsRaw) && maxStepsRaw >= 1 && maxStepsRaw <= 200 ? maxStepsRaw : null;
    const contextCompression = form.contextCompression;

    const hasConfig =
      model !== undefined ||
      memoryMode !== undefined ||
      systemPrompt !== null ||
      maxSteps !== null ||
      contextCompression !== null;

    const req: SessionCreateRequest = {
      name: form.name.trim() || undefined,
      config: hasConfig
        ? {
            model,
            memory_mode: memoryMode,
            system_prompt: systemPrompt,
            max_steps: maxSteps,
            context_compression: contextCompression,
          }
        : undefined,
    };
    createMutation.mutate(req);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setForm(INITIAL_FORM);
      setNameError(null);
      setAdvancedOpen(false);
    }
    setOpen(nextOpen);
  }

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button {...(triggerCy ? { "data-cy": triggerCy } : {})} className="gap-2">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Session</DialogTitle>
          <DialogDescription>Configure and create a new chat session.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="session-name">Name</Label>
            <Input
              id="session-name"
              placeholder="Untitled Session"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                setNameError(null);
              }}
              disabled={isLoading}
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? "session-name-error" : undefined}
            />
            {nameError && (
              <p id="session-name-error" className="text-sm text-red-600">
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-model">Model</Label>
            <Select
              value={form.model}
              onValueChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
              disabled={isLoading}
            >
              <SelectTrigger id="session-model" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_VALUE}>Default</SelectItem>
                {modelsQuery.data?.map((m) => (
                  <SelectItem key={m.alias} value={m.alias}>
                    {m.alias}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modelsQuery.isError && <p className="text-sm text-red-600">Failed to load models</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-memory">Memory mode</Label>
            <Select
              value={form.memoryMode}
              onValueChange={(value) => setForm((prev) => ({ ...prev, memoryMode: value }))}
              disabled={isLoading}
            >
              <SelectTrigger id="session-memory" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_VALUE}>Default</SelectItem>
                <SelectItem value="conversation">Conversation</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="reasoning">Reasoning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced section */}
          <div>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full justify-between px-0 text-zinc-600 hover:bg-transparent hover:text-zinc-900"
            >
              Advanced
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")}
              />
            </Button>

            {advancedOpen && (
              <>
                <hr className="border-zinc-200" />
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="session-system-prompt">System prompt</Label>
                    <Textarea
                      id="session-system-prompt"
                      placeholder="Override system prompt for this session (optional)"
                      rows={4}
                      className="min-h-[96px] resize-y text-sm"
                      maxLength={32768}
                      value={form.systemPrompt}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, systemPrompt: e.target.value }))
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="session-max-steps">Max steps</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="session-max-steps"
                        type="number"
                        min={1}
                        max={200}
                        placeholder="100"
                        className="w-24"
                        value={form.maxSteps}
                        onChange={(e) => setForm((prev) => ({ ...prev, maxSteps: e.target.value }))}
                        disabled={isLoading}
                      />
                      <span className="text-sm text-zinc-500">default: 100, max: 200</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="session-context-compression">Context compression</Label>
                      <p className="text-xs text-zinc-500">Use global setting when off</p>
                    </div>
                    <Switch
                      id="session-context-compression"
                      checked={form.contextCompression ?? false}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, contextCompression: checked }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            data-cy="cancel-session"
          >
            Cancel
          </Button>
          <Button
            className="min-h-11"
            data-cy="create-session"
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewSessionDialog;
