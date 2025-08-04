import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Star,
  GitFork,
  Eye,
  FileText,
  Users,
  GitBranch,
} from "lucide-react";
import { RepositoryDetails } from "@/types/repository-details";

interface RepositoryOverviewProps {
  data: RepositoryDetails;
}

export function RepositoryOverview({ data }: RepositoryOverviewProps) {
  const { repository } = data;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {repository.name}
            </h1>
            {repository.private && <Badge variant="secondary">Privé</Badge>}
          </div>
          {repository.description && (
            <p className="text-lg text-muted-foreground">
              {repository.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{repository.owner.login}</span>
            </span>
            <span className="flex items-center space-x-1">
              <CalendarDays className="h-4 w-4" />
              <span>Créé le {formatDate(repository.created_at)}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span className="font-medium">{repository.stargazers_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitFork className="h-4 w-4" />
            <span className="font-medium">{repository.forks_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span className="font-medium">{repository.watchers_count}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Langage principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repository.language || "Non défini"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Issues ouvertes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repository.open_issues_count}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taille</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatSize(repository.size * 1024)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Branche par défaut
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repository.default_branch}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics */}
      {repository.topics && repository.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {repository.topics.map(topic => (
                <Badge key={topic} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* License */}
      {repository.license && (
        <Card>
          <CardHeader>
            <CardTitle>Licence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">{repository.license.name}</span>
              <Badge variant="outline">{repository.license.key}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dates importantes */}
      <Card>
        <CardHeader>
          <CardTitle>Dates importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Créé le :</span>
            <span>{formatDate(repository.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Dernière mise à jour :
            </span>
            <span>{formatDate(repository.updated_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dernier push :</span>
            <span>{formatDate(repository.pushed_at)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
