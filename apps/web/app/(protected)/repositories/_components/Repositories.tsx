"use client";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGitHubRepositories } from "@/hooks/useGitHub";
import { useSession } from "next-auth/react";
import { useRepositoryFilters } from "@/hooks/useRepositoryFilters";
import { useState, useEffect } from "react";
import { RepositoryFilters } from "./RepositoryFilters";
import { RepositoryList } from "./RepositoryList";
import { PaginationControls } from "./PaginationControls";

const Repositories = () => {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Récupérer tous les repositories d'un coup avec une limite élevée
  const { data, isLoading, error } = useGitHubRepositories(1, 1000);
  const repositories = data?.repositories;

  const {
    searchTerm,
    setSearchTerm,
    languageFilter,
    setLanguageFilter,
    visibilityFilter,
    setVisibilityFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    availableLanguages,
    filteredAndSortedRepos,
  } = useRepositoryFilters({ repositories });

  // Pagination côté client sur les repositories filtrés
  const totalFilteredCount = filteredAndSortedRepos.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRepos = filteredAndSortedRepos.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, languageFilter, visibilityFilter, sortBy, sortDirection]);

  const goToPage = (p: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));
  };
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <Spinner />
        <p className="text-muted-foreground">
          Chargement de vos repositories...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Accès requis</CardTitle>
          <CardDescription>
            Veuillez vous connecter pour voir vos repositories GitHub
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erreur</CardTitle>
          <CardDescription>
            {error instanceof Error
              ? error.message
              : "Une erreur inconnue s'est produite"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Mes Repositories GitHub
        </h1>
        <p className="text-muted-foreground">
          {totalFilteredCount} repository
          {totalFilteredCount > 1 ? "s" : ""} trouvé
          {totalFilteredCount > 1 ? "s" : ""}
          {repositories && repositories.length !== totalFilteredCount && (
            <span className="text-sm text-muted-foreground/70">
              {" "}
              (sur {repositories.length} au total)
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <RepositoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        visibilityFilter={visibilityFilter}
        setVisibilityFilter={setVisibilityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        availableLanguages={availableLanguages}
      />

      {/* Repository List */}
      <RepositoryList repositories={paginatedRepos} />

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        onPrevious={goToPrevious}
        onNext={goToNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />
    </div>
  );
};

export default Repositories;
