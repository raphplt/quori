"use client";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useGitHubRepositories } from "@/hooks/useGitHub";
import { useSession } from "next-auth/react";
import React, { useState, useMemo } from "react";
import {
  Search,
  Star,
  GitFork,
  Code,
  ExternalLink,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

type SortOption = "name" | "stars" | "forks" | "updated" | "created";
type SortDirection = "asc" | "desc";

const Repositories = () => {
  const { data: session, status } = useSession();
  const { data: repositories, isLoading, error } = useGitHubRepositories();

  // États pour les filtres et pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Logique de filtrage et tri
  const filteredAndSortedRepos = useMemo(() => {
    if (!repositories) return [];

    const filtered = repositories.filter(repo => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);

      const matchesLanguage =
        languageFilter === "all" || repo.language === languageFilter;

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "private" ? repo.private : !repo.private);

      return matchesSearch && matchesLanguage && matchesVisibility;
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "stars":
          comparison = a.stargazers_count - b.stargazers_count;
          break;
        case "forks":
          comparison = a.forks_count - b.forks_count;
          break;
        case "updated":
          comparison =
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "created":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    repositories,
    searchTerm,
    languageFilter,
    visibilityFilter,
    sortBy,
    sortDirection,
  ]);

  // Langages disponibles
  const availableLanguages = useMemo(() => {
    if (!repositories) return [];
    const languages = repositories
      .map(repo => repo.language)
      .filter((lang): lang is string => lang !== null)
      .filter((lang, index, arr) => arr.indexOf(lang) === index)
      .sort();
    return languages;
  }, [repositories]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRepos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRepos = filteredAndSortedRepos.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset pagination quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, languageFilter, visibilityFilter, sortBy, sortDirection]);

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
      {/* En-tête */}
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

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres en ligne */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Langage</label>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les langages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les langages</SelectItem>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Visibilité
              </label>
              <Select
                value={visibilityFilter}
                onValueChange={setVisibilityFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les visibilités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les visibilités</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Trier par
              </label>
              <Select
                value={sortBy}
                onValueChange={value => setSortBy(value as SortOption)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Dernière mise à jour</SelectItem>
                  <SelectItem value="created">Date de création</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="stars">Étoiles</SelectItem>
                  <SelectItem value="forks">Forks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordre</label>
              <Button
                variant="outline"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                className="w-full justify-start"
              >
                {sortDirection === "asc" ? (
                  <>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Croissant
                  </>
                ) : (
                  <>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Décroissant
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des repositories */}
      {paginatedRepos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedRepos.map(repo => (
            <Card
              key={repo.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      {repo.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardTitle>
                  <Badge variant={repo.private ? "secondary" : "default"}>
                    {repo.private ? "Privé" : "Public"}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {repo.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {repo.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {repo.language && (
                    <div className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      {repo.language}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repo.stargazers_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {repo.forks_count}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Mis à jour le{" "}
                  {new Date(repo.updated_at).toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucun repository trouvé avec ces critères
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isVisible =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!isVisible) return null;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Repositories;
