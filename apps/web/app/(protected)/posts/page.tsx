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
import { FileText, Clock, Send, Archive, Plus } from "lucide-react";

const PostsPage = () => {
  const mockPosts = [
    {
      id: 1,
      title: "Nouvelle fonctionnalité d'authentification",
      status: "draft",
      createdAt: "2025-01-08",
      scheduledFor: null,
    },
    {
      id: 2,
      title: "Amélioration de l'API GitHub",
      status: "scheduled",
      createdAt: "2025-01-07",
      scheduledFor: "2025-01-10",
    },
    {
      id: 3,
      title: "Refactoring du code TypeScript",
      status: "published",
      createdAt: "2025-01-06",
      scheduledFor: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "scheduled":
        return <Badge variant="default">Planifié</Badge>;
      case "published":
        return <Badge variant="outline">Publié</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "published":
        return <Send className="h-4 w-4" />;
      default:
        return <Archive className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Posts générés</h1>
            <p className="text-muted-foreground">
              Gérez vos publications LinkedIn générées depuis vos commits
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau post
          </Button>
        </div>

        <div className="grid gap-4">
          {mockPosts.map(post => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(post.status)}
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </div>
                  {getStatusBadge(post.status)}
                </div>
                <CardDescription>
                  Créé le {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                  {post.scheduledFor && (
                    <span className="ml-2">
                      • Planifié pour le{" "}
                      {new Date(post.scheduledFor).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm">
                    Aperçu
                  </Button>
                  {post.status === "draft" && (
                    <Button size="sm">Planifier</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PostsPage;
