import { useMemo } from "react";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import { useEventsStats } from "@/hooks/useEventsStats";
import { useDataContext } from "@/contexts/DataContext";

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
  const { total, hasRecentActivity } = useEventsStats();
  const { repositoriesLength, isLoading: isLoadingRepositories } =
    useDataContext();

  const badgeData = useMemo(() => {
    let gitActivityBadge: string | undefined;
    let repositoriesBadge: string;

    if (isLoading) {
      gitActivityBadge = "...";
    } else if (total > 0) {
      gitActivityBadge = total > 99 ? "99+" : total.toString();

      if (!hasRecentActivity && total > 0) {
        gitActivityBadge = total.toString();
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
  }, [
    total,
    hasRecentActivity,
    isLoading,
    repositoriesLength,
    isLoadingRepositories,
  ]);

  return badgeData;
}
