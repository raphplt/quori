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
import {
  Activity,
  CheckCircle,
  GitCommit,
  GitPullRequest,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { PaginationControls } from "@/app/(protected)/repositories/_components/PaginationControls";
import { GeneratePostDialog } from "./GeneratePostDialog";
import { GitHubEvent } from "@/types/githubEvent";

export default function ActivityFeed() {
  const [currentPage, setCurrentPage] = useState(1);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GitHubEvent | null>(null);
  const [generatingForEvent, setGeneratingForEvent] = useState<string | null>(
    null
  );
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

  const getBadge = (type: string, status?: string) => {
    // Badge pour le statut de l'événement
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

  const handleGeneratePost = (event: GitHubEvent, e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation du Link
    e.stopPropagation();
    setGeneratingForEvent(event.delivery_id);
    setSelectedEvent(event);
    setGenerateDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setGenerateDialogOpen(open);
    if (!open) {
      setGeneratingForEvent(null);
      setSelectedEvent(null);
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
                  {getBadge(activity.event, activity.status)}
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
                {activity.status === "processed" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Post généré
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={e => handleGeneratePost(activity, e)}
                    disabled={
                      generatingForEvent === activity.delivery_id ||
                      activity.status === "processing"
                    }
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {generatingForEvent === activity.delivery_id ||
                    activity.status === "processing" ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-1" />
                        Générer un post
                      </>
                    )}
                  </Button>
                )}
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

      {/* Generate Post Dialog */}
      {selectedEvent && (
        <GeneratePostDialog
          open={generateDialogOpen}
          onOpenChange={handleDialogClose}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
