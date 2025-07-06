"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, User, Mail, Calendar, GithubIcon } from "lucide-react";

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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser;

  if (!user) {
    return null;
  }

  // console.log("User:", user);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête du dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bienvenue, {user.name} !</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={() => signOut()} variant="destructive" size="sm">
              Se déconnecter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profil Utilisateur</span>
            </CardTitle>
            <CardDescription>
              Informations de votre compte GitHub connecté
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "User"}
                  width={50}
                  height={50}
                />

                <AvatarFallback>
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Nom complet</span>
                    </div>
                    <p className="text-gray-900">{user.name}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Github className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        Username GitHub
                      </span>
                    </div>
                    <p className="text-gray-900">@{user.username}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-gray-900">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Membre depuis</span>
                    </div>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">Statut</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      ✓ Connecté
                    </Badge>
                    <Badge variant="outline">GitHub ID: {user.githubId}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 mb-2">
              Installer la GitHub App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Installer
              <GithubIcon />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Dernière connexion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Maintenant</div>
              <p className="text-xs text-muted-foreground">Session active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Compte mis à jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(user.updatedAt).toLocaleDateString("fr-FR")}
              </div>
              <p className="text-xs text-muted-foreground">
                Dernière synchronisation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Type de compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GitHub</div>
              <p className="text-xs text-muted-foreground">OAuth connecté</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de session</CardTitle>
            <CardDescription>
              Détails techniques de votre session actuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID utilisateur:</span>
                <span className="font-mono">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GitHub ID:</span>
                <span className="font-mono">{user.githubId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token stocké:</span>
                <span className="text-green-600">✓ Présent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
