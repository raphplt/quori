"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { GitHubEvent } from "@/types/githubEvent";

interface UseEventsSSEReturn {
  events: GitHubEvent[] | undefined;
  isConnected: boolean;
  error: Error | null;
}

/**
 * Hook pour recevoir les événements GitHub en temps réel via SSE
 */
export function useEventsSSE(): UseEventsSSEReturn {
  const { data: session } = useSession();
  const [events, setEvents] = useState<GitHubEvent[] | undefined>(undefined);
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
      const url = `${baseUrl}/github/events/stream?token=${session.apiToken}`;

      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("🔗 SSE Events connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      // Écouter les événements initiaux
      eventSource.addEventListener("events", event => {
        try {
          const data = JSON.parse(event.data);
          if (data.events) {
            setEvents(data.events);
          }
        } catch (err) {
          console.error("Error parsing SSE events event:", err);
        }
      });

      // Écouter les nouveaux événements
      eventSource.addEventListener("new-event", event => {
        try {
          const data = JSON.parse(event.data);
          if (data.event) {
            setEvents(prevEvents => {
              if (!prevEvents) return [data.event];
              return [data.event, ...prevEvents];
            });
          }
        } catch (err) {
          console.error("Error parsing SSE new-event event:", err);
        }
      });

      // Écouter les mises à jour d'événements
      eventSource.addEventListener("event-update", event => {
        try {
          const data = JSON.parse(event.data);
          if (data.event) {
            setEvents(prevEvents => {
              if (!prevEvents) return [data.event];
              return prevEvents.map(event =>
                event.delivery_id === data.event.delivery_id
                  ? data.event
                  : event
              );
            });
          }
        } catch (err) {
          console.error("Error parsing SSE event-update event:", err);
        }
      });

      // Écouter les suppressions d'événements
      eventSource.addEventListener("event-delete", event => {
        try {
          const data = JSON.parse(event.data);
          if (data.eventId) {
            setEvents(prevEvents => {
              if (!prevEvents) return [];
              return prevEvents.filter(
                event => event.delivery_id !== data.eventId
              );
            });
          }
        } catch (err) {
          console.error("Error parsing SSE event-delete event:", err);
        }
      });

      eventSource.onerror = err => {
        console.error("SSE Events error:", err);
        setIsConnected(false);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;

          console.log(
            `🔄 Reconnecting SSE Events in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
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
    events,
    isConnected,
    error,
  };
}
