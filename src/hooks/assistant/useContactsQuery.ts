import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ContactOut } from "@/lib/api/types/assistant";

export function useContactsQuery() {
  return useQuery({
    queryKey: keys.assistant.contacts(),
    queryFn: () => api.get<ContactOut[]>("/assistant/contacts"),
  });
}
