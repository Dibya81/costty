import { api } from "../lib/api";

export interface CommunityOffer {
  id: number;
  author_name: string;
  note: string;
  file_name: string | null;
  created_at: string;
}

export interface CommunityRequest {
  id: number;
  title: string;
  description: string;
  tags: string[];
  author_name: string;
  status: "open" | "fulfilled";
  created_at: string;
  offers: CommunityOffer[];
}

export interface CommunityRequestListResponse {
  items: CommunityRequest[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  tags: string[];
}

export interface CreateOfferInput {
  note: string;
  file_name?: string;
}

export async function listRequests(params?: { q?: string; status?: string }): Promise<CommunityRequestListResponse> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status_filter", params.status);
  qs.set("page_size", "100");
  return api.get<CommunityRequestListResponse>(`/api/v1/community/requests?${qs}`);
}

export async function getRequest(id: number): Promise<CommunityRequest> {
  return api.get<CommunityRequest>(`/api/v1/community/requests/${id}`);
}

export async function createRequest(input: CreateRequestInput): Promise<CommunityRequest> {
  return api.post<CommunityRequest>("/api/v1/community/requests", input);
}

export async function addOffer(requestId: number, input: CreateOfferInput): Promise<CommunityRequest> {
  return api.post<CommunityRequest>(`/api/v1/community/requests/${requestId}/offers`, input);
}

export async function markFulfilled(requestId: number): Promise<CommunityRequest> {
  return api.post<CommunityRequest>(`/api/v1/community/requests/${requestId}/fulfill`, {});
}
