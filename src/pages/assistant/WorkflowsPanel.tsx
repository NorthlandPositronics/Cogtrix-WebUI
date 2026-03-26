import { useState, type FormEvent, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  GitBranch,
  Link,
  Link2Off,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAssistantChatsQuery } from "@/hooks/assistant/useAssistantChatsQuery";
import {
  useWorkflowsQuery,
  useWorkflowDocumentsQuery,
  useWorkflowBindingsQuery,
} from "@/hooks/assistant/useWorkflowsQuery";
import type {
  WorkflowOut,
  WorkflowCreateRequest,
  WorkflowUpdateRequest,
  WorkflowBindingOut,
  BindWorkflowRequest,
  WorkflowDocumentOut,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Status badges
// ---------------------------------------------------------------------------

function KbBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Badge className="border-green-200 bg-green-50 text-green-700" variant="outline">
      Yes
    </Badge>
  ) : (
    <Badge variant="outline" className="text-zinc-600">
      No
    </Badge>
  );
}

function AutoDetectBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50" variant="outline">
      Enabled
    </Badge>
  ) : (
    <Badge variant="outline" className="text-zinc-600">
      Disabled
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Workflow form state
// ---------------------------------------------------------------------------

interface WorkflowFormState {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  knowledge_base: boolean;
  excluded_tools: string;
  additional_approved_tools: string;
  auto_detect_enabled: boolean;
  auto_detect_keywords: string;
  auto_detect_patterns: string;
  min_confidence: string;
}

const DEFAULT_FORM: WorkflowFormState = {
  id: "",
  name: "",
  description: "",
  system_prompt: "",
  knowledge_base: false,
  excluded_tools: "",
  additional_approved_tools: "",
  auto_detect_enabled: false,
  auto_detect_keywords: "",
  auto_detect_patterns: "",
  min_confidence: "1",
};

function formFromWorkflow(w: WorkflowOut): WorkflowFormState {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    system_prompt: w.system_prompt ?? "",
    knowledge_base: w.knowledge_base,
    excluded_tools: (w.tool_policy?.excluded_tools ?? []).join(", "),
    additional_approved_tools: (w.tool_policy?.additional_approved_tools ?? []).join(", "),
    auto_detect_enabled: w.auto_detect?.enabled ?? false,
    auto_detect_keywords: (w.auto_detect?.keywords ?? []).join(", "),
    auto_detect_patterns: (w.auto_detect?.patterns ?? []).join(", "),
    min_confidence: String(w.auto_detect?.min_confidence ?? 1),
  };
}

// ---------------------------------------------------------------------------
// Workflow form fields (shared between create and edit dialogs)
// ---------------------------------------------------------------------------

interface WorkflowFormFieldsProps {
  form: WorkflowFormState;
  onChange: (patch: Partial<WorkflowFormState>) => void;
  isEditMode: boolean;
  advancedOpen: boolean;
  onAdvancedToggle: () => void;
}

