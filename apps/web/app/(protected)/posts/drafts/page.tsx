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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Calendar,
  GitBranch,
  Eye,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle,
  Send,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useCreateScheduledPost } from "@/hooks/useScheduledPosts";
import { Post } from "@/types/post";

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

const statusLabels = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  ready: { label: "Prêt", color: "bg-blue-100 text-blue-800" },
  scheduled: { label: "Programmé", color: "bg-yellow-100 text-yellow-800" },
  published: { label: "Publié", color: "bg-green-100 text-green-800" },
  failed: { label: "Échec", color: "bg-red-100 text-red-800" },
};

export default function DraftsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [schedulePostId, setSchedulePostId] = useState<number | null>(null);
  const [scheduleAt, setScheduleAt] = useState<string>("");
  const createScheduled = useCreateScheduledPost();

  const {
    data: postsData,
    isLoading,
    refetch,
  } = useQuery<PostsResponse>({
    queryKey: ["posts", page, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(selectedStatus !== "all" && { status: selectedStatus }),
      });
      return authenticatedFetcher<PostsResponse>(`/github/posts?${params}`);
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Ajouter un toast de succès
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  const updatePostStatus = async (postId: number, newStatus: string) => {
    try {
      await authenticatedFetcher(`/github/posts/${postId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      refetch();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const openScheduleDialog = (postId: number) => {
    setSchedulePostId(postId);
    setScheduleAt(new Date().toISOString().slice(0, 16));
  };

  const submitSchedule = async () => {
    if (!schedulePostId) return;
    await createScheduled.mutateAsync({
      postId: schedulePostId,
      scheduledAt: new Date(scheduleAt).toISOString(),
    });
    setSchedulePostId(null);
    refetch();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Posts générés</h1>
          <p className="text-muted-foreground">
            Gérez vos posts générés automatiquement depuis GitHub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="ready">Prêts</SelectItem>
              <SelectItem value="scheduled">Programmés</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="failed">Échecs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {postsData?.total === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun post trouvé</h3>
            <p className="text-muted-foreground">
              Commencez par générer des posts depuis vos événements GitHub
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {postsData?.posts.map(post => (
            <Dialog key={post.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{post.summary}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                        {post.event && (
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {post.event.repo_full_name}
                          </span>
                        )}
                        {post.tone && (
                          <span className="text-muted-foreground">
                            Ton: {post.tone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={statusLabels[post.status].color}>
                      {statusLabels[post.status].label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Contenu du post</h4>
                      <div className="flex items-center gap-2">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(post.postContent)}
                        >
                          <Copy className="h-4 w-4" />
                          Copier
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={post.postContent}
                      readOnly
                      className={`resize-none bg-muted/50 ${
                        expandedPost === post.id ? "min-h-[200px]" : "h-20"
                      }`}
                    />
                  </div>

                  {post.status === "published" && (
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
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => updatePostStatus(post.id, "ready")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Valider
                        </Button>
                      )}

                      {post.status === "ready" && (
                        <>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => openScheduleDialog(post.id)}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Programmer
                            </Button>
                          </DialogTrigger>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updatePostStatus(post.id, "published")
                            }
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Publier maintenant
                          </Button>
                        </>
                      )}

                      {post.status === "published" && post.publishedAt && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir le post
                        </Button>
                      )}
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce post ? Cette
                            action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Programmer la publication</DialogTitle>
                </DialogHeader>
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={e => setScheduleAt(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
                <DialogFooter className="mt-2">
                  <Button onClick={submitSchedule}>Planifier</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
