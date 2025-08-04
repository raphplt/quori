import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface ContributorsListProps {
  contributors: {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
  }[];
}

export function ContributorsList({ contributors }: ContributorsListProps) {
  if (!contributors || contributors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contributeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun contributeur trouvé</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributeurs ({contributors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contributors.map(contributor => (
            <div
              key={contributor.login}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={contributor.avatar_url}
                    alt={contributor.login}
                  />
                  <AvatarFallback>
                    {contributor.login.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{contributor.login}</span>
                    <a
                      href={contributor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {contributor.contributions} contribution
                {contributor.contributions > 1 ? "s" : ""}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
