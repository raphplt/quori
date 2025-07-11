"use client";
import { createContext, useContext, ReactNode } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { GitHubEvent } from "@/types/githubEvent";

interface EventsContextType {
  events: GitHubEvent[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createTestEvent: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
}

export function EventsProvider({ children }: EventsProviderProps) {
  const { data: session } = useSession();

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

  const createTestEvent = async () => {
    try {
      await authenticatedFetcher("/github/test-event");
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      console.error("Error creating test event:", error);
      throw error;
    }
  };

  const value: EventsContextType = {
    events,
    isLoading,
    error,
    refetch,
    createTestEvent,
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
