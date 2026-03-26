import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Megaphone,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type {
  CampaignCreateRequest,
  CampaignOut,
  CampaignStatus,
  CampaignTargetStatus,
  CampaignUpdateRequest,
} from "@/lib/api/types/assistant";
import { ApiError } from "@/lib/api/types/common";
import { useCampaignsQuery } from "@/hooks/assistant/useCampaignsQuery";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_BADGE: Record<CampaignStatus, React.ReactNode> = {
  draft: (
    <Badge variant="outline" className="text-zinc-600">
      draft
    </Badge>
  ),
  active: (
    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
      active
    </Badge>
  ),
  paused: (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
      paused
    </Badge>
  ),
  completed: (
    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
      completed
    </Badge>
  ),
  cancelled: (
    <Badge variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-600">
      cancelled
    </Badge>
  ),
};

const TARGET_STATUS_BADGE: Record<CampaignTargetStatus, React.ReactNode> = {
  pending: (
    <Badge variant="outline" className="text-zinc-600">
      pending
    </Badge>
  ),
  active: (
    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
      active
    </Badge>
  ),
  completed: (
    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
      completed
    </Badge>
  ),
  failed: (
    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
      failed
    </Badge>
  ),
  escalated: (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
      escalated
    </Badge>
  ),
};

// ---------------------------------------------------------------------------
// Create dialog
// ---------------------------------------------------------------------------

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

interface CreateFormState {
  name: string;
  goal: string;
  instructions: string;
  targetsRaw: string;
  maxFollowUps: string;
  followUpIntervalHours: string;
  autoLaunch: boolean;
}

const EMPTY_FORM: CreateFormState = {
  name: "",
  goal: "",
  instructions: "",
  targetsRaw: "",
  maxFollowUps: "3",
  followUpIntervalHours: "24",
  autoLaunch: false,
};

