import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { GitBranch } from "lucide-react";
import { Button } from "../ui/button";
import { useEvents } from "@/contexts/EventsContext";

const GitPreview = () => {
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <GitBranch className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Activité récente</h4>
          <span className="text-sm text-muted-foreground">
            {recentActivity.length}{" "}
            {recentActivity.length === 1 ? "activité" : "activités"} récente(s)
          </span>
        </div>
        <div className="mt-2">
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground">Aucune activité récente</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map(activity => (
                <li key={activity.id} className="flex items-start gap-2">
                  <span className="text-sm font-medium">{activity.repo}</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.message}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {activity.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GitPreview;
