import { useState, useEffect } from "react";

export type SortOption = "name" | "stars" | "forks" | "updated" | "created";
export type SortDirection = "asc" | "desc";

export const useRepositoryFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de délai

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return {
    searchTerm, // Valeur immédiate pour l'input
    debouncedSearchTerm, // Valeur debounced pour l'API
    setSearchTerm,
    languageFilter,
    setLanguageFilter,
    visibilityFilter,
    setVisibilityFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  };
};
