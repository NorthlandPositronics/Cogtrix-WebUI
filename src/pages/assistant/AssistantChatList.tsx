import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Lock, MessageSquare } from "lucide-react";
import { useAssistantChatsQuery } from "@/hooks/assistant/useAssistantChatsQuery";
import { useAssistantStatusQuery } from "@/hooks/assistant/useAssistantStatusQuery";
import { useSound } from "@/hooks/shared/useSound";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";

function formatAbsoluteTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

const MEMORY_MODE_CLASSES: Record<string, string> = {
  conversation: "bg-zinc-100 text-zinc-600 border-zinc-200",
  code: "bg-blue-50 text-blue-700 border-blue-200",
  reasoning: "bg-teal-50 text-teal-700 border-teal-200",
};

function MemoryModeChip({ mode }: { mode: string }) {
  const classes = MEMORY_MODE_CLASSES[mode] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {mode}
    </span>
  );
}

export function AssistantChatList() {
  const [activeChatKey, setActiveChatKey] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const { data: assistantStatus } = useAssistantStatusQuery();
  const channelNames = assistantStatus?.channels?.map((c) => c.name) ?? [];

  const {
    data: chats,
    isLoading,
    isError,
    refetch,
  } = useAssistantChatsQuery(channelFilter !== "all" ? { channel: channelFilter } : undefined);

  const { playInboundChat } = useSound();
  // Track session keys seen in previous polls; null means not yet initialised (skip first population)
  const seenChatKeysRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!chats) return;
    const currentKeys = new Set(chats.map((c) => c.session_key));
    if (seenChatKeysRef.current === null) {
      // First data load — populate the ref without playing any sound
      seenChatKeysRef.current = currentKeys;
      return;
    }
    // Detect genuinely new session keys since the last poll
    let hasNew = false;
    for (const key of currentKeys) {
      if (!seenChatKeysRef.current.has(key)) {
        hasNew = true;
        break;
      }
    }
    seenChatKeysRef.current = currentKeys;
    if (hasNew) {
      playInboundChat();
    }
  }, [chats, playInboundChat]);

  const activeChat = chats?.find((c) => c.session_key === activeChatKey);
  const activeChatName = activeChat?.display_name ?? activeChat?.chat_id ?? "";

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            {!isLoading && chats
              ? `${chats.length} chat${chats.length !== 1 ? "s" : ""}`
              : "\u00a0"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
          <p className="text-sm text-red-600">Failed to load chats.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : chats && chats.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Name / Chat ID
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Channel
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Mode
                </TableHead>
                <TableHead className="w-8" />
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Last Activity
                </TableHead>
                <TableHead className="text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Messages
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chats.map((chat) => (
                <TableRow key={chat.session_key} className="hover:bg-zinc-50">
                  <TableCell>
                    <button
                      type="button"
                      className="focus-visible:ring-ring min-h-11 rounded-md text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
                      onClick={() => setActiveChatKey(chat.session_key)}
                      aria-haspopup="dialog"
                      aria-label={`View chat history: ${chat.display_name ?? chat.chat_id}`}
                    >
                      {chat.display_name ? (
                        <span className="text-sm font-medium text-zinc-900">
                          {chat.display_name}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-zinc-500">{chat.chat_id}</span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">{chat.channel}</TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    <MemoryModeChip mode={chat.memory_mode} />
                  </TableCell>
                  <TableCell className="w-8">
                    {chat.is_locked && <Lock className="h-4 w-4 text-amber-600" />}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500 tabular-nums">
                    {chat.last_activity ? formatAbsoluteTime(chat.last_activity) : <span>—</span>}
                  </TableCell>
                  <TableCell className="text-right text-sm text-zinc-600 tabular-nums">
                    {chat.message_count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MessageSquare className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">No active chats found.</p>
        </div>
      )}

      <ChatHistoryDrawer
        chatKey={activeChatKey}
        displayName={activeChatName}
        onClose={() => setActiveChatKey(null)}
      />
    </>
  );
}

export default AssistantChatList;
