import { useState, useCallback, useMemo } from "react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, LayoutGrid, LayoutList, MessageSquare } from "lucide-react";
import { useModelsQuery } from "@/hooks/shared/useModelsQuery";
import { PageHeader } from "@/components/PageHeader";
import { SessionCard, SessionRow } from "@/components/SessionCard";
import { NewSessionDialog } from "./NewSessionDialog";
import { SessionActionDialog } from "./SessionActionDialog";
import { SessionBulkBar } from "./SessionBulkBar";
import { InfiniteScrollSentinel } from "@/components/InfiniteScrollSentinel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useSessionsQuery } from "@/hooks/shared/useSessionsQuery";
import { cn } from "@/lib/utils";

function SessionCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
      <MessageSquare className="h-12 w-12 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <p className="text-base font-medium text-zinc-900">No sessions yet.</p>
        <p className="text-sm text-zinc-500">Create one to get started.</p>
      </div>
      <NewSessionDialog />
    </div>
  );
}

export function SessionsPage() {
  const [actionTarget, setActionTarget] = useState<{ id: string; name: string } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const viewMode = useUIStore((s) => s.sessionsViewMode);
  const setViewMode = useUIStore((s) => s.setSessionsViewMode);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useSessionsQuery({ includeArchived: showArchived });
  const { data: models = [] } = useModelsQuery();

  const sessions = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const showEmpty = !isLoading && !isError && sessions.length === 0;

  const editModelMutation = useMutation({
    mutationFn: ({ id, model }: { id: string; model: string }) =>
      api.patch<null>(`/sessions/${id}`, { config: { model } }),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      void queryClient.invalidateQueries({ queryKey: keys.sessions.detail(id) });
      toast.success("Model updated");
    },
    onError: () => {
      toast.error("Failed to update model");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.delete<null>(`/sessions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      setActionTarget(null);
      toast.success("Session archived");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setActionTarget(null);
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id: string) => api.post<null>(`/sessions/${id}/restore`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      toast.success("Session restored");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<null>(`/sessions/${id}?permanent=true`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      setActionTarget(null);
      toast.success("Session permanently deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setActionTarget(null);
    },
  });

  const bulkArchiveMutation = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => api.delete<null>(`/sessions/${id}`))),
    onSuccess: (_data, ids) => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      setSelectedIds(new Set());
      toast.success(`${ids.length} session${ids.length === 1 ? "" : "s"} archived`);
    },
    onError: () => {
      toast.error("Some sessions could not be archived");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => api.delete<null>(`/sessions/${id}?permanent=true`))),
    onSuccess: (_data, ids) => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions.all });
      setSelectedIds(new Set());
      toast.success(`${ids.length} session${ids.length === 1 ? "" : "s"} permanently deleted`);
    },
    onError: () => {
      toast.error("Some sessions could not be deleted");
    },
  });

  const handleDelete = useCallback((id: string, name: string) => setActionTarget({ id, name }), []);

  const handleUnarchive = useCallback(
    (id: string) => unarchiveMutation.mutate(id),
    [unarchiveMutation],
  );

  const handleEditModel = useCallback(
    (id: string, model: string) => editModelMutation.mutate({ id, model }),
    [editModelMutation],
  );

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(sessions.map((s) => s.id)));
  }, [sessions]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const headerCheckboxState =
    sessions.length > 0 && selectedIds.size === sessions.length
      ? true
      : selectedIds.size > 0
        ? "indeterminate"
        : false;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className={cn("mx-auto w-full max-w-5xl", selectedIds.size > 0 && "pb-20")}>
        <PageHeader title="Sessions">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={(v) => {
                  setShowArchived(v);
                  setSelectedIds(new Set());
                }}
                aria-label="Show archived sessions"
              />
              <Label
                htmlFor="show-archived"
                className="hidden cursor-pointer text-sm text-zinc-500 sm:inline"
              >
                Show archived
              </Label>
            </div>
            <div
              className="flex items-center rounded-lg border border-zinc-200 p-0.5"
              role="group"
              aria-label="View mode"
            >
              <Button
                variant="ghost"
                className={cn(
                  "h-8 w-8",
                  viewMode === "grid"
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100",
                )}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 w-8",
                  viewMode === "list"
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100",
                )}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
            <NewSessionDialog triggerCy="new-session" />
          </div>
        </PageHeader>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SessionCardSkeleton key={i} />)
              : sessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onDelete={(id) => handleDelete(id, s.name)}
                    onUnarchive={handleUnarchive}
                    models={models}
                    onEditModel={handleEditModel}
                    selected={selectedIds.has(s.id)}
                    onSelect={handleSelect}
                  />
                ))}

            {isError && (
              <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
                <p className="text-sm text-red-600">Failed to load sessions.</p>
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && showEmpty && <EmptyState />}

            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, i) => <SessionCardSkeleton key={`more-${i}`} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-3">
                    <Checkbox
                      checked={headerCheckboxState}
                      onCheckedChange={(checked) => {
                        if (checked) handleSelectAll();
                        else handleClearSelection();
                      }}
                      aria-label={
                        selectedIds.size === sessions.length
                          ? "Deselect all sessions"
                          : "Select all sessions"
                      }
                      className="border-zinc-400 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 data-[state=indeterminate]:border-teal-600 data-[state=indeterminate]:bg-teal-600"
                    />
                  </TableHead>
                  <TableHead className="pl-1 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Name
                  </TableHead>
                  <TableHead className="hidden text-xs font-medium tracking-wide text-zinc-500 uppercase sm:table-cell">
                    Model
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    State
                  </TableHead>
                  <TableHead className="hidden text-xs font-medium tracking-wide text-zinc-500 uppercase sm:table-cell">
                    Updated
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td className="p-3" colSpan={6}>
                          <Skeleton className="h-4 w-full" />
                        </td>
                      </tr>
                    ))
                  : sessions.map((s) => (
                      <SessionRow
                        key={s.id}
                        session={s}
                        onDelete={(id) => handleDelete(id, s.name)}
                        onUnarchive={handleUnarchive}
                        models={models}
                        onEditModel={handleEditModel}
                        selected={selectedIds.has(s.id)}
                        onSelect={handleSelect}
                      />
                    ))}
              </TableBody>
            </Table>
            {!isLoading && showEmpty && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <MessageSquare
                  className="h-10 w-10 text-zinc-400"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-base font-medium text-zinc-900">No sessions yet.</p>
                  <p className="text-sm text-zinc-500">Create one to get started.</p>
                </div>
                <NewSessionDialog />
              </div>
            )}
            {isError && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertTriangle className="h-10 w-10 text-red-600" strokeWidth={1.5} />
                <p className="text-sm text-red-600">Failed to load sessions.</p>
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            )}
            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`more-${i}`}>
                  <td className="p-3" colSpan={6}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))}
          </div>
        )}

        {!isLoading && (
          <div>
            {hasNextPage ? (
              <InfiniteScrollSentinel onIntersect={handleIntersect} loading={isFetchingNextPage} />
            ) : (
              sessions.length > 0 && <div className="h-4" />
            )}
          </div>
        )}

        <SessionActionDialog
          open={actionTarget !== null}
          onOpenChange={(open) => {
            if (!open) setActionTarget(null);
          }}
          sessionName={actionTarget?.name}
          isPending={archiveMutation.isPending || hardDeleteMutation.isPending}
          onArchive={() => {
            if (actionTarget) archiveMutation.mutate(actionTarget.id);
          }}
          onDeletePermanently={() => {
            if (actionTarget) hardDeleteMutation.mutate(actionTarget.id);
          }}
        />

        <div className="sr-only" aria-live="polite">
          {isFetchingNextPage && "Loading more sessions..."}
        </div>
      </div>

      <SessionBulkBar
        selectedCount={selectedIds.size}
        totalCount={sessions.length}
        isPending={bulkArchiveMutation.isPending || bulkDeleteMutation.isPending}
        onArchive={() => bulkArchiveMutation.mutate([...selectedIds])}
        onDelete={() => bulkDeleteMutation.mutate([...selectedIds])}
        onSelectAll={handleSelectAll}
        onClear={handleClearSelection}
      />
    </div>
  );
}

export default SessionsPage;
