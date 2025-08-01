"use client";

import { useGitHubAppStatus, useForceSyncGitHubApp } from "@/hooks/useGitHubApp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, Settings, RefreshCw } from "lucide-react";
import Link from "next/link";

export function GitHubAppAlert() {
  const { data, isLoading } = useGitHubAppStatus();
  const forceSyncMutation = useForceSyncGitHubApp();

  if (isLoading || data?.installed) {
    return null;
  }

  const handleForceSync = () => {
    forceSyncMutation.mutate();
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Github className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong className="text-orange-800">GitHub App non installée</strong>
          <p className="text-orange-700 mt-1">
            Pour utiliser Quori et analyser vos commits, vous devez installer
            notre GitHub App sur vos dépôts.
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            onClick={handleForceSync}
            variant="outline"
            size="sm"
            disabled={forceSyncMutation.isPending}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${forceSyncMutation.isPending ? "animate-spin" : ""}`}
            />
            {forceSyncMutation.isPending
              ? "Synchronisation..."
              : "Synchroniser"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Configurer
            </Link>
          </Button>
          {data?.installUrl && (
            <Button asChild size="sm">
              <a
                href={data.installUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Installer
              </a>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
