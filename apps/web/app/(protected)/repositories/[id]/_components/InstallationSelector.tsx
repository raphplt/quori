import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGitHubInstallations } from "@/hooks/useGitHubInstallations";
import { ExternalLink, GitBranch } from "lucide-react";

interface InstallationSelectorProps {
  repositoryFullName: string;
  onInstallationChange: (installationId: string | null) => void;
  selectedInstallationId: string | null;
}

export function InstallationSelector({
  repositoryFullName,
  onInstallationChange,
  selectedInstallationId,
}: InstallationSelectorProps) {
  const { data: installationStatus, isLoading } = useGitHubInstallations();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des installations...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (
    !installationStatus?.installed ||
    !installationStatus.installations.length
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GitHub App non installée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Pour accéder aux détails complets du repository via la GitHub App,
            vous devez d&apos;abord l&apos;installer sur votre compte ou
            organisation.
          </p>
          <Button asChild>
            <a
              href={installationStatus?.installUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Installer GitHub App</span>
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Trouver les installations qui ont accès à ce repository
  const availableInstallations = installationStatus.installations.filter(
    installation => installation.repos.includes(repositoryFullName)
  );

  if (availableInstallations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accès GitHub App indisponible</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ce repository n&apos;est pas accessible via vos installations GitHub
            App. Les données sont récupérées via votre token OAuth GitHub.
          </p>
          <p className="text-sm text-muted-foreground">
            Repository: {repositoryFullName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5" />
          <span>Source des données</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Choisir la source des données:
          </label>
          <Select
            value={selectedInstallationId || "oauth"}
            onValueChange={value =>
              onInstallationChange(value === "oauth" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oauth">
                Token OAuth (données de base)
              </SelectItem>
              {availableInstallations.map(installation => (
                <SelectItem
                  key={installation.id}
                  value={installation.id.toString()}
                >
                  GitHub App - {installation.account_login} (données complètes)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant={selectedInstallationId ? "default" : "secondary"}>
              {selectedInstallationId ? "GitHub App" : "OAuth"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {selectedInstallationId ? "Données complètes" : "Données de base"}
            </span>
          </div>

          {selectedInstallationId && (
            <p className="text-xs text-muted-foreground">
              Via:{" "}
              {
                availableInstallations.find(
                  i => i.id.toString() === selectedInstallationId
                )?.account_login
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
