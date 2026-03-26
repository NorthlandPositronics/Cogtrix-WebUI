import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, ShieldOff, Ban } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ViolationBadge } from "@/components/ViolationBadge";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useGuardrailsQuery } from "@/hooks/assistant/useGuardrailsQuery";

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export function GuardrailsPanel() {
  const queryClient = useQueryClient();
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGuardrailsQuery();

  const removeMutation = useMutation({
    mutationFn: (chatId: string) =>
      api.delete(`/assistant/guardrails/blacklist/${encodeURIComponent(chatId)}`),
    onSuccess: (_data, chatId) => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.guardrails() });
      toast.success(`Removed "${chatId}" from blacklist`);
    },
    onError: () => {
      toast.error("Failed to remove blacklist entry");
    },
    onSettled: () => {
      setPendingChatId(null);
    },
  });

  const blacklist = data?.blacklisted_chats ?? [];
  const violations = data?.recent_violations ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-red-600">Failed to load guardrails data.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Recent violations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Violations</CardTitle>
              <Badge variant="outline" className="text-xs">
                {data?.total_violations ?? violations.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {violations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <ShieldOff className="h-10 w-10 text-zinc-400" />
                <p className="text-sm text-zinc-500">No violations recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Time
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Chat ID
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Channel
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Type
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Detail
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violations.map((v) => (
                      <TableRow key={`${v.chat_id}-${v.timestamp}`} className="hover:bg-zinc-50">
                        <TableCell className="font-mono text-xs whitespace-nowrap text-zinc-500 tabular-nums">
                          {formatTimestamp(v.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-zinc-900">
                          {v.chat_id}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-600">{v.channel}</TableCell>
                        <TableCell>
                          <ViolationBadge type={v.violation_type} />
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate text-sm text-zinc-600"
                          title={v.detail ?? undefined}
                        >
                          {v.detail ?? <span className="text-zinc-500">—</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blacklisted chats */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Blacklisted Chats</CardTitle>
              <Badge variant="outline" className="text-xs">
                {blacklist.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {blacklist.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Ban className="h-10 w-10 text-zinc-400" />
                <p className="text-sm text-zinc-500">No blacklisted chats.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Chat ID
                      </TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blacklist.map((chatId) => (
                      <TableRow key={chatId} className="hover:bg-zinc-50">
                        <TableCell className="font-mono text-sm text-zinc-900">{chatId}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-11 w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setPendingChatId(chatId)}
                            aria-label={`Remove ${chatId} from blacklist`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingChatId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingChatId(null);
        }}
        title="Remove from blacklist"
        description={
          pendingChatId
            ? `Remove "${pendingChatId}" from the blacklist? This chat will be able to send messages again.`
            : ""
        }
        confirmLabel="Remove"
        isPending={removeMutation.isPending}
        onConfirm={() => pendingChatId && removeMutation.mutate(pendingChatId)}
        variant="destructive"
      />
    </>
  );
}

export default GuardrailsPanel;
