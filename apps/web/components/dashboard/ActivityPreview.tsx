import React from "react";
import { Github, GitCommit, GitPullRequest, ArrowUpRight } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Github className="mr-2 h-5 w-5" />
          Activité Git récente
        </CardTitle>
        <CardDescription>Vos derniers commits et pull requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map(activity => (
              <Link
                key={activity.id}
                href={`/event/${activity.id}`}
                className="flex items-center space-x-4 border-l-2 border-l-primary pl-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  {activity.type === "commit" || activity.type === "push" ? (
                    <GitCommit className="h-4 w-4 text-blue-500" />
                  ) : (
                    <GitPullRequest className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.message}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.repo} • {activity.time}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    variant={
                      activity.status === "processed" ? "default" : "secondary"
                    }
                  >
                    {getEventStatusLabel(activity.status)}
                  </Badge>
                </div>
              </Link>
            ))
          ) : eventsLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                Chargement des événements...
              </p>
            </div>
          ) : eventsError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">
                Erreur lors du chargement des événements
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Aucune activité récente</p>
              <p className="text-xs text-gray-400 mt-1">
                Connectez votre application GitHub pour voir votre activité
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/activity">
              Voir l&apos;activité
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityPreview;
