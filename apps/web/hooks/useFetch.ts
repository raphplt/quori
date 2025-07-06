import { useQuery, QueryKey, UseQueryOptions } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const finalUrl = `${API_BASE_URL}${url}`;

  const res = await fetch(finalUrl, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

/**
 * useFetch - hook réutilisable pour requêtes vers le backend API
 **
 * @param key    clé unique (string | array) pour React Query
 * @param url    URL relative à appeler (ex: "/github/repositories")
 * @param init   options de fetch (méthode, headers, body...)
 * @param opts   options de useQuery (staleTime, cacheTime, onSuccess...)
 */
export function useFetch<TData, TError = unknown>(
  key: QueryKey,
  url: string,
  init?: RequestInit,
  opts?: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => fetcher<TData>(url, init),
    ...opts,
  });
}
