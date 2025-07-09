import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RepositoryCard } from "./RepositoryCard";

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

interface RepositoryListProps {
  repositories: Repository[];
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
  repositories,
}) => {
  if (repositories.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Aucun repository trouvé avec ces critères
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map(repo => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
};
