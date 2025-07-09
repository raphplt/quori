"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Plus,
} from "lucide-react";

const ActivityPage = () => {
  const activities = [
    {
      id: 1,
      type: "commit",
      title: "feat: add OAuth integration",
      repository: "quori",
      branch: "main",
      timestamp: "2025-01-08T10:30:00Z",
      hasPost: false,
    },
    {
      id: 2,
      type: "pull_request",
      title: "Fix authentication bug",
      repository: "api-service",
      branch: "feature/auth-fix",
      timestamp: "2025-01-08T09:15:00Z",
      hasPost: true,
    },
    {
      id: 3,
      type: "merge",
      title: "Merge feature/user-dashboard",
      repository: "web-app",
      branch: "main",
      timestamp: "2025-01-07T16:20:00Z",
      hasPost: false,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "commit":
        return <GitCommit className="h-4 w-4" />;
      case "pull_request":
        return <GitPullRequest className="h-4 w-4" />;
      case "merge":
        return <GitMerge className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "commit":
        return <Badge variant="default">Commit</Badge>;
      case "pull_request":
        return <Badge variant="secondary">Pull Request</Badge>;
      case "merge":
        return <Badge variant="outline">Merge</Badge>;
      default:
        return <Badge variant="secondary">Activité</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Flux Git</h1>
          <p className="text-muted-foreground">
            Chronologie de vos événements Git avec génération de posts en 1-clic
          </p>
        </div>

        <div className="grid gap-4">
          {activities.map(activity => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getActivityBadge(activity.type)}
                    {activity.hasPost && (
                      <Badge variant="destructive">Post généré</Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {activity.repository} • {activity.branch} •{" "}
                  {new Date(activity.timestamp).toLocaleDateString("fr-FR")} à{" "}
                  {new Date(activity.timestamp).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {!activity.hasPost ? (
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Générer un post
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Post déjà généré
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Voir les détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ActivityPage;
