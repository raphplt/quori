export interface GitHubEventMeta {
  title: string;
  desc: string;
  filesChanged: string[];
  diffStats: {
    additions: number;
    deletions: number;
    changes: number;
  }[];
}

export type EventStatus =
  | "pending" // En attente de traitement
  | "processing" // En cours de traitement
  | "processed" // Traité avec succès
  | "failed" // Échec du traitement
  | "ignored"; // Ignoré (pas pertinent pour génération de post)

export type EventType =
  | "push"
  | "pull_request"
  | "issues"
  | "release"
  | "fork"
  | "star"
  | "create"
  | "delete"
  | "workflow_run"
  | "other";

export interface GitHubEvent {
  delivery_id: string;
  event: string;
  event_type: EventType;
  payload: Record<string, unknown>;
  repo_full_name: string;
  author_login?: string;
  author_avatar_url?: string;
  metadata?: GitHubEventMeta;
  received_at: string;
  status: EventStatus;
  processed_at?: string;
  error_message?: string;
  retry_count: number;
}
