"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Github,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useGitHubAppStatus, useRevokeGitHubApp } from "@/hooks/useGitHubApp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GitHubAppSettings() {
  const { data, isLoading, error, refetch } = useGitHubAppStatus();
  const revokeApp = useRevokeGitHubApp();
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [installationToRevoke, setInstallationToRevoke] = useState<
    number | null
  >(null);

  const handleRevoke = async () => {
    if (installationToRevoke) {
      try {
        await revokeApp.mutateAsync(installationToRevoke);
        setShowRevokeDialog(false);
        setInstallationToRevoke(null);
        toast.success("Installation révoquée avec succès");
      } catch (error) {
        console.error("Erreur lors de la révocation:", error);
        toast.error(
          "Erreur lors de la révocation de l'installation. Veuillez réessayer."
        );
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Github className="mr-2 h-5 w-5" />
            GitHub App
          </CardTitle>
          <CardDescription>
            Configuration de l&apos;application GitHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Spinner />
            <span>Vérification du statut...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Github className="mr-2 h-5 w-5" />
            GitHub App
          </CardTitle>
          <CardDescription>
            Configuration de l&apos;application GitHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors de la vérification du statut de l&apos;installation
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="mt-4"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Github className="mr-2 h-5 w-5" />
          GitHub App
        </CardTitle>
        <CardDescription>
          Configuration de l&apos;application GitHub pour analyser vos commits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Statut :</span>
            {data?.installed ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Connectée
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Non installée
              </Badge>
            )}
          </div>
          {!data?.installed && (
            <Button asChild>
              <a
                href={data?.installUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Installer sur GitHub
              </a>
            </Button>
          )}
        </div>

        {data?.installed && data.installations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Installations actives :</h4>
            {data.installations.map(installation => (
              <div
                key={installation.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      @{installation.account_login}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      ID: {installation.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {installation.repos.length} dépôt(s) configuré(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Installée le{" "}
                    {new Date(installation.created_at).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>

                <Dialog
                  open={showRevokeDialog}
                  onOpenChange={setShowRevokeDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setInstallationToRevoke(installation.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Révoquer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Révoquer l&apos;installation</DialogTitle>
                      <DialogDescription>
                        Êtes-vous sûr de vouloir révoquer l&apos;installation de
                        la GitHub App pour @{installation.account_login} ? Cette
                        action supprimera l&apos;accès aux{" "}
                        {installation.repos.length} dépôt(s) configuré(s).
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowRevokeDialog(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRevoke}
                        disabled={revokeApp.isPending}
                      >
                        {revokeApp.isPending && (
                          <Spinner className="mr-2 h-4 w-4" />
                        )}
                        Révoquer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}

        {!data?.installed && (
          <Alert>
            <Github className="h-4 w-4" />
            <AlertDescription>
              Pour utiliser Quori, vous devez installer notre GitHub App sur vos
              dépôts. Elle permettra d&apos;analyser vos commits et de générer
              automatiquement des publications.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
