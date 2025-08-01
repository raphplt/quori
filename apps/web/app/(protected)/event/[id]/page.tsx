"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GitHubEvent } from "@/types/githubEvent";
import { Post } from "@/types/post";
import { useAuthenticatedQuery } from "@/hooks/useAuthenticatedQuery";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { GeneratePostDialog } from "@/components/GeneratePostDialog";
import {
  ArrowLeft,
  Calendar,
  User,
  GitBranch,
  Eye,
  Hash,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GitCommit,
  Folder,
  Plus,
  Minus,
  BarChart3,
  MessageSquare,
  Heart,
  Sparkles,
  Send,
  Edit3,
  Copy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getEventStatusLabel } from "@/utils/events";

interface CommitData {
  id: string;
  message: string;
  timestamp: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
  added?: string[];
  modified?: string[];
  removed?: string[];
}

interface PayloadData {
  commits?: CommitData[];
  repository?: {
    name?: string;
    description?: string;
    html_url?: string;
  };
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useAuthenticatedQuery<GitHubEvent>(["event", id], `/github/events/${id}`);

  const { data: allPosts } = useAuthenticatedQuery<{ posts: Post[] }>(
    ["posts"],
    `/github/posts?limit=100`
  );

  const relatedPosts =
    allPosts?.posts.filter(
      post => post.event?.delivery_id === event?.delivery_id
    ) || [];

  const getEventIcon = (eventType: string): string => {
    const iconMap: Record<string, string> = {
      push: "🚀",
      pull_request: "🔄",
      issues: "🐛",
      release: "🎉",
      fork: "🍴",
      star: "⭐",
      watch: "👀",
      create: "🆕",
      delete: "🗑️",
      workflow_run: "⚙️",
    };
    return iconMap[eventType] || "📝";
  };

  const getEventTypeDisplay = (eventType: string): string => {
    const eventMap: Record<string, string> = {
      push: "Push",
      pull_request: "Pull Request",
      issues: "Issue",
      release: "Release",
      fork: "Fork",
      star: "Star",
      watch: "Watch",
      create: "Création",
      delete: "Suppression",
      workflow_run: "Workflow",
    };
    return eventMap[eventType] || eventType;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "processed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      case "ignored":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getPostStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Publié</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Programmé</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Prêt</Badge>;
      case "failed":
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Événement introuvable
          </h1>
          <p className="text-gray-600 mb-6">
            L&apos;événement avec l&apos;ID {id} n&apos;a pas pu être trouvé.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const payload = event.payload as PayloadData;
  const commits = payload?.commits || [];
  const repository = payload?.repository || {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getEventIcon(event.event_type)}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getEventTypeDisplay(event.event_type)}
              </h1>
              <p className="text-sm text-gray-600">{event.repo_full_name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={getStatusBadgeVariant(event.status)}
            className="flex items-center gap-1"
          >
            {getStatusIcon(event.status)}
            {getEventStatusLabel(event.status)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Détails de l&apos;événement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    ID de livraison
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {event.delivery_id}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(event.delivery_id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    Type d&apos;événement
                  </p>
                  <Badge variant="outline">{event.event}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Reçu le</p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(event.received_at)}
                  </p>
                </div>
                {event.processed_at && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      Traité le
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {formatDate(event.processed_at)}
                    </p>
                  </div>
                )}
              </div>

              {event.author_login && (
                <div className="flex items-center space-x-3 pt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={event.author_avatar_url}
                      alt={event.author_login}
                    />
                    <AvatarFallback>
                      {event.author_login.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{event.author_login}</p>
                    <p className="text-xs text-gray-600">Auteur</p>
                  </div>
                </div>
              )}

              {event.metadata?.title && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-600">Titre</p>
                  <p className="text-sm">{event.metadata.title}</p>
                </div>
              )}

              {event.metadata?.desc && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {event.metadata.desc}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commits (for push events) */}
          {commits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCommit className="h-5 w-5" />
                  Commits ({commits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commits.map((commit: CommitData) => (
                    <div key={commit.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">
                            {commit.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {commit.author.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {commit.id.substring(0, 7)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(commit.timestamp), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>

                      {((commit.added?.length ?? 0) > 0 ||
                        (commit.modified?.length ?? 0) > 0 ||
                        (commit.removed?.length ?? 0) > 0) && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-4 text-xs">
                            {(commit.added?.length ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Plus className="h-3 w-3" />
                                {commit.added?.length} ajouté
                                {(commit.added?.length ?? 0) > 1 ? "s" : ""}
                              </span>
                            )}
                            {(commit.modified?.length ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Edit3 className="h-3 w-3" />
                                {commit.modified?.length} modifié
                                {(commit.modified?.length ?? 0) > 1 ? "s" : ""}
                              </span>
                            )}
                            {(commit.removed?.length ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-red-600">
                                <Minus className="h-3 w-3" />
                                {commit.removed?.length} supprimé
                                {(commit.removed?.length ?? 0) > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Posts générés ({relatedPosts.length})
                </CardTitle>
                <CardDescription>
                  Posts créés à partir de cet événement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedPosts.map((post: Post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getPostStatusBadge(post.status)}
                            <span className="text-xs text-gray-600">
                              ID: {post.id}
                            </span>
                          </div>
                          <h4 className="font-medium mb-2">{post.summary}</h4>
                        </div>
                      </div>

                      <Textarea
                        value={post.postContent}
                        readOnly
                        className="min-h-[120px] resize-none mb-3"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                          {post.status === "published" && (
                            <>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.impressions} vues
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.likes} likes
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {post.comments} commentaires
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Copy className="h-3 w-3 mr-1" />
                            Copier
                          </Button>
                          {post.status === "draft" && (
                            <Button size="sm">
                              <Send className="h-3 w-3 mr-1" />
                              Publier
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Repository Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Dépôt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  {repository.name || event.repo_full_name.split("/").pop()}
                </p>
                <p className="text-xs text-gray-600">{event.repo_full_name}</p>
              </div>
              {repository.description && (
                <p className="text-sm text-gray-700">
                  {repository.description}
                </p>
              )}
              {repository.html_url && (
                <Button size="sm" variant="outline" asChild className="w-full">
                  <a
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Voir sur GitHub
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tentatives</span>
                <span className="text-sm font-medium">{event.retry_count}</span>
              </div>
              {commits.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commits</span>
                  <span className="text-sm font-medium">{commits.length}</span>
                </div>
              )}
              {relatedPosts && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Posts générés</span>
                  <span className="text-sm font-medium">
                    {relatedPosts.length}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Délai de traitement
                </span>
                <span className="text-sm font-medium">
                  {event.processed_at
                    ? formatDistanceToNow(
                        new Date(event.processed_at).getTime() -
                          new Date(event.received_at).getTime()
                      )
                    : "Non traité"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Error Details */}
          {event.error_message && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Erreur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 bg-red-50 p-3 rounded">
                  {event.error_message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                // variant="outline"
                color="primary"
                className="w-full"
                onClick={() => setGenerateDialogOpen(true)}
                disabled={
                  event.status === "processed" && relatedPosts.length > 0
                }
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {relatedPosts.length > 0
                  ? "Générer un nouveau post"
                  : "Générer un post"}
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Voir les événements similaires
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Post Dialog */}
      {event && (
        <GeneratePostDialog
          open={generateDialogOpen}
          onOpenChange={setGenerateDialogOpen}
          event={event}
        />
      )}
    </div>
  );
}
