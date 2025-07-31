import { useQuery } from "@tanstack/react-query";
import { authenticatedFetcher } from "./useAuthenticatedQuery";
import { Post } from "@/types/post";

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
    refetchInterval: 60000, // Augmenté de 30s à 60s
  });
}

/**
 * Hook pour récupérer les listes de posts par statut
 */
export function usePostsByStatus() {
  return useQuery<{
    drafts: Post[];
    ready: Post[];
    scheduled: Post[];
    published: Post[];
    failed: Post[];
  }>({
    queryKey: ["posts-by-status"],
    queryFn: async () => {
      const [drafts, ready, scheduled, published, failed] = await Promise.all([
        authenticatedFetcher<{ posts: Post[] }>(
          "/github/posts?status=draft&limit=100"
        ),
        authenticatedFetcher<{ posts: Post[] }>(
          "/github/posts?status=ready&limit=100"
        ),
        authenticatedFetcher<{ posts: Post[] }>(
          "/github/posts?status=scheduled&limit=100"
        ),
        authenticatedFetcher<{ posts: Post[] }>(
          "/github/posts?status=published&limit=100"
        ),
        authenticatedFetcher<{ posts: Post[] }>(
          "/github/posts?status=failed&limit=100"
        ),
      ]);
      return {
        drafts: drafts.posts,
        ready: ready.posts,
        scheduled: scheduled.posts,
        published: published.posts,
        failed: failed.posts,
      };
    },
    refetchInterval: 60000, // Augmenté de 30s à 60s
  });
}
