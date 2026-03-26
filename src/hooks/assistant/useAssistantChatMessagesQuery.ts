import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { MessageOut } from "@/lib/api/types/message";
import type { CursorPage } from "@/lib/api/types/common";

export function useAssistantChatMessagesQuery(chatKey: string | null) {
  return useQuery({
    queryKey: keys.assistant.chatMessages(chatKey ?? ""),
    queryFn: async () => {
      const page = await api.get<CursorPage<MessageOut>>(`/assistant/chats/${chatKey}/messages`);
      return page.items;
    },
    enabled: chatKey !== null,
  });
}
