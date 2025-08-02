import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useGitHubAppStatus } from "@/hooks/useGitHubApp";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import {
  useGeneratePost,
  createGenerateRequestFromEvent,
} from "@/hooks/useGeneratePost";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { authenticatedFetch } from "@/lib/api-client";
import { Card, CardContent, CardFooter } from "./ui/card";

const TOTAL_STEPS = 4;

const stepTitles = [
  "Installer l'App GitHub",
  "Scan des dépôts",
  "Sélectionner un commit",
  "Générer & partager le post",
];

export const OnboardingModal: React.FC = () => {
  const {
    onboardingStatus,
    loading,
    error,
    currentStep,
    advanceStep,
    finishOnboarding,
    skipOnboarding,
  } = useOnboarding();

  const { status } = useSession();

  // Step 1: GitHub App install logic
  const {
    data: githubApp,
    isLoading: isLoadingApp,
    error: appError,
    refetch: refetchApp,
  } = useGitHubAppStatus();

  // Step 2: Scan logic
  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await authenticatedFetch("/github/events/scan", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erreur lors du scan des dépôts");
      return res.json();
    },
  });

  const handleScan = async () => {
    try {
      await scanMutation.mutateAsync();
      advanceStep();
    } catch (e) {
      // handled by mutation error
    }
  };

  // Step 3: Commit selection logic
  const {
    events: allEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useGitHubEvents();
  const [selectedCommitId, setSelectedCommitId] = React.useState<string | null>(
    null
  );

  // Filter for push events (commits)
  const commitEvents = (allEvents || []).filter(e => e.event_type === "push");

  // Step 4: Post generation logic
  const [copied, setCopied] = React.useState(false);
  const generatePost = useGeneratePost();

  const selectedCommit = (allEvents || []).find(
    e => e.delivery_id === selectedCommitId
  );

  const handleGenerate = () => {
    if (!selectedCommit) return;
    const request = createGenerateRequestFromEvent(selectedCommit);
    generatePost.mutate({ request, event: selectedCommit });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Show modal if onboarding not finished or never started and user is authenticated
  const open =
    status === "authenticated" &&
    !loading &&
    (!onboardingStatus || !onboardingStatus.finished);

  // Step content logic
  const renderStep = (step: number) => {
    if (step === 1) {
      return (
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Github className="inline-block w-6 h-6 text-primary" /> Installer
            l’App GitHub
          </h2>
          <p className="mb-4 text-muted-foreground">
            Pour utiliser Quori, vous devez installer notre GitHub App sur vos
            dépôts. Elle permet d’analyser vos commits et de générer
            automatiquement des publications.
          </p>
          {isLoadingApp ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-spin h-5 w-5 border-b-2 border-primary rounded-full inline-block" />
              Vérification du statut de l’App GitHub…
            </div>
          ) : appError ? (
            <div className="text-red-500 mb-2">
              Erreur lors de la vérification :{" "}
              {appError instanceof Error ? appError.message : String(appError)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchApp()}
                className="ml-2"
              >
                Réessayer
              </Button>
            </div>
          ) : githubApp?.error === "INSUFFICIENT_PERMISSIONS" ? (
            <div className="flex flex-col gap-4">
              <div className="text-orange-600 mb-2 p-3 bg-orange-50 rounded-lg">
                <p className="font-medium">Permissions insuffisantes</p>
                <p className="text-sm">{githubApp.message}</p>
              </div>
              <Button asChild className="btn-modern w-full" size="lg">
                <a
                  href="/auth/login"
                  className="flex items-center justify-center"
                >
                  <Github className="mr-2 h-5 w-5" /> Se reconnecter
                </a>
              </Button>
            </div>
          ) : githubApp?.installed ? (
            <div className="flex flex-col gap-2">
              <div className="text-green-700 font-medium flex items-center gap-2">
                <Github className="w-5 h-5" /> App installée avec succès !
              </div>
              <Button className="btn-modern w-full mt-4" onClick={advanceStep}>
                Continuer
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Button asChild className="btn-modern w-full" size="lg">
                <a
                  href={githubApp?.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-5 w-5" /> Installer sur GitHub
                </a>
              </Button>
              <div className="text-xs text-muted-foreground">
                Une fois l’installation terminée, revenez ici et cliquez sur «
                Continuer ».
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchApp()}>
                Vérifier l’installation
              </Button>
            </div>
          )}
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">Scan des dépôts</h2>
          <p className="mb-4 text-muted-foreground text-center">
            Nous analysons vos dépôts et votre activité GitHub pour préparer
            votre expérience Quori.
          </p>
          <div className="flex flex-col items-center gap-4 w-full">
            {scanMutation.isIdle && (
              <Button className="btn-modern w-full" onClick={handleScan}>
                Lancer le scan
              </Button>
            )}
            {scanMutation.isPending && (
              <div className="flex flex-col items-center gap-2 w-full">
                <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
                <div className="loading-shimmer w-48 h-3 rounded mb-2" />
                <div className="loading-shimmer w-32 h-3 rounded mb-2" />
                <div className="text-sm text-muted-foreground">
                  Scan en cours...
                </div>
              </div>
            )}
            {scanMutation.isError && (
              <div className="text-red-500 mb-2">
                Erreur :{" "}
                {scanMutation.error instanceof Error
                  ? scanMutation.error.message
                  : String(scanMutation.error)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScan}
                  className="ml-2"
                >
                  Réessayer
                </Button>
              </div>
            )}
            {scanMutation.isSuccess && (
              <div className="text-green-700 font-medium flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-pulse text-green-600" />
                Scan terminé !
                <Button
                  className="btn-modern w-full mt-2"
                  onClick={advanceStep}
                >
                  Continuer
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">Sélectionner un commit</h2>
          <p className="mb-4 text-muted-foreground text-center">
            Choisissez un commit récent pour générer un post.
          </p>
          {isLoadingEvents ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
              <div className="loading-shimmer w-48 h-3 rounded mb-2" />
              <div className="text-sm text-muted-foreground">
                Chargement des commits...
              </div>
            </div>
          ) : eventsError ? (
            <div className="text-red-500 mb-2">
              Erreur lors du chargement :{" "}
              {eventsError instanceof Error
                ? eventsError.message
                : String(eventsError)}
            </div>
          ) : (
            <div className="w-full max-h-64 overflow-y-auto rounded mb-4 bg-muted/30">
              {commitEvents.length === 0 ? (
                <div className="p-4 text-muted-foreground text-center">
                  Aucun commit trouvé.
                </div>
              ) : (
                commitEvents.map(event => {
                  const selected = selectedCommitId === event.delivery_id;
                  return (
                    <Card
                      key={event.delivery_id}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedCommitId(event.delivery_id)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedCommitId(event.delivery_id);
                      }}
                      className={`mb-2 cursor-pointer transition-colors border ${selected ? " bg-primary/10" : "hover:bg-primary/5"}`}
                    >
                      <CardContent className="py-3 flex flex-col gap-1">
                        <div className="font-medium text-sm truncate">
                          {event.metadata?.title || "Commit"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {event.repo_full_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.author_login} •{" "}
                          {new Date(event.received_at).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                      </CardContent>
                      {selected && (
                        <CardFooter className="justify-end pt-0 pb-2">
                          <span className="text-primary font-bold">✓</span>
                        </CardFooter>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          )}
          <Button
            className="btn-modern w-full mt-2"
            onClick={advanceStep}
            disabled={!selectedCommitId}
          >
            Générer un post
          </Button>
        </div>
      );
    }
    if (step === 4) {
      return (
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">Générer & partager le post</h2>
          <p className="mb-4 text-muted-foreground text-center">
            Générez un post à partir du commit sélectionné, puis copiez ou
            programmez-le.
          </p>
          {!generatePost.isSuccess && (
            <Button
              className="btn-modern w-full mb-4"
              onClick={handleGenerate}
              disabled={!selectedCommit || generatePost.isPending}
            >
              {generatePost.isPending ? (
                <>
                  <Sparkles className="animate-spin h-5 w-5 mr-2" />{" "}
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" /> Générer le post
                </>
              )}
            </Button>
          )}
          {generatePost.isPending && (
            <div className="flex flex-col items-center gap-2 w-full">
              <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
              <div className="loading-shimmer w-48 h-3 rounded mb-2" />
              <div className="text-sm text-muted-foreground">
                Génération du post en cours...
              </div>
            </div>
          )}
          {generatePost.isError && (
            <div className="text-red-500 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {generatePost.error instanceof Error
                ? generatePost.error.message
                : String(generatePost.error)}
            </div>
          )}
          {generatePost.isSuccess && generatePost.data && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Textarea
                value={generatePost.data.post}
                readOnly
                className="min-h-[150px] resize-none bg-white/50 border-blue-200 focus:border-blue-300 mb-2"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(generatePost.data.post)}
                  className="hover:bg-blue-100 transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={finishOnboarding}
                  className="hover:bg-green-100 transition-colors"
                >
                  Programmer (stub)
                </Button>
                <Button
                  className="btn-modern ml-auto"
                  onClick={finishOnboarding}
                >
                  Terminer
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Votre post a été sauvegardé dans vos brouillons. Vous pouvez le
                modifier ou le publier plus tard.
                <Link
                  href="/posts/drafts"
                  className="ml-2 underline text-primary"
                >
                  Voir mes posts
                </Link>
              </div>
            </div>
          )}
        </div>
      );
    }
    switch (step) {
      case 3:
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Sélectionner un commit</h2>
            <p className="mb-4">Liste des commits récents...</p>
            <button className="btn-modern w-full" onClick={advanceStep}>
              Générer un post
            </button>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">
              Générer & partager le post
            </h2>
            <p className="mb-4">Génération du post en cours...</p>
            <button className="btn-modern w-full" onClick={finishOnboarding}>
              Terminer l’onboarding
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={!!open}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Bienvenue sur Quori</DialogTitle>
          </div>
          <DialogDescription asChild={false}>
            <span className="text-sm font-medium">
              Étape {currentStep} sur {TOTAL_STEPS}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              {stepTitles[currentStep - 1]}
            </span>
          </DialogDescription>
          <div className="mt-2">
            <Progress value={(currentStep / TOTAL_STEPS) * 100} />
          </div>
        </DialogHeader>
        <div className="mt-6">
          {error && <div className="text-red-500 mb-2">{error.message}</div>}
          {renderStep(currentStep)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={skipOnboarding}
          className="text-muted-foreground hover:text-foreground"
        >
          Passer l&apos;onboarding
        </Button>
      </DialogContent>
    </Dialog>
  );
};
