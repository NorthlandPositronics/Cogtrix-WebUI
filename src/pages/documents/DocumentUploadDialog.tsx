import { useRef, useState, type DragEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { DocumentOut } from "@/lib/api/types/rag";
import { ApiError } from "@/lib/api/types/common";

const ACCEPTED_TYPES = [".pdf", ".txt", ".md"];
const ACCEPTED_MIME = ["application/pdf", "text/plain", "text/markdown"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentUploadDialog({ open, onOpenChange }: DocumentUploadDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.upload<DocumentOut>("/rag/documents", formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.documents.list() });
      toast.success("Document uploaded successfully");
      handleClose();
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Upload failed";
      setValidationError(message);
    },
  });

  function validateAndSetFile(file: File | null) {
    setValidationError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const isAcceptedType = ACCEPTED_TYPES.includes(ext) || ACCEPTED_MIME.includes(file.type);
    if (!isAcceptedType) {
      setValidationError("Only PDF, TXT, and Markdown files are accepted.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError("File exceeds the 50 MB size limit.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndSetFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragOver(false);
    if (isUploading) return;
    validateAndSetFile(e.dataTransfer.files[0] ?? null);
  }

  function handleDragOver(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!isUploading) setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleUpload() {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  }

  function handleClose() {
    setSelectedFile(null);
    setValidationError(null);
    setDragOver(false);
    uploadMutation.reset();
    onOpenChange(false);
  }

  const isUploading = uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a PDF, text, or markdown file for RAG ingestion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "focus-visible:ring-ring flex w-full cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                validationError
                  ? "border-red-200 bg-red-50"
                  : dragOver
                    ? "border-teal-200 bg-teal-50"
                    : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50",
              )}
              disabled={isUploading}
              aria-busy={isUploading}
              aria-label="Upload file: click to browse or drag and drop"
              aria-describedby="upload-constraints"
            >
              <Upload className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-zinc-900">
                {selectedFile ? selectedFile.name : "Click or drag a file here"}
              </span>
              <span id="upload-constraints" className="text-xs text-zinc-500">
                PDF, TXT, or Markdown — max 50 MB
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
              aria-label="Select file to upload"
            />
          </div>

          {validationError && <p className="text-sm text-red-600">{validationError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            aria-busy={isUploading}
          >
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentUploadDialog;
