export type DocumentStatus = "pending" | "processing" | "indexed" | "failed";

export interface DocumentOut {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  chunk_count: number;
  status: DocumentStatus;
  error?: string | null;
  ingested_at: string;
  created_at: string;
}

export interface RAGSearchRequest {
  query: string;
  top_k?: number;
  document_ids?: string[] | null;
}

export interface RAGChunkOut {
  document_id: string;
  document_name: string;
  chunk_index: number;
  text: string;
  score: number;
}

export interface RAGSearchResponse {
  query: string;
  chunks: RAGChunkOut[];
  total_documents_searched: number;
}
