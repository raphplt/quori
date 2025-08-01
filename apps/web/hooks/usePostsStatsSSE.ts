"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { Post } from "@/types/post";

interface PostsStats {
  drafts: number;
  ready: number;
  scheduled: number;
  published: number;
  failed: number;
}

interface PostsByStatus {
  drafts: Post[];
  ready: Post[];
  scheduled: Post[];
  published: Post[];
  failed: Post[];
}

interface UsePostsStatsSSEReturn {
  stats: PostsStats | undefined;
  postsByStatus: PostsByStatus | undefined;
  isConnected: boolean;
  error: Error | null;
}

/**
 * Hook pour recevoir les statistiques des posts en temps réel via SSE
 */
export function usePostsStatsSSE(): UsePostsStatsSSEReturn {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PostsStats | undefined>(undefined);
  const [postsByStatus, setPostsByStatus] = useState<PostsByStatus | undefined>(
    undefined
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 3;
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!session?.apiToken) {
      return;
    }

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const url = `${baseUrl}/github/posts/stats/stream`;

      const eventSource = new EventSourcePolyfill(url, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${session.apiToken}`,
        },
      });

      eventSourceRef.current = eventSource as unknown as EventSource;

      eventSource.onopen = () => {
        console.log("🔗 SSE Posts Stats connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      // Écouter les événements de stats
      (eventSource as any).addEventListener("stats", (event: Event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as {
            stats?: PostsStats;
          };
          if (data.stats) {
            setStats(data.stats);
          }
        } catch (err: unknown) {
          console.error("Error parsing SSE stats event:", err);
        }
      });

      // Écouter les événements de posts par statut
      (eventSource as any).addEventListener(
        "posts-by-status",
        (event: Event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data) as {
              postsByStatus?: PostsByStatus;
            };
            if (data.postsByStatus) {
              setPostsByStatus(data.postsByStatus);
            }
          } catch (err: unknown) {
            console.error("Error parsing SSE posts-by-status event:", err);
          }
        }
      );

      // Écouter les mises à jour de stats
      (eventSource as any).addEventListener("stats-update", (event: Event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as {
            stats?: PostsStats;
          };
          if (data.stats) {
            setStats(data.stats);
          }
        } catch (err: unknown) {
          console.error("Error parsing SSE stats-update event:", err);
        }
      });

      // Écouter les mises à jour de posts
      (eventSource as any).addEventListener(
        "posts-update",
        (event: Event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data) as {
              postsByStatus?: PostsByStatus;
            };
            if (data.postsByStatus) {
              setPostsByStatus(data.postsByStatus);
            }
          } catch (err: unknown) {
            console.error("Error parsing SSE posts-update event:", err);
          }
        }
      );

      (eventSource as any).onerror = (err: Event) => {
        console.error("SSE Posts Stats error:", err);
        setIsConnected(false);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;

          console.log(
            `🔄 Reconnecting SSE Posts Stats in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectSSE();
          }, delay);
        } else {
          setError(new Error("Max reconnection attempts reached"));
        }
      };
    };

    connectSSE();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
    };
  }, [session?.apiToken]);

  return {
    stats,
    postsByStatus,
    isConnected,
    error,
  };
}
