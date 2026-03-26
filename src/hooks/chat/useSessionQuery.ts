import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { SessionOut } from "@/lib/api/types/session";

export function useSessionQuery(sessionId: string) {
  return useQuery({
    queryKey: keys.sessions.detail(sessionId),
    queryFn: () => api.get<SessionOut>(`/sessions/${sessionId}`),
    staleTime: 10_000,
    enabled: !!sessionId,
  });
}
