"use client";
import { useState } from "react";
import { useGitHubEventsPaginated } from "@/hooks/useGitHubEventsPaginated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PaginationControls } from "@/app/(protected)/repositories/_components/PaginationControls";
import { GeneratePostDialog } from "./GeneratePostDialog";
import { GitHubEvent } from "@/types/githubEvent";
import EventCard from "./activity/EventCard";
import AddActivity from "./dev/AddActivity";

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

  const goToPage = (p: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));
  };
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

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
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.total} événement{data.total > 1 ? "s" : ""} trouvé
              {data.total > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <AddActivity />
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
        <EventCard
          key={activity.delivery_id}
          activity={activity}
          generatingForEvent={generatingForEvent}
          handleGeneratePost={handleGeneratePost}
        />
      ))}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        onPrevious={goToPrevious}
        onNext={goToNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

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
