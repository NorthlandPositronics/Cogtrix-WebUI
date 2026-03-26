import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InfiniteScrollSentinel } from "@/components/InfiniteScrollSentinel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useDocumentsQuery } from "@/hooks/shared/useDocumentsQuery";
import { DocumentCard } from "./DocumentCard";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { SemanticSearchBar } from "./SemanticSearchBar";

export function DocumentsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const queryClient = useQueryClient();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage, status, refetch } =
    useDocumentsQuery();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/rag/documents/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.documents.list() });
      toast.success("Document deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Delete failed");
    },
  });

  const documents = data?.pages.flatMap((page) => page.items) ?? [];

  function handleDeleteConfirm() {
    if (!pendingDeleteId) return;
    deleteMutation.mutate(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader title="Documents">
          {isAdmin && (
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          )}
        </PageHeader>

        <SemanticSearchBar className="mb-8" />

        {status === "pending" && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-red-600">Failed to load documents.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}

        {status === "success" && documents.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-900">No documents yet.</p>
            <p className="text-sm text-zinc-500">Upload a file to get started.</p>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
                Upload your first document
              </Button>
            )}
          </div>
        )}

        {status === "success" && documents.length > 0 && (
          <>
            <p className="mb-2 text-sm text-zinc-500">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-3">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isAdmin={isAdmin}
                  onDelete={setPendingDeleteId}
                />
              ))}
            </div>
          </>
        )}

        {hasNextPage && (
          <InfiniteScrollSentinel onIntersect={fetchNextPage} loading={isFetchingNextPage} />
        )}

        {isAdmin && <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />}

        <ConfirmDialog
          open={pendingDeleteId !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDeleteId(null);
          }}
          title="Delete document"
          description="This will permanently remove the document and all its chunks. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </div>
  );
}

export default DocumentsPage;
