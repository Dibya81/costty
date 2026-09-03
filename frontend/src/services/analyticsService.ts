/**
 * Thin adapters that transform the real backend API responses into the shape
 * expected by the UI components. This isolates the UI from backend schema changes.
 */
import { adminService } from "./adminService";
import type {
  AdminOverview as BackendOverview,
  AdminUserList,
  AdminRevenue,
  DocumentBreakdown as BackendDocBreakdown,
  CommunityStats as BackendCommunityStats,
  RevenuePoint as BackendRevenuePoint,
} from "./adminService";
import type {
  AdminOverview,
  RevenuePoint,
  DocumentBreakdown,
  EstimateStats,
  CommunityStats,
  AdminUser,
} from "../types/analytics";

// Convert backend revenue in rupees (whole units) → frontend paise (integer)
function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

function adaptOverview(raw: BackendOverview): AdminOverview {
  return {
    revenuePaise: toPaise(raw.total_revenue),
    revenueDeltaPct: 0, // backend doesn't provide delta yet
    totalUsers: raw.total_users,
    activeUsers: raw.active_users,
    totalDocuments: raw.total_documents,
    totalEstimates: raw.total_estimates,
  };
}

function adaptRevenue(raw: AdminRevenue): RevenuePoint[] {
  return raw.series.map((p: BackendRevenuePoint) => ({
    month: p.date,
    revenuePaise: toPaise(p.revenue),
  }));
}

function adaptDocBreakdown(raw: BackendDocBreakdown): DocumentBreakdown[] {
  return Object.entries(raw.by_extension).map(([ext, count]) => ({
    category: ext.replace(".", "").toLowerCase() as DocumentBreakdown["category"],
    count: count as number,
  }));
}

function adaptCommunity(raw: BackendCommunityStats): CommunityStats {
  return {
    requests: raw.total_requests,
    fulfilled: raw.fulfilled_requests,
    open: raw.open_requests,
  };
}

function adaptEstimateStats(raw: AdminRevenue): EstimateStats {
  return {
    count: raw.total_estimates,
    revenuePaise: toPaise(raw.total_revenue),
    averagePaise: toPaise(raw.average_estimate),
  };
}

function adaptUser(u: { id: number; email: string; full_name: string; is_active: boolean; is_admin: boolean; created_at: string }): AdminUser {
  return {
    id: String(u.id),
    name: u.full_name,
    email: u.email,
    joinedAt: u.created_at,
    lastActiveAt: u.created_at,
    documents: 0,
    status: u.is_active ? "active" : "inactive",
  };
}

function adaptUserList(raw: AdminUserList): AdminUser[] {
  return raw.items.map(adaptUser);
}

export const getOverview = () => adminService.overview().then(adaptOverview);
export const getRevenueSeries = () => adminService.revenue().then(adaptRevenue);
export const getDocumentBreakdown = () => adminService.documentBreakdown().then(adaptDocBreakdown);
export const getEstimateStats = () => adminService.revenue().then(adaptEstimateStats);
export const getCommunityStats = () => adminService.communityStats().then(adaptCommunity);
export const getRecentUsers = () => adminService.listUsers(1, 10).then(adaptUserList);
