export type DocumentCategory =
  | "PDF"
  | "Word"
  | "Excel"
  | "PowerPoint"
  | "Text"
  | "Image"
  | "Other";

export interface DocumentMeta {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  category: DocumentCategory;
  sizeBytes: number;
  pageCount: number;
  folder: string;
  owner: string;
  updatedAt: string; // ISO date
  starred?: boolean;
}

/** Stages of the simulated document-intelligence pipeline (spec section 7). */
export type AnalysisStage =
  | "idle"
  | "uploading"
  | "analyzing"
  | "identifying"
  | "extracting"
  | "classifying"
  | "complete"
  | "error";

export interface AnalysisResult {
  fileName: string;
  fileType: string;
  category: DocumentCategory;
  sizeBytes: number;
  extension: string;
  mimeType: string;
  pageCount: number;
}
