import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { SimulateRequest, SimulateOut } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  REMARK_PLUGINS,
  REHYPE_PLUGINS,
  markdownComponents,
} from "@/components/MarkdownComponents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function SimulatorPanel() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const [channel, setChannel] = useState<string>("whatsapp");
  const [direction, setDirection] = useState<"inbound" | "outbound">("inbound");
  const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderId, setSenderId] = useState("");
  const [persist, setPersist] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const simulateMutation = useMutation({
    mutationFn: (req: SimulateRequest) => api.post<SimulateOut>("/assistant/simulate", req),
    onError: (err) => {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        const fields = err.getFieldErrors();
        if (Object.keys(fields).length > 0) {
          setFieldErrors(fields);
          return;
        }
      }
      toast.error(err instanceof ApiError ? err.message : "Simulation failed");
    },
  });

  if (!isAdmin) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    simulateMutation.reset();
    simulateMutation.mutate({
      channel,
      chat_id: chatId,
      message,
      direction,
      instructions: direction === "outbound" && instructions ? instructions : undefined,
      sender_name: senderName || undefined,
      sender_id: senderId || undefined,
      persist,
    });
  }

  const data = simulateMutation.data;

  return (
    <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6">
      {/* Form panel */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Channel */}
          <div className="space-y-1.5">
            <Label htmlFor="channel">Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="channel" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chat ID */}
          <div className="space-y-1.5">
            <Label htmlFor="chat-id">Chat ID</Label>
            <Input
              id="chat-id"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="+1234567890@c.us"
              required
              maxLength={256}
            />
            <p className="mt-1 text-xs text-zinc-500">
              The channel-specific contact identifier (e.g. WhatsApp number or Telegram chat ID).
            </p>
            {fieldErrors["chat_id"]?.[0] && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors["chat_id"][0]}</p>
            )}
          </div>

          {/* Direction */}
          <div className="space-y-1.5">
            <Label htmlFor="direction">Direction</Label>
            <Select
              value={direction}
              onValueChange={(v) => {
                setDirection(v as "inbound" | "outbound");
                setInstructions("");
              }}
            >
              <SelectTrigger id="direction" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type the message to simulate..."
              className="min-h-[80px] resize-y"
              required
              maxLength={8192}
            />
            {fieldErrors["message"]?.[0] && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors["message"][0]}</p>
            )}
          </div>

          {/* Instructions — conditional on outbound */}
          {direction === "outbound" && (
            <div className="space-y-1.5">
              <Label htmlFor="instructions">Operator instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Be concise and formal."
                className="min-h-[64px] resize-y"
                maxLength={8192}
              />
              <p className="mt-1 text-xs text-zinc-500">
                Instructions for the outbound operator persona.
              </p>
              {fieldErrors["instructions"]?.[0] && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors["instructions"][0]}</p>
              )}
            </div>
          )}

          {/* Persist memory */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="persist-memory"
                checked={persist}
                onCheckedChange={(checked) => setPersist(checked === true)}
              />
              <Label htmlFor="persist-memory" className="text-sm font-medium text-zinc-900">
                Persist memory
              </Label>
            </div>
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <AlertDescription>
                When enabled, the simulation writes to live conversation memory for this chat. This
                cannot be undone.
              </AlertDescription>
            </Alert>
          </div>

          {/* Advanced options */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="group focus-visible:ring-ring flex items-center gap-1.5 text-sm text-zinc-500 transition-colors duration-150 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
              <ChevronDown className="h-4 w-4 transition-transform duration-150 group-data-[state=open]:rotate-180" />
              Advanced options
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sender-name">Sender name</Label>
                  <Input
                    id="sender-name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Simulator"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Display name shown in the simulated message. Defaults to
                    &ldquo;Simulator&rdquo;.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sender-id">Sender ID</Label>
                  <Input
                    id="sender-id"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="simulator"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Internal sender identifier. Defaults to &ldquo;simulator&rdquo;.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Provider unreachable error (submission-level) */}
          {simulateMutation.isError &&
            simulateMutation.error instanceof ApiError &&
            simulateMutation.error.code === "PROVIDER_UNREACHABLE" && (
              <p className="text-sm text-red-600">LLM provider unreachable. Check configuration.</p>
            )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={simulateMutation.isPending}>
            {simulateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running…
              </>
            ) : (
              "Run simulation"
            )}
          </Button>
        </div>
      </form>

      {/* Result panel */}
      <div className="mt-6 min-h-[200px] lg:mt-0 lg:min-h-0">
        {/* Empty state */}
        {simulateMutation.status === "idle" && (
          <div className="flex items-center justify-center py-12">
            <p className="text-center text-sm text-zinc-500">
              Run a simulation to see the pipeline response.
            </p>
          </div>
        )}

        {/* Loading state */}
        {simulateMutation.isPending && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-white p-6">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">Running simulation…</p>
          </div>
        )}

        {/* Error state — skip for PROVIDER_UNREACHABLE and VALIDATION_ERROR (handled inline) */}
        {simulateMutation.isError &&
          simulateMutation.error instanceof ApiError &&
          simulateMutation.error.code !== "PROVIDER_UNREACHABLE" &&
          simulateMutation.error.code !== "VALIDATION_ERROR" && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{simulateMutation.error.message}</p>
            </div>
          )}

        {/* Generic non-ApiError */}
        {simulateMutation.isError && !(simulateMutation.error instanceof ApiError) && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">Simulation failed</p>
          </div>
        )}

        {/* Success — result card */}
        {data && (
          <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
            {/* Response prose */}
            <div>
              {data.suppressed || !data.response ? (
                <p className="text-sm text-zinc-500 italic">
                  (No response — message was suppressed)
                </p>
              ) : (
                <div className="space-y-3 text-base leading-relaxed text-zinc-900">
                  <ReactMarkdown
                    remarkPlugins={REMARK_PLUGINS}
                    rehypePlugins={REHYPE_PLUGINS}
                    components={markdownComponents}
                  >
                    {data.response}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Status badge row */}
            <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
              <Badge
                variant="outline"
                className={
                  data.blocked_by_guardrails
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-zinc-200 bg-white text-zinc-500"
                }
              >
                Guardrail blocked
              </Badge>
              <Badge
                variant="outline"
                className={
                  data.suppressed
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-zinc-200 bg-white text-zinc-500"
                }
              >
                Suppressed
              </Badge>
              <Badge
                variant="outline"
                className={
                  data.deferred
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-zinc-200 bg-white text-zinc-500"
                }
              >
                Deferred
              </Badge>
              <Badge
                variant="outline"
                className={
                  data.memory_persisted
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-zinc-200 bg-white text-zinc-500"
                }
              >
                Memory persisted
              </Badge>
            </div>

            {/* Guardrail reason (conditional) */}
            {data.guardrail_reason && (
              <div className="space-y-1">
                <p className="text-xs tracking-wide text-zinc-500 uppercase">Guardrail reason</p>
                <p className="text-sm text-zinc-900">{data.guardrail_reason}</p>
              </div>
            )}

            {/* Metadata footer */}
            <div className="space-y-1 border-t border-zinc-200 pt-3">
              <p className="text-right text-xs text-zinc-500 tabular-nums">
                {data.duration_ms.toLocaleString()} ms
              </p>
              <p className="font-mono text-xs text-zinc-500">{data.session_key}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulatorPanel;
