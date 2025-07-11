"use client";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, GitCommit, GitPullRequest } from "lucide-react";

export default function EventsSummary() {
  const { events, isLoading, getEventsByType, hasEvents } = useGitHubEvents();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            Chargement des statistiques...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasEvents) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            Aucun événement disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  const pushEvents = getEventsByType("push");
  const pullRequestEvents = getEventsByType("pull_request");
  const totalEvents = events?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Résumé d&apos;activité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <GitCommit className="h-4 w-4" />
              <Badge variant="default">{pushEvents.length}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Commits</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <GitPullRequest className="h-4 w-4" />
              <Badge variant="secondary">{pullRequestEvents.length}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Pull Requests</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-4 w-4" />
              <Badge variant="outline">{totalEvents}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
