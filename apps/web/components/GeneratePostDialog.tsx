"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Copy,
  CheckCircle,
  Loader2,
  FileText,
  Calendar,
  GitBranch,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { GitHubEvent } from "@/types/githubEvent";
import {
  useGeneratePost,
  createGenerateRequestFromEvent,
} from "@/hooks/useGeneratePost";
import { Progress } from "./ui/progress";

interface GeneratePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: GitHubEvent;
}

export function GeneratePostDialog({
  open,
  onOpenChange,
  event,
}: GeneratePostDialogProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const generatePost = useGeneratePost();

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedbackMessage({ type, message });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleGenerate = () => {
    const request = createGenerateRequestFromEvent(event);

    // Démarrer la progression
    setIsGenerating(true);
    setProgress(0);

    // Simuler une progression naturelle sur 4.5 secondes
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // S'arrêter à 90% jusqu'à ce que la vraie requête soit terminée
        }
        return prev + Math.random() * 15 + 5; // Progression aléatoire entre 5-20%
      });
    }, 300); // Mise à jour toutes les 300ms

    generatePost.mutate(
      { request, event },
      {
        onSuccess: () => {
          clearInterval(progressInterval);
          setProgress(100);
          setIsGenerating(false);
          showFeedback("success", "Post généré avec succès et sauvegardé !");
        },
        onError: error => {
          clearInterval(progressInterval);
          setProgress(0);
          setIsGenerating(false);
          showFeedback(
            "error",
            "Erreur lors de la génération : " + error.message
          );
        },
      }
    );
  };

  const copyToClipboard = async (text: string, type: "summary" | "post") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "summary") {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      } else {
        setCopiedPost(true);
        setTimeout(() => setCopiedPost(false), 2000);
      }
      showFeedback("success", "Copié dans le presse-papiers !");
    } catch {
      showFeedback("error", "Erreur lors de la copie");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Génération de post
          </DialogTitle>
          <DialogDescription>
            Générez automatiquement un post pour vos réseaux sociaux basé sur
            votre activité GitHub
          </DialogDescription>
        </DialogHeader>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-lg border ${
              feedbackMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {feedbackMessage.message}
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-4 w-4" />
                Détails de l&apos;événement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dépôt
                  </p>
                  <p className="font-mono text-sm">{event.repo_full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Type d&apos;événement
                  </p>
                  <Badge variant="outline">{event.event}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(event.received_at)}
                  </p>
                </div>
                {event.metadata?.filesChanged && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fichiers modifiés
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {event.metadata.filesChanged.length} fichier(s)
                    </p>
                  </div>
                )}
              </div>

              {event.metadata?.title && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Titre
                  </p>
                  <p className="text-sm">{event.metadata.title}</p>
                </div>
              )}

              {event.metadata?.desc && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.metadata.desc}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Generation Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contenu généré</h3>
              <Button
                onClick={handleGenerate}
                disabled={generatePost.isPending || isGenerating}
                className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary-hover hover:to-chart-2-hover"
              >
                {generatePost.isPending || isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer le post
                  </>
                )}
              </Button>
            </div>

            {(generatePost.isPending || isGenerating) && (
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-purple-400 opacity-20"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground font-medium">
                        Génération du contenu en cours...
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        IA en train d&apos;analyser votre activité GitHub
                      </p>
                    </div>
                    <div className="w-full max-w-xs">
                      <Progress
                        value={progress}
                        className="transition-all duration-300 ease-out"
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {Math.round(progress)}% terminé
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatePost.isError && (
              <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
                <CardContent className="p-6">
                  <div className="text-center text-red-600">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      <p className="font-medium">
                        Erreur lors de la génération
                      </p>
                    </div>
                    <p className="text-sm mt-1">
                      {generatePost.error?.message ||
                        "Une erreur inattendue s'est produite"}
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Réessayer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatePost.isSuccess && generatePost.data && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Summary */}
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground ">
                        <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                        Résumé
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(generatePost.data.summary, "summary")
                        }
                        className="hover:bg-green-100 transition-colors dark:hover:bg-green-900 dark:hover:text-green-400"
                      >
                        {copiedSummary ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatePost.data.summary}
                      readOnly
                      className="min-h-[100px] resize-none bg-white/50 border-green-200 focus:border-green-300 dark:bg-gray-900 dark:border-green-800 dark:focus:border-green-700"
                    />
                  </CardContent>
                </Card>

                {/* Post Content */}
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        Post pour réseaux sociaux
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(generatePost.data.post, "post")
                        }
                        className="hover:bg-blue-100 transition-colors dark:hover:bg-blue-900 dark:hover:text-blue-400"
                      >
                        {copiedPost ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatePost.data.post}
                      readOnly
                      className="min-h-[150px] resize-none bg-white/50 border-blue-200 focus:border-blue-300 dark:bg-gray-900 dark:border-blue-800 dark:focus:border-blue-700"
                    />
                  </CardContent>
                </Card>

                {/* Action pour voir tous les posts */}
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400">
                  <CardContent className="p-4 dark:text-purple-400">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-purple-900 dark:text-purple-400">
                          Post sauvegardé !
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-400">
                          Votre post a été automatiquement sauvegardé et vous
                          pouvez le gérer depuis vos brouillons.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/posts/drafts">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir mes posts
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
