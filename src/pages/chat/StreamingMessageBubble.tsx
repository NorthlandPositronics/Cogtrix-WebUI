import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import {
  markdownComponents,
  REMARK_PLUGINS,
  REHYPE_PLUGINS,
} from "@/components/MarkdownComponents";
const SCROLL_THRESHOLD_PX = 150;

export function StreamingMessageBubble() {
  const streamingBuffer = useStreamingStore((s) => s.streamingBuffer);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const scrollParent = el.closest<HTMLElement>("[data-scroll-container]");
    if (!scrollParent) return;
    const nearBottom =
      scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight <
      SCROLL_THRESHOLD_PX;
    if (nearBottom) {
      el.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }, [streamingBuffer]);

  if (!streamingBuffer.trimStart()) return null;

  return (
    <div
      className="flex justify-start"
      ref={endRef}
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Assistant response"
    >
      <div className="max-w-[75%]">
        <div className="rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm">
          <div className="space-y-3 text-base leading-relaxed">
            <ReactMarkdown
              remarkPlugins={REMARK_PLUGINS}
              rehypePlugins={REHYPE_PLUGINS}
              components={markdownComponents}
            >
              {streamingBuffer}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamingMessageBubble;
