import { Brain, Users, MessageSquare } from "lucide-react";
import type { MessageMode } from "@/lib/api/types/message";

const MODE_LABELS: Record<MessageMode, { icon: React.ReactNode; label: string }> = {
  normal: { icon: <MessageSquare className="size-3.5" />, label: "Normal" },
  think: { icon: <Brain className="size-3.5" />, label: "Think" },
  delegate: { icon: <Users className="size-3.5" />, label: "Delegate" },
};

interface TypingIndicatorProps {
  mode?: MessageMode | null;
}

export function TypingIndicator({ mode = null }: TypingIndicatorProps) {
  const modeInfo = mode ? MODE_LABELS[mode] : null;

  return (
    <div
      className="flex justify-start"
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span
            data-cy="typing-dot"
            aria-hidden="true"
            className="size-2 rounded-full bg-zinc-400 motion-safe:animate-[typing-bounce_0.9s_ease-in-out_infinite]"
          />
          <span
            data-cy="typing-dot"
            aria-hidden="true"
            className="size-2 rounded-full bg-zinc-400 motion-safe:animate-[typing-bounce_0.9s_ease-in-out_0.15s_infinite]"
          />
          <span
            data-cy="typing-dot"
            aria-hidden="true"
            className="size-2 rounded-full bg-zinc-400 motion-safe:animate-[typing-bounce_0.9s_ease-in-out_0.30s_infinite]"
          />
          {modeInfo && (
            <span className="ml-1 flex items-center gap-1 text-xs text-zinc-500" aria-hidden="true">
              {modeInfo.icon}
              {modeInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
