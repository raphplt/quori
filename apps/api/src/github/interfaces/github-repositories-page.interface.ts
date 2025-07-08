export interface GitHubRepositoriesPage {
  repositories: import('./github-repository.interface').GitHubRepository[];
  totalCount: number;
}
