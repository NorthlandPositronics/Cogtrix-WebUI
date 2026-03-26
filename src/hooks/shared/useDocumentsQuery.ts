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
      const hasProcessing = query.state.data?.pages.some((page) =>
        page.items.some((doc) => doc.chunk_count === 0),
      );
      return hasProcessing ? 15_000 : false;
    },
  });
}
