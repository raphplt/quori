"use client";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGitHubRepositories,
  useAvailableLanguages,
} from "@/hooks/useGitHub";
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

  const {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    languageFilter,
    setLanguageFilter,
    visibilityFilter,
    setVisibilityFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  } = useRepositoryFilters();

  // Préparer les filtres pour l'API (utiliser debouncedSearchTerm)
  const filters = {
    search: debouncedSearchTerm || undefined,
    language: languageFilter !== "all" ? languageFilter : undefined,
    visibility: visibilityFilter as "all" | "public" | "private",
    sort: sortBy,
    direction: sortDirection,
  };

  const { data, isLoading, error } = useGitHubRepositories(
    currentPage,
    itemsPerPage,
    filters
  );

  const { data: languagesData } = useAvailableLanguages();
  const availableLanguages = languagesData?.availableLanguages || [];

  const repositories = data?.repositories || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    languageFilter,
    visibilityFilter,
    sortBy,
    sortDirection,
  ]);

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
          {totalCount} repository
          {totalCount > 1 ? "s" : ""} trouvé
          {totalCount > 1 ? "s" : ""}
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
      <RepositoryList repositories={repositories} />

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
