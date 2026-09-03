import { api } from "../lib/api";

export interface AdminOverview {
  total_users: number;
  active_users: number;
  total_documents: number;
  total_estimates: number;
  total_revenue: number;
  currency: string;
  total_shares: number;
  open_requests: number;
  fulfilled_requests: number;
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface AdminUserList {
  items: AdminUser[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface AdminEstimate {
  estimate_id: number;
  page_count: number;
  copies: number;
  color_mode: string;
  print_type: string;
  total_cost: number;
  currency: string;
  created_at: string;
}

export interface AdminEstimateList {
  items: AdminEstimate[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface AdminRevenue {
  total_revenue: number;
  today_revenue: number;
  monthly_revenue: number;
  total_estimates: number;
  average_estimate: number;
  currency: string;
  series: RevenuePoint[];
}

export interface DocumentBreakdown {
  total_documents: number;
  by_extension: Record<string, number>;
}

export interface CommunityStats {
  total_requests: number;
  open_requests: number;
  fulfilled_requests: number;
  total_offers: number;
}

export const adminService = {
  overview: () => api.get<AdminOverview>("/api/v1/admin/overview"),
  listUsers: (page = 1, pageSize = 50) =>
    api.get<AdminUserList>(`/api/v1/admin/users?page=${page}&page_size=${pageSize}`),
  listEstimates: (page = 1, pageSize = 50) =>
    api.get<AdminEstimateList>(`/api/v1/admin/estimates?page=${page}&page_size=${pageSize}`),
  revenue: () => api.get<AdminRevenue>("/api/v1/admin/revenue"),
  documentBreakdown: () => api.get<DocumentBreakdown>("/api/v1/admin/documents/breakdown"),
  communityStats: () => api.get<CommunityStats>("/api/v1/admin/community/stats"),
};
