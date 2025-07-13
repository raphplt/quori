import { Badge } from "@/components/ui/badge";
import { EventStatus } from "@/types/githubEvent";
import { GitCommit, GitPullRequest, Activity } from "lucide-react";

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

export const getEventTypeLabel = (type: string): string => {
  switch (type) {
    case "push":
      return "Push";
    case "pull_request":
      return "Pull Request";
    case "issues":
      return "Issue";
    case "release":
      return "Release";
    case "fork":
      return "Fork";
    case "star":
      return "Star";
    case "create":
      return "Création";
    case "delete":
      return "Suppression";
    case "workflow_run":
      return "Exécution de workflow";
    default:
      return "Autre";
  }
};

export const getIcon = (type: string) => {
  switch (type) {
    case "push":
      return <GitCommit className="h-4 w-4" />;
    case "pull_request":
      return <GitPullRequest className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export const getBadge = (type: string, status?: string) => {
  if (status === "processed") {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Traité
      </Badge>
    );
  } else if (status === "processing") {
    return (
      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
        En cours
      </Badge>
    );
  } else if (status === "failed") {
    return <Badge variant="destructive">Échec</Badge>;
  }

  // Badge pour le type d'événement
  switch (type) {
    case "push":
      return <Badge variant="default">Push</Badge>;
    case "pull_request":
      return <Badge variant="secondary">Pull Request</Badge>;
    default:
      return <Badge variant="secondary">Event</Badge>;
  }
};
