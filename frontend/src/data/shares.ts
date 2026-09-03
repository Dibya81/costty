import type { ShareLink } from "../types/share";
import { daysFromNow } from "../utils/date";
import { makeId } from "../utils/id";

interface SeedShare {
  documentName: string;
  permission: "view" | "comment" | "edit";
  hasPassword?: boolean;
  expiresInDays?: number;
  daysAgo: number;
  views: number;
  revoked?: boolean;
}

const SEED: SeedShare[] = [
  { documentName: "Project_Report.docx", permission: "comment", daysAgo: 2, views: 14 },
  { documentName: "Financial_Model.xlsx", permission: "view", hasPassword: true, expiresInDays: 5, daysAgo: 3, views: 6 },
  { documentName: "Presentation.pptx", permission: "view", expiresInDays: 14, daysAgo: 4, views: 22 },
  { documentName: "React_Notes_Compiled.pdf", permission: "view", daysAgo: 9, views: 41, revoked: true },
];

export function getSeedShareLinks(): ShareLink[] {
  return SEED.map((s, i) => ({
    id: `share_seed_${i}`,
    documentId: `doc_seed_${i}`,
    documentName: s.documentName,
    url: `https://folio.app/s/${makeId("").replace(/^_/, "")}`,
    permission: s.permission,
    password: s.hasPassword ? "••••••" : undefined,
    expiresAt: s.expiresInDays ? daysFromNow(s.expiresInDays) : undefined,
    createdAt: daysFromNow(-s.daysAgo),
    revoked: Boolean(s.revoked),
    views: s.views,
  }));
}
