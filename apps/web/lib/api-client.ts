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

  return fetch(`${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.apiToken && { Authorization: `Bearer ${session.apiToken}` }),
      ...options.headers,
    },
  });
};

/**
 * Hook pour obtenir une fonction de requête authentifiée
 * À utiliser dans les composants React
 */
export const useAuthenticatedFetch = () => {
  return authenticatedFetch;
};
