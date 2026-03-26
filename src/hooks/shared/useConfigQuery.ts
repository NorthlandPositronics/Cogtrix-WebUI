import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ConfigOut } from "@/lib/api/types/config";

interface UseConfigQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useConfigQuery({ enabled, staleTime }: UseConfigQueryOptions = {}) {
  return useQuery({
    queryKey: keys.config(),
    queryFn: () => api.get<ConfigOut>("/config"),
    staleTime: staleTime ?? 5 * 60 * 1000,
    ...(enabled !== undefined && { enabled }),
  });
}
