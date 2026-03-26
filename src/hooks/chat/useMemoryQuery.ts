import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { MemoryStateOut } from "@/lib/api/types/memory";

export function useMemoryQuery(sessionId: string) {
  return useQuery({
    queryKey: keys.memory(sessionId),
    queryFn: () => api.get<MemoryStateOut>(`/sessions/${sessionId}/memory`),
    enabled: !!sessionId,
    staleTime: 30_000,
  });
}
