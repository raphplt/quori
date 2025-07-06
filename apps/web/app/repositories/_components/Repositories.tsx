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
import { usePagination } from "@/hooks/usePagination";
import { RepositoryFilters } from "./RepositoryFilters";
import { RepositoryList } from "./RepositoryList";
import { PaginationControls } from "./PaginationControls";

const Repositories = () => {
  const { data: session, status } = useSession();
  const { data: repositories, isLoading, error } = useGitHubRepositories();

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

  const itemsPerPage = 6;
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
  } = usePagination({
    totalItems: filteredAndSortedRepos.length,
    itemsPerPage,
    dependencies: [
      searchTerm,
      languageFilter,
      visibilityFilter,
      sortBy,
      sortDirection,
    ],
  });

  const paginatedRepos = filteredAndSortedRepos.slice(startIndex, endIndex);

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
          {filteredAndSortedRepos.length} repository
          {filteredAndSortedRepos.length > 1 ? "s" : ""} trouvé
          {filteredAndSortedRepos.length > 1 ? "s" : ""}
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
