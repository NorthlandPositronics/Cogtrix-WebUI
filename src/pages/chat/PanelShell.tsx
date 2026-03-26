import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface PanelShellProps {
  title: string;
  asSheet: boolean;
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
  onClose: () => void;
  children: ReactNode;
}

export function PanelShell({
  title,
  asSheet,
  sheetOpen,
  onSheetOpenChange,
  onClose,
  children,
}: PanelShellProps) {
  if (asSheet) {
    return (
      <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:w-80">
          <SheetHeader className="border-b border-zinc-200 px-4 py-3">
            <SheetTitle className="text-sm font-semibold">{title}</SheetTitle>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="flex h-full w-80 flex-col border-l border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()} panel`}
          className="h-11 w-11 text-zinc-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </aside>
  );
}
