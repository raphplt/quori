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
import { Calendar as CalendarIcon, Clock, Eye, Edit } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { Post } from "@/types/post";

const CalendarPage = () => {
  const [view, setView] = useState<"month" | "week">("month");
  const { data: scheduledPostsData } = useQuery({
    queryKey: ["scheduledPosts"],
    queryFn: () =>
      authenticatedFetcher<{
        posts: Post[];
        total: number;
        page: number;
        limit: number;
      }>("/github/posts?status=scheduled"),
  });

  const scheduledPosts = scheduledPostsData?.posts || [];

  console.log("scheduledPosts", scheduledPosts);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendrier</h1>
            <p className="text-muted-foreground">
              Planifiez et organisez vos publications LinkedIn
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("month")}
            >
              Mois
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
            >
              Semaine
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendrier principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Janvier 2025
                </CardTitle>
                <CardDescription>
                  Vue {view === "month" ? "mensuelle" : "hebdomadaire"} de vos
                  publications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                    day => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                    const hasPost = scheduledPosts?.some(
                      post => new Date(post.scheduledAt!).getDate() === day
                    );
                    return (
                      <div
                        key={day}
                        className={`p-2 text-center text-sm border rounded cursor-pointer hover:bg-accent ${
                          hasPost
                            ? "bg-primary/10 border-primary"
                            : "border-border"
                        }`}
                      >
                        {day}
                        {hasPost && (
                          <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec posts planifiés */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Prochaines publications
                </CardTitle>
                <CardDescription>
                  Posts planifiés pour les prochains jours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduledPosts?.map(post => (
                  <div key={post.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className="text-xs">
                        {new Date(post.scheduledAt!).toLocaleDateString(
                          "fr-FR"
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.scheduledAt!).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-1 line-clamp-1">
                      {post.summary}
                    </h4>

                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Aperçu
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CalendarPage;
