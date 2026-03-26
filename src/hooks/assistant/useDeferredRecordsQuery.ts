import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { DeferredRecordOut } from "@/lib/api/types/assistant";

interface UseDeferredRecordsOptions {
  channel?: string;
}

export function useDeferredRecordsQuery(options?: UseDeferredRecordsOptions) {
  return useQuery({
    queryKey: keys.assistant.deferred(options?.channel),
    queryFn: () => {
      const params = new URLSearchParams();
      if (options?.channel) params.set("channel", options.channel);
      const qs = params.toString();
      return api.get<DeferredRecordOut[]>(`/assistant/deferred${qs ? `?${qs}` : ""}`);
    },
  });
}
