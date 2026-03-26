import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/shared/useSound";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  /** @default "destructive" — always use "destructive" for irreversible actions */
  variant?: "destructive" | "default";
  isPending?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant = "destructive",
  isPending = false,
  icon,
}: ConfirmDialogProps) {
  const { playDestructiveConfirm } = useSound();

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    onOpenChange(next);
  }

  function handleConfirm() {
    playDestructiveConfirm();
    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Standard footer pattern: [Cancel, Confirm] DOM order.
            DialogFooter applies flex-col-reverse on mobile (Confirm top, Cancel bottom)
            and sm:flex-row sm:justify-end on desktop (Cancel left, Confirm right). */}
        <DialogFooter>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={variant}
            className="min-h-11"
            onClick={handleConfirm}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
