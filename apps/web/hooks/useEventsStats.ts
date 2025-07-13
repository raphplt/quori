import { useMemo } from "react";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";

export interface EventsStats {
  total: number;
  pushEvents: number;
  pullRequestEvents: number;
  hasRecentActivity: boolean;
  lastEventDate?: Date;
}

/**
 * Hook pour obtenir des statistiques sur les événements GitHub
 */
//TODO plus utile à supprimer ?
export function useEventsStats(): EventsStats {
  const { events, getEventsByType } = useGitHubEvents();

  const stats = useMemo(() => {
    if (!events || events.length === 0) {
      return {
        total: 0,
        pushEvents: 0,
        pullRequestEvents: 0,
        hasRecentActivity: false,
      };
    }

    const pushEvents = getEventsByType("push").length;
    const pullRequestEvents = getEventsByType("pull_request").length;

    // Considère l'activité comme "récente" si elle date de moins de 24h
    const lastEvent = events.sort(
      (a, b) =>
        new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    )[0];

    const lastEventDate = new Date(lastEvent.received_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hasRecentActivity = lastEventDate > oneDayAgo;

    return {
      total: events.length,
      pushEvents,
      pullRequestEvents,
      hasRecentActivity,
      lastEventDate,
    };
  }, [events, getEventsByType]);

  return stats;
}
