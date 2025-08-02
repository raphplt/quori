import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/types/post";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  GitBranch,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  Send,
  ExternalLink,
  Trash2,
} from "lucide-react";
import React from "react";
import { statusLabels } from "../page";
import toast from "react-hot-toast";
import { authenticatedFetch } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

type PostCardProps = {
  post: Post;
  setExpandedPost: (id: number | null) => void;
  expandedPost: number | null;
  updatePostStatus: (id: number, status: string) => void;
  publishingPosts: Set<number>;
  createScheduled: {
    isPending: boolean;
    mutateAsync: (params: {
      postId: number;
      scheduledAt: string;
    }) => Promise<unknown>;
  };
  openScheduleDialog: (id: number) => void;
  isDialogOpen: boolean;
  handleDialogOpenChange: (open: boolean) => void;
  scheduleAt: string;
  setScheduleAt: (date: string) => void;
  submitSchedule: () => void;
  copyToClipboard: (text: string) => void;
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  setExpandedPost,
  expandedPost,
  updatePostStatus,
  publishingPosts,
  createScheduled,
  openScheduleDialog,
  isDialogOpen,
  handleDialogOpenChange,
  scheduleAt,
  setScheduleAt,
  submitSchedule,
}) => {
  const queryClient = useQueryClient();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Post copié avec succès");
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  const onOpenLinkedIn = (externalId: string | undefined) => {
    if (!externalId) return;
    const shareId = externalId.replace("urn:li:share:", "");
    const linkedInUrl = `https://www.linkedin.com/feed/update/urn:li:share:${shareId}/`;
    console.log("linkedInUrl", linkedInUrl);
    window.open(linkedInUrl, "_blank");
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const response = await authenticatedFetch(`/github/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Post supprimé avec succès");
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-md text-default-900 line-clamp-1">
                {post.summary}
              </CardTitle>
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
                    setExpandedPost(expandedPost === post.id ? null : post.id)
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
            <div className="space-y-3">
              {/* Statut LinkedIn */}
              <div className="flex items-center gap-2">
                {post.statusLinkedin === "published" && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Publié sur LinkedIn
                  </Badge>
                )}
                {post.statusLinkedin === "failed" && (
                  <Badge className="bg-red-100 text-red-800">
                    Échec LinkedIn
                  </Badge>
                )}
                {post.statusLinkedin === "pending" && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    En attente LinkedIn
                  </Badge>
                )}
              </div>

              {/* Métriques LinkedIn */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg dark:bg-green-950 dark:text-green-400 dark:border-green-800">
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
                  <Button
                    size="sm"
                    onClick={() => openScheduleDialog(post.id)}
                    disabled={createScheduled.isPending}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {createScheduled.isPending
                      ? "Planification..."
                      : "Programmer"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updatePostStatus(post.id, "published")}
                    disabled={publishingPosts.has(post.id)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {publishingPosts.has(post.id)
                      ? "Publication..."
                      : "Publier"}
                  </Button>
                </>
              )}

              {post.status === "published" && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Publié
                  </Badge>
                  {post.statusLinkedin === "published" && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      LinkedIn
                    </Badge>
                  )}
                  {post.statusLinkedin === "failed" && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      LinkedIn échec
                    </Badge>
                  )}
                  {post.externalId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenLinkedIn(post.externalId)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir sur LinkedIn
                    </Button>
                  )}
                </div>
              )}

              {post.status === "failed" && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    Échec
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updatePostStatus(post.id, "published")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                </div>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce post ? Cette action
                    est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
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
            <Button
              onClick={submitSchedule}
              disabled={createScheduled.isPending}
            >
              {createScheduled.isPending ? "Planification..." : "Planifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCard;
