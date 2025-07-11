"use client";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, GitCommit, GitPullRequest, RefreshCw } from "lucide-react";

export default function ActivityFeed() {
  const {
    events: data,
    isLoading,
    error,
    refetch,
    createTestEvent,
  } = useGitHubEvents();

  const getIcon = (type: string) => {
    switch (type) {
      case "push":
        return <GitCommit className="h-4 w-4" />;
      case "pull_request":
        return <GitPullRequest className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case "push":
        return <Badge variant="default">Push</Badge>;
      case "pull_request":
        return <Badge variant="secondary">Pull Request</Badge>;
      default:
        return <Badge variant="secondary">Event</Badge>;
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activité Git</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
        <Button variant="outline" size="sm" onClick={createTestEvent}>
          Créer événement test
        </Button>
      </div>
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Chargement des événements...
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Erreur lors du chargement des événements
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Aucun événement Git trouvé. Connectez votre dépôt GitHub pour voir
              les événements.
            </div>
          </CardContent>
        </Card>
      )}

      {data?.map(activity => (
        <Card key={activity.delivery_id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getIcon(activity.event)}
                <CardTitle className="text-lg">
                  {activity.metadata?.title || activity.event}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getBadge(activity.event)}
              </div>
            </div>
            <CardDescription>
              {activity.repo_full_name} •{" "}
              {new Date(activity.received_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.metadata?.desc && (
              <p className="mb-2 text-sm text-muted-foreground">
                {activity.metadata.desc}
              </p>
            )}
            <div className="flex items-center space-x-2">
              <Button size="sm">Generer un post</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
