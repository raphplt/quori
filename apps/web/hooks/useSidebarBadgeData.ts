import { useMemo } from "react";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import { useEventsStats } from "@/hooks/useEventsStats";

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

  const badgeData = useMemo(() => {
    // Pour le badge Git Activity, on affiche le nombre seulement s'il y a de l'activité récente
    let gitActivityBadge: string | undefined;

    if (isLoading) {
      gitActivityBadge = "...";
    } else if (total > 0) {
      // Si plus de 99 événements, on affiche "99+"
      gitActivityBadge = total > 99 ? "99+" : total.toString();

      // Si pas d'activité récente, on peut choisir de ne pas afficher le badge
      // ou de le griser en ajoutant un indicateur visuel plus tard
      if (!hasRecentActivity && total > 0) {
        gitActivityBadge = total.toString(); // Garde le nombre mais on pourrait ajouter un style différent
      }
    }

    return {
      repositories: "3", // TODO: Connecter à une vraie source de données
      gitActivity: gitActivityBadge,
      drafts: "5", // TODO: Connecter à une vraie source de données
      scheduled: "8", // TODO: Connecter à une vraie source de données
    };
  }, [total, hasRecentActivity, isLoading]);

  return badgeData;
}
