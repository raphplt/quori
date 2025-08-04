import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Tag, ExternalLink, Shield } from "lucide-react";

interface BranchesAndReleasesProps {
  branches: {
    name: string;
    commit: {
      sha: string;
    };
    protected: boolean;
  }[];
  releases: {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    published_at: string;
    html_url: string;
  }[];
}

export function BranchesAndReleases({
  branches,
  releases,
}: BranchesAndReleasesProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const truncateSha = (sha: string) => {
    return sha.slice(0, 7);
  };

  const truncateBody = (body: string, maxLength = 100) => {
    if (!body || body.length <= maxLength) return body;
    return body.slice(0, maxLength) + "...";
  };

  const renderBranches = () => {
    if (!branches || branches.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">
          Aucune branche trouvée
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {branches.map(branch => (
          <div key={branch.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{branch.name}</span>
                  {branch.protected && (
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3 text-amber-600" />
                      <Badge variant="outline" className="text-xs">
                        Protégée
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Commit {truncateSha(branch.commit.sha)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReleases = () => {
    if (!releases || releases.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">
          Aucune release trouvée
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {releases.map(release => (
          <div key={release.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">
                    {release.name || release.tag_name}
                  </h4>
                  <Badge variant="outline">{release.tag_name}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Publié le {formatDate(release.published_at)}
                </p>
                {release.body && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {truncateBody(release.body)}
                  </p>
                )}
              </div>
              <a
                href={release.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            {releases.indexOf(release) < releases.length - 1 && (
              <hr className="border-border" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branches et Releases</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="branches" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="branches"
              className="flex items-center space-x-2"
            >
              <GitBranch className="h-4 w-4" />
              <span>Branches ({branches.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="releases"
              className="flex items-center space-x-2"
            >
              <Tag className="h-4 w-4" />
              <span>Releases ({releases.length})</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="branches" className="mt-4">
            {renderBranches()}
          </TabsContent>
          <TabsContent value="releases" className="mt-4">
            {renderReleases()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
