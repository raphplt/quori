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

  //TODO : améliorer pour utiliser le SSE ou websocket
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
