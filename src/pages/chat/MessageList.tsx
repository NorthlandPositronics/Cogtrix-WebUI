import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessagesQuery } from "@/hooks/chat/useMessagesQuery";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  sessionId: string;
  hasStreamingContent?: boolean;
  streamingSlot?: ReactNode;
}

function MessageSkeletons() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex justify-end">
        <Skeleton className="h-14 w-[55%] rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-20 w-[65%] rounded-2xl" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[40%] rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-28 w-[70%] rounded-2xl" />
      </div>
    </div>
  );
}

export function MessageList({
  sessionId,
  hasStreamingContent = false,
  streamingSlot,
}: MessageListProps) {
  const { messages, isLoading, isError, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useMessagesQuery(sessionId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0 && isInitialLoadRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      isInitialLoadRef.current = false;
    }
  }, [isLoading, messages.length]);

  // Auto-scroll to bottom when streaming content arrives
  useEffect(() => {
    if (hasStreamingContent) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hasStreamingContent]);

  // API returns oldest-first; next_cursor points to newer messages.
  // Trigger fetchNextPage when scrolling near the bottom.
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 200 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // IntersectionObserver fallback sentinel at the bottom
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <MessageSkeletons />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
          <p className="text-sm text-red-600">Failed to load messages.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoading && messages.length === 0 && !hasStreamingContent) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <MessageSquare className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">Send a message to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      data-scroll-container
      className="flex flex-1 flex-col overflow-y-auto px-4 py-4"
      onScroll={handleScroll}
    >
      <div className="flex flex-col gap-4" role="list">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex flex-col gap-2 py-2">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-[45%] rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-14 w-[55%] rounded-2xl" />
          </div>
        </div>
      )}

      {/* Streaming bubble rendered inside scroll container so bottomRef stays below it */}
      {streamingSlot}

      {/* Bottom sentinel — triggers fetchNextPage when scrolled into view */}
      <div ref={bottomSentinelRef} className="h-px" aria-hidden="true" />

      {/* Bottom anchor for auto-scroll — must be after streaming content */}
      <div ref={bottomRef} className="h-px" aria-hidden="true" />
    </div>
  );
}

export default MessageList;
