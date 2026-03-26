import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { KnowledgeFactOut } from "@/lib/api/types/assistant";
import type { CursorPage } from "@/lib/api/types/common";

interface UseKnowledgeOptions {
  source_chat?: string;
}

export function useKnowledgeQuery(options?: UseKnowledgeOptions) {
  return useQuery({
    queryKey: keys.assistant.knowledge(options?.source_chat),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.source_chat) params.set("source_chat", options.source_chat);
      const qs = params.toString();
      const page = await api.get<CursorPage<KnowledgeFactOut>>(
        `/assistant/knowledge${qs ? `?${qs}` : ""}`,
      );
      return page.items;
    },
  });
}
