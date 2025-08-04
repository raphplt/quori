import { useAuthenticatedQuery } from "./useAuthenticatedQuery";

interface InstallationStatus {
  installed: boolean;
  installations: {
    id: number;
    account_login: string;
    repos: string[];
    created_at: string;
  }[];
  installUrl: string;
}

export function useGitHubInstallations() {
  return useAuthenticatedQuery<InstallationStatus>(
    ["github-installations"],
    "/github/app/status",
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
