import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAssistantStatusQuery } from "@/hooks/assistant/useAssistantStatusQuery";
import { useLiveUptime } from "@/hooks/shared/useLiveUptime";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/types/common";

export function ServiceControlPanel() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const stopMutation = useMutation({
    mutationFn: () => api.post("/assistant/stop"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.status() });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to stop assistant");
    },
  });

  const startMutation = useMutation<unknown, Error, boolean>({
    mutationFn: (forceRestart: boolean) =>
      api.post("/assistant/start", { force_restart: forceRestart }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.status() });
      toast.success("Assistant started");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to start assistant");
    },
  });

  const {
    data: status,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useAssistantStatusQuery({
    refetchInterval: stopMutation.isPending ? 2000 : false,
  });

  const uptime = useLiveUptime(
    status?.status === "running" ? (status.uptime_s ?? undefined) : undefined,
    dataUpdatedAt,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Service Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : status ? (
          <div className="flex flex-wrap items-center gap-4">
            {status.status === "running" ? (
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                Running
              </Badge>
            ) : (
              <Badge variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-600">
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </Badge>
            )}
            {status.status === "running" && (
              <>
                {status.channels && status.channels.length > 0 && (
                  <span className="text-sm text-zinc-500">
                    Channels:{" "}
                    <span className="font-medium text-zinc-900">
                      {status.channels.map((ch) => ch.name).join(", ")}
                    </span>
                  </span>
                )}
                {status.uptime_s != null && (
                  <span className="text-sm text-zinc-500">
                    Uptime: <span className="font-medium text-zinc-900">{uptime}</span>
                  </span>
                )}
              </>
            )}
            {isAdmin && (
              <div className="ml-auto flex gap-2">
                {stopMutation.isPending ? (
                  <Button variant="outline" size="sm" disabled aria-label="Stopping assistant">
                    <Loader2 className="size-4 animate-spin" />
                  </Button>
                ) : status.status === "running" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => stopMutation.mutate()}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    aria-label="Stop assistant service"
                  >
                    Stop
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => startMutation.mutate(false)}
                      disabled={startMutation.isPending}
                      aria-label="Start assistant service"
                    >
                      {startMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Start"
                      )}
                    </Button>
                    {status.status === "error" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                        onClick={() => startMutation.mutate(true)}
                        disabled={startMutation.isPending}
                        aria-label="Force restart assistant service"
                      >
                        Force restart
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">Failed to load service status.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Unable to load service status.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ServiceControlPanel;
