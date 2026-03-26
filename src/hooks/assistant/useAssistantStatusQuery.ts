import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { AssistantStatusOut } from "@/lib/api/types/assistant";

interface UseAssistantStatusQueryOptions {
  refetchInterval?: UseQueryOptions<AssistantStatusOut>["refetchInterval"];
}

export function useAssistantStatusQuery({
  refetchInterval = false,
}: UseAssistantStatusQueryOptions = {}) {
  return useQuery({
    queryKey: keys.assistant.status(),
    queryFn: () => api.get<AssistantStatusOut>("/assistant/status"),
    refetchInterval,
  });
}
