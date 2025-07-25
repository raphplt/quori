"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import {
  useUpdateScheduledPost,
  useDeleteScheduledPost,
} from "@/hooks/useScheduledPosts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Calendar,
  GitBranch,
  Eye,
  Send,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Post {
  id: string;
  summary: string;
  postContent: string;
  status: "draft" | "ready" | "scheduled" | "published" | "failed";
  scheduledAt?: string;
  publishedAt?: string;
  impressions: number;
  likes: number;
  comments: number;
  template?: string;
  tone?: string;
  createdAt: string;
  updatedAt: string;
  installation?: {
    id: number;
    account_login: string;
  };
  event?: {
    delivery_id: string;
    repo_full_name: string;
  };
}

interface PostsResponse {
  items: Post[];
  total: number;
}

export default function ScheduledPage() {
  const [page, setPage] = useState(1);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const {
    data: postsData,
    isLoading,
    refetch,
  } = useQuery<PostsResponse>({
    queryKey: ["scheduled-posts", page],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: "10",
        offset: ((page - 1) * 10).toString(),
      });
      return authenticatedFetcher<PostsResponse>(`/scheduled-posts?${params}`);
    },
  });

  const updatePostStatus = async (id: string, newStatus: string) => {
    try {
      await authenticatedFetcher(`/scheduled-posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      refetch();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await authenticatedFetcher(`/scheduled-posts/${id}`, { method: "DELETE" });
      refetch();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const formatScheduledDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Posts programmés</h1>
        <p className="text-muted-foreground">
          Gérez vos posts programmés pour publication automatique
        </p>
      </div>

      {postsData?.total === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun post programmé</h3>
            <p className="text-muted-foreground">
              Vos posts programmés apparaîtront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {postsData?.items.map(post => (
            <Card key={post.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{post.summary}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Créé{" "}
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                      {post.scheduledAt && (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="h-3 w-3" />
                          Programmé pour le{" "}
                          {formatScheduledDate(post.scheduledAt)}
                        </span>
                      )}
                      {post.event && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {post.event.repo_full_name}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Programmé
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Contenu du post</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedPost(
                          expandedPost === post.id ? null : post.id
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                      {expandedPost === post.id ? "Réduire" : "Voir plus"}
                    </Button>
                  </div>

                  <Textarea
                    value={post.postContent}
                    readOnly
                    className={`resize-none bg-muted/50 ${
                      expandedPost === post.id ? "min-h-[200px]" : "h-20"
                    }`}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => updatePostStatus(post.id, "published")}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Publier maintenant
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier programmation
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => deleteSchedule(post.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {postsData && postsData.total > 10 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {Math.ceil(postsData.total / 10)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(postsData.total / 10)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
