import { memo, type MouseEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArchiveRestore, CheckCircle2, ChevronDown, Trash2 } from "lucide-react";
import { AgentStateBadge } from "@/components/AgentStateBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SessionOut } from "@/lib/api/types/session";
import type { ModelOut } from "@/lib/api/types/config";

interface SessionCardProps {
  session: SessionOut;
  onDelete: (id: string) => void;
  onUnarchive?: (id: string) => void;
  models?: ModelOut[];
  onEditModel?: (id: string, model: string) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

interface SessionRowProps {
  session: SessionOut;
  onDelete: (id: string) => void;
  onUnarchive?: (id: string) => void;
  models?: ModelOut[];
  onEditModel?: (id: string, model: string) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ModelPopoverProps {
  sessionId: string;
  sessionName: string;
  currentModel: string;
  models: ModelOut[];
  onEditModel: (id: string, model: string) => void;
}

function ModelPopover({
  sessionId,
  sessionName,
  currentModel,
  models,
  onEditModel,
}: ModelPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="focus-visible:ring-ring -mx-1 flex items-center gap-1 rounded px-1 text-sm text-zinc-500 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
          aria-label={`Change model for session: ${sessionName}. Current: ${currentModel}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="truncate">{currentModel}</span>
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start" onClick={(e) => e.stopPropagation()}>
        <p className="px-2 pb-1.5 text-xs font-medium text-zinc-500">Change model</p>
        <div className="space-y-0.5">
          {models.map((m) => (
            <button
              key={m.alias}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-zinc-100",
                m.alias === currentModel && "bg-teal-50",
              )}
              onClick={() => {
                if (m.alias !== currentModel) {
                  onEditModel(sessionId, m.alias);
                }
              }}
              aria-pressed={m.alias === currentModel}
            >
              <span className="flex-1 truncate text-left font-mono text-xs">{m.alias}</span>
              {m.alias === currentModel && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
        <p className="mt-1.5 border-t border-zinc-100 px-2 pt-1 text-xs text-zinc-500">
          Save on select
        </p>
      </PopoverContent>
    </Popover>
  );
}

export const SessionCard = memo(function SessionCard({
  session,
  onDelete,
  onUnarchive,
  models,
  onEditModel,
  selected = false,
  onSelect,
}: SessionCardProps) {
  const navigate = useNavigate();
  const model = session.config.model ?? "Default";
  const isArchived = session.archived_at !== null;

  function handleCardClick() {
    navigate(`/sessions/${session.id}`);
  }

  function handleCardKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/sessions/${session.id}`);
    }
  }

  function handleDeleteClick(e: MouseEvent) {
    e.stopPropagation();
    onDelete(session.id);
  }

  function handleUnarchiveClick(e: MouseEvent) {
    e.stopPropagation();
    onUnarchive?.(session.id);
  }

  return (
    <Card
      data-cy="session-card"
      data-selected={String(selected)}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open session: ${session.name}`}
      className={cn(
        "group focus-visible:ring-ring relative cursor-pointer transition-colors duration-150 hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]",
        isArchived && "bg-zinc-50 opacity-60",
        selected && "ring-2 ring-teal-600 ring-offset-2",
      )}
    >
      {onSelect && (
        <div
          className={cn(
            "absolute top-3 left-3 z-10 transition-opacity duration-150",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            data-cy="session-checkbox"
            checked={selected}
            onCheckedChange={(checked) => onSelect(session.id, checked === true)}
            aria-label={`Select session: ${session.name}`}
            className="border-zinc-400 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
          />
        </div>
      )}

      <CardContent className={cn("flex flex-col gap-2 p-4", onSelect && "pt-4 pl-10")}>
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-base leading-tight font-medium text-zinc-900">
            {session.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AgentStateBadge state={session.state} />
          {isArchived && (
            <Badge
              data-cy="archived-badge"
              variant="secondary"
              className="h-5 px-1.5 text-xs text-zinc-500"
            >
              Archived
            </Badge>
          )}
        </div>

        {models && models.length > 0 && onEditModel ? (
          <ModelPopover
            sessionId={session.id}
            sessionName={session.name}
            currentModel={model}
            models={models}
            onEditModel={onEditModel}
          />
        ) : (
          <span className="truncate text-sm text-zinc-500">{model}</span>
        )}

        <span className="text-xs text-zinc-500">{formatRelativeTime(session.updated_at)}</span>
      </CardContent>

      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        {isArchived && onUnarchive && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Unarchive session: ${session.name}`}
            className="min-h-11 min-w-11 text-zinc-500 hover:bg-zinc-100"
            onClick={handleUnarchiveClick}
          >
            <ArchiveRestore className="h-4 w-4" />
          </Button>
        )}
        <Button
          data-cy="delete-session"
          variant="ghost"
          size="sm"
          aria-label={`Delete session: ${session.name}`}
          className="min-h-11 min-w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
});

