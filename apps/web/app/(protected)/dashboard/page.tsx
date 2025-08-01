"use client";

import React from "react";
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
import {
  BarChart3,
  Clock,
  FileText,
  Calendar,
  Target,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { GitHubAppAlert } from "@/components/dashboard/GitHubAppAlert";
import ActivityPreview from "@/components/dashboard/ActivityPreview";
import { usePostsStatsSSE } from "@/hooks/usePostsStatsSSE";
import { LinkedInAppAlert } from "@/components/dashboard/LinkedinAppAlert";
import KpisCards from "@/components/dashboard/KpisCards";

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

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

function DashboardContent() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser;

  const {
    postsByStatus,
    isConnected: postsConnected,
    error: postsError,
  } = usePostsStatsSSE();

  if (!user) {
    return null;
  }

  const queuedPosts = postsByStatus
    ? [...postsByStatus.drafts, ...postsByStatus.ready]
    : [];
  const upcomingPosts = postsByStatus ? postsByStatus.scheduled : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-default-900">Dashboard</h1>
            <p className="text-default-600 mt-1">
              Bienvenue, {user.name} ! Voici un aperçu de votre activité.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button asChild variant="outline">
              <Link href="/posts/drafts">
                <FileText className="mr-2 h-4 w-4" />
                Brouillons
              </Link>
            </Button>
            <Button asChild>
              <Link href="/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau post
              </Link>
            </Button>
          </div>
        </div>

        {/* GitHub App Alert */}
        <GitHubAppAlert />
        <LinkedInAppAlert />

        {/* KPI Cards */}
        <KpisCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activité Git récente */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityPreview />

            {/* Files d'attente de posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Files d&apos;attente de posts
                </CardTitle>
                <CardDescription>Posts en cours de génération</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!postsConnected && !postsError ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Chargement des posts...
                    </p>
                  ) : postsError ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Impossible de charger les posts. Veuillez réessayer.
                    </p>
                  ) : queuedPosts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucun post en cours de génération
                    </p>
                  ) : (
                    queuedPosts.map(post => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{post.summary}</p>
                          <p className="text-xs text-gray-500">
                            {post.installation?.account_login || ""}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              post.status === "ready" ? "default" : "secondary"
                            }
                          >
                            {post.status === "ready"
                              ? "Prêt à publier"
                              : "Brouillon"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {/* Pas d'estimation réelle, champ à adapter si besoin */}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Posts planifiés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Prochains posts
                </CardTitle>
                <CardDescription>Publications planifiées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!postsConnected && !postsError ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Chargement des posts planifiés...
                    </p>
                  ) : postsError ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Impossible de charger les posts planifiés. Veuillez
                      réessayer.
                    </p>
                  ) : upcomingPosts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucun post planifié
                    </p>
                  ) : (
                    upcomingPosts.map(post => (
                      <div key={post.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleDateString(
                                  "fr-FR"
                                )
                              : ""}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleTimeString(
                                  "fr-FR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{post.summary}</p>
                        <p className="text-xs text-gray-500">
                          {post.installation?.account_login || ""}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/calendar">
                      Voir le calendrier
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Voir les analytics
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/templates">
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les templates
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/settings">
                    <Target className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
