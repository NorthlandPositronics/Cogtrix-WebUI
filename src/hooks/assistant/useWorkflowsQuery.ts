import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type {
  WorkflowOut,
  WorkflowDocumentOut,
  WorkflowBindingOut,
  CursorPage,
} from "@/lib/api/types";

export function useWorkflowsQuery() {
  return useQuery<CursorPage<WorkflowOut>>({
    queryKey: keys.workflows.list(),
    queryFn: () => api.get<CursorPage<WorkflowOut>>("/assistant/workflows"),
  });
}

export function useWorkflowDocumentsQuery(workflowId: string | null) {
  return useQuery<WorkflowDocumentOut[]>({
    queryKey: keys.workflows.documents(workflowId ?? ""),
    queryFn: () => api.get<WorkflowDocumentOut[]>(`/assistant/workflows/${workflowId!}/documents`),
    enabled: workflowId !== null,
  });
}

export function useWorkflowBindingsQuery() {
  return useQuery<WorkflowBindingOut[]>({
    queryKey: keys.workflows.bindings(),
    queryFn: () => api.get<WorkflowBindingOut[]>("/assistant/workflows/bindings"),
  });
}
