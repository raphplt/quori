import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, GitPullRequest, ExternalLink } from "lucide-react";

interface IssuesAndPRsProps {
  issues: {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    html_url: string;
    user: {
      login: string;
      avatar_url: string;
    } | null;
  }[];
  pullRequests: {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    html_url: string;
    user: {
      login: string;
      avatar_url: string;
    } | null;
  }[];
}

export function IssuesAndPRs({ issues, pullRequests }: IssuesAndPRsProps) {
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

  const truncateTitle = (title: string, maxLength = 80) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };

  const renderIssueList = (items: typeof issues, type: "issue" | "pr") => {
    if (!items || items.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">
          Aucun{type === "issue" ? "e issue" : "e pull request"} ouvert
          {type === "issue" ? "e" : "e"}
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {type === "issue" ? (
                <AlertCircle className="h-4 w-4 text-green-600" />
              ) : (
                <GitPullRequest className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium leading-tight">
                    {truncateTitle(item.title)}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      #{item.number}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ouvert {formatDate(item.created_at)}
                    </span>
                    {item.user && (
                      <>
                        <span className="text-xs text-muted-foreground">
                          par
                        </span>
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage
                              src={item.user.avatar_url}
                              alt={item.user.login}
                            />
                            <AvatarFallback className="text-xs">
                              {item.user.login.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {item.user.login}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <a
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues et Pull Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issues" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Issues ({issues.length})</span>
            </TabsTrigger>
            <TabsTrigger value="prs" className="flex items-center space-x-2">
              <GitPullRequest className="h-4 w-4" />
              <span>Pull Requests ({pullRequests.length})</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="issues" className="mt-4">
            {renderIssueList(issues, "issue")}
          </TabsContent>
          <TabsContent value="prs" className="mt-4">
            {renderIssueList(pullRequests, "pr")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
