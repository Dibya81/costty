import type {
  AdminOverview,
  AdminUser,
  CommunityStats,
  DocumentBreakdown,
  EstimateStats,
  RevenuePoint,
} from "../types/analytics";
import { rupeesToPaise } from "../utils/currency";
import { daysFromNow } from "../utils/date";

export const REVENUE_SERIES: RevenuePoint[] = [
  { month: "Mar", revenuePaise: rupeesToPaise(38_400) },
  { month: "Apr", revenuePaise: rupeesToPaise(41_200) },
  { month: "May", revenuePaise: rupeesToPaise(39_800) },
  { month: "Jun", revenuePaise: rupeesToPaise(46_500) },
  { month: "Jul", revenuePaise: rupeesToPaise(52_100) },
  { month: "Aug", revenuePaise: rupeesToPaise(58_900) },
];

export const ADMIN_OVERVIEW: AdminOverview = {
  revenuePaise: REVENUE_SERIES.reduce((sum, point) => sum + point.revenuePaise, 0),
  revenueDeltaPct: 12.9,
  totalUsers: 2_384,
  activeUsers: 918,
  totalDocuments: 14_207,
  totalEstimates: 6_842,
};

export const DOCUMENT_BREAKDOWN: DocumentBreakdown[] = [
  { category: "PDF", count: 6_318 },
  { category: "Word", count: 3_142 },
  { category: "Excel", count: 1_876 },
  { category: "PowerPoint", count: 1_534 },
  { category: "Image", count: 902 },
  { category: "Text", count: 311 },
  { category: "Other", count: 124 },
];

export const ESTIMATE_STATS: EstimateStats = {
  count: ADMIN_OVERVIEW.totalEstimates,
  revenuePaise: ADMIN_OVERVIEW.revenuePaise,
  averagePaise: Math.round(ADMIN_OVERVIEW.revenuePaise / ADMIN_OVERVIEW.totalEstimates),
};

export const COMMUNITY_STATS: CommunityStats = {
  requests: 1_284,
  fulfilled: 812,
  open: 472,
};

const NAMES = [
  "Ananya R.", "Rohit K.", "Meera S.", "Farah I.", "Devika P.", "Karan V.",
  "Priya M.", "Aditya N.", "Sneha T.", "Vikram J.", "Ishaan G.", "Neha B.",
];

export const RECENT_USERS: AdminUser[] = NAMES.slice(0, 8).map((name, i) => ({
  id: `user_${i}`,
  name,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  joinedAt: daysFromNow(-(20 + i * 11)),
  lastActiveAt: daysFromNow(-i),
  documents: 4 + ((i * 7) % 23),
  status: i % 5 === 4 ? "inactive" : "active",
}));