function WorkflowFormFields({
  form,
  onChange,
  isEditMode,
  advancedOpen,
  onAdvancedToggle,
}: WorkflowFormFieldsProps) {
  return (
    <div className="space-y-4">
      {!isEditMode && (
        <div className="space-y-1.5">
          <Label htmlFor="wf-id">ID</Label>
          <Input
            id="wf-id"
            value={form.id}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ id: e.target.value })}
            placeholder="my-workflow"
            pattern="[a-zA-Z0-9_\-]+"
            required
          />
          <p className="text-xs text-zinc-500">Alphanumeric, hyphens, and underscores only.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="wf-name">Name</Label>
        <Input
          id="wf-name"
          value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ name: e.target.value })}
          placeholder="My Workflow"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wf-description">Description</Label>
        <Textarea
          id="wf-description"
          value={form.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onChange({ description: e.target.value })
          }
          placeholder="Describe what this workflow does..."
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wf-system-prompt">System prompt</Label>
        <Textarea
          id="wf-system-prompt"
          value={form.system_prompt}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onChange({ system_prompt: e.target.value })
          }
          placeholder="Optional system prompt override..."
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-zinc-900">Knowledge base</p>
          <p className="text-xs text-zinc-500">Enable RAG knowledge base for this workflow.</p>
        </div>
        <Switch
          checked={form.knowledge_base}
          onCheckedChange={(v) => onChange({ knowledge_base: v })}
          aria-label="Knowledge base"
        />
      </div>

      <Collapsible open={advancedOpen} onOpenChange={onAdvancedToggle}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-between px-0 text-zinc-600 hover:text-zinc-900"
          >
            <span className="text-sm font-medium">Advanced settings</span>
            {advancedOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="wf-excluded-tools">Excluded tools (comma-separated)</Label>
            <Input
              id="wf-excluded-tools"
              value={form.excluded_tools}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ excluded_tools: e.target.value })
              }
              placeholder="tool_a, tool_b"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wf-approved-tools">Additional approved tools (comma-separated)</Label>
            <Input
              id="wf-approved-tools"
              value={form.additional_approved_tools}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ additional_approved_tools: e.target.value })
              }
              placeholder="tool_c, tool_d"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-900">Auto-detect</p>
              <p className="text-xs text-zinc-500">
                Automatically detect when to apply this workflow.
              </p>
            </div>
            <Switch
              checked={form.auto_detect_enabled}
              onCheckedChange={(v) => onChange({ auto_detect_enabled: v })}
              aria-label="Auto-detect enabled"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wf-keywords">Auto-detect keywords (comma-separated)</Label>
            <Input
              id="wf-keywords"
              value={form.auto_detect_keywords}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ auto_detect_keywords: e.target.value })
              }
              placeholder="keyword1, keyword2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wf-patterns">Auto-detect patterns (comma-separated)</Label>
            <Input
              id="wf-patterns"
              value={form.auto_detect_patterns}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ auto_detect_patterns: e.target.value })
              }
              placeholder="pattern1, pattern2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wf-confidence">Min confidence</Label>
            <Input
              id="wf-confidence"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={form.min_confidence}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ min_confidence: e.target.value })
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create workflow dialog
// ---------------------------------------------------------------------------

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function CreateWorkflowDialog({ open, onOpenChange, onSuccess }: CreateWorkflowDialogProps) {
  const [form, setForm] = useState<WorkflowFormState>(DEFAULT_FORM);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (body: WorkflowCreateRequest) =>
      api.post<WorkflowOut>("/assistant/workflows", body),
    onSuccess: () => {
      toast.success("Workflow created");
      onSuccess();
      onOpenChange(false);
      setForm(DEFAULT_FORM);
      setAdvancedOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create workflow");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body: WorkflowCreateRequest = {
      id: form.id.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      system_prompt: form.system_prompt.trim() || null,
      knowledge_base: form.knowledge_base,
      tool_policy: {
        excluded_tools: splitCsv(form.excluded_tools),
        additional_approved_tools: splitCsv(form.additional_approved_tools),
      },
      auto_detect: {
        enabled: form.auto_detect_enabled,
        keywords: splitCsv(form.auto_detect_keywords),
        patterns: splitCsv(form.auto_detect_patterns),
        min_confidence: parseFloat(form.min_confidence) || 1,
      },
    };
    createMutation.mutate(body);
  }

  function handleClose(next: boolean) {
    if (!next) {
      setForm(DEFAULT_FORM);
      setAdvancedOpen(false);
    }
    onOpenChange(next);
  }

  const isValid = form.id.trim().length > 0 && form.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create workflow</DialogTitle>
          <DialogDescription>
            Define a new workflow with a system prompt, tool policy, and auto-detect settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1">
          <WorkflowFormFields
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            isEditMode={false}
            advancedOpen={advancedOpen}
            onAdvancedToggle={() => setAdvancedOpen((v) => !v)}
          />

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !isValid}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit workflow dialog
// ---------------------------------------------------------------------------

