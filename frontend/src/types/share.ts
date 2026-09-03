export type SharePermission = "view" | "comment" | "edit";

export interface ShareLink {
  id: string;
  documentId: string;
  documentName: string;
  url: string;
  permission: SharePermission;
  password?: string;
  expiresAt?: string; // ISO date, undefined = never
  createdAt: string;
  revoked: boolean;
  views: number;
}
