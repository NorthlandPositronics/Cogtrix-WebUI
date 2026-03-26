import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Server, RotateCcw, Loader2, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useMcpServersQuery } from "@/hooks/settings/useMcpServersQuery";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { ApiError } from "@/lib/api/types/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { McpAddServerDialog } from "./McpAddServerDialog";

function StatusBadge({
  status,
}: {
  status: "connected" | "disconnected" | "error" | "connecting";
}) {
  if (status === "connected") {
    return (
      <Badge className="border-green-200 bg-green-50 text-green-700" variant="outline">
        Connected
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50" variant="outline">
        Error
      </Badge>
    );
  }
  if (status === "connecting") {
    return (
      <Badge
        className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
        variant="outline"
      >
        Connecting
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-zinc-600">
      Disconnected
    </Badge>
  );
}

export function McpServerList() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const queryClient = useQueryClient();
  const { data: servers, isLoading, isError, refetch } = useMcpServersQuery();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const restartMutation = useMutation({
    mutationFn: (name: string) => api.post(`/mcp/servers/${name}/restart`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.mcpServers() });
      toast.success("MCP server restarted");
    },
    onError: () => {
      toast.error("Failed to restart MCP server");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => api.delete(`/mcp/servers/${name}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.mcpServers() });
      toast.success("MCP server removed");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove MCP server");
    },
    onSettled: () => {
      setDeleteTarget(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
        <p className="text-sm text-red-600">Failed to load MCP servers.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {isAdmin && (
          <div className="flex justify-end">
            <Button size="sm" className="min-h-11 gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add MCP Server
            </Button>
          </div>
        )}

        {!servers?.length ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Server className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">No MCP servers configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Transport
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Status
                  </TableHead>
                  {isAdmin && (
                    <TableHead className="text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                      Action
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.name} className="hover:bg-zinc-50">
                    <TableCell className="font-medium text-zinc-900">{server.name}</TableCell>
                    <TableCell className="max-w-44 truncate font-mono text-sm text-zinc-600">
                      {server.url != null
                        ? server.url
                        : server.command != null
                          ? [server.command, ...(server.args ?? [])].join(" ")
                          : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={server.status} />
                      {server.connected_at != null && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {new Date(server.connected_at).toLocaleString()}
                        </p>
                      )}
                      {server.error && (
                        <p className="mt-0.5 text-xs text-red-600">{server.error}</p>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-11 text-zinc-500 hover:bg-zinc-100"
                            onClick={() => restartMutation.mutate(server.name)}
                            disabled={
                              restartMutation.isPending && restartMutation.variables === server.name
                            }
                            aria-label={`Restart ${server.name}`}
                          >
                            {restartMutation.isPending &&
                            restartMutation.variables === server.name ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleteTarget(server.name)}
                            disabled={
                              deleteMutation.isPending && deleteMutation.variables === server.name
                            }
                            aria-label={`Remove ${server.name}`}
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables === server.name ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <McpAddServerDialog open={addOpen} onOpenChange={setAddOpen} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove MCP server"
        description={`Remove "${deleteTarget ?? ""}" from the server list? This cannot be undone.`}
        confirmLabel="Remove"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </>
  );
}

export default McpServerList;
