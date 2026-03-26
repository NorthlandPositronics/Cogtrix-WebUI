import { Archive, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionBulkBarProps {
  selectedCount: number;
  totalCount: number;
  onArchive: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  isPending: boolean;
}

export function SessionBulkBar({
  selectedCount,
  totalCount,
  onArchive,
  onDelete,
  onSelectAll,
  onClear,
  isPending,
}: SessionBulkBarProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div
      data-cy="bulk-bar"
      className={cn(
        "fixed right-0 bottom-0 left-0 z-50 border-t border-zinc-200 bg-white shadow-md",
        "lg:left-[220px]",
      )}
      role="toolbar"
      aria-label="Bulk session actions"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <span className="text-sm font-medium text-zinc-900">{selectedCount} selected</span>
        <button
          className="focus-visible:ring-ring text-sm text-teal-600 underline hover:no-underline focus-visible:ring-2 focus-visible:outline-none"
          onClick={allSelected ? onClear : onSelectAll}
          disabled={isPending}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            data-cy="bulk-archive"
            variant="outline"
            size="sm"
            className="min-h-9 gap-1.5"
            onClick={onArchive}
            disabled={isPending}
          >
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            Archive
          </Button>
          <Button
            data-cy="bulk-delete"
            variant="destructive"
            size="sm"
            className="min-h-9 gap-1.5"
            onClick={onDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete permanently
          </Button>
          <Button
            data-cy="bulk-clear"
            variant="ghost"
            size="sm"
            className="min-h-9 gap-1.5 text-zinc-500"
            onClick={onClear}
            disabled={isPending}
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
