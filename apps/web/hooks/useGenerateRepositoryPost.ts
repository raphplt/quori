import { useMutation } from "@tanstack/react-query";
import { authenticatedFetcher } from "./useAuthenticatedQuery";
import { RepositoryDetails } from "@/types/repository-details";

interface RepositoryPostRequest {
  repository: {
    fullName: string;
    description?: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    language?: string | null;
    topics: string[];
    timestamp: string;
  };
  options?: {
    lang?: string;
    tone?: string;
    output?: string[];
  };
}

interface GeneratePostResponse {
  summary: string;
  post: string;
}

export function useGenerateRepositoryPost(owner: string, repo: string) {
  return useMutation<GeneratePostResponse, Error, RepositoryPostRequest>({
    mutationFn: async request => {
      const url = `/github/repositories/${owner}/${repo}/generate`;
      return authenticatedFetcher<GeneratePostResponse>(url, {
        method: "POST",
        body: JSON.stringify(request),
      });
    },
  });
}

export function createRepositoryPostRequest(
  details: RepositoryDetails
): RepositoryPostRequest {
  return {
    repository: {
      fullName: details.repository.full_name,
      description: details.repository.description,
      stars: details.repository.stargazers_count,
      forks: details.repository.forks_count,
      openIssues: details.repository.open_issues_count,
      language: details.repository.language,
      topics: details.repository.topics,
      timestamp: new Date().toISOString(),
    },
  };
}
