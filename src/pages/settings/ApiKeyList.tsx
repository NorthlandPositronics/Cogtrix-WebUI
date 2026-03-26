import { useState, type FormEvent } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Copy, Check, Loader2, Key, AlertTriangle } from "lucide-react";
import { useApiKeysQuery } from "@/hooks/settings/useApiKeysQuery";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { APIKeyOut, APIKeyCreateRequest } from "@/lib/api/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogTrigger,
} from "@/components/ui/dialog";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface CreatedKeyDisplayProps {
  apiKey: string;
}

function CreatedKeyDisplay({ apiKey }: CreatedKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <Key className="h-4 w-4 shrink-0 text-zinc-500" />
        <code
          data-cy="api-key-value"
          className="min-w-0 flex-1 font-mono text-xs break-all text-zinc-900"
        >
          {apiKey}
        </code>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11"
          onClick={() => void handleCopy()}
          aria-label="Copy API key"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-zinc-500">
        Copy this key now. It will not be shown again after you close this dialog.
      </p>
    </div>
  );
}

interface CreateKeyDialogProps {
  onCreated: (key: APIKeyOut) => void;
}

function CreateKeyDialog({ onCreated }: CreateKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [createdKey, setCreatedKey] = useState<APIKeyOut | null>(null);

  const createMutation = useMutation({
    mutationFn: (body: APIKeyCreateRequest) => api.post<APIKeyOut>("/auth/api-keys", body),
    onSuccess: (result) => {
      setCreatedKey(result);
      onCreated(result);
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body: APIKeyCreateRequest = {
      label: label.trim(),
      expires_in_days: expiresInDays ? parseInt(expiresInDays, 10) : null,
    };
    createMutation.mutate(body);
  }

  function handleClose(next: boolean) {
    if (!next) {
      setOpen(false);
      setLabel("");
      setExpiresInDays("");
      setCreatedKey(null);
    } else {
      setOpen(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create key
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{createdKey ? "Key created" : "Create API key"}</DialogTitle>
          <DialogDescription>
            {createdKey
              ? "Copy the key now — it will not be shown again."
              : "Create a new API key for programmatic access."}
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <>
            <CreatedKeyDisplay apiKey={createdKey.key ?? ""} />
            <DialogFooter>
              <Button data-cy="close-create-key" onClick={() => handleClose(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="key-label">Label</Label>
              <Input
                id="key-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My API key"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="key-expires">Expires in (days, optional)</Label>
              <Input
                id="key-expires"
                type="number"
                min="1"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="Never"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={createMutation.isPending}
                data-cy="cancel-create-key"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !label.trim()}
                data-cy="confirm-create-key"
              >
                {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmRevokeDialogProps {
  keyLabel: string;
  onConfirm: () => void;
  isPending: boolean;
}

function ConfirmRevokeDialog({ keyLabel, onConfirm, isPending }: ConfirmRevokeDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Revoke ${keyLabel}`}
          className="min-h-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Revoke API key</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke <span className="font-medium">{keyLabel}</span>? Any
            requests using this key will immediately stop working.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            data-cy="cancel-revoke-key"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            data-cy="confirm-revoke-key"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : "Revoke"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeyList() {
  const queryClient = useQueryClient();
  const { data: apiKeys, isLoading, isError, refetch } = useApiKeysQuery();

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/api-keys/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.apiKeys() });
      toast.success("API key revoked");
    },
    onError: () => {
      toast.error("Failed to revoke API key");
    },
  });

  function handleCreated() {
    void queryClient.invalidateQueries({ queryKey: keys.apiKeys() });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
        <p className="text-sm text-red-600">Failed to load API keys.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateKeyDialog onCreated={handleCreated} />
      </div>

      {!apiKeys?.length ? (
        <div className="rounded-xl border border-zinc-200 py-12 text-center">
          <Key className="mx-auto mb-3 h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">No API keys yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Label
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Key prefix
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Created
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Expires
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Last used
                </TableHead>
                <TableHead className="text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id} className="hover:bg-zinc-50">
                  <TableCell className="font-medium text-zinc-900">{apiKey.label}</TableCell>
                  <TableCell className="font-mono text-sm text-zinc-600">
                    {apiKey.key_prefix}…
                  </TableCell>
                  <TableCell className="text-zinc-500">{formatDate(apiKey.created_at)}</TableCell>
                  <TableCell className="text-zinc-500">{formatDate(apiKey.expires_at)}</TableCell>
                  <TableCell className="text-zinc-500">{formatDate(apiKey.last_used_at)}</TableCell>
                  <TableCell className="text-right">
                    <ConfirmRevokeDialog
                      keyLabel={apiKey.label}
                      onConfirm={() => revokeMutation.mutate(apiKey.id)}
                      isPending={revokeMutation.isPending}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default ApiKeyList;
