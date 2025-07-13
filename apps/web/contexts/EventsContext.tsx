"use client";
import { createContext, useContext, ReactNode, useRef, useEffect } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { GitHubEvent } from "@/types/githubEvent";
import { useEventNotifications } from "@/hooks/useEventNotifications";
import { useEventsCountSSE } from "@/hooks/useEventsCountSSE";

interface EventsContextType {
  events: GitHubEvent[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  eventsLength?: number;
  isEventsLengthLoading?: boolean;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
}

export function EventsProvider({ children }: EventsProviderProps) {
  const { data: session } = useSession();
  const previousEventsRef = useRef<GitHubEvent[]>([]);
  const { notifyNewEvent } = useEventNotifications();

  // Utilisation du SSE pour obtenir le count en temps réel
  const { eventsLength } = useEventsCountSSE();

  const {
    data: events,
    isLoading,
    error,
    refetch,
  }: UseQueryResult<GitHubEvent[], Error> = useQuery({
    queryKey: ["events"],
    queryFn: () => authenticatedFetcher<GitHubEvent[]>("/github/events"),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    enabled: !!session,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Effet pour détecter les nouveaux événements
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

  const value: EventsContextType = {
    events,
    isLoading,
    error,
    refetch,
    eventsLength,
    isEventsLengthLoading: false, // SSE n'a pas de concept de loading, toujours false
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
