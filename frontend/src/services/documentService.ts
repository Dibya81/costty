import { api } from "../lib/api";

export interface FileResponse {
  id: number;
  filename: string;
  extension: string;
  content_type: string;
  size_bytes: number;
  owner_id: string;
  folder_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface FileListResponse {
  items: FileResponse[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface UploadResult {
  id: number;
  filename: string;
  extension: string;
  content_type: string;
  size_bytes: number;
  owner_id: string;
  folder_id: number | null;
  created_at: string;
  updated_at: string;
  // Auto-estimated print cost (computed on upload using default print settings)
  estimated_cost?: number | null;
  currency?: string;
  page_count?: number;
  print_type?: "simplex" | "duplex";
  color_mode?: "bw" | "color";
}

export async function listDocuments(params?: {
  folder_id?: number;
  q?: string;
  extension?: string;
  page?: number;
  page_size?: number;
}): Promise<FileListResponse> {
  const qs = new URLSearchParams();
  if (params?.folder_id) qs.set("folder_id", String(params.folder_id));
  if (params?.q) qs.set("q", params.q);
  if (params?.extension) qs.set("extension", params.extension);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  return api.get<FileListResponse>(`/api/v1/files?${qs}`);
}

export async function uploadDocument(file: File, folderId?: number): Promise<UploadResult> {
  const form = new FormData();
  form.append("upload", file);
  if (folderId !== undefined) form.set("folder_id", String(folderId));
  return api.upload<UploadResult>("/api/v1/files", form);
}

export async function renameDocument(id: number, filename: string): Promise<FileResponse> {
  return api.patch<FileResponse>(`/api/v1/files/${id}`, { filename });
}

export async function deleteDocument(id: number): Promise<void> {
  return api.delete(`/api/v1/files/${id}`);
}

export async function downloadDocument(id: number): Promise<void> {
  const token = localStorage.getItem("folio_token");
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${base}/api/v1/files/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cd = res.headers.get("Content-Disposition");
  const name = cd?.match(/filename="?([^";]+)"?/)?.[1] ?? "download";
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// Frontend-only analysis (metadata inference) — backend analysis is future work
export type DocumentCategory = "PDF" | "Word" | "Excel" | "PowerPoint" | "Text" | "Image" | "Other";

export interface AnalysisResult {
  fileName: string;
  fileType: string;
  category: DocumentCategory;
  sizeBytes: number;
  extension: string;
  mimeType: string;
  pageCount: number;
}

const TYPE_MAP: Record<string, { category: DocumentCategory; mimeType: string }> = {
  pdf: { category: "PDF", mimeType: "application/pdf" },
  doc: { category: "Word", mimeType: "application/msword" },
  docx: { category: "Word", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  xls: { category: "Excel", mimeType: "application/vnd.ms-excel" },
  xlsx: { category: "Excel", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  ppt: { category: "PowerPoint", mimeType: "application/vnd.ms-powerpoint" },
  pptx: { category: "PowerPoint", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  txt: { category: "Text", mimeType: "text/plain" },
  csv: { category: "Text", mimeType: "text/csv" },
  jpg: { category: "Image", mimeType: "image/jpeg" },
  jpeg: { category: "Image", mimeType: "image/jpeg" },
  png: { category: "Image", mimeType: "image/png" },
  gif: { category: "Image", mimeType: "image/gif" },
};

const STAGE_LABELS = [
  { stage: "uploading", label: "Uploading" },
  { stage: "analyzing", label: "Analyzing" },
  { stage: "identifying", label: "Identifying type" },
  { stage: "extracting", label: "Extracting metadata" },
  { stage: "classifying", label: "Classifying" },
] as const;

const STAGE_TIMINGS: Record<string, number> = {
  uploading: 500,
  analyzing: 650,
  identifying: 450,
  extracting: 600,
  classifying: 500,
};

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function estimatePageCount(_name: string, size: number, category: DocumentCategory): number {
  if (category === "Image") return 1;
  if (category === "Text") return Math.max(1, Math.ceil(size / 3000));
  const sizes: Record<DocumentCategory, number> = {
    PDF: 50000,
    Word: 20000,
    Excel: 30000,
    PowerPoint: 500000,
    Text: 3000,
    Image: 100000,
    Other: 20000,
  };
  return Math.max(1, Math.ceil(size / (sizes[category] || 20000)));
}

export async function analyzeDocument(
  file: { name: string; sizeBytes: number },
  onStage: (stage: string) => void
): Promise<AnalysisResult> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const info = TYPE_MAP[extension] ?? { category: "Other" as DocumentCategory, mimeType: "application/octet-stream" };

  for (const { stage } of STAGE_LABELS) {
    onStage(stage);
    await delay(STAGE_TIMINGS[stage] ?? 400);
  }
  onStage("complete");

  return {
    fileName: file.name,
    fileType: info.category === "Other" ? "Unknown format" : `${info.category} document`,
    category: info.category,
    sizeBytes: file.sizeBytes,
    extension,
    mimeType: info.mimeType,
    pageCount: estimatePageCount(file.name, file.sizeBytes, info.category),
  };
}

export const ANALYSIS_STAGES = STAGE_LABELS.map((s) => s.stage as string);

export function stageLabel(stage: string): string {
  return STAGE_LABELS.find((s) => s.stage === stage)?.label ?? stage;
}
