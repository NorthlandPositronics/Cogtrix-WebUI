import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { CursorPage } from "@/lib/api/types/common";
import type { DocumentOut } from "@/lib/api/types/rag";

export function useDocumentsQuery() {
  return useInfiniteQuery({
    queryKey: keys.documents.list(),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | null;
      const url = `/rag/documents?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      return api.get<CursorPage<DocumentOut>>(url);
    },
    getNextPageParam: (lastPage: CursorPage<DocumentOut>) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
    refetchInterval: (query) => {
      // Poll only while something is genuinely in progress. chunk_count === 0 was
      // used as a proxy, but that's also the resting state of failed and empty
      // documents — so the list re-fetched forever. status is the real signal.
      const hasProcessing = query.state.data?.pages.some((page) =>
        page.items.some((doc) => doc.status === "pending" || doc.status === "processing"),
      );
      return hasProcessing ? 15_000 : false;
    },
  });
}
