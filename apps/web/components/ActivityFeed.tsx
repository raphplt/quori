"use client";
import { useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { GitHubEvent } from "@/types/githubEvent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, GitCommit, GitPullRequest } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ActivityFeed() {
  const queryClient = useQueryClient();

  const { data } = useQuery<GitHubEvent[]>({
    queryKey: ["events"],
    queryFn: () => authenticatedFetcher<GitHubEvent[]>("/github/events"),
  });

  useEffect(() => {
    const es = new EventSource(`${API_BASE_URL}/github/events/stream`);
    es.onmessage = (e) => {
      try {
        const event: GitHubEvent = JSON.parse(e.data);
        queryClient.setQueryData<GitHubEvent[]>(["events"], (old) => {
          const arr = old ? [event, ...old] : [event];
          return arr.slice(0, 20);
        });
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [queryClient]);

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
      {data?.map((activity) => (
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
              {activity.repo_full_name} • {new Date(activity.received_at).toLocaleString()}
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
