import { AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssistantChatMessagesQuery } from "@/hooks/assistant/useAssistantChatMessagesQuery";

interface ChatHistoryDrawerProps {
  chatKey: string | null;
  displayName: string;
  onClose: () => void;
}

export function ChatHistoryDrawer({ chatKey, displayName, onClose }: ChatHistoryDrawerProps) {
  const { data: messages, isLoading, isError, refetch } = useAssistantChatMessagesQuery(chatKey);

  return (
    <Sheet open={chatKey !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-zinc-200 px-4 py-3">
          <SheetTitle className="text-sm font-semibold">{displayName || "Chat History"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
              <p className="text-sm text-red-600">Failed to load chat history.</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  {msg.role}
                </span>
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-900">
                  {msg.content}
                </p>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">No messages found.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatHistoryDrawer;
