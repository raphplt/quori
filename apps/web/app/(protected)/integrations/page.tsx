"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Puzzle, Plus, Settings, ExternalLink, Check } from "lucide-react";

const IntegrationsPage = () => {
  const integrations = [
    {
      id: 1,
      name: "LinkedIn",
      description: "Publiez directement sur LinkedIn",
      icon: "🔗",
      status: "connected",
      lastSync: "2025-01-08T10:30:00Z",
    },
    {
      id: 2,
      name: "GitHub",
      description: "Synchronisation avec vos dépôts GitHub",
      icon: "🐙",
      status: "connected",
      lastSync: "2025-01-08T11:15:00Z",
    },
    {
      id: 3,
      name: "GitLab",
      description: "Synchronisation avec GitLab",
      icon: "🦊",
      status: "available",
      lastSync: null,
    },
    {
      id: 4,
      name: "Zapier",
      description: "Automatisez vos workflows",
      icon: "⚡",
      status: "available",
      lastSync: null,
    },
  ];

  const webhooks = [
    {
      id: 1,
      name: "Push Events",
      url: "https://api.quori.dev/github/events",
      status: "active",
      events: ["push", "pull_request"],
    },
    {
      id: 2,
      name: "Release Events",
      url: "https://api.quori.dev/github/events",
      status: "active",
      events: ["release"],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="default">Connecté</Badge>;
      case "available":
        return <Badge variant="secondary">Disponible</Badge>;
      case "error":
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getWebhookStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Actif</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>;
      case "error":
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Intégrations</h1>
            <p className="text-muted-foreground">
              Connectez vos services et configurez vos webhooks
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle intégration
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Intégrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Puzzle className="mr-2 h-5 w-5" />
                Connexions
              </CardTitle>
              <CardDescription>
                Services connectés à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map(integration => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h3 className="font-medium">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>

                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Dernière synchronisation :{" "}
                        {new Date(integration.lastSync).toLocaleString("fr-FR")}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      {integration.status === "connected" ? (
                        <>
                          <Button size="sm" variant="outline">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurer
                          </Button>
                          <Button size="sm" variant="outline">
                            Déconnecter
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Connecter
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API & Webhooks */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API & Webhooks</CardTitle>
                <CardDescription>
                  Gérez vos clés API et webhooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Clé API</h3>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                        qri_••••••••••••••••••••••••••••••••
                      </code>
                      <Button size="sm" variant="outline">
                        Copier
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Utilisée pour les intégrations tierces
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Webhooks actifs</h3>
                    {webhooks.map(webhook => (
                      <div key={webhook.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            {webhook.name}
                          </h4>
                          {getWebhookStatusBadge(webhook.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {webhook.url}
                        </p>
                        <div className="flex items-center space-x-2">
                          {webhook.events.map(event => (
                            <Badge
                              key={event}
                              variant="outline"
                              className="text-xs"
                            >
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add-ons disponibles</CardTitle>
                <CardDescription>
                  Étendez les fonctionnalités de Quori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      name: "Carrousels LinkedIn",
                      price: "9€/mois",
                      installed: true,
                    },
                    {
                      name: "Analytics avancés",
                      price: "15€/mois",
                      installed: false,
                    },
                    {
                      name: "Planification automatique",
                      price: "12€/mois",
                      installed: true,
                    },
                    {
                      name: "Templates premium",
                      price: "6€/mois",
                      installed: false,
                    },
                  ].map((addon, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {addon.installed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 border rounded border-muted-foreground"></div>
                        )}
                        <div>
                          <h4 className="font-medium text-sm">{addon.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {addon.price}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={addon.installed ? "outline" : "default"}
                      >
                        {addon.installed ? "Installé" : "Installer"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default IntegrationsPage;
