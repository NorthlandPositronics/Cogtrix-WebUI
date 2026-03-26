import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { SendHorizontal, Square, Brain, Users, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MessageMode = "normal" | "think" | "delegate";

interface ModeOption {
  value: MessageMode;
  label: string;
  icon: ReactNode;
}

const MODE_OPTIONS: ModeOption[] = [
  { value: "normal", label: "Normal", icon: <MessageSquare className="h-4 w-4" /> },
  { value: "think", label: "Think", icon: <Brain className="h-4 w-4" /> },
  { value: "delegate", label: "Delegate", icon: <Users className="h-4 w-4" /> },
];

interface MessageInputProps {
  onSend: (text: string, mode: MessageMode) => void;
  onCancel: () => void;
  disabled: boolean;
  isAgentRunning: boolean;
  delegateEnabled?: boolean;
}

export function MessageInput({
  onSend,
  onCancel,
  disabled,
  isAgentRunning,
  delegateEnabled = true,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<MessageMode>("normal");

  const availableModes = delegateEnabled
    ? MODE_OPTIONS
    : MODE_OPTIONS.filter((m) => m.value !== "delegate");

  // When delegate is disabled while selected, fall back to normal for display and sending.
  const effectiveMode: MessageMode = !delegateEnabled && mode === "delegate" ? "normal" : mode;

  const selectedMode = availableModes.find((m) => m.value === effectiveMode) ?? availableModes[0]!;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Return focus to textarea after send
  useEffect(() => {
    if (!isAgentRunning && !disabled) {
      textareaRef.current?.focus();
    }
  }, [isAgentRunning, disabled]);

  function adjustHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    adjustHeight();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      e.preventDefault();
      textareaRef.current?.blur();
    }
    // Shift+Enter falls through to default textarea behavior (inserts newline)
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled || isAgentRunning) return;
    onSend(trimmed, effectiveMode);
    setText("");
    setMode("normal");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    // Restore focus after clearing
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  const canSend = text.trim().length > 0 && !disabled && !isAgentRunning;

  return (
    <div className="sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        {/* Mode selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-cy="message-mode"
              variant="ghost"
              size="sm"
              className="flex min-h-11 shrink-0 items-center gap-1 text-zinc-500"
              aria-label={`Message mode: ${selectedMode.label}`}
              disabled={disabled || isAgentRunning}
            >
              {selectedMode.icon}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={effectiveMode}
              onValueChange={(v) => setMode(v as MessageMode)}
            >
              {availableModes.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <span className="text-zinc-500" aria-hidden="true">
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Textarea — Enter sends, Shift+Enter newline, Escape blurs */}
        <textarea
          ref={textareaRef}
          data-cy="message-input"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message... (Enter to send, Shift+Enter for newline)"
          aria-label="Message input"
          aria-describedby="message-input-hint"
          rows={1}
          disabled={disabled}
          className="focus-visible:ring-ring max-h-36 min-h-11 flex-1 resize-none overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2 text-base leading-relaxed text-zinc-900 transition-colors duration-150 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span id="message-input-hint" className="sr-only">
          Press Enter to send. Press Shift+Enter for a new line.
        </span>

        {/* Send / Cancel */}
        {isAgentRunning ? (
          <Button
            data-cy="cancel-generation"
            variant="outline"
            size="sm"
            onClick={onCancel}
            aria-label="Cancel generation"
            className="min-h-11 shrink-0 border-zinc-200"
          >
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            data-cy="send-message"
            size="sm"
            onClick={handleSend}
            disabled={!canSend}
            aria-label={disabled ? "Connecting..." : "Send message"}
            className="min-h-11 shrink-0"
          >
            <SendHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default MessageInput;
