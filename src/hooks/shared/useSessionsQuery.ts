import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { CursorPage } from "@/lib/api/types/common";
import type { SessionOut } from "@/lib/api/types/session";

interface UseSessionsQueryOptions {
  includeArchived?: boolean;
}

export function useSessionsQuery({ includeArchived = false }: UseSessionsQueryOptions = {}) {
  return useInfiniteQuery({
    queryKey: keys.sessions.list(includeArchived),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | null;
      const archivedParam = includeArchived ? "&include_archived=true" : "";
      const url = `/sessions?limit=18${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}${archivedParam}`;
      return api.get<CursorPage<SessionOut>>(url);
    },
    getNextPageParam: (lastPage: CursorPage<SessionOut>) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
    staleTime: 5 * 60_000,
  });
}
