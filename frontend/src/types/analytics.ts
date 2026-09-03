import type { DocumentCategory } from "./document";

export interface RevenuePoint {
  month: string;
  revenuePaise: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lastActiveAt: string;
  documents: number;
  status: "active" | "inactive";
}

export interface AdminOverview {
  revenuePaise: number;
  revenueDeltaPct: number;
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  totalEstimates: number;
}

export interface DocumentBreakdown {
  category: DocumentCategory;
  count: number;
}

export interface EstimateStats {
  count: number;
  revenuePaise: number;
  averagePaise: number;
}

export interface CommunityStats {
  requests: number;
  fulfilled: number;
  open: number;
}
