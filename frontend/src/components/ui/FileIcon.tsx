import { FileText, FileSpreadsheet, FileImage, FileCode2, Presentation, File } from "lucide-react";
import type { DocumentCategory } from "../../types/document";
import { cn } from "../../utils/cn";

const ICONS: Record<DocumentCategory, typeof File> = {
  PDF: FileText,
  Word: FileText,
  Excel: FileSpreadsheet,
  PowerPoint: Presentation,
  Image: FileImage,
  Text: FileCode2,
  Other: File,
};

export function FileIcon({ category, size = 18, className }: { category: DocumentCategory; size?: number; className?: string }) {
  const Icon = ICONS[category];
  return <Icon size={size} className={cn("shrink-0", className)} strokeWidth={1.6} />;
}
