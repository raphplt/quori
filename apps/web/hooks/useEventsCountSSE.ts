"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

interface UseEventsCountSSEReturn {
  eventsLength?: number;
  isConnected: boolean;
  error: Error | null;
}

/**
 * Hook pour recevoir le count des événements en temps réel via SSE
 */
export function useEventsCountSSE(): UseEventsCountSSEReturn {
  const { data: session } = useSession();
  const [eventsLength, setEventsLength] = useState<number>();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // On reste sur EventSource pour éviter les conflits de types
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    if (!session?.apiToken) return;

    const connectSSE = () => {
      // Ferme l'ancienne connexion si existante
      eventSourceRef.current?.close();

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const url = `${baseUrl}/github/events/length/stream`;

      // Crée le polyfill puis caste en EventSource standard
      const raw = new EventSourcePolyfill(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${session.apiToken}` },
      });
      const es = raw as unknown as EventSource;
      eventSourceRef.current = es;

      // Connexion ouverte
      es.onopen = () => {
        console.log("🔗 SSE Events Count connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      // Message par défaut
      es.onmessage = (ev: MessageEvent) => {
        try {
          const parsed = JSON.parse(ev.data) as { count: number };
          if (typeof parsed.count === "number") {
            setEventsLength(parsed.count);
          }
        } catch (parseErr: unknown) {
          console.error("Error parsing SSE message:", parseErr);
        }
      };

      // Événement nommé "count"
      es.addEventListener("count", (ev: MessageEvent) => {
        try {
          const parsed = JSON.parse(ev.data) as { count: number };
          if (typeof parsed.count === "number") {
            setEventsLength(parsed.count);
          }
        } catch (parseErr: unknown) {
          console.error("Error parsing SSE 'count' event:", parseErr);
        }
      });

      // Gestion des erreurs et reconnexion
      es.onerror = () => {
        console.error("SSE Events Count error");
        setIsConnected(false);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * 2 ** reconnectAttemptsRef.current,
            30_000
          );
          reconnectAttemptsRef.current += 1;
          console.log(
            `🔄 Reconnecting SSE Events Count in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
          );
          reconnectTimeoutRef.current = window.setTimeout(connectSSE, delay);
        } else {
          setError(new Error("Max reconnection attempts reached"));
        }
      };
    };

    connectSSE();

    // Cleanup
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
    };
  }, [session?.apiToken]);

  return { eventsLength, isConnected, error };
}
