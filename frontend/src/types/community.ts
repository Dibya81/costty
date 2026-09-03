export type RequestStatus = "open" | "fulfilled";

export interface CommunityOffer {
  id: string;
  author: string;
  note: string;
  fileName?: string;
  createdAt: string;
}

export interface CommunityRequest {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  createdAt: string;
  status: RequestStatus;
  offers: CommunityOffer[];
}
