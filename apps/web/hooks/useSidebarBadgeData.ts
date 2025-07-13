import { useMemo } from "react";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import { useDataContext } from "@/contexts/DataContext";
import { useEvents } from "@/contexts/EventsContext";

export interface SidebarBadgeData {
  repositories: string;
  gitActivity: string | undefined;
  drafts: string;
  scheduled: string;
}

/**
 * Hook pour récupérer les données dynamiques des badges de la sidebar
 */
export function useSidebarBadgeData(): SidebarBadgeData {
  const { isLoading } = useGitHubEvents();
  const { eventsLength } = useEvents();
  const { repositoriesLength, isLoading: isLoadingRepositories } =
    useDataContext();

  const badgeData = useMemo(() => {
    let gitActivityBadge: string | undefined;
    let repositoriesBadge: string;

    if (isLoading) {
      gitActivityBadge = "0";
    } else if ((eventsLength ?? 0) > 0) {
      gitActivityBadge =
        (eventsLength ?? 0) > 99 ? "99+" : (eventsLength ?? 0).toString();

      if ((eventsLength ?? 0) > 0) {
        gitActivityBadge = (eventsLength ?? 0).toString();
      }
    }

    if (isLoadingRepositories) {
      repositoriesBadge = "...";
    } else {
      repositoriesBadge = repositoriesLength
        ? repositoriesLength.toString()
        : "0";
    }

    return {
      repositories: repositoriesBadge,
      gitActivity: gitActivityBadge,
      drafts: "5", // TODO: Connecter à une vraie source de données
      scheduled: "8", // TODO: Connecter à une vraie source de données
    };
  }, [eventsLength, isLoading, repositoriesLength, isLoadingRepositories]);

  return badgeData;
}
