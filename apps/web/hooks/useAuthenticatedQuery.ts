import { useQuery, QueryKey, UseQueryOptions } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/api-client";

/**
 * Fetcher qui utilise l'API client configuré avec l'authentification
 */
export async function authenticatedFetcher<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await authenticatedFetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

/**
 * Hook pour faire des requêtes authentifiées vers l'API backend
 * Utilise automatiquement l'URL de base configurée et les headers d'auth
 */
export function useAuthenticatedQuery<TData, TError = unknown>(
  key: QueryKey,
  url: string,
  init?: RequestInit,
  opts?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  return useQuery<TData, TError>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => authenticatedFetcher<TData>(url, init),
    ...opts,
  });
}
