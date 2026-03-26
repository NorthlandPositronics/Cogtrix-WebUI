import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { UserOut } from "@/lib/api/types";

export function useUsersQuery() {
  return useQuery({
    queryKey: keys.users.list(),
    queryFn: () => api.get<UserOut[]>("/users"),
  });
}
