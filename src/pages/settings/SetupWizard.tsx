import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2, Wand2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types/common";
import type { WizardStartRequest, WizardStepRequest, WizardStepOut } from "@/lib/api/types/config";
import { useConfigQuery } from "@/hooks/shared/useConfigQuery";
import {
  markdownComponents,
  REMARK_PLUGINS,
  REHYPE_PLUGINS,
} from "@/components/MarkdownComponents";
import { YamlBlock } from "@/components/YamlBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Strip internal backend protocol instructions from the question before display.
// e.g. "YAML config detected. Send data: {accept: true} to save it."
function stripProtocolLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^YAML\s+\w+\s+detected\./i.test(line.trim()))
    .join("\n")
    .trim();
}

type WizardState = "idle" | "active" | "complete" | "error";
type ProviderType = "ollama" | "openai" | "anthropic" | "google";

const PROVIDER_LABELS: Record<ProviderType, string> = {
  ollama: "Ollama (local)",
  openai: "OpenAI / OpenAI-compatible",
  anthropic: "Anthropic",
  google: "Google",
};

const DEFAULT_MODELS: Record<ProviderType, string> = {
  ollama: "qwen3:8b",
  openai: "gpt-4.1-mini",
  anthropic: "claude-sonnet-4-6",
  google: "gemini-2.5-flash",
};

const STANDARD_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com",
  google: "https://generativelanguage.googleapis.com",
};

interface LlmFormState {
  providerType: ProviderType;
  providerName: string;
  apiKey: string;
  hasExistingKey: boolean;
  baseUrl: string;
  model: string;
}

