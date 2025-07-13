import { useQuery } from "@tanstack/react-query";
import { authenticatedFetcher } from "./useAuthenticatedQuery";

interface PostsStats {
  drafts: number;
  ready: number;
  scheduled: number;
  published: number;
  failed: number;
}

/**
 * Hook pour récupérer les statistiques des posts par statut
 */
export function usePostsStats() {
  return useQuery<PostsStats>({
    queryKey: ["posts-stats"],
    queryFn: async () => {
      // Récupérer les counts pour chaque statut
      const [drafts, ready, scheduled, published, failed] = await Promise.all([
        authenticatedFetcher<{ total: number }>(
          "/github/posts?status=draft&limit=1"
        ),
        authenticatedFetcher<{ total: number }>(
          "/github/posts?status=ready&limit=1"
        ),
        authenticatedFetcher<{ total: number }>(
          "/github/posts?status=scheduled&limit=1"
        ),
        authenticatedFetcher<{ total: number }>(
          "/github/posts?status=published&limit=1"
        ),
        authenticatedFetcher<{ total: number }>(
          "/github/posts?status=failed&limit=1"
        ),
      ]);

      return {
        drafts: drafts.total,
        ready: ready.total,
        scheduled: scheduled.total,
        published: published.total,
        failed: failed.total,
      };
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}