interface EditWorkflowDialogProps {
  workflow: WorkflowOut | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function EditWorkflowDialog({ workflow, onOpenChange, onSuccess }: EditWorkflowDialogProps) {
  const [form, setForm] = useState<WorkflowFormState>(
    workflow ? formFromWorkflow(workflow) : DEFAULT_FORM,
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Sync form when the workflow prop changes (dialog re-opened for different row)
  const [lastId, setLastId] = useState<string | null>(null);
  if (workflow && workflow.id !== lastId) {
    setLastId(workflow.id);
    setForm(formFromWorkflow(workflow));
    setAdvancedOpen(false);
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: WorkflowUpdateRequest }) =>
      api.put<WorkflowOut>(`/assistant/workflows/${encodeURIComponent(id)}`, body),
    onSuccess: () => {
      toast.success("Workflow updated");
      onSuccess();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update workflow");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workflow) return;
    const body: WorkflowUpdateRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      system_prompt: form.system_prompt.trim() || null,
      knowledge_base: form.knowledge_base,
      tool_policy: {
        excluded_tools: splitCsv(form.excluded_tools),
        additional_approved_tools: splitCsv(form.additional_approved_tools),
      },
      auto_detect: {
        enabled: form.auto_detect_enabled,
        keywords: splitCsv(form.auto_detect_keywords),
        patterns: splitCsv(form.auto_detect_patterns),
        min_confidence: parseFloat(form.min_confidence) || 1,
      },
    };
    updateMutation.mutate({ id: workflow.id, body });
  }

  const isValid = form.name.trim().length > 0;