export function SetupWizard() {
  const [wizardState, setWizardState] = useState<WizardState>("idle");
  const [step, setStep] = useState<WizardStepOut | null>(null);
  const [answer, setAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slowHint, setSlowHint] = useState(false);
  const slowHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Query current config to pre-fill Step 0 form
  const { data: currentConfig } = useConfigQuery({
    enabled: wizardState === "idle",
    staleTime: 30_000,
  });

  // Derive initial Step 0 values from the running config
  function deriveInitialForm(): LlmFormState {
    const providers = currentConfig?.providers ?? [];
    const firstProvider = providers[0];
    if (firstProvider) {
      const pt =
        (firstProvider.type as ProviderType) in PROVIDER_LABELS
          ? (firstProvider.type as ProviderType)
          : "openai";
      const activeModel = currentConfig?.models.find((m) => m.is_active);
      return {
        providerType: pt,
        providerName: firstProvider.name,
        apiKey: "",
        hasExistingKey: firstProvider.has_api_key,
        baseUrl: firstProvider.base_url ?? "",
        model: activeModel?.model_name ?? DEFAULT_MODELS[pt],
      };
    }
    return {
      providerType: "ollama",
      providerName: "ollama",
      apiKey: "",
      hasExistingKey: false,
      baseUrl: "",
      model: DEFAULT_MODELS.ollama,
    };
  }

  const [llmForm, setLlmForm] = useState<LlmFormState>(() => ({
    providerType: "ollama",
    providerName: "ollama",
    apiKey: "",
    hasExistingKey: false,
    baseUrl: "",
    model: DEFAULT_MODELS.ollama,
  }));

  // Re-seed the form once config loads (only while idle, not during an active wizard)
  useEffect(() => {
    if (wizardState === "idle" && currentConfig) {
      setLlmForm(deriveInitialForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConfig, wizardState]);

  useEffect(() => {
    if (
      wizardState === "active" &&
      step &&
      step.step > 0 &&
      !step.requires_acceptance &&
      textareaRef.current
    ) {
      textareaRef.current.focus();
    }
  }, [step, wizardState]);

  const isStep0 = step !== null && step.step === 0;
  const isAcceptanceStep = step !== null && step.requires_acceptance === true;

  const startMutation = useMutation({
    mutationFn: (req: WizardStartRequest) => api.post<WizardStepOut>("/config/wizard", req),
    onSuccess: (data) => {
      setStep(data);
      setWizardState("active");
      setAnswer("");
      setErrorMessage(null);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Failed to start wizard";
      setErrorMessage(msg);
      setWizardState("error");
    },
  });

  const advanceMutation = useMutation({
    mutationFn: (req: { wizardId: string; body: WizardStepRequest }) =>
      // Step 0 tests connection AND invokes the LLM to generate the first question —
      // allow up to 5 minutes for slow/remote models loading for the first time.
      api.post<WizardStepOut>(`/config/wizard/${req.wizardId}/step`, req.body, {
        timeoutMs: 5 * 60 * 1000,
      }),
    onSuccess: (data) => {
      setStep(data);
      setAnswer("");
      if (data.complete) {
        setWizardState("complete");
      }
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "PROVIDER_UNREACHABLE") {
        setErrorMessage(
          "The LLM provider is unreachable. Check your provider settings and API key, then try again.",
        );
        setWizardState("error");
      } else {
        toast.error(err instanceof ApiError ? err.message : "Wizard step failed");
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (wizardId: string) => api.delete(`/config/wizard/${wizardId}`),
    onSuccess: () => {
      setWizardState("idle");
      setStep(null);
      setAnswer("");
      setErrorMessage(null);
    },
    onError: () => {
      toast.error("Failed to cancel wizard");
    },
  });

  // Show a "taking longer than expected" hint after 8 s of pending on Step 0.
  // Must be after advanceMutation and isStep0 are defined.
  useEffect(() => {
    if (advanceMutation.isPending && isStep0) {
      slowHintTimerRef.current = setTimeout(() => setSlowHint(true), 8_000);
    } else {
      if (slowHintTimerRef.current) clearTimeout(slowHintTimerRef.current);
      setSlowHint(false);
    }
    return () => {
      if (slowHintTimerRef.current) clearTimeout(slowHintTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceMutation.isPending]);

  function handleStart(editExisting: boolean) {
    startMutation.mutate({ edit_existing: editExisting });
  }

  function handleSubmitLlmForm() {
    if (!step) return;
    const data: Record<string, string> = {
      provider_type: llmForm.providerType,
      provider_name: llmForm.providerName.trim() || llmForm.providerType,
      model: llmForm.model || DEFAULT_MODELS[llmForm.providerType],
    };
    if (llmForm.apiKey.trim()) data.api_key = llmForm.apiKey.trim();
    if (llmForm.baseUrl.trim()) data.base_url = llmForm.baseUrl.trim();
    advanceMutation.mutate({ wizardId: step.wizard_id, body: { data } });
  }

  function handleSubmitAnswer() {
    if (!step || !answer.trim()) return;
    advanceMutation.mutate({ wizardId: step.wizard_id, body: { answer: answer.trim() } });
  }

  function handleAccept() {
    if (!step) return;
    advanceMutation.mutate({ wizardId: step.wizard_id, body: { data: { accept: true } } });
  }

  function handleReject() {
    if (!step) return;
    advanceMutation.mutate({ wizardId: step.wizard_id, body: { data: { accept: false } } });
  }

  function handleCancel() {
    if (step) {
      cancelMutation.mutate(step.wizard_id);
    } else {
      setWizardState("idle");
      setErrorMessage(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  }

  const isPending =
    startMutation.isPending || advanceMutation.isPending || cancelMutation.isPending;
  const progressPercent = step ? Math.round((step.step / step.total_steps) * 100) : 0;

  if (wizardState === "idle") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-2">
          <Wand2 className="size-5 text-teal-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-zinc-900">Setup Wizard</h2>
        </div>
        <p className="text-sm leading-relaxed text-zinc-500">
          The setup wizard guides you through configuring Cogtrix step by step — provider selection,
          API keys, model setup, and more. Your answers are used to generate or update the
          configuration file.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => handleStart(false)} disabled={isPending} className="min-h-11">
            {startMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Start new configuration"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleStart(true)}
            disabled={isPending}
            className="min-h-11"
          >
            {startMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Edit existing"
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (wizardState === "error") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-700" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-zinc-900">Wizard unavailable</h2>
        </div>
        <p className="text-sm leading-relaxed text-zinc-500">{errorMessage}</p>
        <Button variant="outline" onClick={() => setWizardState("idle")} className="min-h-11">
          Back
        </Button>
      </div>
    );
  }

  if (wizardState === "complete") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-green-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-zinc-900">Configuration complete</h2>
        </div>
        {step?.warnings && step.warnings.length > 0 && (
          <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-700">Warnings</p>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700">
              {step.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        {step?.yaml_preview && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-500">Generated configuration</p>
            <YamlBlock code={step.yaml_preview} />
          </div>
        )}
        <Button onClick={() => setWizardState("idle")} className="min-h-11">
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="size-5 text-teal-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-zinc-900">
              {step?.step_name ?? "Setup Wizard"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="min-h-11 text-zinc-500 hover:text-zinc-900"
            aria-label="Cancel wizard"
          >
            {cancelMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
          </Button>
        </div>
        {step && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                Step {step.step} of {step.total_steps}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1" />
          </div>
        )}
      </div>

      {/* Step 0 — structured LLM connection form */}
      {isStep0 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Choose the LLM provider the wizard will use to drive configuration. This is the model
            that will answer your questions during setup.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="wiz-provider">Provider type</Label>
            <Select
              value={llmForm.providerType}
              onValueChange={(v) => {
                const pt = v as ProviderType;
                setLlmForm((f) => ({
                  ...f,
                  providerType: pt,
                  providerName: pt,
                  baseUrl: "",
                  apiKey: "",
                  hasExistingKey: false,
                  model: DEFAULT_MODELS[pt],
                }));
              }}
            >
              <SelectTrigger id="wiz-provider" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROVIDER_LABELS) as ProviderType[]).map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {PROVIDER_LABELS[pt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wiz-baseurl">
              Base URL
              <span className="ml-1 text-zinc-500">
                (optional — leave blank for default{" "}
                {STANDARD_BASE_URLS[llmForm.providerType] ?? "endpoint"})
              </span>
            </Label>
            <Input
              id="wiz-baseurl"
              value={llmForm.baseUrl}
              onChange={(e) => setLlmForm((f) => ({ ...f, baseUrl: e.target.value }))}
              placeholder={
                llmForm.providerType === "ollama"
                  ? "http://localhost:11434"
                  : (STANDARD_BASE_URLS[llmForm.providerType] ?? "")
              }
              className="min-h-11 font-mono text-sm"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wiz-apikey">
              API key
              {llmForm.hasExistingKey ? (
                <span className="ml-1 text-zinc-500">(leave blank to keep existing)</span>
              ) : llmForm.providerType === "ollama" ? (
                <span className="ml-1 text-zinc-500">
                  (optional — leave blank for unauthenticated)
                </span>
              ) : (
                <span className="ml-1 text-zinc-500">(optional for unauthenticated endpoints)</span>
              )}
            </Label>
            <Input
              id="wiz-apikey"
              type="password"
              value={llmForm.apiKey}
              onChange={(e) => setLlmForm((f) => ({ ...f, apiKey: e.target.value }))}
              placeholder={
                llmForm.hasExistingKey
                  ? "••••••••••••••••"
                  : llmForm.providerType === "anthropic"
                    ? "sk-ant-..."
                    : llmForm.providerType === "ollama"
                      ? "ollama (leave blank if none)"
                      : "sk-..."
              }
              className="min-h-11 font-mono text-sm"
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wiz-model">Model</Label>
            <Input
              id="wiz-model"
              value={llmForm.model}
              onChange={(e) => setLlmForm((f) => ({ ...f, model: e.target.value }))}
              placeholder={DEFAULT_MODELS[llmForm.providerType]}
              className="min-h-11 font-mono text-sm"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wiz-provider-name">
              Provider name
              <span className="ml-1 text-zinc-500">(used in the generated config file)</span>
            </Label>
            <Input
              id="wiz-provider-name"
              value={llmForm.providerName}
              onChange={(e) => setLlmForm((f) => ({ ...f, providerName: e.target.value }))}
              placeholder={llmForm.providerType}
              className="min-h-11 font-mono text-sm"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitLlmForm}
                disabled={isPending || !llmForm.model.trim()}
                className="min-h-11"
              >
                {advanceMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {slowHint ? "Generating first question…" : "Connecting…"}
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
            {slowHint && (
              <p className="text-right text-xs text-zinc-500">
                Still connecting — the model may be loading. This can take a minute or two for large
                models.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Steps 1+ — acceptance step (YAML preview requires explicit Accept/Cancel) */}
      {!isStep0 && isAcceptanceStep && (
        <>
          {/* Question */}
          {step?.question && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-900">
              <div className="space-y-3">
                <ReactMarkdown
                  remarkPlugins={REMARK_PLUGINS}
                  rehypePlugins={REHYPE_PLUGINS}
                  components={markdownComponents}
                >
                  {stripProtocolLines(step.question)}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* YAML preview — shown prominently for acceptance steps */}
          {step?.yaml_preview && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-500">Configuration preview</p>
              <YamlBlock code={step.yaml_preview} />
            </div>
          )}

          {/* Warnings */}
          {step?.warnings && step.warnings.length > 0 && (
            <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-700">Warnings</p>
              <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700">
                {step.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Accept / Cancel buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isPending}
              className="min-h-11"
            >
              {advanceMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Cancel"}
            </Button>
            <Button onClick={handleAccept} disabled={isPending} className="min-h-11">
              {advanceMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        </>
      )}

      {/* Steps 1+ — free-text answer */}
      {!isStep0 && !isAcceptanceStep && (
        <>
          {/* Question — rendered as markdown; protocol lines stripped */}
          {step?.question && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-900">
              <div className="space-y-3">
                <ReactMarkdown
                  remarkPlugins={REMARK_PLUGINS}
                  rehypePlugins={REHYPE_PLUGINS}
                  components={markdownComponents}
                >
                  {stripProtocolLines(step.question)}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* YAML preview */}
          {step?.yaml_preview && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-500">YAML preview</p>
              <YamlBlock code={step.yaml_preview} />
            </div>
          )}

          {/* Warnings */}
          {step?.warnings && step.warnings.length > 0 && (
            <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-700">Warnings</p>
              <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700">
                {step.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Answer input */}
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer… (Enter to submit, Shift+Enter for newline)"
              disabled={isPending}
              rows={3}
              className="min-h-20 resize-y text-sm"
              aria-label="Wizard answer"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitAnswer}
                disabled={isPending || !answer.trim()}
                className="min-h-11"
              >
                {advanceMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SetupWizard;
