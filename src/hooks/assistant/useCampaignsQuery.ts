import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { CampaignOut, CampaignStatus } from "@/lib/api/types/assistant";

interface UseCampaignsOptions {
  status?: CampaignStatus;
}

export function useCampaignsQuery(options?: UseCampaignsOptions) {
  const status = options?.status;
  return useQuery({
    queryKey: keys.assistant.campaigns.list(status),
    queryFn: () => {
      const params = status ? `?status_filter=${status}` : "";
      return api.get<CampaignOut[]>(`/assistant/campaigns${params}`);
    },
  });
}
