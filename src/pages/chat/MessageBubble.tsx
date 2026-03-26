import { memo } from "react";
import { Check, X, MessageSquare, Brain, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { MessageOut, MessageMode, ToolCallRecord } from "@/lib/api/types/message";
import {
  markdownComponents,
  REMARK_PLUGINS,
  REHYPE_PLUGINS,
} from "@/components/MarkdownComponents";

interface MessageBubbleProps {
  message: MessageOut;
}

function formatTimestamp(iso: string): string {
  const normalized = iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
  return new Date(normalized).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ToolCallSummary({ record }: { record: ToolCallRecord }) {
  const hasError = record.error !== null;
  const durationSec =
    record.duration_ms !== null ? (record.duration_ms / 1000).toFixed(2) + "s" : null;

  return (
    <div className="flex items-center gap-2 py-0.5 font-mono text-xs text-zinc-500">
      <span className="flex w-3 shrink-0 justify-center" aria-hidden="true">
        {hasError ? (
          <X className="size-3 text-red-600" />
        ) : (
          <Check className="size-3 text-green-600" />
        )}
      </span>
      <span className="text-zinc-700">{record.tool_name}</span>
      <span className="ml-auto tabular-nums">
        {hasError ? (
          <span className="text-red-600" title={record.error ?? undefined}>
            failed
          </span>
        ) : (
          <span className="text-zinc-500">{durationSec}</span>
        )}
      </span>
    </div>
  );
}

const MODE_ICONS: Record<MessageMode, { icon: React.ReactNode; label: string }> = {
  normal: { icon: <MessageSquare className="size-3" />, label: "Normal" },
  think: { icon: <Brain className="size-3" />, label: "Think" },
  delegate: { icon: <Users className="size-3" />, label: "Delegate" },
};

function UserBubble({ message }: { message: MessageOut }) {
  const modeInfo = message.mode ? MODE_ICONS[message.mode] : null;

  return (
    <div className="flex justify-end" role="listitem" aria-label="You said">
      <div className="max-w-[75%]">
        <div className="rounded-2xl rounded-br-sm border border-teal-200 bg-teal-50 px-4 py-3 text-zinc-900">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="mt-1 flex items-center justify-end gap-1.5">
          {modeInfo && (
            <span
              className="flex items-center gap-1 text-zinc-400"
              title={modeInfo.label}
              aria-label={`Sent in ${modeInfo.label} mode`}
            >
              {modeInfo.icon}
            </span>
          )}
          <p className="text-xs text-zinc-500">{formatTimestamp(message.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: MessageOut }) {
  return (
    <div className="flex justify-start" role="listitem" aria-label="Assistant said">
      <div className="max-w-[75%]">
        <div className="rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm">
          <div className="space-y-3 text-base leading-relaxed">
            <ReactMarkdown
              remarkPlugins={REMARK_PLUGINS}
              rehypePlugins={REHYPE_PLUGINS}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          {message.tool_calls.length > 0 && (
            <div className="mt-2 border-t border-zinc-200 pt-1.5">
              {message.tool_calls.map((tc) => (
                <ToolCallSummary key={tc.tool_call_id} record={tc} />
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">{formatTimestamp(message.created_at)}</p>
      </div>
    </div>
  );
}

function SystemBubble({ message }: { message: MessageOut }) {
  return (
    <div className="flex justify-center" role="listitem" aria-label="System message">
      <div className="max-w-[60%]">
        <div
          role="status"
          className="mx-auto rounded-md bg-zinc-100 px-3 py-1.5 text-center text-sm text-zinc-600 italic"
        >
          {message.content}
        </div>
        <p className="mt-1 text-center text-xs text-zinc-500">
          {formatTimestamp(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function ToolBubble({ message }: { message: MessageOut }) {
  return (
    <div className="flex justify-start" role="listitem" aria-label="Tool output">
      <div className="max-w-[85%]">
        <div className="rounded-md border border-l-2 border-zinc-200 border-l-zinc-400 bg-zinc-50 px-4 py-3">
          <pre className="overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-900">
            {message.content}
          </pre>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{formatTimestamp(message.created_at)}</p>
      </div>
    </div>
  );
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  switch (message.role) {
    case "user":
      return <UserBubble message={message} />;
    case "assistant":
      return <AssistantBubble message={message} />;
    case "system":
      return <SystemBubble message={message} />;
    case "tool":
      return <ToolBubble message={message} />;
  }
});

export default MessageBubble;
