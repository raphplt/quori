import React from "react";
import {
  Github,
  GitCommit,
  GitPullRequest,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { useEvents } from "@/contexts/EventsContext";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { getEventStatusLabel } from "@/utils/events";

const ActivityPreview = () => {
  const { events, isLoading: eventsLoading, error: eventsError } = useEvents();

  const recentActivity =
    events?.slice(0, 5).map(event => ({
      id: event.delivery_id,
      type:
        event.event === "push"
          ? "commit"
          : event.event.replace("Request", "_request").toLowerCase(),
      repo: event.repo_full_name.split("/")[1] || event.repo_full_name,
      message: event.metadata?.title || `${event.event} event`,
      time: new Date(event.received_at).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: event.status,
    })) || [];

  return (
    <Card className=" group overflow-hidden">
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full transform" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center group-hover:text-gradient transition-all duration-300">
          <div className="relative mr-2">
            <Github className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
          </div>
          Activité Git récente
        </CardTitle>
        <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
          Vos derniers commits et pull requests
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-2">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <Link
                key={activity.id}
                href={`/event/${activity.id}`}
                className="group/item relative flex items-center space-x-4 p-3 rounded-r-lg border-l-2 border-l-primary/30 hover:border-l-primary hover:bg-accent/30 transition-all duration-300 hover:translate-x-2 hover:shadow-md"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "slideInLeft 0.5s ease-out forwards",
                }}
              >
                {/* Indicateur de hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-chart-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />

                <div className="flex-shrink-0 relative">
                  <div className="p-2 rounded-full bg-muted group-hover/item:bg-primary/10 transition-all duration-300 group-hover/item:scale-110">
                    {activity.type === "commit" || activity.type === "push" ? (
                      <GitCommit className="h-4 w-4 text-blue-500 group-hover/item:text-primary transition-colors duration-300" />
                    ) : (
                      <GitPullRequest className="h-4 w-4 text-green-500 group-hover/item:text-primary transition-colors duration-300" />
                    )}
                  </div>
                  {/* Effet de pulsation */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover/item:opacity-100 group-hover/item:animate-ping" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover/item:text-gradient transition-all duration-300">
                    {activity.message}
                  </p>
                  <p className="text-sm text-muted-foreground group-hover/item:text-foreground/70 transition-colors duration-300">
                    {activity.repo} • {activity.time}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center space-x-2">
                  <Badge
                    className={`badge-modern transition-all duration-300 group-hover/item:scale-105 ${
                      activity.status === "processed"
                        ? "bg-primary/10 text-primary border-primary/20 group-hover/item:glow-primary"
                        : "group-hover/item:border-primary/30"
                    }`}
                    variant={
                      activity.status === "processed" ? "default" : "secondary"
                    }
                  >
                    {getEventStatusLabel(activity.status)}
                  </Badge>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:text-primary transition-all duration-300 transform group-hover/item:translate-x-1 group-hover/item:-translate-y-1" />
                </div>
              </Link>
            ))
          ) : eventsLoading ? (
            <div className="text-center py-8">
              <div className="loading-shimmer w-full h-4 rounded mb-2" />
              <div className="loading-shimmer w-3/4 h-3 rounded mx-auto" />
              <p className="text-sm text-muted-foreground mt-4 animate-pulse">
                Chargement des événements...
              </p>
            </div>
          ) : eventsError ? (
            <div className="text-center py-8 group-hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-destructive text-xl">⚠️</span>
              </div>
              <p className="text-sm text-destructive">
                Erreur lors du chargement des événements
              </p>
            </div>
          ) : (
            <div className="text-center py-8 group-hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                <Github className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aucune activité récente
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Connectez votre application GitHub pour voir votre activité
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gradient">
          <Button
            variant="outline"
            className="w-full btn-modern glass-effect group-hover:glow-primary"
            asChild
          >
            <Link href="/activity" className="group/button">
              <span className="group-hover/button:text-gradient transition-all duration-300">
                Voir l&apos;activité
              </span>
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1 group-hover/button:-translate-y-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityPreview;
