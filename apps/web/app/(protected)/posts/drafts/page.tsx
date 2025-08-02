"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useCreateScheduledPost } from "@/hooks/useScheduledPosts";
import { Post } from "@/types/post";
import toast from "react-hot-toast";
import PostCard from "./_components/PostCard";

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export const statusLabels = {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [publishingPosts, setPublishingPosts] = useState<Set<number>>(
    new Set()
  );
  const createScheduled = useCreateScheduledPost();
  const queryClient = useQueryClient();

  const { data: postsData, isLoading } = useQuery<PostsResponse>({
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

  const updatePostStatus = async (postId: number, newStatus: string) => {
    try {
      if (newStatus === "published") {
        setPublishingPosts(prev => new Set(prev).add(postId));

        await authenticatedFetcher(`/github/posts/${postId}/publish-linkedin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        toast.success("Post publié sur LinkedIn avec succès !");
      } else {
        await authenticatedFetcher(`/github/posts/${postId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      if (newStatus === "published") {
        toast.error("Erreur lors de la publication sur LinkedIn");
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } finally {
      if (newStatus === "published") {
        setPublishingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    }
  };

  const openScheduleDialog = (postId: number) => {
    setSchedulePostId(postId);
    setScheduleAt(new Date().toISOString().slice(0, 16));
    setIsDialogOpen(true);
  };

  const submitSchedule = async () => {
    if (!schedulePostId || createScheduled.isPending) return;

    try {
      await createScheduled.mutateAsync({
        postId: Number(schedulePostId),
        scheduledAt: new Date(scheduleAt).toISOString(),
      });

      setIsDialogOpen(false);
      setSchedulePostId(null);
      setScheduleAt("");

      // Invalider toutes les requêtes de posts
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("Erreur lors de la planification:", error);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSchedulePostId(null);
      setScheduleAt("");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Post copié avec succès");
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
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
            <PostCard
              key={post.id}
              post={post}
              setExpandedPost={setExpandedPost}
              expandedPost={expandedPost}
              updatePostStatus={updatePostStatus}
              publishingPosts={publishingPosts}
              createScheduled={createScheduled}
              openScheduleDialog={openScheduleDialog}
              isDialogOpen={isDialogOpen}
              handleDialogOpenChange={handleDialogOpenChange}
              scheduleAt={scheduleAt}
              setScheduleAt={setScheduleAt}
              submitSchedule={submitSchedule}
              copyToClipboard={copyToClipboard}
            />
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
