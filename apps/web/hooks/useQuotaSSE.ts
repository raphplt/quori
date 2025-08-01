"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

interface Quota {
  used: number;
  remaining: number;
}

interface UseQuotaSSEReturn {
  quota: Quota | undefined;
  isConnected: boolean;
  error: Error | null;
}

/**
 * Hook pour recevoir les informations de quota en temps réel via SSE
 */
export function useQuotaSSE(): UseQuotaSSEReturn {
  const { data: session } = useSession();
  const [quota, setQuota] = useState<Quota | undefined>(undefined);
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
      const url = `${baseUrl}/quota/stream`;

      const eventSource = new EventSourcePolyfill(url, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${session.apiToken}`,
        },
      });

      eventSourceRef.current = eventSource as unknown as EventSource;

      eventSource.onopen = () => {
        console.log("🔗 SSE Quota connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      // Écouter les événements de quota
      (eventSource as any).addEventListener("quota", (event: Event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as { quota?: Quota };
          if (data.quota) {
            setQuota(data.quota);
          }
        } catch (err: unknown) {
          console.error("Error parsing SSE quota event:", err);
        }
      });

      // Écouter les mises à jour de quota
      (eventSource as any).addEventListener("quota-update", (event: Event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as { quota?: Quota };
          if (data.quota) {
            setQuota(data.quota);
          }
        } catch (err: unknown) {
          console.error("Error parsing SSE quota-update event:", err);
        }
      });

      (eventSource as any).onerror = (err: Event) => {
        console.error("SSE Quota error:", err);
        setIsConnected(false);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;

          console.log(
            `🔄 Reconnecting SSE Quota in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
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
    quota,
    isConnected,
    error,
  };
}
