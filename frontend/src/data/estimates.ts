import type { EstimateHistoryEntry } from "../types/estimate";
import { calculateEstimate } from "../services/printService";
import { daysFromNow } from "../utils/date";
import { makeId } from "../utils/id";

interface SeedEstimate {
  documentName: string;
  pageCount: number;
  copies: number;
  colorMode: "bw" | "color";
  sidedness: "simplex" | "duplex";
  daysAgo: number;
}

const SEED_ESTIMATES: SeedEstimate[] = [
  { documentName: "Python_ML_Notes.pdf", pageCount: 86, copies: 1, colorMode: "bw", sidedness: "duplex", daysAgo: 1 },
  { documentName: "Project_Report.docx", pageCount: 34, copies: 3, colorMode: "bw", sidedness: "simplex", daysAgo: 2 },
  { documentName: "Presentation.pptx", pageCount: 28, copies: 1, colorMode: "color", sidedness: "simplex", daysAgo: 3 },
  { documentName: "Financial_Model.xlsx", pageCount: 12, copies: 5, colorMode: "color", sidedness: "duplex", daysAgo: 6 },
  { documentName: "DBMS_Unit3_Normalization.pdf", pageCount: 41, copies: 2, colorMode: "bw", sidedness: "duplex", daysAgo: 9 },
  { documentName: "React_Notes_Compiled.pdf", pageCount: 58, copies: 1, colorMode: "bw", sidedness: "duplex", daysAgo: 14 },
];

export function getSeedEstimateHistory(): EstimateHistoryEntry[] {
  return SEED_ESTIMATES.map((seed) => ({
    id: makeId("est"),
    documentName: seed.documentName,
    createdAt: daysFromNow(-seed.daysAgo),
    ...calculateEstimate({
      pageCount: seed.pageCount,
      copies: seed.copies,
      colorMode: seed.colorMode,
      sidedness: seed.sidedness,
    }),
  }));
}
