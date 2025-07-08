import { useAuthenticatedQuery } from "./useAuthenticatedQuery";

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
}

interface GitHubRepositoriesPage {
  repositories: GitHubRepository[];
  totalCount: number;
}

/**
 * Hook pour récupérer les repositories GitHub de l'utilisateur connecté
 */
export function useGitHubRepositories(page = 1, perPage = 30) {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });
  return useAuthenticatedQuery<GitHubRepositoriesPage>(
    ["github", "repositories", page, perPage],
    `/github/repositories?${params.toString()}`,
    { method: "GET" }
  );
}

/**
 * Hook pour récupérer un repository GitHub spécifique
 */
export function useGitHubRepository(owner: string, repo: string) {
  return useAuthenticatedQuery<GitHubRepository>(
    ["github", "repository", owner, repo],
    `/github/repositories/${owner}/${repo}`,
    { method: "GET" },
    {
      enabled: !!owner && !!repo, // Ne pas exécuter si owner ou repo sont vides
    }
  );
}

export type { GitHubRepository, GitHubRepositoriesPage };
