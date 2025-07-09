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
import { FileText, Edit, Eye } from "lucide-react";

const DraftsPage = () => {
  const drafts = [
    {
      id: 1,
      title: "Nouvelle fonctionnalité d'authentification",
      content:
        "Aujourd'hui, j'ai implémenté une nouvelle fonctionnalité d'authentification...",
      repository: "quori",
      commit: "feat: add OAuth integration",
      createdAt: "2025-01-08T10:30:00Z",
    },
    {
      id: 2,
      title: "Optimisation des performances",
      content: "Petit thread sur les optimisations que j'ai apportées...",
      repository: "api-service",
      commit: "perf: optimize database queries",
      createdAt: "2025-01-07T15:45:00Z",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Brouillons</h1>
          <p className="text-muted-foreground">
            Posts en attente de validation et d&apos;édition
          </p>
        </div>

        <div className="grid gap-4">
          {drafts.map(draft => (
            <Card key={draft.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{draft.title}</CardTitle>
                  <Badge variant="secondary">
                    <FileText className="mr-1 h-3 w-3" />
                    Brouillon
                  </Badge>
                </div>
                <CardDescription>
                  Basé sur : {draft.commit} • {draft.repository}
                  <br />
                  Créé le{" "}
                  {new Date(draft.createdAt).toLocaleDateString("fr-FR")} à{" "}
                  {new Date(draft.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {draft.content}
                </p>
                <div className="flex items-center space-x-2">
                  <Button size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Aperçu
                  </Button>
                  <Button variant="outline" size="sm">
                    Planifier
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

export default DraftsPage;
