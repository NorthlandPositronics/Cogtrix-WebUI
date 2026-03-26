import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ScheduledMessageOut } from "@/lib/api/types/assistant";
import { useScheduledMessagesQuery } from "@/hooks/assistant/useScheduledMessagesQuery";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function statusBadgeClass(status: string): string {
  if (status === "pending") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "firing") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "sent") return "bg-green-50 text-green-700 border-green-200";
  if (status === "failed") return "bg-red-50 text-red-700 border-red-200";
  if (status === "cancelled") return "bg-zinc-50 text-zinc-600 border-zinc-200";
  return "bg-zinc-50 text-zinc-600 border-zinc-200";
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert an ISO datetime string to the value format required by <input type="datetime-local">. */
function isoToDatetimeLocal(isoString: string): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  // datetime-local format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert a datetime-local input value back to an ISO string in UTC. */
function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}

export function ScheduledMessageTable() {
  const queryClient = useQueryClient();
  const [channelFilter, setChannelFilter] = useState("all");
  const [chatIdFilter, setChatIdFilter] = useState("");
  const { data: assistantStatus } = useAssistantStatusQuery();
  const channelNames = assistantStatus?.channels?.map((c) => c.name) ?? [];
  const [editingMessage, setEditingMessage] = useState<ScheduledMessageOut | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSendAt, setEditSendAt] = useState("");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const {
    data: scheduled,
    isLoading,
    isError,
    refetch,
  } = useScheduledMessagesQuery({
    channel: channelFilter !== "all" ? channelFilter : undefined,
    chat_id: chatIdFilter || undefined,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, text, send_at }: { id: string; text: string; send_at: string }) =>
      api.patch(`/assistant/scheduled/${id}`, {
        text,
        send_at: send_at ? datetimeLocalToIso(send_at) : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.scheduled() });
      toast.success("Message updated");
      setEditingMessage(null);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update message");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/assistant/scheduled/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.scheduled() });
      toast.success("Message cancelled");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to cancel message");
    },
    onSettled: () => {
      setCancelTarget(null);
    },
  });

  function openEdit(msg: ScheduledMessageOut) {
    setEditingMessage(msg);
    setEditContent(msg.text);
    setEditSendAt(isoToDatetimeLocal(msg.send_at));
  }

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
        <Input
          placeholder="Filter by chat ID"
          aria-label="Filter by chat ID"
          value={chatIdFilter}
          onChange={(e) => setChatIdFilter(e.target.value)}
          className="h-8 w-[160px] text-sm"
        />
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
          <p className="text-sm text-red-600">Failed to load scheduled messages.</p>
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
      ) : scheduled && scheduled.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Chat
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Channel
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Content
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Scheduled At
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Attempts
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Status
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduled.map((msg) => (
                <TableRow key={msg.id} className="hover:bg-zinc-50">
                  <TableCell className="font-mono text-sm font-medium text-zinc-900">
                    {msg.chat_id}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">{msg.channel}</TableCell>
                  <TableCell className="max-w-48 truncate text-sm text-zinc-600" title={msg.text}>
                    {msg.text}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    {formatDateTime(msg.send_at)}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    {msg.attempts}/{msg.max_attempts}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(msg.status)}>
                      {msg.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11"
                        aria-label={`Edit scheduled message for ${msg.chat_id}`}
                        onClick={() => openEdit(msg)}
                        disabled={msg.status !== "pending"}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Cancel scheduled message for ${msg.chat_id}`}
                        onClick={() => setCancelTarget(msg.id)}
                        disabled={msg.status !== "pending"}
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
          <CalendarClock className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">No scheduled messages.</p>
        </div>
      )}

      <Dialog
        open={editingMessage !== null}
        onOpenChange={(open) => !open && setEditingMessage(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Scheduled Message</DialogTitle>
            <DialogDescription>
              Edit the message content or scheduled time before it is sent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled-content">Content</Label>
              <Textarea
                id="scheduled-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scheduled-send-at">Scheduled time</Label>
              <Input
                id="scheduled-send-at"
                type="datetime-local"
                value={editSendAt}
                onChange={(e) => setEditSendAt(e.target.value)}
                className="min-h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editingMessage &&
                saveMutation.mutate({
                  id: editingMessage.id,
                  text: editContent,
                  send_at: editSendAt,
                })
              }
              disabled={saveMutation.isPending || editContent.trim() === ""}
              aria-label="Save scheduled message"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Scheduled Message"
        description="This will cancel the scheduled message. This action cannot be undone."
        confirmLabel="Cancel Message"
        isPending={cancelMutation.isPending}
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
      />
    </>
  );
}

export default ScheduledMessageTable;
