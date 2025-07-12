"use client";
import { useState } from "react";
import { useGitHubEventsPaginated } from "@/hooks/useGitHubEventsPaginated";
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
import Link from "next/link";
import { PaginationControls } from "@/app/(protected)/repositories/_components/PaginationControls";

export default function ActivityFeed() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useGitHubEventsPaginated(
    currentPage,
    itemsPerPage
  );

  const events = data?.events || [];
  const totalPages = data?.totalPages || 0;

  // Fonctions de pagination similaires à Repositories.tsx
  const goToPage = (p: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));
  };
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

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
        <div>
          <h2 className="text-lg font-semibold">Activité Git</h2>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.total} événement{data.total > 1 ? "s" : ""} trouvé
              {data.total > 1 ? "s" : ""}
            </p>
          )}
        </div>
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

      {data && data.events.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Aucun événement Git trouvé. Connectez votre dépôt GitHub pour voir
              les événements.
            </div>
          </CardContent>
        </Card>
      )}

      {events.map(activity => (
        <Card key={activity.delivery_id}>
          <Link href={`/event/${activity.delivery_id}`}>
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
          </Link>
        </Card>
      ))}

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        onPrevious={goToPrevious}
        onNext={goToNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />
    </div>
  );
}
