import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
import type { RAGSearchResponse, RAGChunkOut } from "@/lib/api/types/rag";

interface SemanticSearchBarProps {
  className?: string;
}

export function SemanticSearchBar({ className = "" }: SemanticSearchBarProps) {
  const [query, setQuery] = useState("");

  const searchMutation = useMutation({
    mutationFn: (q: string) => api.post<RAGSearchResponse>("/rag/search", { query: q, top_k: 10 }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    searchMutation.mutate(trimmed);
  }

  const chunks = searchMutation.data?.chunks ?? [];
  const hasSearched = searchMutation.isSuccess || searchMutation.isError;

  return (
    <div className={className}>
      <form onSubmit={handleSearch} role="search" className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <Input
            data-cy="search-documents"
            aria-label="Search documents"
            placeholder="Search documents semantically..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={searchMutation.isPending}
            className={hasSearched ? "pr-9 pl-9" : "pl-9"}
          />
          {hasSearched && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                searchMutation.reset();
              }}
              className="focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 rounded text-zinc-400 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={!query.trim() || searchMutation.isPending}>
          {searchMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </form>

      {searchMutation.isPending && (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {hasSearched && !searchMutation.isPending && (
        <div className="mt-4 space-y-2">
          {searchMutation.isError ? (
            <p className="py-6 text-center text-sm text-red-600">
              Search failed. Please try again.
            </p>
          ) : chunks.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">No results found.</p>
          ) : (
            chunks.map((chunk, idx) => (
              <SearchResultCard
                key={`${chunk.document_id}-${chunk.chunk_index}-${idx}`}
                chunk={chunk}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ chunk }: { chunk: RAGChunkOut }) {
  const scorePercent = Math.round(chunk.score * 100);
  const truncatedText = chunk.text.length > 300 ? chunk.text.slice(0, 300) + "..." : chunk.text;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-zinc-900">{chunk.document_name}</span>
          <span className="shrink-0 text-xs font-medium text-zinc-500">{scorePercent}% match</span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-900">{truncatedText}</p>
      </CardContent>
    </Card>
  );
}

export default SemanticSearchBar;
