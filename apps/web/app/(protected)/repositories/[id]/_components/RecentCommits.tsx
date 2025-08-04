import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommit, ExternalLink } from "lucide-react";

interface RecentCommitsProps {
  commits: {
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    } | null;
    date: string;
    html_url: string;
  }[];
}

export function RecentCommits({ commits }: RecentCommitsProps) {
  if (!commits || commits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commits récents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun commit trouvé</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Il y a quelques secondes";
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    }

    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const truncateMessage = (message: string, maxLength = 60) => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + "...";
  };

  const truncateSha = (sha: string) => {
    return sha.slice(0, 7);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitCommit className="h-5 w-5" />
          <span>Commits récents</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commits.map(commit => (
            <div key={commit.sha} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {truncateMessage(commit.message)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {commit.author?.name || "Auteur inconnu"}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(commit.date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                  <Badge variant="outline" className="font-mono text-xs">
                    {truncateSha(commit.sha)}
                  </Badge>
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              {commits.indexOf(commit) < commits.length - 1 && (
                <hr className="border-border" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
