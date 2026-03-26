import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { ApiError } from "@/lib/api/types/common";
import type { MCPServerAddRequest, McpServerOut } from "@/lib/api/types/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface McpAddServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SLUG_RE = /^[a-z0-9-]+$/;

interface FormState {
  name: string;
  transport: "stdio" | "sse";
  command: string;
  url: string;
  args: string;
  requires_confirmation: boolean;
}

function defaultForm(): FormState {
  return {
    name: "",
    transport: "stdio",
    command: "",
    url: "",
    args: "",
    requires_confirmation: true,
  };
}

export function McpAddServerDialog({ open, onOpenChange }: McpAddServerDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [nameError, setNameError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(defaultForm());
      setNameError(null);
    }
    onOpenChange(next);
  }

  function validateName(value: string): string | null {
    if (!value.trim()) return "Name is required.";
    if (!SLUG_RE.test(value)) return "Lowercase letters, numbers, and hyphens only.";
    return null;
  }

  const addMutation = useMutation({
    mutationFn: (req: MCPServerAddRequest) => api.post<McpServerOut>("/mcp/servers", req),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.mcpServers() });
      toast.success("MCP server added");
      handleOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to add MCP server");
    },
  });

  function handleSubmit() {
    const err = validateName(form.name);
    if (err) {
      setNameError(err);
      return;
    }

    const req: MCPServerAddRequest = {
      name: form.name.trim(),
      transport: form.transport,
      requires_confirmation: form.requires_confirmation,
    };

    if (form.transport === "stdio") {
      req.command = form.command.trim() || undefined;
      const trimmedArgs = form.args.trim();
      if (trimmedArgs) {
        req.args = trimmedArgs.split(/\s+/);
      }
    } else {
      req.url = form.url.trim() || undefined;
    }

    addMutation.mutate(req);
  }

  function handleRequiresConfirmationChange(checked: boolean | "indeterminate") {
    setForm((f) => ({ ...f, requires_confirmation: checked === true }));
  }

  const isStdio = form.transport === "stdio";
  const isSse = form.transport === "sse";

  const isSubmitDisabled =
    addMutation.isPending ||
    !form.name.trim() ||
    (isStdio && !form.command.trim()) ||
    (isSse && !form.url.trim());

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add MCP Server</DialogTitle>
          <DialogDescription>Connect a new Model Context Protocol server.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="mcp-name">Name</Label>
            <Input
              id="mcp-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setNameError(null);
              }}
              placeholder="my-server"
              className="min-h-11 font-mono text-sm"
              disabled={addMutation.isPending}
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? "mcp-name-error" : "mcp-name-hint"}
            />
            {nameError ? (
              <p id="mcp-name-error" className="text-xs text-red-600">
                {nameError}
              </p>
            ) : (
              <p id="mcp-name-hint" className="text-xs text-zinc-500">
                Lowercase letters, numbers, and hyphens only.
              </p>
            )}
          </div>

          {/* Transport */}
          <div className="space-y-1.5">
            <Label htmlFor="mcp-transport">Transport</Label>
            <Select
              value={form.transport}
              onValueChange={(v) => setForm((f) => ({ ...f, transport: v as "stdio" | "sse" }))}
              disabled={addMutation.isPending}
            >
              <SelectTrigger id="mcp-transport" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">stdio — local process</SelectItem>
                <SelectItem value="sse">sse — HTTP stream</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Command (stdio only) */}
          {isStdio && (
            <div className="space-y-1.5">
              <Label htmlFor="mcp-command">Command</Label>
              <Input
                id="mcp-command"
                value={form.command}
                onChange={(e) => setForm((f) => ({ ...f, command: e.target.value }))}
                placeholder="npx my-mcp-server"
                className="min-h-11 font-mono text-sm"
                disabled={addMutation.isPending}
              />
            </div>
          )}

          {/* URL (sse only) */}
          {isSse && (
            <div className="space-y-1.5">
              <Label htmlFor="mcp-url">URL</Label>
              <Input
                id="mcp-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="http://localhost:3000/sse"
                className="min-h-11 font-mono text-sm"
                disabled={addMutation.isPending}
              />
            </div>
          )}

          {/* Args (stdio only) */}
          {isStdio && (
            <div className="space-y-1.5">
              <Label htmlFor="mcp-args">Args</Label>
              <Input
                id="mcp-args"
                value={form.args}
                onChange={(e) => setForm((f) => ({ ...f, args: e.target.value }))}
                placeholder="--flag value another-arg"
                className="min-h-11 font-mono text-sm"
                disabled={addMutation.isPending}
              />
              <p className="text-xs text-zinc-500">Space-separated arguments.</p>
            </div>
          )}

          {/* Requires confirmation */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="mcp-requires-confirmation"
                checked={form.requires_confirmation}
                onCheckedChange={handleRequiresConfirmationChange}
                disabled={addMutation.isPending}
              />
              <Label htmlFor="mcp-requires-confirmation" className="cursor-pointer font-normal">
                Requires confirmation
              </Label>
            </div>
            <p className="pl-6 text-xs text-zinc-500">
              Prompt before executing tool calls from this server.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={addMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {addMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              "Add Server"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default McpAddServerDialog;
