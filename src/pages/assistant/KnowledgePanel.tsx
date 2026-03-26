import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Brain, Loader2, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { KnowledgeFactOut } from "@/lib/api/types/assistant";
import { useKnowledgeQuery } from "@/hooks/assistant/useKnowledgeQuery";
import { ApiError } from "@/lib/api/types/common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface FactTableProps {
  items: KnowledgeFactOut[];
  isAdmin: boolean;
  onDelete: (factId: string) => void;
}

function FactTable({ items, isAdmin, onDelete }: FactTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Content
            </TableHead>
            <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Source
            </TableHead>
            <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Created
            </TableHead>
            {isAdmin && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((fact) => (
            <TableRow key={fact.id} className="hover:bg-zinc-50">
              <TableCell className="max-w-72 truncate font-medium text-zinc-900" title={fact.text}>
                {fact.text}
              </TableCell>
              <TableCell className="text-sm text-zinc-600">
                {fact.source_chat ?? <span className="text-zinc-500">—</span>}
              </TableCell>
              <TableCell className="text-xs text-zinc-600">
                {formatDateTime(fact.created_at)}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Delete fact: ${fact.text.slice(0, 50)}`}
                      onClick={() => onDelete(fact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface KnowledgePanelProps {
  isAdmin: boolean;
}

export function KnowledgePanel({ isAdmin }: KnowledgePanelProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceChatInput, setSourceChatInput] = useState("");
  const [sourceChatFilter, setSourceChatFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSourceChatFilter(sourceChatInput), 300);
    return () => clearTimeout(t);
  }, [sourceChatInput]);

  const {
    data: facts,
    isLoading,
    isError,
    refetch,
  } = useKnowledgeQuery(sourceChatFilter ? { source_chat: sourceChatFilter } : undefined);

  const searchMutation = useMutation({
    mutationFn: (query: string) =>
      api.post<KnowledgeFactOut[]>("/assistant/knowledge/search", { query }),
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Search failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (factId: string) => api.delete(`/assistant/knowledge/${factId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.knowledge() });
      if (searchMutation.data) {
        searchMutation.reset();
      }
      toast.success("Fact deleted");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete fact");
    },
    onSettled: () => {
      setDeleteTarget(null);
    },
  });

  function handleSearch() {
    const query = searchQuery.trim();
    if (!query) return;
    searchMutation.mutate(query);
  }

  function clearSearch() {
    setSearchQuery("");
    searchMutation.reset();
  }

  const displayedFacts = searchMutation.data ?? facts;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search knowledge base..."
          aria-label="Search knowledge base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="min-h-11 max-w-sm"
        />
        <Button
          className="min-h-11"
          onClick={handleSearch}
          disabled={searchMutation.isPending || searchQuery.trim() === ""}
        >
          {searchMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search
            </>
          )}
        </Button>
        {searchMutation.data !== undefined && (
          <Button variant="outline" className="min-h-11" onClick={clearSearch}>
            Clear
          </Button>
        )}
        <Input
          placeholder="Filter by source chat"
          aria-label="Filter by source chat"
          value={sourceChatInput}
          onChange={(e) => {
            setSourceChatInput(e.target.value);
            if (searchMutation.data) searchMutation.reset();
          }}
          className="h-8 w-[160px] text-sm"
        />
      </div>

      {searchMutation.data !== undefined && (
        <p className="mb-3 text-sm text-zinc-500">
          {searchMutation.data.length} result{searchMutation.data.length !== 1 ? "s" : ""} for
          &ldquo;
          {searchQuery}&rdquo;
        </p>
      )}

      {isError && searchMutation.data === undefined ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
          <p className="text-sm text-red-600">Failed to load knowledge base.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : isLoading && searchMutation.data === undefined ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : displayedFacts && displayedFacts.length > 0 ? (
        <FactTable items={displayedFacts} isAdmin={isAdmin} onDelete={setDeleteTarget} />
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Brain className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">
            {searchMutation.data !== undefined ? "No results found." : "No knowledge facts found."}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Knowledge Fact"
        description="This will permanently delete this knowledge fact. This action cannot be undone."
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </>
  );
}

export default KnowledgePanel;
