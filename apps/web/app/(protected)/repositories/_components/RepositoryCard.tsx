import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, Code, ExternalLink, Calendar } from "lucide-react";

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

interface RepositoryCardProps {
  repository: Repository;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository: repo,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
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
          Mis à jour le {new Date(repo.updated_at).toLocaleDateString("fr-FR")}
        </div>
      </CardContent>
    </Card>
  );
};
