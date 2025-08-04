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
import { InstallationSelector } from "./_components/InstallationSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const initialInstallationId = searchParams.get("installationId");

  // State pour gérer l'installation sélectionnée
  const [selectedInstallationId, setSelectedInstallationId] = useState<
    string | null
  >(initialInstallationId);

  // Décoder l'ID qui est au format owner/repo
  const [owner, repo] = decodeURIComponent(id).split("/");
  const repositoryFullName = `${owner}/${repo}`;

  const {
    data: repositoryDetails,
    isLoading,
    error,
    refetch,
  } = useRepositoryDetails(owner, repo, selectedInstallationId || undefined);

  // Gérer le changement d'installation
  const handleInstallationChange = (installationId: string | null) => {
    setSelectedInstallationId(installationId);
    // Optionnel: mettre à jour l'URL
    const url = new URL(window.location.href);
    if (installationId) {
      url.searchParams.set("installationId", installationId);
    } else {
      url.searchParams.delete("installationId");
    }
    window.history.replaceState({}, "", url.toString());

    // Refetch avec la nouvelle installation
    refetch();
  };

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

      {/* Sélecteur d'installation */}
      <InstallationSelector
        repositoryFullName={repositoryFullName}
        onInstallationChange={handleInstallationChange}
        selectedInstallationId={selectedInstallationId}
      />

      {/* Vue d'ensemble */}
      <RepositoryOverview data={repositoryDetails} />

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
