export interface Post {
  id: number;
  summary: string;
  postContent: string;
  status: "draft" | "ready" | "scheduled" | "published" | "failed";
  statusLinkedin?: "pending" | "published" | "failed";
  scheduledAt?: string;
  publishedAt?: string;
  externalId?: string;
  impressions: number;
  likes: number;
  comments: number;
  template?: string;
  tone?: string;
  createdAt: string;
  updatedAt: string;
  installation?: {
    id: number;
    account_login: string;
  };
  event?: {
    delivery_id: string;
    repo_full_name: string;
  };
}
