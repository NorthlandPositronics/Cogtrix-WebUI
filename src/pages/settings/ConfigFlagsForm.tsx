import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";
import { useConfigQuery } from "@/hooks/shared/useConfigQuery";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { ConfigPatchRequest } from "@/lib/api/types/config";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ConfigBooleanKey =
  | "debug"
  | "verbose"
  | "prompt_optimizer"
  | "parallel_tool_execution"
  | "context_compression";

interface FlagRow {
  key: ConfigBooleanKey;
  label: string;
  description: string;
}

const FLAG_ROWS: FlagRow[] = [
  {
    key: "debug",
    label: "Debug mode",
    description: "Enable verbose debug output in server logs. Use only in development.",
  },
  {
    key: "verbose",
    label: "Verbose logging",
    description: "Log additional detail for every agent step and API call.",
  },
  {
    key: "prompt_optimizer",
    label: "Prompt optimizer",
    description: "Automatically rewrite user prompts to improve agent reasoning quality.",
  },
  {
    key: "parallel_tool_execution",
    label: "Parallel tool execution",
    description: "Run independent tool calls concurrently to reduce latency.",
  },
  {
    key: "context_compression",
    label: "Context compression",
    description: "Compress older context to stay within the model's context window.",
  },
];

export function ConfigFlagsForm() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const queryClient = useQueryClient();
  const { data: config, isLoading, isError, refetch } = useConfigQuery();
  const [pendingFlags, setPendingFlags] = useState<Set<ConfigBooleanKey>>(new Set());

  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const setSoundEnabled = useUIStore((s) => s.setSoundEnabled);

  const patchMutation = useMutation({
    mutationFn: (patch: ConfigPatchRequest) => api.patch("/config", patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.config() });
    },
    onError: () => {
      toast.error("Failed to update configuration");
    },
  });

  const reloadMutation = useMutation({
    mutationFn: () => api.post("/config/reload"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.config() });
      toast.success("Configuration reloaded from disk");
    },
    onError: () => {
      toast.error("Failed to reload configuration");
    },
  });

  function handleToggle(flagKey: ConfigBooleanKey, value: boolean) {
    setPendingFlags((prev) => new Set(prev).add(flagKey));
    patchMutation.mutate(
      { [flagKey]: value },
      {
        onSettled: () => {
          setPendingFlags((prev) => {
            const next = new Set(prev);
            next.delete(flagKey);
            return next;
          });
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !config) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-red-600">Failed to load configuration.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const activeModel = config.active_model
    ? config.models.find((m) => m.alias === config.active_model)
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-zinc-500">Active model</dt>
            <dd className="font-medium text-zinc-900">
              {activeModel ? (
                <>
                  {activeModel.alias.startsWith(activeModel.provider + "/")
                    ? activeModel.alias.slice(activeModel.provider.length + 1)
                    : activeModel.alias}
                  <span className="ml-1 text-zinc-500">
                    ({activeModel.provider} &middot; {activeModel.model_name})
                  </span>
                </>
              ) : (
                <span className="text-zinc-500">Not configured</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Memory mode</dt>
            <dd className="font-medium text-zinc-900">{config.memory_mode}</dd>
          </div>
          {config.config_file_path && (
            <div className="col-span-2">
              <dt className="text-zinc-500">Config file</dt>
              <dd className="truncate font-mono text-xs text-zinc-900">
                {config.config_file_path}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="divide-y divide-zinc-200">
        {FLAG_ROWS.map(({ key, label, description }) => {
          const checked = config[key];
          const isPending = pendingFlags.has(key);

          return (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-zinc-900">{label}</p>
                <p className="text-sm text-zinc-500">{description}</p>
              </div>
              <Switch
                checked={checked}
                disabled={!isAdmin || isPending}
                onCheckedChange={(value) => handleToggle(key, value)}
                aria-label={label}
              />
            </div>
          );
        })}

        <div className="flex items-center justify-between py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-zinc-900">Audio cues</p>
            <p className="text-sm text-zinc-500">
              Play subtle sounds for response completion and errors.
            </p>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
            aria-label="Audio cues"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end border-t border-zinc-200 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => reloadMutation.mutate()}
            disabled={reloadMutation.isPending}
          >
            {reloadMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reload config from disk
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ConfigFlagsForm;
