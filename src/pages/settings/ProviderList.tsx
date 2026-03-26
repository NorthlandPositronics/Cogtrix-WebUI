import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  Server,
  Cpu,
  CircleCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProvidersQuery } from "@/hooks/settings/useProvidersQuery";
import { useModelsQuery } from "@/hooks/shared/useModelsQuery";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ProviderHealthOut, ProviderOut } from "@/lib/api/types/config";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProviderType = "openai" | "ollama" | "anthropic" | "google";

const PROVIDER_TYPES: ProviderType[] = ["openai", "ollama", "anthropic", "google"];

interface HealthResult {
  providerName: string;
  result: ProviderHealthOut | null;
}

interface ProviderListProps {
  onRequestWizard?: () => void;
}

export function ProviderList({ onRequestWizard: _onRequestWizard }: ProviderListProps) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const queryClient = useQueryClient();
  const {
    data: providers,
    isLoading: loadingProviders,
    isError: providersError,
    refetch: refetchProviders,
  } = useProvidersQuery();
  const {
    data: models,
    isLoading: loadingModels,
    isError: modelsError,
    refetch: refetchModels,
  } = useModelsQuery();

  const [healthResults, setHealthResults] = useState<Map<string, HealthResult>>(new Map());

  // Add provider form state
  const [addProviderOpen, setAddProviderOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ProviderType>("openai");
  const [newBaseUrl, setNewBaseUrl] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [addProviderError, setAddProviderError] = useState<string | null>(null);

  // Edit provider form state
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editBaseUrl, setEditBaseUrl] = useState("");
  const [editApiKey, setEditApiKey] = useState("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ProviderOut | null>(null);

  // Add model form state
  const [addModelOpen, setAddModelOpen] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [newModelName, setNewModelName] = useState("");

  const invalidateProviderData = () => {
    void queryClient.invalidateQueries({ queryKey: keys.providers() });
    void queryClient.invalidateQueries({ queryKey: keys.config() });
  };

  const createProviderMutation = useMutation({
    mutationFn: (body: {
      name: string;
      type: ProviderType;
      base_url?: string | null;
      api_key?: string | null;
    }) => api.post<ProviderOut>("/config/providers", body),
    onSuccess: () => {
      invalidateProviderData();
      toast.success("Provider added");
      setAddProviderOpen(false);
      setNewName("");
      setNewType("openai");
      setNewBaseUrl("");
      setNewApiKey("");
      setAddProviderError(null);
    },
    onError: (error: Error & { code?: string }) => {
      if ((error as { code?: string }).code === "PROVIDER_EXISTS") {
        setAddProviderError("A provider with this name already exists.");
      } else {
        toast.error(error.message);
      }
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: ({
      name,
      base_url,
      api_key,
    }: {
      name: string;
      base_url?: string | null;
      api_key?: string | null;
    }) =>
      api.patch<ProviderOut>(`/config/providers/${name}`, {
        base_url: base_url || null,
        api_key: api_key || null,
      }),
    onSuccess: () => {
      invalidateProviderData();
      toast.success("Provider updated");
      setEditingProvider(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: (name: string) => api.delete<null>(`/config/providers/${name}`),
    onSuccess: () => {
      invalidateProviderData();
      toast.success("Provider removed");
      setDeleteTarget(null);
    },
    onError: (error: Error & { code?: string }) => {
      setDeleteTarget(null);
      if ((error as { code?: string }).code === "PROVIDER_IN_USE") {
        toast.error("Provider is referenced by one or more models and cannot be deleted.");
      } else {
        toast.error(error.message);
      }
    },
  });

  const switchModelMutation = useMutation({
    mutationFn: (alias: string) => api.post("/config/model", { model: alias }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.config() });
      void queryClient.invalidateQueries({ queryKey: keys.models() });
      void queryClient.invalidateQueries({ queryKey: keys.providers() });
      toast.success("Model switched");
    },
    onError: () => {
      toast.error("Failed to switch model");
    },
  });

  const addModelMutation = useMutation({
    mutationFn: (modelStr: string) => api.post("/config/model", { model: modelStr }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.config() });
      void queryClient.invalidateQueries({ queryKey: keys.models() });
      toast.success("Model added and set as active");
      setAddModelOpen(false);
      setNewModelName("");
    },
    onError: () => {
      toast.error("Failed to add model — check the provider name and model name are correct");
    },
  });

  const healthCheckMutation = useMutation({
    mutationFn: (name: string) => api.post<ProviderHealthOut>(`/config/providers/${name}/health`),
    onSuccess: (result, name) => {
      setHealthResults((prev) => new Map(prev).set(name, { providerName: name, result }));
    },
    onError: (_err, name) => {
      setHealthResults((prev) => new Map(prev).set(name, { providerName: name, result: null }));
    },
  });

  const handleOpenEdit = (provider: ProviderOut) => {
    setEditingProvider(provider.name);
    setEditBaseUrl(provider.base_url ?? "");
    setEditApiKey("");
    setAddProviderOpen(false);
  };

  const handleCloseEdit = () => {
    setEditingProvider(null);
    setEditBaseUrl("");
    setEditApiKey("");
  };

  const handleAddProviderToggle = () => {
    setEditingProvider(null);
    setAddProviderOpen((v) => !v);
    setAddProviderError(null);
  };

  const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
  const addProviderValid = newName.trim().length > 0 && slugPattern.test(newName.trim());

  if (providersError || modelsError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-red-600">Failed to load provider data.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (providersError) void refetchProviders();
            if (modelsError) void refetchModels();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (loadingProviders || loadingModels) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="providers-heading">
        <h2 id="providers-heading" className="mb-3 text-lg font-semibold text-zinc-900">
          Providers
        </h2>
        {!providers?.length ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Server className="h-10 w-10 text-zinc-400" />
            <p className="text-sm text-zinc-500">No providers configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Base URL
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    API Key
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Health
                  </TableHead>
                  {isAdmin && (
                    <TableHead className="w-20 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => {
                  const health = healthResults.get(provider.name)?.result;
                  const isChecking =
                    healthCheckMutation.isPending &&
                    healthCheckMutation.variables === provider.name;
                  const isEditing = editingProvider === provider.name;

                  return (
                    <>
                      <TableRow key={provider.name} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">{provider.name}</TableCell>
                        <TableCell className="text-zinc-600">{provider.type}</TableCell>
                        <TableCell className="max-w-44 truncate font-mono text-sm text-zinc-600">
                          {provider.base_url ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                provider.has_api_key ? "bg-green-600" : "bg-zinc-400",
                              )}
                              aria-hidden="true"
                            />
                            <span className="text-xs text-zinc-600">
                              {provider.has_api_key ? "Configured" : "None"}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              className="min-h-11"
                              onClick={() => healthCheckMutation.mutate(provider.name)}
                              disabled={isChecking}
                              aria-label={`Check health of ${provider.name}`}
                            >
                              {isChecking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Activity className="h-4 w-4" />
                                  Check
                                </>
                              )}
                            </Button>
                            <span
                              className="inline-flex min-w-[7rem] items-center gap-1 text-xs"
                              aria-live="polite"
                              aria-atomic="true"
                            >
                              {health !== undefined &&
                                (health === null ? (
                                  <>
                                    <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                                    <span className="text-red-600">Check failed</span>
                                  </>
                                ) : health.reachable ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                    <span className="text-green-700">
                                      {health.latency_ms != null ? `${health.latency_ms}ms` : "OK"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                                    <span className="text-red-600">Unreachable</span>
                                  </>
                                ))}
                            </span>
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 text-zinc-500 hover:bg-zinc-100"
                                aria-label={`Edit ${provider.name}`}
                                aria-pressed={isEditing}
                                onClick={() =>
                                  isEditing ? handleCloseEdit() : handleOpenEdit(provider)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                                aria-label={`Delete ${provider.name}`}
                                onClick={() => setDeleteTarget(provider)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>

                      {isEditing && (
                        <TableRow key={`${provider.name}-edit`} className="bg-zinc-50">
                          <TableCell colSpan={isAdmin ? 6 : 5} className="p-0">
                            <div className="m-3 rounded-lg border border-zinc-200 bg-white p-4">
                              <p className="mb-3 text-xs text-zinc-500">
                                Update connection details for{" "}
                                <span className="font-mono font-medium text-zinc-900">
                                  {provider.name}
                                </span>
                                . Leave API key blank to keep the current value.
                              </p>
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <div className="min-w-0 flex-1 space-y-1.5">
                                  <Label
                                    htmlFor={`edit-base-url-${provider.name}`}
                                    className="text-xs"
                                  >
                                    Base URL
                                  </Label>
                                  <Input
                                    id={`edit-base-url-${provider.name}`}
                                    value={editBaseUrl}
                                    onChange={(e) => setEditBaseUrl(e.target.value)}
                                    placeholder="https://… (blank to use default)"
                                    className="min-h-11 font-mono text-sm"
                                    disabled={updateProviderMutation.isPending}
                                  />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                  <Label
                                    htmlFor={`edit-api-key-${provider.name}`}
                                    className="text-xs"
                                  >
                                    API key
                                  </Label>
                                  <Input
                                    id={`edit-api-key-${provider.name}`}
                                    type="password"
                                    value={editApiKey}
                                    onChange={(e) => setEditApiKey(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                    className="min-h-11 text-sm"
                                    disabled={updateProviderMutation.isPending}
                                  />
                                </div>
                                <div className="flex shrink-0 gap-2">
                                  <Button
                                    variant="outline"
                                    className="min-h-11"
                                    onClick={handleCloseEdit}
                                    disabled={updateProviderMutation.isPending}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    className="min-h-11"
                                    disabled={updateProviderMutation.isPending}
                                    onClick={() =>
                                      updateProviderMutation.mutate({
                                        name: provider.name,
                                        base_url: editBaseUrl || null,
                                        api_key: editApiKey || null,
                                      })
                                    }
                                  >
                                    {updateProviderMutation.isPending ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
              {isAdmin && (
                <TableFooter className="border-0 bg-transparent font-normal">
                  <tr
                    role="button"
                    tabIndex={0}
                    aria-label="Add provider"
                    className="cursor-pointer border-t border-dashed border-zinc-300 hover:bg-zinc-50"
                    onClick={handleAddProviderToggle}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleAddProviderToggle();
                      }
                    }}
                  >
                    <td
                      colSpan={6}
                      className="py-3 text-center text-sm text-zinc-500 hover:text-zinc-900"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Plus className="h-4 w-4" />
                        Add provider
                      </span>
                    </td>
                  </tr>
                </TableFooter>
              )}
            </Table>
          </div>
        )}

        {isAdmin && !providers?.length && (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <Table>
              <TableBody />
              <TableFooter className="border-0 bg-transparent font-normal">
                <tr
                  role="button"
                  tabIndex={0}
                  aria-label="Add provider"
                  className="cursor-pointer border-t border-dashed border-zinc-300 hover:bg-zinc-50"
                  onClick={handleAddProviderToggle}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAddProviderToggle();
                    }
                  }}
                >
                  <td
                    colSpan={6}
                    className="py-3 text-center text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add provider
                    </span>
                  </td>
                </tr>
              </TableFooter>
            </Table>
          </div>
        )}

        {isAdmin && addProviderOpen && (
          <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="mb-3 text-xs text-zinc-500">
              Add a new LLM provider. Changes are persisted to the config file immediately.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="add-provider-name" className="text-xs">
                  Name <span className="text-red-500">*</span>
                </Label>
                <div>
                  <Input
                    id="add-provider-name"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setAddProviderError(null);
                    }}
                    placeholder="e.g. my-openai"
                    className={cn(
                      "min-h-11 w-40 font-mono text-sm",
                      addProviderError && "border-red-500",
                    )}
                    disabled={createProviderMutation.isPending}
                  />
                  {addProviderError && (
                    <p className="mt-1 text-xs text-red-600">{addProviderError}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-provider-type" className="text-xs">
                  Type
                </Label>
                <Select
                  value={newType}
                  onValueChange={(v) => setNewType(v as ProviderType)}
                  disabled={createProviderMutation.isPending}
                >
                  <SelectTrigger id="add-provider-type" className="min-h-11 w-36 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="add-provider-base-url" className="text-xs">
                  Base URL
                </Label>
                <Input
                  id="add-provider-base-url"
                  value={newBaseUrl}
                  onChange={(e) => setNewBaseUrl(e.target.value)}
                  placeholder="https://… (optional)"
                  className="min-h-11 font-mono text-sm"
                  disabled={createProviderMutation.isPending}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="add-provider-api-key" className="text-xs">
                  API key
                </Label>
                <Input
                  id="add-provider-api-key"
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Optional"
                  className="min-h-11 text-sm"
                  disabled={createProviderMutation.isPending}
                />
              </div>
              <Button
                className="min-h-11 shrink-0"
                disabled={!addProviderValid || createProviderMutation.isPending}
                onClick={() =>
                  createProviderMutation.mutate({
                    name: newName.trim(),
                    type: newType,
                    base_url: newBaseUrl.trim() || null,
                    api_key: newApiKey || null,
                  })
                }
              >
                {createProviderMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="models-heading">
        <h2 id="models-heading" className="mb-3 text-lg font-semibold text-zinc-900">
          Models
        </h2>

        {!models?.length ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Cpu className="h-10 w-10 text-zinc-400" />
            <p className="text-sm text-zinc-500">No models configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Alias
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Provider
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Model name
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((m) => {
                  const isSwitching =
                    switchModelMutation.isPending && switchModelMutation.variables === m.alias;
                  const isClickable = isAdmin && !m.is_active;

                  return (
                    <TableRow
                      key={m.alias}
                      className={cn(
                        "hover:bg-zinc-50",
                        m.is_active && "border-l-2 border-l-teal-600 bg-teal-50",
                        isClickable && "cursor-pointer",
                        isSwitching && "pointer-events-none cursor-wait opacity-60",
                      )}
                      {...(isClickable
                        ? {
                            role: "button",
                            tabIndex: 0,
                            "aria-label": `Set ${m.alias} as active model`,
                            onClick: () => switchModelMutation.mutate(m.alias),
                            onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                switchModelMutation.mutate(m.alias);
                              }
                            },
                          }
                        : {})}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          {m.alias}
                          {m.is_active && (
                            <CircleCheck
                              className="h-4 w-4 shrink-0 text-teal-600"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-600">{m.provider}</TableCell>
                      <TableCell className="text-sm text-zinc-600">{m.model_name}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {isAdmin && (
                <TableFooter className="border-0 bg-transparent font-normal">
                  <tr
                    role="button"
                    tabIndex={0}
                    aria-label="Add model"
                    className="cursor-pointer border-t border-dashed border-zinc-300 hover:bg-zinc-50"
                    onClick={() => {
                      setNewProvider(providers?.[0]?.name ?? "");
                      setAddModelOpen((v) => !v);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setNewProvider(providers?.[0]?.name ?? "");
                        setAddModelOpen((v) => !v);
                      }
                    }}
                  >
                    <td
                      colSpan={3}
                      className="py-3 text-center text-sm text-zinc-500 hover:text-zinc-900"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Plus className="h-4 w-4" />
                        Add model
                      </span>
                    </td>
                  </tr>
                </TableFooter>
              )}
            </Table>
          </div>
        )}

        {isAdmin && addModelOpen && (
          <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="mb-3 text-xs text-zinc-500">
              Register a new model from an existing provider. The model will become active
              immediately but changes are runtime-only — edit your config file to persist them.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="add-provider" className="text-xs">
                  Provider
                </Label>
                <Select
                  value={newProvider}
                  onValueChange={setNewProvider}
                  disabled={addModelMutation.isPending}
                >
                  <SelectTrigger id="add-provider" className="min-h-11 w-40 text-sm">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(providers ?? []).map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="add-model-name" className="text-xs">
                  Model name
                </Label>
                <Input
                  id="add-model-name"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="e.g. qwen3:8b or llama3.2:3b"
                  className="min-h-11 font-mono text-sm"
                  disabled={addModelMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newProvider && newModelName.trim()) {
                      addModelMutation.mutate(`${newProvider}/${newModelName.trim()}`);
                    }
                  }}
                />
              </div>
              <Button
                className="min-h-11 shrink-0"
                disabled={!newProvider || !newModelName.trim() || addModelMutation.isPending}
                onClick={() => addModelMutation.mutate(`${newProvider}/${newModelName.trim()}`)}
              >
                {addModelMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete provider "${deleteTarget?.name ?? ""}"?`}
        description="This will remove the provider from the configuration. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteProviderMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteProviderMutation.mutate(deleteTarget.name);
        }}
      />
    </div>
  );
}

export default ProviderList;
