import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { APIKeyOut } from "@/lib/api/types/auth";
import type { CursorPage } from "@/lib/api/types/common";

export function useApiKeysQuery() {
  return useQuery({
    queryKey: keys.apiKeys(),
    queryFn: async () => {
      const page = await api.get<CursorPage<APIKeyOut>>("/auth/api-keys");
      return page.items;
    },
  });
}
