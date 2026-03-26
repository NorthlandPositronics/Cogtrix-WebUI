import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ToolConfirmPayload } from "@/lib/api/types/websocket";

interface ToolConfirmationModalProps {
  onConfirm: (confirmationId: string, action: ToolConfirmPayload["action"]) => void;
}

const MAX_VALUE_LENGTH = 200;

function ParamValue({ value }: { value: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const str = typeof value === "string" ? value : JSON.stringify(value);
  const truncated = str.length > MAX_VALUE_LENGTH && !expanded;
  const display = truncated ? str.slice(0, MAX_VALUE_LENGTH) + "…" : str;

  return (
    <span className="font-mono text-sm break-all text-zinc-900">
      <span id={contentId}>{display}</span>
      {str.length > MAX_VALUE_LENGTH && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((e) => !e)}
          className="focus-visible:ring-ring ml-1 inline-flex min-h-11 items-center rounded-md px-1 py-2 text-teal-600 hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </span>
  );
}

export function ToolConfirmationModal({ onConfirm }: ToolConfirmationModalProps) {
  const pendingConfirmation = useStreamingStore((s) => s.pendingConfirmation);
  const [lastConfirmationId, setLastConfirmationId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ToolConfirmPayload["action"] | null>(null);
  const isOpen = pendingConfirmation !== null;
  const confirming =
    lastConfirmationId !== null && lastConfirmationId === pendingConfirmation?.confirmation_id;

  function handleAction(action: ToolConfirmPayload["action"]) {
    if (!pendingConfirmation || confirming) return;
    setLastConfirmationId(pendingConfirmation.confirmation_id);
    setActiveAction(action);
    onConfirm(pendingConfirmation.confirmation_id, action);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        // Non-dismissible — intentionally block close from outside click or Escape
      }}
    >
      <DialogContent
        className="max-h-[90vh] max-w-xl overflow-y-auto [&>[data-slot=dialog-close]]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Tool Confirmation Required</DialogTitle>
          <DialogDescription>
            Review the tool request below before allowing execution. You must choose one of the
            actions below to proceed.
          </DialogDescription>
        </DialogHeader>

        {pendingConfirmation && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Tool</p>
              <p className="text-base font-semibold text-zinc-900">{pendingConfirmation.tool}</p>
            </div>

            {pendingConfirmation.message && (
              <div>
                <p className="text-sm text-zinc-500">Description</p>
                <p className="text-sm text-zinc-900">{pendingConfirmation.message}</p>
              </div>
            )}

            {Object.keys(pendingConfirmation.parameters).length > 0 && (
              <div>
                <p className="mb-2 text-sm text-zinc-500">Parameters</p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                          Key
                        </TableHead>
                        <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                          Value
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(pendingConfirmation.parameters).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="pr-4 align-top font-mono text-sm font-medium break-all text-zinc-900">
                            {key}
                          </TableCell>
                          <TableCell className="align-top">
                            <ParamValue value={value} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2 md:grid-cols-3">
          <Button
            autoFocus
            className="min-h-11"
            onClick={() => handleAction("allow")}
            disabled={confirming}
            aria-label={`Allow ${pendingConfirmation?.tool ?? "tool"}`}
          >
            {confirming && activeAction === "allow" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Allow"
            )}
          </Button>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => handleAction("deny")}
            disabled={confirming}
            aria-label={`Deny ${pendingConfirmation?.tool ?? "tool"}`}
          >
            {confirming && activeAction === "deny" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Deny"
            )}
          </Button>
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => handleAction("allow_all")}
            disabled={confirming}
            aria-label={`Allow all future ${pendingConfirmation?.tool ?? "tool"} calls`}
          >
            {confirming && activeAction === "allow_all" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Allow All"
            )}
          </Button>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => handleAction("disable")}
            disabled={confirming}
            aria-label={`Disable ${pendingConfirmation?.tool ?? "tool"}`}
          >
            {confirming && activeAction === "disable" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Disable"
            )}
          </Button>
          <Button
            variant="outline"
            className="min-h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleAction("forbid_all")}
            disabled={confirming}
            aria-label={`Forbid all future ${pendingConfirmation?.tool ?? "tool"} calls`}
          >
            {confirming && activeAction === "forbid_all" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Forbid All"
            )}
          </Button>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => handleAction("cancel")}
            disabled={confirming}
            aria-label={`Cancel tool confirmation for ${pendingConfirmation?.tool ?? "tool"}`}
          >
            {confirming && activeAction === "cancel" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Cancel"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ToolConfirmationModal;
