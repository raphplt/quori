import { useAuthenticatedQuery } from "./useAuthenticatedQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/api-client";

interface Installation {
  id: number;
  account_login: string;
  repos: string[];
  created_at: string;
}

interface AppInstallationStatus {
  installed: boolean;
  installations: Installation[];
  installUrl: string;
  error?: string;
  message?: string;
}

/**
 * Hook pour récupérer le statut d'installation de la GitHub App
 */
export function useGitHubAppStatus() {
  return useAuthenticatedQuery<AppInstallationStatus>(
    ["github", "app", "status"],
    "/github/app/status",
    { method: "GET" }
  );
}

export function useGithubAppDebug() {
  return useAuthenticatedQuery<Installation[]>(
    ["github", "app", "debug"],
    "/github/app/debug",
    { method: "GET" }
  );
}

export function useGithubAppTestApi() {
  return useAuthenticatedQuery<Record<string, unknown>>(
    ["github", "app", "test-api"],
    "/github/app/test-api",
    { method: "GET" }
  );
}

/**
 * Hook pour révoquer une installation de la GitHub App
 */
export function useRevokeGitHubApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (installationId: number) => {
      const response = await authenticatedFetch(
        `/github/app/installation/${installationId}`,
        {
          method: "DELETE",
        }
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache du statut d'installation
      queryClient.invalidateQueries({
        queryKey: ["github", "app", "status"],
      });
    },
  });
}

/**
 * Hook pour synchroniser manuellement les installations GitHub
 */
export function useSyncGitHubApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch("/github/app/sync", {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache du statut d'installation après la synchronisation
      queryClient.invalidateQueries({
        queryKey: ["github", "app", "status"],
      });
    },
  });
}

/**
 * Hook pour forcer la synchronisation de toutes les installations GitHub
 */
export function useForceSyncGitHubApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch("/github/app/force-sync", {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache du statut d'installation après la synchronisation
      queryClient.invalidateQueries({
        queryKey: ["github", "app", "status"],
      });
    },
  });
}

export type { Installation, AppInstallationStatus };
