export interface RepositoryDetails {
  repository: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    clone_url: string;
    ssh_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    topics: string[];
    license: {
      key: string;
      name: string;
      spdx_id: string;
      url: string;
    } | null;
    owner: {
      login: string;
      avatar_url: string;
      html_url: string;
    };
  };
  languages: Record<string, number>;
  contributors: {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
  }[];
  recentCommits: {
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    } | null;
    date: string;
    html_url: string;
  }[];
  releases: {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    published_at: string;
    html_url: string;
  }[];
  openIssues: {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    html_url: string;
    user: {
      login: string;
      avatar_url: string;
    } | null;
  }[];
  openPullRequests: {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    html_url: string;
    user: {
      login: string;
      avatar_url: string;
    } | null;
  }[];
  branches: {
    name: string;
    commit: {
      sha: string;
    };
    protected: boolean;
  }[];
}
