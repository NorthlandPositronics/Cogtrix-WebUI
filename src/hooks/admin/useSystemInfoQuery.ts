import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { SystemInfoOut } from "@/lib/api/types/system";

export function useSystemInfoQuery() {
  return useQuery({
    queryKey: keys.systemInfo(),
    queryFn: () => api.get<SystemInfoOut>("/system/info"),
    staleTime: 60 * 1000,
  });
}