  return (
    <Dialog open={workflow !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit workflow</DialogTitle>
          <DialogDescription>Update the workflow configuration.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1">
          <WorkflowFormFields
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            isEditMode={true}
            advancedOpen={advancedOpen}
            onAdvancedToggle={() => setAdvancedOpen((v) => !v)}
          />

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !isValid}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Documents dialog
// ---------------------------------------------------------------------------

interface DocumentsDialogProps {
  workflowId: string | null;
  onOpenChange: (open: boolean) => void;
}

function DocumentsDialog({ workflowId, onOpenChange }: DocumentsDialogProps) {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: docs, isLoading, isError } = useWorkflowDocumentsQuery(workflowId);

  const deleteMutation = useMutation({
    mutationFn: ({ wfId, docId }: { wfId: string; docId: string }) =>
      api.delete(
        `/assistant/workflows/${encodeURIComponent(wfId)}/documents/${encodeURIComponent(docId)}`,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.workflows.documents(workflowId!) });
      toast.success("Document deleted");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete document");
    },
    onSettled: () => {
      setDeleteTarget(null);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ wfId, formData }: { wfId: string; formData: FormData }) =>
      api.upload<WorkflowDocumentOut>(
        `/assistant/workflows/${encodeURIComponent(wfId)}/documents`,
        formData,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.workflows.documents(workflowId!) });
      toast.success("Document uploaded");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload document");
    },
  });

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !workflowId) return;
    const formData = new FormData();
    formData.append("file", file);
    uploadMutation.mutate({ wfId: workflowId, formData });
    e.target.value = "";
  }

  return (
    <>
      <Dialog open={workflowId !== null} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow documents</DialogTitle>
            <DialogDescription>
              Manage documents attached to this workflow&apos;s knowledge base.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <label htmlFor="doc-upload">
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  disabled={uploadMutation.isPending}
                  asChild
                >
                  <span>
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload document
                  </span>
                </Button>
              </label>
              <input
                id="doc-upload"
                type="file"
                className="sr-only"
                onChange={handleUpload}
                disabled={uploadMutation.isPending}
                aria-label="Upload document"
              />
            </div>

            {isError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertTriangle className="h-10 w-10 text-red-600" strokeWidth={1.5} />
                <p className="text-sm text-red-600">Failed to load documents.</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !docs?.length ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText className="h-10 w-10 text-zinc-400" strokeWidth={1.5} />
                <p className="text-sm text-zinc-500">No documents attached to this workflow.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Filename
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Size
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Type
                      </TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map((doc) => (
                      <TableRow key={doc.doc_id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">{doc.filename}</TableCell>
                        <TableCell className="text-sm text-zinc-600">
                          {formatBytes(doc.size_bytes)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-600">
                          {doc.content_type}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-11 w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                            aria-label={`Delete ${doc.filename}`}
                            onClick={() => setDeleteTarget(doc.doc_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete document"
        description="This will permanently delete the document. This action cannot be undone."
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deleteTarget &&
          workflowId &&
          deleteMutation.mutate({ wfId: workflowId, docId: deleteTarget })
        }
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Bindings dialog
// ---------------------------------------------------------------------------

interface BindingsDialogProps {
  workflowId: string | null;
  onOpenChange: (open: boolean) => void;
}

function BindingsDialog({ workflowId, onOpenChange }: BindingsDialogProps) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const queryClient = useQueryClient();
  const [selectedChatKey, setSelectedChatKey] = useState("");
  const [unbindTarget, setUnbindTarget] = useState<string | null>(null);

  const {
    data: allBindings,
    isLoading: bindingsLoading,
    isError: bindingsError,
  } = useWorkflowBindingsQuery();

  const { data: chats } = useAssistantChatsQuery();

  const bindMutation = useMutation({
    mutationFn: ({ sessionKey, body }: { sessionKey: string; body: BindWorkflowRequest }) =>
      api.put<WorkflowBindingOut>(
        `/assistant/workflows/bindings/${encodeURIComponent(sessionKey)}`,
        body,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.workflows.bindings() });
      toast.success("Chat bound to workflow");
      setSelectedChatKey("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to bind chat");
    },
  });

  const unbindMutation = useMutation({
    mutationFn: (sessionKey: string) =>
      api.delete(`/assistant/workflows/bindings/${encodeURIComponent(sessionKey)}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.workflows.bindings() });
      toast.success("Chat unbound from workflow");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to unbind chat");
    },
    onSettled: () => {
      setUnbindTarget(null);
    },
  });

  const workflowBindings = allBindings?.filter((b) => b.workflow_id === workflowId) ?? [];

  const boundToThisWorkflow = new Set(workflowBindings.map((b) => b.session_key));

  const reboundWarning =
    selectedChatKey.length > 0 &&
    allBindings?.some((b) => b.session_key === selectedChatKey && b.workflow_id !== workflowId) ===
      true;

  const selectableChats = (chats ?? []).filter((c) => !boundToThisWorkflow.has(c.session_key));

  function handleBind() {
    if (!selectedChatKey || !workflowId) return;
    bindMutation.mutate({ sessionKey: selectedChatKey, body: { workflow_id: workflowId } });
  }

  function formatAssignedAt(value: string): string {
    if (!value) return "—";
    const d = new Date(value);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  }

  return (
    <>
      <Dialog open={workflowId !== null} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow bindings</DialogTitle>
            <DialogDescription>Chat sessions currently bound to this workflow.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isAdmin && (
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="bind-chat-select">Chat session</Label>
                  <Select
                    value={selectedChatKey}
                    onValueChange={setSelectedChatKey}
                    disabled={bindMutation.isPending}
                  >
                    <SelectTrigger id="bind-chat-select">
                      <SelectValue placeholder="Select a chat..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableChats.map((c) => (
                        <SelectItem key={c.session_key} value={c.session_key}>
                          {c.display_name ?? c.session_key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleBind}
                  disabled={!selectedChatKey || bindMutation.isPending}
                >
                  {bindMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                  Bind
                </Button>
              </div>
            )}

            {reboundWarning && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-sm text-amber-800">
                  This chat is already bound to a different workflow. Saving will reassign it.
                </AlertDescription>
              </Alert>
            )}

            {bindingsError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertTriangle className="h-10 w-10 text-red-600" strokeWidth={1.5} />
                <p className="text-sm text-red-600">Failed to load bindings.</p>
              </div>
            ) : bindingsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : workflowBindings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Link2Off className="h-10 w-10 text-zinc-400" strokeWidth={1.5} />
                <p className="text-sm text-zinc-500">No chats are bound to this workflow.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Session key
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Assigned at
                      </TableHead>
                      <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Assigned by
                      </TableHead>
                      {isAdmin && <TableHead className="w-12" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflowBindings.map((b) => (
                      <TableRow key={b.session_key} className="hover:bg-zinc-50">
                        <TableCell className="font-mono text-sm text-zinc-900">
                          {b.session_key}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-600">
                          {formatAssignedAt(b.assigned_at)}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-600">
                          {b.assigned_by ?? <span className="text-zinc-500">—</span>}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-11 w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                              aria-label={`Unbind ${b.session_key}`}
                              onClick={() => setUnbindTarget(b.session_key)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={unbindTarget !== null}
        onOpenChange={(open) => !open && setUnbindTarget(null)}
        title="Unbind chat"
        description={
          unbindTarget
            ? `Remove the binding for "${unbindTarget}"? The chat will no longer use this workflow.`
            : ""
        }
        confirmLabel="Unbind"
        isPending={unbindMutation.isPending}
        onConfirm={() => unbindTarget && unbindMutation.mutate(unbindTarget)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function WorkflowsPanel() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkflowOut | null>(null);
  const [docsWorkflowId, setDocsWorkflowId] = useState<string | null>(null);
  const [bindingsWorkflowId, setBindingsWorkflowId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowOut | null>(null);

  const { data: page, isLoading, isError, refetch } = useWorkflowsQuery();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/assistant/workflows/${encodeURIComponent(id)}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.workflows.list() });
      toast.success("Workflow deleted");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete workflow");
    },
    onSettled: () => {
      setDeleteTarget(null);
    },
  });

  function handleCreateSuccess() {
    void queryClient.invalidateQueries({ queryKey: keys.workflows.list() });
  }

  function handleEditSuccess() {
    void queryClient.invalidateQueries({ queryKey: keys.workflows.list() });
  }

  const workflows = page?.items ?? [];

  return (
    <>
      <div className="space-y-4">
        {isAdmin && (
          <div className="flex justify-end">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
              data-cy="create-workflow-button"
            >
              <Plus className="h-4 w-4" />
              Create workflow
            </Button>
          </div>
        )}

        {isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
            <p className="text-sm text-red-600">Failed to load workflows.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <GitBranch className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">No workflows configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    ID
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Description
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Knowledge base
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Auto-detect
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Created
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((wf) => (
                  <TableRow
                    key={wf.id}
                    className="hover:bg-zinc-50"
                    data-cy={`workflow-row-${wf.id}`}
                  >
                    <TableCell className="font-mono text-sm text-zinc-900">{wf.id}</TableCell>
                    <TableCell className="font-medium text-zinc-900">{wf.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-zinc-600">
                      {wf.description || <span className="text-zinc-500">—</span>}
                    </TableCell>
                    <TableCell>
                      <KbBadge enabled={wf.knowledge_base} />
                    </TableCell>
                    <TableCell>
                      <AutoDetectBadge enabled={wf.auto_detect?.enabled ?? false} />
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {formatDate(wf.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-11 w-11 text-zinc-500"
                            aria-label={`Actions for ${wf.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin && (
                            <DropdownMenuItem onClick={() => setEditTarget(wf)}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDocsWorkflowId(wf.id)}>
                            Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setBindingsWorkflowId(wf.id)}>
                            Bindings
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-700"
                              onClick={() => setDeleteTarget(wf)}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {isAdmin && (
        <CreateWorkflowDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={handleCreateSuccess}
        />
      )}

      {isAdmin && (
        <EditWorkflowDialog
          workflow={editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      <DocumentsDialog
        workflowId={docsWorkflowId}
        onOpenChange={(open) => !open && setDocsWorkflowId(null)}
      />

      <BindingsDialog
        workflowId={bindingsWorkflowId}
        onOpenChange={(open) => !open && setBindingsWorkflowId(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete workflow"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This will permanently remove the workflow and all its documents.`
            : ""
        }
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </>
  );
}

export default WorkflowsPanel;
