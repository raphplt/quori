import { useAuthenticatedQuery } from "./useAuthenticatedQuery";
import { RepositoryDetails } from "../types/repository-details";

export function useRepositoryDetails(
  owner: string,
  repo: string,
  installationId?: string
) {
  const queryKey = installationId
    ? ["repository-details", owner, repo, installationId]
    : ["repository-details", owner, repo];

  const queryParams = installationId ? `?installationId=${installationId}` : "";

  const url = `/github/repositories/${owner}/${repo}/details${queryParams}`;

  return useAuthenticatedQuery<RepositoryDetails>(
    queryKey,
    url,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}
