import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Cache pour la session pour éviter les appels répétés
let sessionCache: any = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 30000; // 30 secondes

/**
 * Fonction utilitaire pour faire des requêtes authentifiées vers l'API
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  // Utiliser le cache de session si il est encore valide
  const now = Date.now();
  if (!sessionCache || now - sessionCacheTime > SESSION_CACHE_DURATION) {
    sessionCache = await getSession();
    sessionCacheTime = now;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiToken = (sessionCache as any)?.apiToken as string | undefined;
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
