"use client";

import React, { useState } from "react";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  User,
} from "lucide-react";
import Link from "next/link";
import { GitHubAppSettings } from "@/components/GitHubAppSettings";
import { UserPreferencesForm } from "@/components/profile/UserPreferencesForm";

type ExtendedUser = {
  id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
};

const Settings = () => {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
};

function SettingsContent() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser;

  // State pour les paramètres
  const [notifications, setNotifications] = useState({
    emailOnNewPost: true,
    emailOnCommit: false,
    emailWeeklyReport: true,
    pushNotifications: true,
    slackIntegration: false,
  });

  const [showApiKey, setShowApiKey] = useState(false);

  if (!user) {
    return null;
  }

  const connectedAccounts = [
    {
      id: "github",
      name: "GitHub",
      connected: true,
      email: user.email,
      avatar: user.avatarUrl,
    },
    {
      id: "twitter",
      name: "Twitter",
      connected: false,
      email: null,
      avatar: null,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      connected: false,
      email: null,
      avatar: null,
    },
  ];

  const sessions = [
    {
      id: "1",
      device: "MacBook Pro",
      location: "Paris, France",
      lastActive: "Maintenant",
      current: true,
    },
    {
      id: "2",
      device: "iPhone 15",
      location: "Paris, France",
      lastActive: "Il y a 2h",
      current: false,
    },
    {
      id: "3",
      device: "Chrome sur Windows",
      location: "Lyon, France",
      lastActive: "Il y a 3j",
      current: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Paramètres et Sécurité
            </h1>
            <p className="text-gray-600 mt-1">
              Configurez vos préférences, notifications, sécurité et
              intégrations.
            </p>
          </div>
          <Link href="/profile">
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Voir mon profil
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <a
                    href="#notifications"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground"
                  >
                    <Bell className="mr-3 h-4 w-4" />
                    Notifications
                  </a>
                  <a
                    href="#security"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    Sécurité
                  </a>
                  <a
                    href="#preferences"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    <Palette className="mr-3 h-4 w-4" />
                    Préférences
                  </a>
                  <a
                    href="#integrations"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    <Globe className="mr-3 h-4 w-4" />
                    Intégrations
                  </a>
                  <a
                    href="#data"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    <Database className="mr-3 h-4 w-4" />
                    Données
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Notifications */}
            <Card id="notifications">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configurez vos préférences de notification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email pour nouveaux posts</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir un email quand un nouveau post est généré
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailOnNewPost}
                      onCheckedChange={value =>
                        setNotifications(prev => ({
                          ...prev,
                          emailOnNewPost: value,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email pour commits</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir un email pour chaque commit traité
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailOnCommit}
                      onCheckedChange={value =>
                        setNotifications(prev => ({
                          ...prev,
                          emailOnCommit: value,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rapport hebdomadaire</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir un résumé de votre activité chaque semaine
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailWeeklyReport}
                      onCheckedChange={value =>
                        setNotifications(prev => ({
                          ...prev,
                          emailWeeklyReport: value,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications push</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications push sur vos appareils
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={value =>
                        setNotifications(prev => ({
                          ...prev,
                          pushNotifications: value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card id="security">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Sécurité
                </CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Mot de passe</h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Mot de passe</p>
                      <p className="text-sm text-muted-foreground">
                        Dernière modification il y a 3 mois
                      </p>
                    </div>
                    <Button variant="outline">Modifier</Button>
                  </div>
                </div>

                <Separator />

                {/* 2FA */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    Authentification à deux facteurs
                  </h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Application d&apos;authentification
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Non configurée
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Configurer</Button>
                  </div>
                </div>

                <Separator />

                {/* API Key */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Clé API</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={
                          showApiKey
                            ? "qr_sk_1234567890abcdef"
                            : "qr_sk_••••••••••••••••"
                        }
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Key className="mr-2 h-4 w-4" />
                        Régénérer
                      </Button>
                      <Button variant="outline" size="sm">
                        Copier
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Active Sessions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Sessions actives</h4>
                  <div className="space-y-3">
                    {sessions.map(session => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium">
                                {session.device}
                              </p>
                              {session.current && (
                                <Badge variant="default" className="text-xs">
                                  Actuelle
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {session.location} • {session.lastActive}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <Button variant="outline" size="sm">
                            Révoquer
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Préférences utilisateur */}
            <div id="preferences" className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de génération de contenu</CardTitle>
                  <CardDescription>
                    Personnalisez le ton, la langue, les formats de sortie, le
                    contexte et les réglages avancés pour la génération de vos
                    posts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserPreferencesForm />
                </CardContent>
              </Card>
            </div>

            {/* GitHub App Integration */}
            <div id="integrations">
              <GitHubAppSettings />
            </div>

            {/* Other Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Autres intégrations
                </CardTitle>
                <CardDescription>
                  Gérez vos intégrations avec d&apos;autres services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedAccounts.map(account => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {account.avatar ? (
                            <Image
                              src={account.avatar}
                              alt={account.name}
                              width={40}
                              height={40}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {account.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">
                              {account.name}
                            </p>
                            {account.connected && (
                              <Badge variant="default" className="text-xs">
                                Connecté
                              </Badge>
                            )}
                          </div>
                          {account.email && (
                            <p className="text-sm text-muted-foreground">
                              {account.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant={account.connected ? "destructive" : "default"}
                        size="sm"
                      >
                        {account.connected ? "Déconnecter" : "Connecter"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card id="data">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Données et confidentialité
                </CardTitle>
                <CardDescription>
                  Gérez vos données et paramètres de confidentialité.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        Exporter vos données
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Télécharger une copie de toutes vos données
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Exporter
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        Supprimer le compte
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supprimer définitivement votre compte et toutes vos
                        données
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
