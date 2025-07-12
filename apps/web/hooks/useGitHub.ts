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
  availableLanguages?: string[];
}

/**
 * Hook pour récupérer les repositories GitHub de l'utilisateur connecté avec filtres
 */
export function useGitHubRepositories(
  page = 1,
  perPage = 6,
  filters?: {
    search?: string;
    language?: string;
    visibility?: "all" | "public" | "private";
    sort?: "name" | "stars" | "forks" | "updated" | "created";
    direction?: "asc" | "desc";
  }
) {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    sort: filters?.sort || "updated",
    direction: filters?.direction || "desc",
    visibility: filters?.visibility || "all",
  });

  if (filters?.search) {
    params.set("search", filters.search);
  }
  if (filters?.language && filters.language !== "all") {
    params.set("language", filters.language);
  }

  return useAuthenticatedQuery<GitHubRepositoriesPage>(
    ["github", "repositories", page, perPage, filters],
    `/github/repositories?${params.toString()}`,
    { method: "GET" }
  );
}

/**
 * Hook pour récupérer les langages disponibles (utilisé par les filtres)
 */
export function useAvailableLanguages() {
  return useAuthenticatedQuery<{ availableLanguages: string[] }>(
    ["github", "repositories", "languages"],
    `/github/repositories?page=1&perPage=1`,
    { method: "GET" },
    {
      select: data => ({ availableLanguages: data.availableLanguages || [] }),
    }
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
