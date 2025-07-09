"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share,
} from "lucide-react";

const AnalyticsPage = () => {
  const stats = {
    totalPosts: 24,
    totalImpressions: 15420,
    totalEngagements: 892,
    avgEngagementRate: 5.8,
    thisMonth: {
      posts: 8,
      impressions: 4230,
      engagements: 267,
    },
  };

  const recentPosts = [
    {
      id: 1,
      title: "Nouvelle fonctionnalité d'authentification",
      publishedAt: "2025-01-06",
      impressions: 1250,
      likes: 45,
      comments: 12,
      shares: 8,
      engagementRate: 5.2,
    },
    {
      id: 2,
      title: "Amélioration de l'API GitHub",
      publishedAt: "2025-01-04",
      impressions: 890,
      likes: 32,
      comments: 7,
      shares: 4,
      engagementRate: 4.8,
    },
    {
      id: 3,
      title: "Refactoring du code TypeScript",
      publishedAt: "2025-01-02",
      impressions: 1560,
      likes: 67,
      comments: 18,
      shares: 12,
      engagementRate: 6.2,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Suivez les performances de vos publications LinkedIn
          </p>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Posts totaux
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonth.posts} ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalImpressions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonth.impressions.toLocaleString()} ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagements</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEngagements}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonth.engagements} ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taux d&apos;engagement
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgEngagementRate}%
              </div>
              <p className="text-xs text-muted-foreground">Moyenne générale</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance par post */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par post</CardTitle>
            <CardDescription>Détails des publications récentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map(post => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge
                      variant={
                        post.engagementRate > 5 ? "default" : "secondary"
                      }
                    >
                      {post.engagementRate}% engagement
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground mb-3">
                    Publié le{" "}
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR")}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {post.impressions.toLocaleString()} vues
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{post.likes} likes</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {post.comments} commentaires
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Share className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{post.shares} partages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;
