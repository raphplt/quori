import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Fonction utilitaire pour faire des requêtes authentifiées vers l'API
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const session = await getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiToken = (session as any)?.apiToken as string | undefined;
  if (apiToken) {
    headers.Authorization = `Bearer ${apiToken}`;
  }

  const finalUrl = `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  return fetch(finalUrl, {
    ...options,
    headers,
  });
};

/**
 * Hook pour obtenir une fonction de requête authentifiée
 * À utiliser dans les composants React
 */
export const useAuthenticatedFetch = () => {
  return authenticatedFetch;
};
