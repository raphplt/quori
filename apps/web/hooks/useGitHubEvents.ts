import { useEvents } from "@/contexts/EventsContext";
import { GitHubEvent } from "@/types/githubEvent";

export interface UseEventsReturn {
  events: GitHubEvent[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createTestEvent: () => Promise<void>;
  // Méthodes utilitaires
  getEventsByType: (type: string) => GitHubEvent[];
  getRecentEvents: (limit?: number) => GitHubEvent[];
  hasEvents: boolean;
}

/**
 * Hook personnalisé pour accéder aux événements GitHub avec des méthodes utilitaires
 */
export function useGitHubEvents(): UseEventsReturn {
  const { events, isLoading, error, refetch, createTestEvent } = useEvents();

  const getEventsByType = (type: string): GitHubEvent[] => {
    if (!events) return [];
    return events.filter(event => event.event === type);
  };

  const getRecentEvents = (limit: number = 10): GitHubEvent[] => {
    if (!events) return [];
    return events
      .sort(
        (a, b) =>
          new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
      )
      .slice(0, limit);
  };

  const hasEvents = Boolean(events && events.length > 0);

  return {
    events,
    isLoading,
    error,
    refetch,
    createTestEvent,
    getEventsByType,
    getRecentEvents,
    hasEvents,
  };
}
