import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { GuardrailStatusOut } from "@/lib/api/types/system";

export function useGuardrailsQuery() {
  return useQuery({
    queryKey: keys.assistant.guardrails(),
    queryFn: () => api.get<GuardrailStatusOut>("/assistant/guardrails"),
  });
}
