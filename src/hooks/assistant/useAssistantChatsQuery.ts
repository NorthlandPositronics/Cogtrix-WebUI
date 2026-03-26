import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ChatSessionOut } from "@/lib/api/types/assistant";
import type { CursorPage } from "@/lib/api/types/common";

interface UseAssistantChatsOptions {
  channel?: string;
}

export function useAssistantChatsQuery(options?: UseAssistantChatsOptions) {
  return useQuery({
    queryKey: keys.assistant.chats(options?.channel),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.channel) params.set("channel", options.channel);
      const qs = params.toString();
      const page = await api.get<CursorPage<ChatSessionOut>>(
        `/assistant/chats${qs ? `?${qs}` : ""}`,
      );
      return page.items;
    },
  });
}