function CreateCampaignDialog({ open, onOpenChange, onCreated }: CreateDialogProps) {
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);

  function set<K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const createMutation = useMutation({
    mutationFn: (body: CampaignCreateRequest) =>
      api.post<CampaignOut>("/assistant/campaigns", body),
    onSuccess: () => {
      toast.success("Campaign created");
      onCreated();
      onOpenChange(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create campaign");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const targets = form.targetsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((contact_name) => ({ contact_name }));

    createMutation.mutate({
      name: form.name.trim(),
      goal: form.goal.trim(),
      instructions: form.instructions.trim(),
      targets,
      max_follow_ups: parseInt(form.maxFollowUps, 10) || 3,
      follow_up_interval_hours: parseInt(form.followUpIntervalHours, 10) || 24,
      auto_launch: form.autoLaunch,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>Configure a new outbound campaign.</DialogDescription>
        </DialogHeader>
        <form id="create-campaign-form" onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="campaign-name">Name</Label>
              <Input
                id="campaign-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Campaign name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-goal">Goal</Label>
              <Textarea
                id="campaign-goal"
                value={form.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="What should this campaign achieve?"
                rows={2}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-instructions">Instructions</Label>
              <Textarea
                id="campaign-instructions"
                value={form.instructions}
                onChange={(e) => set("instructions", e.target.value)}
                placeholder="Instructions for the assistant when running this campaign"
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-targets">
                Targets{" "}
                <span className="text-xs text-zinc-500">(comma-separated contact names)</span>
              </Label>
              <Input
                id="campaign-targets"
                value={form.targetsRaw}
                onChange={(e) => set("targetsRaw", e.target.value)}
                placeholder="Alice, Bob, Charlie"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="campaign-max-followups">Max follow-ups</Label>
                <Input
                  id="campaign-max-followups"
                  type="number"
                  min={0}
                  value={form.maxFollowUps}
                  onChange={(e) => set("maxFollowUps", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-interval">Interval (hours)</Label>
                <Input
                  id="campaign-interval"
                  type="number"
                  min={1}
                  value={form.followUpIntervalHours}
                  onChange={(e) => set("followUpIntervalHours", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="campaign-auto-launch"
                checked={form.autoLaunch}
                onCheckedChange={(checked) => set("autoLaunch", checked)}
              />
              <Label htmlFor="campaign-auto-launch">Auto-launch after creation</Label>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-campaign-form"
            disabled={createMutation.isPending}
            data-cy="confirm-create-campaign"
          >
            {createMutation.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit dialog
// ---------------------------------------------------------------------------

interface EditDialogProps {
  campaign: CampaignOut | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

interface EditFormState {
  name: string;
  goal: string;
  instructions: string;
  maxFollowUps: string;
  followUpIntervalHours: string;
}

function EditCampaignDialog({ campaign, onOpenChange, onSaved }: EditDialogProps) {
  const [form, setForm] = useState<EditFormState>({
    name: campaign?.name ?? "",
    goal: campaign?.goal ?? "",
    instructions: campaign?.instructions ?? "",
    maxFollowUps: String(campaign?.max_follow_ups ?? 3),
    followUpIntervalHours: String(campaign?.follow_up_interval_hours ?? 24),
  });

  function set<K extends keyof EditFormState>(key: K, value: EditFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const editMutation = useMutation({
    mutationFn: (body: CampaignUpdateRequest) =>
      api.patch<CampaignOut>(`/assistant/campaigns/${campaign?.id}`, body),
    onSuccess: () => {
      toast.success("Campaign updated");
      onSaved();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update campaign");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign) return;
    const body: CampaignUpdateRequest = {};
    const trimName = form.name.trim();
    const trimGoal = form.goal.trim();
    const trimInstructions = form.instructions.trim();
    const maxFU = parseInt(form.maxFollowUps, 10);
    const interval = parseInt(form.followUpIntervalHours, 10);

    if (trimName !== campaign.name) body.name = trimName;
    if (trimGoal !== campaign.goal) body.goal = trimGoal;
    if (trimInstructions !== campaign.instructions) body.instructions = trimInstructions;
    if (!isNaN(maxFU) && maxFU !== campaign.max_follow_ups) body.max_follow_ups = maxFU;
    if (!isNaN(interval) && interval !== campaign.follow_up_interval_hours)
      body.follow_up_interval_hours = interval;

    editMutation.mutate(body);
  }

  return (
    <Dialog open={campaign !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>Update the campaign configuration.</DialogDescription>
        </DialogHeader>
        <form id="edit-campaign-form" onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-campaign-name">Name</Label>
              <Input
                id="edit-campaign-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Campaign name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-campaign-goal">Goal</Label>
              <Textarea
                id="edit-campaign-goal"
                value={form.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="What should this campaign achieve?"
                rows={2}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-campaign-instructions">Instructions</Label>
              <Textarea
                id="edit-campaign-instructions"
                value={form.instructions}
                onChange={(e) => set("instructions", e.target.value)}
                placeholder="Instructions for the assistant"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-campaign-max-followups">Max follow-ups</Label>
                <Input
                  id="edit-campaign-max-followups"
                  type="number"
                  min={0}
                  value={form.maxFollowUps}
                  onChange={(e) => set("maxFollowUps", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-campaign-interval">Interval (hours)</Label>
                <Input
                  id="edit-campaign-interval"
                  type="number"
                  min={1}
                  value={form.followUpIntervalHours}
                  onChange={(e) => set("followUpIntervalHours", e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={editMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-campaign-form"
            disabled={editMutation.isPending}
            data-cy="confirm-edit-campaign"
          >
            {editMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Expanded detail row
// ---------------------------------------------------------------------------

interface CampaignDetailProps {
  campaign: CampaignOut;
}

function CampaignDetail({ campaign }: CampaignDetailProps) {
  return (
    <div className="space-y-4 bg-zinc-50 px-4 py-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-0.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">Goal</p>
          <p className="text-sm text-zinc-900">{campaign.goal}</p>
        </div>
        <div>
          <p className="mb-0.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Instructions
          </p>
          <p className="text-sm text-zinc-900">{campaign.instructions}</p>
        </div>
      </div>

      {campaign.targets.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Contact
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Channel
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Follow-ups
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Last outbound
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Last reply
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Reason
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.targets.map((t) => (
                <TableRow key={t.chat_id} className="hover:bg-zinc-50">
                  <TableCell className="font-medium text-zinc-900">{t.contact_name}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{t.channel}</TableCell>
                  <TableCell>{TARGET_STATUS_BADGE[t.status]}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{t.follow_ups_sent}</TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    {t.last_outbound_at ? (
                      formatDate(t.last_outbound_at)
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    {t.last_reply_at ? (
                      formatDate(t.last_reply_at)
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-zinc-600">
                    {t.completion_reason ?? <span className="text-zinc-500">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No targets.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row with collapsible detail
// ---------------------------------------------------------------------------

interface CampaignRowProps {
  campaign: CampaignOut;
  onLaunch: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onEdit: (campaign: CampaignOut) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

function CampaignRow({
  campaign,
  onLaunch,
  onPause,
  onResume,
  onCancel,
  onEdit,
  onDelete,
  isPending,
}: CampaignRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded} asChild>
      <>
        <CollapsibleTrigger asChild>
          <TableRow
            data-cy={`campaign-row-${campaign.id}`}
            className="focus-visible:ring-ring cursor-pointer hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-expanded={expanded}
            aria-label={`Expand campaign: ${campaign.name}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpanded(!expanded);
              }
            }}
          >
            <TableCell className="w-6 pr-0">
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              )}
            </TableCell>
            <TableCell className="font-medium text-zinc-900">{campaign.name}</TableCell>
            <TableCell>{STATUS_BADGE[campaign.status]}</TableCell>
            <TableCell className="text-sm text-zinc-600">{campaign.targets.length}</TableCell>
            <TableCell className="text-sm text-zinc-600">{campaign.max_follow_ups}</TableCell>
            <TableCell className="text-xs text-zinc-600">
              {formatDate(campaign.created_at)}
            </TableCell>
            <TableCell>
              <div
                className="flex justify-end"
                role="presentation"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11 min-w-11 p-0 text-zinc-500"
                      aria-label="Campaign actions"
                      disabled={isPending}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {campaign.status === "draft" && (
                      <DropdownMenuItem onClick={() => onLaunch(campaign.id)}>
                        Launch
                      </DropdownMenuItem>
                    )}
                    {campaign.status === "active" && (
                      <DropdownMenuItem onClick={() => onPause(campaign.id)}>
                        Pause
                      </DropdownMenuItem>
                    )}
                    {campaign.status === "paused" && (
                      <DropdownMenuItem onClick={() => onResume(campaign.id)}>
                        Resume
                      </DropdownMenuItem>
                    )}
                    {(campaign.status === "draft" || campaign.status === "paused") && (
                      <DropdownMenuItem onClick={() => onEdit(campaign)}>Edit</DropdownMenuItem>
                    )}
                    {(campaign.status === "active" || campaign.status === "paused") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-700"
                          onClick={() => onCancel(campaign.id)}
                        >
                          Stop
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:bg-red-50 focus:text-red-700"
                      onClick={() => onDelete(campaign.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <tr>
            <td colSpan={7} className="p-0">
              <CampaignDetail campaign={campaign} />
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function CampaignsPanel() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CampaignOut | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useCampaignsQuery(
    statusFilter !== "all" ? { status: statusFilter } : undefined,
  );

  const campaigns = data ?? [];

  const launchMutation = useMutation({
    mutationFn: (id: string) => api.post<CampaignOut>(`/assistant/campaigns/${id}/launch`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.campaigns.list() });
      toast.success("Campaign launched");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to launch campaign");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      api.patch<CampaignOut>(`/assistant/campaigns/${id}`, { status }),
    onSuccess: (_data, { status }) => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.campaigns.list() });
      const label = status === "paused" ? "paused" : status === "cancelled" ? "stopped" : "resumed";
      toast.success(`Campaign ${label}`);
    },
    onSettled: () => {
      setCancelTarget(null);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update campaign");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/assistant/campaigns/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.assistant.campaigns.list() });
      toast.success("Campaign deleted");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete campaign");
    },
    onSettled: () => {
      setDeleteTarget(null);
    },
  });

  const anyPending =
    launchMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            {isLoading
              ? "\u00a0"
              : `${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""}`}
          </p>
          <Button size="sm" onClick={() => setCreateOpen(true)} data-cy="create-campaign-button">
            <Plus className="mr-1.5 h-4 w-4" />
            New campaign
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as CampaignStatus | "all")}
          >
            <SelectTrigger className="h-8 w-[140px] text-sm" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
            <p className="text-sm text-red-600">Failed to load campaigns.</p>
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
        ) : campaigns.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6" />
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Targets
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Follow-ups
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Created
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    onLaunch={(id) => launchMutation.mutate(id)}
                    onPause={(id) => updateMutation.mutate({ id, status: "paused" })}
                    onResume={(id) => updateMutation.mutate({ id, status: "active" })}
                    onCancel={(id) => setCancelTarget(id)}
                    onEdit={(c) => setEditTarget(c)}
                    onDelete={(id) => setDeleteTarget(id)}
                    isPending={anyPending}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Megaphone className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">No campaigns.</p>
          </div>
        )}
      </div>

      <CreateCampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() =>
          void queryClient.invalidateQueries({ queryKey: keys.assistant.campaigns.list() })
        }
      />

      {editTarget && (
        <EditCampaignDialog
          campaign={editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSaved={() =>
            void queryClient.invalidateQueries({ queryKey: keys.assistant.campaigns.list() })
          }
        />
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Stop Campaign"
        description="This will cancel the campaign. No further follow-ups will be sent. This action cannot be undone."
        confirmLabel="Stop"
        isPending={updateMutation.isPending}
        onConfirm={() =>
          cancelTarget && updateMutation.mutate({ id: cancelTarget, status: "cancelled" })
        }
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Campaign"
        description="This will permanently delete the campaign and all its data. This action cannot be undone."
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        variant="destructive"
      />
    </>
  );
}

export default CampaignsPanel;
