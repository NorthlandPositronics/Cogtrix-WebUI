import { FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DocumentOut } from "@/lib/api/types/rag";

interface DocumentCardProps {
  document: DocumentOut;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DocumentCard({ document, onDelete, isAdmin = false }: DocumentCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 text-zinc-500">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900">{document.filename}</p>
            <div className="mt-1">
              {document.status === "indexed" ? (
                <Badge
                  variant="outline"
                  className="animate-none border-green-200 bg-green-50 text-xs text-green-700"
                >
                  {document.chunk_count} chunks
                </Badge>
              ) : document.status === "processing" || document.status === "pending" ? (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-xs text-amber-700 motion-safe:animate-pulse"
                >
                  {document.status === "processing" ? "Processing..." : "Pending"}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-xs text-red-700">
                  Failed
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-zinc-500">
              <span>{formatFileSize(document.size_bytes)}</span>
              <span>{document.content_type}</span>
              <span>Uploaded {formatDate(document.created_at)}</span>
              {document.status === "indexed" && document.ingested_at && (
                <span>Indexed {formatDate(document.ingested_at)}</span>
              )}
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete ${document.filename}`}
              onClick={() => onDelete(document.id)}
              disabled={document.status === "processing" || document.status === "pending"}
              className="h-11 w-11 shrink-0 text-zinc-500 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentCard;
