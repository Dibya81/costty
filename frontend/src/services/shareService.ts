import { api } from "../lib/api";

export type SharePermission = "view" | "comment" | "edit";

export interface ShareLink {
  id: number;
  slug: string;
  file_id: number;
  file_name: string;
  permission: SharePermission;
  password: boolean;
  expires_at: string | null;
  revoked: boolean;
  view_count: number;
  created_at: string;
}

export interface CreateShareInput {
  file_id: number;
  permission: SharePermission;
  password?: string;
  expires_in_hours?: number;
}

export async function listShareLinks(): Promise<ShareLink[]> {
  return api.get<ShareLink[]>("/api/v1/shares");
}

export async function createShareLink(input: CreateShareInput): Promise<ShareLink> {
  return api.post<ShareLink>("/api/v1/shares", input);
}

export async function revokeShareLink(id: number): Promise<ShareLink> {
  return api.delete<ShareLink>(`/api/v1/shares/${id}`);
}
