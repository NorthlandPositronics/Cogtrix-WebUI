import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ModelOut } from "@/lib/api/types/config";

interface UseModelsQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useModelsQuery(options?: UseModelsQueryOptions) {
  return useQuery({
    queryKey: keys.models(),
    queryFn: () => api.get<ModelOut[]>("/config/models"),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}
