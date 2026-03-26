import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { McpServerOut } from "@/lib/api/types/config";

export function useMcpServersQuery() {
  return useQuery({
    queryKey: keys.mcpServers(),
    queryFn: () => api.get<McpServerOut[]>("/mcp/servers"),
  });
}
