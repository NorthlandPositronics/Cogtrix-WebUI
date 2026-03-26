import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ToolSummary } from "@/lib/api/types/tool";

export function useToolsQuery(sessionId: string) {
  return useQuery({
    queryKey: keys.tools.session(sessionId),
    queryFn: () => api.get<ToolSummary[]>(`/sessions/${sessionId}/tools`),
    enabled: !!sessionId,
    staleTime: 60_000,
  });
}
