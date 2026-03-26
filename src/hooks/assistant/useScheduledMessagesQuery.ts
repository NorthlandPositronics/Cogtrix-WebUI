import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ScheduledMessageOut } from "@/lib/api/types/assistant";
import type { CursorPage } from "@/lib/api/types/common";

interface UseScheduledMessagesOptions {
  channel?: string;
  chat_id?: string;
}

export function useScheduledMessagesQuery(options?: UseScheduledMessagesOptions) {
  const filters =
    options?.channel || options?.chat_id
      ? { channel: options.channel, chat_id: options.chat_id }
      : undefined;
  return useQuery({
    queryKey: keys.assistant.scheduled(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.channel) params.set("channel", options.channel);
      if (options?.chat_id) params.set("chat_id", options.chat_id);
      const qs = params.toString();
      const page = await api.get<CursorPage<ScheduledMessageOut>>(
        `/assistant/scheduled${qs ? `?${qs}` : ""}`,
      );
      return page.items;
    },
  });
}
