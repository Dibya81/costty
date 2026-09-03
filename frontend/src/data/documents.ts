import type { DocumentMeta } from "../types/document";
import { inferTypeInfo } from "../utils/fileType";
import { daysFromNow } from "../utils/date";

interface SeedFile {
  name: string;
  sizeBytes: number;
  pageCount: number;
  folder: string;
  daysAgo: number;
  starred?: boolean;
}

const SEED_FILES: SeedFile[] = [
  { name: "Python_ML_Notes.pdf", sizeBytes: 4_200_000, pageCount: 86, folder: "Semester 6", daysAgo: 1, starred: true },
  { name: "Project_Report.docx", sizeBytes: 1_800_000, pageCount: 34, folder: "Capstone", daysAgo: 2 },
  { name: "Financial_Model.xlsx", sizeBytes: 620_000, pageCount: 12, folder: "Capstone", daysAgo: 3 },
  { name: "Presentation.pptx", sizeBytes: 9_400_000, pageCount: 28, folder: "Capstone", daysAgo: 3 },
  { name: "DBMS_Unit3_Normalization.pdf", sizeBytes: 2_100_000, pageCount: 41, folder: "Semester 6", daysAgo: 5 },
  { name: "Resume_2026.docx", sizeBytes: 210_000, pageCount: 2, folder: "Personal", daysAgo: 6, starred: true },
  { name: "OS_Scheduling_Diagram.png", sizeBytes: 860_000, pageCount: 1, folder: "Semester 6", daysAgo: 8 },
  { name: "Budget_Tracker.xlsx", sizeBytes: 340_000, pageCount: 6, folder: "Personal", daysAgo: 10 },
  { name: "React_Notes_Compiled.pdf", sizeBytes: 3_050_000, pageCount: 58, folder: "Semester 6", daysAgo: 12 },
  { name: "Lab_Manual_Networks.txt", sizeBytes: 84_000, pageCount: 19, folder: "Semester 6", daysAgo: 15 },
];

export function getSeedDocuments(): DocumentMeta[] {
  return SEED_FILES.map((file, index) => {
    const { category, mimeType } = inferTypeInfo(file.name);
    const ext = file.name.split(".").pop() ?? "";
    return {
      id: `doc_seed_${index}`,
      name: file.name,
      extension: ext,
      mimeType,
      category,
      sizeBytes: file.sizeBytes,
      pageCount: file.pageCount,
      folder: file.folder,
      owner: "You",
      updatedAt: daysFromNow(-file.daysAgo),
      starred: file.starred,
    };
  });
}
