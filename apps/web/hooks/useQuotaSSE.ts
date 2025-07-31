"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

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
      const url = `${baseUrl}/quota/stream?token=${session.apiToken}`;

      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("🔗 SSE Quota connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      // Écouter les événements de quota
      eventSource.addEventListener("quota", event => {
        try {
          const data = JSON.parse(event.data);
          if (data.quota) {
            setQuota(data.quota);
          }
        } catch (err) {
          console.error("Error parsing SSE quota event:", err);
        }
      });

      // Écouter les mises à jour de quota
      eventSource.addEventListener("quota-update", event => {
        try {
          const data = JSON.parse(event.data);
          if (data.quota) {
            setQuota(data.quota);
          }
        } catch (err) {
          console.error("Error parsing SSE quota-update event:", err);
        }
      });

      eventSource.onerror = err => {
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
