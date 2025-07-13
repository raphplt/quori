"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

interface UseEventsCountSSEReturn {
  eventsLength: number | undefined;
  isConnected: boolean;
  error: Error | null;
}

/**
 * Hook pour recevoir le count des événements en temps réel via SSE
 */
export function useEventsCountSSE(): UseEventsCountSSEReturn {
  const { data: session } = useSession();
  const [eventsLength, setEventsLength] = useState<number | undefined>(
    undefined
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
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
      const url = `${baseUrl}/github/events/length/stream?token=${session.apiToken}`;

      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("🔗 SSE Events Count connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data.count === "number") {
            setEventsLength(data.count);
          }
        } catch (err) {
          console.error("Error parsing SSE event data:", err);
        }
      };

      eventSource.addEventListener("count", event => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data.count === "number") {
            setEventsLength(data.count);
          }
        } catch (err) {
          console.error("Error parsing SSE count event:", err);
        }
      });

      eventSource.onerror = err => {
        console.error("SSE Events Count error:", err);
        setIsConnected(false);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;

          console.log(
            `🔄 Reconnecting SSE Events Count in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
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
    eventsLength,
    isConnected,
    error,
  };
}
