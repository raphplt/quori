"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
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
  Send,
  Calendar,
  GitBranch,
  Eye,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Post {
  id: number;
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
  externalId?: string;
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
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export default function PublishedPage() {
  const [page, setPage] = useState(1);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const { data: postsData, isLoading } = useQuery<PostsResponse>({
    queryKey: ["posts", page, "published"],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: "published",
      });
      return authenticatedFetcher<PostsResponse>(`/github/posts?${params}`);
    },
  });

  const formatPublishedDate = (dateString: string) => {
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

  const onOpenLinkedIn = (externalId: string | undefined) => {
    if (!externalId) return;
    const shareId = externalId.replace("urn:li:share:", "");
    const linkedInUrl = `https://www.linkedin.com/feed/update/urn:li:share:${shareId}/`;
    console.log("linkedInUrl", linkedInUrl);
    window.open(linkedInUrl, "_blank");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Posts publiés</h1>
        <p className="text-muted-foreground">
          Consultez vos posts publiés et leurs performances
        </p>
      </div>

      {postsData?.total === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun post publié</h3>
            <p className="text-muted-foreground">
              Vos posts publiés apparaîtront ici avec leurs métriques
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {postsData?.posts.map(post => (
            <Card key={post.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {post.summary}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Créé{" "}
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                      {post.publishedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Send className="h-3 w-3" />
                          Publié le {formatPublishedDate(post.publishedAt)}
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
                  <Badge className="bg-green-100 text-green-800">Publié</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Métriques de performance */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {post.impressions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Impressions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {post.likes}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      J&apos;aime
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {post.comments}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Commentaires
                    </div>
                  </div>
                </div>

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
                    {post.externalId &&
                    post.externalId.startsWith("urn:li:share:") ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenLinkedIn(post.externalId)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir sur LinkedIn
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Non publié
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics détaillées
                    </Button>
                  </div>
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
