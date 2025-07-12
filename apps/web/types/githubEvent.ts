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

export interface GitHubEvent {
  delivery_id: string;
  event: string;
  repo_full_name: string;
  metadata?: GitHubEventMeta;
  received_at: string;
}