export const SessionRow = memo(function SessionRow({
  session,
  onDelete,
  onUnarchive,
  models,
  onEditModel,
  selected = false,
  onSelect,
}: SessionRowProps) {
  const navigate = useNavigate();
  const isArchived = session.archived_at !== null;
  const model = session.config.model ?? "Default";

  function handleRowClick() {
    navigate(`/sessions/${session.id}`);
  }

  function handleRowKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/sessions/${session.id}`);
    }
  }

  function handleDeleteClick(e: MouseEvent) {
    e.stopPropagation();
    onDelete(session.id);
  }

  function handleUnarchiveClick(e: MouseEvent) {
    e.stopPropagation();
    onUnarchive?.(session.id);
  }

  return (
    <tr
      data-cy="session-row"
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      aria-label={`Open session: ${session.name}`}
      className={cn(
        "group focus-visible:ring-ring cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
        isArchived && "opacity-60",
        selected && "bg-zinc-50",
      )}
    >
      <td className="w-10 py-3 pr-1 pl-3" onClick={(e) => e.stopPropagation()}>
        {onSelect && (
          <Checkbox
            data-cy="session-checkbox"
            checked={selected}
            onCheckedChange={(checked) => onSelect(session.id, checked === true)}
            aria-label={`Select session: ${session.name}`}
            className="border-zinc-400 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
          />
        )}
      </td>
      <td className="min-w-0 py-3 pr-2 pl-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-48 truncate text-sm font-medium text-zinc-900">
            {session.name}
          </span>
          {isArchived && (
            <Badge
              data-cy="archived-badge"
              variant="secondary"
              className="h-5 shrink-0 px-1.5 text-xs text-zinc-500"
            >
              Archived
            </Badge>
          )}
        </div>
      </td>
      <td className="hidden py-3 pr-2 sm:table-cell" onClick={(e) => e.stopPropagation()}>
        {models && models.length > 0 && onEditModel ? (
          <ModelPopover
            sessionId={session.id}
            sessionName={session.name}
            currentModel={model}
            models={models}
            onEditModel={onEditModel}
          />
        ) : (
          <span className="truncate text-sm text-zinc-500">{model}</span>
        )}
      </td>
      <td className="py-3 pr-2">
        <AgentStateBadge state={session.state} />
      </td>
      <td className="hidden py-3 pr-2 text-xs text-zinc-500 tabular-nums sm:table-cell">
        {formatRelativeTime(session.updated_at)}
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          {isArchived && onUnarchive && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Unarchive session: ${session.name}`}
              className="h-8 w-8 text-zinc-500 hover:bg-zinc-100"
              onClick={handleUnarchiveClick}
            >
              <ArchiveRestore className="h-4 w-4" />
            </Button>
          )}
          <Button
            data-cy="delete-session-row"
            variant="ghost"
            size="sm"
            aria-label={`Delete session: ${session.name}`}
            className="h-8 w-8 text-zinc-500 hover:bg-red-50 hover:text-red-700"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

export default SessionCard;
