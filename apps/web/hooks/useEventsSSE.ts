"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { GitHubEvent } from "@/types/githubEvent";

interface UseEventsSSEReturn {
  events?: GitHubEvent[];
  isConnected: boolean;
  error: Error | null;
}

/**
 * Hook pour recevoir les événements GitHub en temps réel via SSE
 */
export function useEventsSSE(): UseEventsSSEReturn {
  const { data: session } = useSession();
  const [events, setEvents] = useState<GitHubEvent[]>();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // On n’a plus besoin de EventSourcePolyfill dans le type, juste EventSource
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    if (!session?.apiToken) return;

    const connectSSE = () => {
      eventSourceRef.current?.close();

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const url = `${baseUrl}/github/events/stream`;

      const raw = new EventSourcePolyfill(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${session.apiToken}` },
      });
      const es = raw as unknown as EventSource;
      eventSourceRef.current = es;

      // connexion ouverte
      es.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      // événement initial avec la liste complète
      es.addEventListener("events", (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data) as unknown as {
            events: GitHubEvent[];
          };
          if (payload.events) setEvents(payload.events);
        } catch (parseErr: unknown) {
          console.error("Error parsing 'events':", parseErr);
        }
      });

      // nouvel événement ajouté
      es.addEventListener("new-event", (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data) as unknown as {
            event: GitHubEvent;
          };
          if (payload.event) {
            setEvents(prev =>
              prev ? [payload.event, ...prev] : [payload.event]
            );
          }
        } catch (parseErr: unknown) {
          console.error("Error parsing 'new-event':", parseErr);
        }
      });

      // mise à jour d'un événement existant
      es.addEventListener("event-update", (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data) as unknown as {
            event: GitHubEvent;
          };
          if (payload.event) {
            setEvents(prev =>
              prev
                ? prev.map(e =>
                    e.delivery_id === payload.event.delivery_id
                      ? payload.event
                      : e
                  )
                : [payload.event]
            );
          }
        } catch (parseErr: unknown) {
          console.error("Error parsing 'event-update':", parseErr);
        }
      });

      // suppression d'un événement
      es.addEventListener("event-delete", (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data) as unknown as { eventId: string };
          if (payload.eventId) {
            setEvents(prev =>
              prev ? prev.filter(e => e.delivery_id !== payload.eventId) : []
            );
          }
        } catch (parseErr: unknown) {
          console.error("Error parsing 'event-delete':", parseErr);
        }
      });

      // gestion des erreurs côté serveur
      es.addEventListener("error", (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data) as unknown as { error: string };
          if (payload.error) {
            console.error("Server SSE error:", payload.error);
            setError(new Error(payload.error));
          }
        } catch (parseErr: unknown) {
          console.error("Error parsing 'error' event:", parseErr);
        }
      });

      // erreur + logique de reconnexion
      es.onerror = errorEvent => {
        console.error("🔥 SSE Error:", errorEvent);
        setIsConnected(false);

        // Vérifier s'il s'agit d'une erreur d'authentification
        if (
          errorEvent.type === "error" &&
          es.readyState === EventSource.CLOSED
        ) {
          setError(new Error("Authentication failed or connection refused"));
          return;
        }

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * 2 ** reconnectAttemptsRef.current,
            30_000
          );
          reconnectAttemptsRef.current += 1;
          console.log(
            `🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
          );
          reconnectTimeoutRef.current = window.setTimeout(connectSSE, delay);
        } else {
          setError(new Error("Max reconnection attempts reached"));
        }
      };
    };

    connectSSE();

    // cleanup
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
    };
  }, [session?.apiToken]);

  return { events, isConnected, error };
}
