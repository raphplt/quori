import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { SortOption, SortDirection } from "@/hooks/useRepositoryFilters";

interface RepositoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  languageFilter: string;
  setLanguageFilter: (language: string) => void;
  visibilityFilter: string;
  setVisibilityFilter: (visibility: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  availableLanguages: string[];
}

export const RepositoryFilters: React.FC<RepositoryFiltersProps> = ({
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
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter row */}
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
            <label className="text-sm font-medium mb-2 block">Visibilité</label>
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
            <label className="text-sm font-medium mb-2 block">Trier par</label>
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
  );
};
