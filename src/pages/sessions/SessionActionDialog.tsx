import { Archive, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: () => void;
  onDeletePermanently: () => void;
  isPending: boolean;
  sessionName?: string;
}

export function SessionActionDialog({
  open,
  onOpenChange,
  onArchive,
  onDeletePermanently,
  isPending,
  sessionName,
}: SessionActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove session{sessionName ? `: ${sessionName}` : ""}</DialogTitle>
          <DialogDescription>Choose how to remove this session.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
              <Archive className="h-5 w-5 text-zinc-400" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">Archive</p>
              <p className="text-xs text-zinc-500">
                The session is hidden but kept. You can restore it any time from the archived view.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <Trash2 className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">Delete permanently</p>
              <p className="text-xs text-zinc-500">
                All messages and data are erased. This cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="min-h-11 gap-2"
              onClick={onArchive}
              disabled={isPending}
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Archive
            </Button>
            <Button
              variant="destructive"
              className="min-h-11 gap-2"
              onClick={onDeletePermanently}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete permanently
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
