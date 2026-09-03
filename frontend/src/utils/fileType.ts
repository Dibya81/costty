import type { DocumentCategory } from "../types/document";

interface TypeInfo {
  category: DocumentCategory;
  mimeType: string;
}

const EXTENSION_MAP: Record<string, TypeInfo> = {
  pdf: { category: "PDF", mimeType: "application/pdf" },
  doc: { category: "Word", mimeType: "application/msword" },
  docx: {
    category: "Word",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  xls: { category: "Excel", mimeType: "application/vnd.ms-excel" },
  xlsx: {
    category: "Excel",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  csv: { category: "Excel", mimeType: "text/csv" },
  ppt: { category: "PowerPoint", mimeType: "application/vnd.ms-powerpoint" },
  pptx: {
    category: "PowerPoint",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  txt: { category: "Text", mimeType: "text/plain" },
  md: { category: "Text", mimeType: "text/markdown" },
  png: { category: "Image", mimeType: "image/png" },
  jpg: { category: "Image", mimeType: "image/jpeg" },
  jpeg: { category: "Image", mimeType: "image/jpeg" },
  webp: { category: "Image", mimeType: "image/webp" },
};

export function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function inferTypeInfo(fileName: string): TypeInfo {
  const ext = getExtension(fileName);
  return EXTENSION_MAP[ext] ?? { category: "Other", mimeType: "application/octet-stream" };
}

/** Deterministic mock page count so the same file name always analyzes the same way. */
export function estimatePageCount(fileName: string, sizeBytes: number, category: DocumentCategory): number {
  if (category === "Image") return 1;
  let hash = 0;
  for (let i = 0; i < fileName.length; i += 1) hash = (hash * 31 + fileName.charCodeAt(i)) >>> 0;
  const bySize = Math.max(1, Math.round(sizeBytes / 42_000));
  const variance = (hash % 40) - 20;
  return Math.max(1, bySize + variance);
}
