import { EventStatus } from "@/types/githubEvent";

export const getEventStatusLabel = (status: EventStatus): string => {
  switch (status) {
    case "pending":
      return "En attente";
    case "processing":
      return "En cours de traitement";
    case "processed":
      return "Traité avec succès";
    case "failed":
      return "Échec du traitement";
    case "ignored":
      return "Ignoré";
    default:
      return "Statut inconnu";
  }
};
