"use client";
import { useState, useEffect } from "react";
import { useEventsStats } from "@/hooks/useEventsStats";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  GitCommit,
  GitPullRequest,
  Clock,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventsSummaryProps {
  compact?: boolean;
  showToggle?: boolean;
  defaultExpanded?: boolean;
}

export default function StatCard({
  compact = false,
  showToggle = true,
  defaultExpanded = true,
}: EventsSummaryProps = {}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { isLoading } = useGitHubEvents();
  const {
    total,
    pushEvents,
    pullRequestEvents,
    hasRecentActivity,
    lastEventDate,
  } = useEventsStats();

  // Mémoriser l'état dans localStorage (seulement si pas en mode compact)
  useEffect(() => {
    if (!compact) {
      const saved = localStorage.getItem("eventsSummaryExpanded");
      if (saved !== null) {
        setIsExpanded(JSON.parse(saved));
      }
    }
  }, [compact]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (!compact) {
      localStorage.setItem("eventsSummaryExpanded", JSON.stringify(newState));
    }
  };

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

  if (total === 0) {
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

  return (
    <Card className="transition-all duration-200 ease-in-out">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Résumé d&apos;activité
            {hasRecentActivity && (
              <Badge variant="default" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                Récent
              </Badge>
            )}
          </CardTitle>
          {showToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className={cn(
                "h-8 w-8 p-0 transition-transform duration-200",
                !isExpanded && "rotate-180"
              )}
              title={isExpanded ? "Réduire" : "Agrandir"}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-16 opacity-100"
        )}
      >
        {isExpanded ? (
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <GitCommit className="h-4 w-4" />
                  <Badge variant="default">{pushEvents}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">Commits</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <GitPullRequest className="h-4 w-4" />
                  <Badge variant="secondary">{pullRequestEvents}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Pull Requests
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Activity className="h-4 w-4" />
                  <Badge variant="outline">{total}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
            {lastEventDate && (
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Dernière activité : {lastEventDate.toLocaleString()}
              </div>
            )}
          </CardContent>
        ) : (
          <CardContent className="py-2">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                <span>{pushEvents}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitPullRequest className="h-3 w-3" />
                <span>{pullRequestEvents}</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{total}</span>
              </div>
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
}
