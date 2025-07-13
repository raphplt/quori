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
  GitCommit,
  Clock,
  FileText,
  TrendingUp,
  Calendar,
  Target,
  Eye,
  ArrowUpRight,
  Sparkles,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { GitHubAppAlert } from "@/components/GitHubAppAlert";
import ActivityPreview from "@/components/dashboard/ActivityPreview";

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

  if (!user) {
    return null;
  }

  // Mock data - dans un vrai projet, ces données viendraient de votre API
  const stats = {
    thisMonth: {
      posts: 12,
      engagement: 4.2,
      impressions: 8430,
      commits: 45,
    },
    total: {
      posts: 89,
      followers: 1240,
    },
  };

  const queuedPosts = [
    {
      id: 1,
      title: "Nouvelle fonctionnalité de notifications",
      status: "processing",
      repo: "quori",
      estimatedTime: "5 min",
    },
    {
      id: 2,
      title: "Correctifs d'authentification",
      status: "queued",
      repo: "api-service",
      estimatedTime: "En attente",
    },
  ];

  const upcomingPosts = [
    {
      id: 1,
      title: "Amélioration de l'UI du dashboard",
      scheduledFor: "2025-01-10T09:00:00Z",
      repo: "web-app",
    },
    {
      id: 2,
      title: "Optimisation des performances API",
      scheduledFor: "2025-01-11T14:30:00Z",
      repo: "api-service",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Posts ce mois-ci
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth.posts}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3</span> depuis la semaine
                dernière
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taux d&apos;engagement
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.thisMonth.engagement}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.4%</span> vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Impressions totales
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.thisMonth.impressions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Commits traités
              </CardTitle>
              <GitCommit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.thisMonth.commits}
              </div>
              <p className="text-xs text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>

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
                  {queuedPosts.map(post => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{post.title}</p>
                        <p className="text-xs text-gray-500">{post.repo}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            post.status === "processing"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {post.status === "processing"
                            ? "Traitement..."
                            : "En attente"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {post.estimatedTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {queuedPosts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun post en cours de génération
                  </p>
                )}
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
                  {upcomingPosts.map(post => (
                    <div key={post.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(post.scheduledFor).toLocaleDateString(
                            "fr-FR"
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.scheduledFor).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{post.title}</p>
                      <p className="text-xs text-gray-500">{post.repo}</p>
                    </div>
                  ))}
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
