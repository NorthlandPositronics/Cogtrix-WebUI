import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useDeferredRecordsQuery } from "@/hooks/assistant/useDeferredRecordsQuery";
import { useAssistantStatusQuery } from "@/hooks/assistant/useAssistantStatusQuery";
import { ApiError } from "@/lib/api/types/common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: string): string {
  if (status === "firing") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export function DeferredRecordTable() {
  const queryClient = useQueryClient();
  const [channelFilter, setChannelFilter] = useState("all");
  const { data: assistantStatus } = useAssistantStatusQuery();
  const channelNames = assistantStatus?.channels?.map((c) => c.name) ?? [];
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const {
    data: deferred,
    isLoading,
    isError,
    refetch,
  } = useDeferredRecordsQuery(channelFilter !== "all" ? { channel: channelFilter } : undefined);

  const cancelMutation = useMutation({
    mutationFn: (sessionKey: string) =>
      api.delete(`/assistant/deferred/${encodeURIComponent(sessionKey)}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.deferred() });
      toast.success("Deferred record cancelled");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to cancel deferred record");
    },
    onSettled: () => {
      setCancelTarget(null);
    },
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="h-8 w-[140px] text-sm" aria-label="Filter by channel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {channelNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
          <p className="text-sm text-red-600">Failed to load deferred records.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : deferred && deferred.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Session
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Fire At
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Pending
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Depth
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Status
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {deferred.map((record) => (
                <TableRow key={record.session_key} className="hover:bg-zinc-50">
                  <TableCell className="font-mono text-sm text-zinc-900">
                    {record.session_key}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    {formatDateTime(record.fire_at)}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    {record.pending_messages.length <= 1 ? (
                      record.pending_messages.length
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default underline decoration-dotted">
                              {record.pending_messages.length}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <ul className="max-w-[240px] space-y-1 text-xs">
                              {record.pending_messages.slice(0, 5).map((msg, i) => (
                                <li key={i} className="truncate">
                                  {msg}
                                </li>
                              ))}
                              {record.pending_messages.length > 5 && (
                                <li className="text-zinc-500">
                                  +{record.pending_messages.length - 5} more
                                </li>
                              )}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    {record.depth}/{record.max_depth}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Cancel deferred record for ${record.session_key}`}
                        onClick={() => setCancelTarget(record.session_key)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Clock className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">No deferred records.</p>
        </div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Deferred Record"
        description="This will cancel the deferred record. This action cannot be undone."
        confirmLabel="Cancel Record"
        isPending={cancelMutation.isPending}
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
      />
    </>
  );
}

export default DeferredRecordTable;
