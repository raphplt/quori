"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRepositoryDetails } from "@/hooks/useRepositoryDetails";
import { RepositoryOverview } from "./_components/RepositoryOverview";
import { LanguagesChart } from "./_components/LanguagesChart";
import { ContributorsList } from "./_components/ContributorsList";
import { RecentCommits } from "./_components/RecentCommits";
import { IssuesAndPRs } from "./_components/IssuesAndPRs";
import { BranchesAndReleases } from "./_components/BranchesAndReleases";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  useGenerateRepositoryPost,
  createRepositoryPostRequest,
} from "@/hooks/useGenerateRepositoryPost";

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const initialInstallationId = searchParams.get("installationId");

  // State pour gérer l'installation sélectionnée
  const [selectedInstallationId] = useState<string | null>(
    initialInstallationId
  );

  // Décoder l'ID qui est au format owner/repo
  const [owner, repo] = decodeURIComponent(id).split("/");

  const {
    data: repositoryDetails,
    isLoading,
    error,
  } = useRepositoryDetails(owner, repo, selectedInstallationId || undefined);

  const generatePost = useGenerateRepositoryPost(owner, repo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des détails du repository...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/repositories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux repositories
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des détails du repository:{" "}
            {error instanceof Error ? error.message : "Erreur inconnue"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!repositoryDetails) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/repositories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux repositories
            </Button>
          </Link>
        </div>
        <Alert>
          <AlertDescription>Repository non trouvé.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
        <div className="flex items-center justify-between">
          <Link href="/repositories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux repositories
            </Button>
          </Link>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                generatePost.mutate(
                  createRepositoryPostRequest(repositoryDetails)
                )
              }
              disabled={generatePost.isPending}
            >
              {generatePost.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Générer un post
            </Button>
            <Button asChild>
              <a
                href={repositoryDetails.repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Voir sur GitHub</span>
              </a>
            </Button>
          </div>
        </div>

      {/* Sélecteur d'installation */}
      {/* <InstallationSelector
        repositoryFullName={repositoryFullName}
        onInstallationChange={handleInstallationChange}
        selectedInstallationId={selectedInstallationId}
      /> */}

      {/* Vue d'ensemble */}
        <RepositoryOverview data={repositoryDetails} />

        {generatePost.isSuccess && generatePost.data && (
          <div className="space-y-2 p-4 border rounded">
            <h3 className="font-semibold">Résumé</h3>
            <p>{generatePost.data.summary}</p>
            <h3 className="font-semibold">Post</h3>
            <p>{generatePost.data.post}</p>
          </div>
        )}
        {generatePost.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {generatePost.error.message}
            </AlertDescription>
          </Alert>
        )}

      {/* Grille de contenu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          <LanguagesChart languages={repositoryDetails.languages} />
          <ContributorsList contributors={repositoryDetails.contributors} />
          <BranchesAndReleases
            branches={repositoryDetails.branches}
            releases={repositoryDetails.releases}
          />
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          <RecentCommits commits={repositoryDetails.recentCommits} />
          <IssuesAndPRs
            issues={repositoryDetails.openIssues}
            pullRequests={repositoryDetails.openPullRequests}
          />
        </div>
      </div>
    </div>
  );
}
