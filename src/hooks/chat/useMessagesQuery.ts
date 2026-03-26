import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { CursorPage } from "@/lib/api/types/common";
import type { MessageOut } from "@/lib/api/types/message";

export function useMessagesQuery(sessionId: string) {
  const query = useInfiniteQuery({
    queryKey: keys.messages.list(sessionId),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | null;
      const url = `/sessions/${sessionId}/messages?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      return api.get<CursorPage<MessageOut>>(url);
    },
    getNextPageParam: (lastPage: CursorPage<MessageOut>) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
    staleTime: 60_000,
    enabled: !!sessionId,
  });

  // API returns messages oldest-first (chronological); flatten pages in order.
  const messages = useMemo(
    () => (query.data ? query.data.pages.flatMap((page) => page.items) : []),
    [query.data],
  );

  return { ...query, messages };
}
