import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ProviderOut } from "@/lib/api/types/config";

interface UseProvidersQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useProvidersQuery(options?: UseProvidersQueryOptions) {
  return useQuery({
    queryKey: keys.providers(),
    queryFn: () => api.get<ProviderOut[]>("/config/providers"),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}
