"use client";
import { createContext, useContext, ReactNode, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GitHubEvent } from "@/types/githubEvent";
import { useEventNotifications } from "@/hooks/useEventNotifications";
import { useEventsCountSSE } from "@/hooks/useEventsCountSSE";
import { useEventsSSE } from "@/hooks/useEventsSSE";

interface EventsContextType {
  events: GitHubEvent[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  eventsLength?: number;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
}

export function EventsProvider({ children }: EventsProviderProps) {
  const { data: session } = useSession();
  const previousEventsRef = useRef<GitHubEvent[]>([]);
  const { notifyNewEvent } = useEventNotifications();

  const { eventsLength } = useEventsCountSSE();
  const { events, isConnected, error } = useEventsSSE();

  // Détecter les nouveaux événements pour les notifications
  useEffect(() => {
    if (!events || !Array.isArray(events)) return;

    const previousEvents = previousEventsRef.current;

    if (previousEvents.length === 0) {
      previousEventsRef.current = events;
      return;
    }

    const previousIds = new Set(previousEvents.map(event => event.delivery_id));
    const newEvents = events.filter(
      event => !previousIds.has(event.delivery_id)
    );

    newEvents.forEach(event => {
      notifyNewEvent(event);
    });

    previousEventsRef.current = events;
  }, [events, notifyNewEvent]);

  const refetch = () => {
    // Avec SSE, pas besoin de refetch manuel
    // Les données sont mises à jour automatiquement
  };

  const value: EventsContextType = {
    events,
    isLoading: !isConnected && !error,
    error,
    refetch,
    eventsLength,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
