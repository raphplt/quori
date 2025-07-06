import { useState, useMemo } from "react";

export type SortOption = "name" | "stars" | "forks" | "updated" | "created";
export type SortDirection = "asc" | "desc";

interface Repository {
  id: number;
  name: string;
  description?: string;
  language?: string;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  html_url: string;
  full_name: string;
}

interface UseRepositoryFiltersProps {
  repositories: Repository[] | undefined;
}

export const useRepositoryFilters = ({
  repositories,
}: UseRepositoryFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Available languages from repositories
  const availableLanguages = useMemo(() => {
    if (!repositories) return [];
    const languages = repositories
      .map(repo => repo.language)
      .filter((lang): lang is string => lang !== null)
      .filter((lang, index, arr) => arr.indexOf(lang) === index)
      .sort();
    return languages;
  }, [repositories]);

  // Filtered and sorted repositories
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

    // Sort
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

  return {
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
  };
};
