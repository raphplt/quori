"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Github,
  Mail,
  Calendar,
  Save,
  GitCommit,
  FileText,
  TrendingUp,
  MapPin,
  Link as LinkIcon,
  Edit,
  Settings,
  BarChart3,
  Activity,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import QuotaRate from "@/components/profile/QuotaRate";

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

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}

function Profile() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser;

  const [bio, setBio] = useState(
    "Développeur passionné qui transforme du code en contenu LinkedIn engageant. Spécialisé en React, TypeScript et Node.js."
  );
  const [location, setLocation] = useState("Paris, France");
  const [website, setWebsite] = useState("https://github.com/johndoe");
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return null;
  }

  // Mock data pour les statistiques du profil
  const profileStats = {
    totalPosts: 89,
    totalCommits: 245,
    followersGrowth: 12.5,
    engagementRate: 4.2,
    joinedDate: user.createdAt,
    lastActiveDate: "2025-07-11T14:30:00Z",
  };

  const recentActivity = [
    {
      id: 1,
      type: "post",
      title: "Nouvelle fonctionnalité de notifications",
      engagement: 45,
      date: "2025-07-10",
      platform: "LinkedIn",
    },
    {
      id: 2,
      type: "commit",
      title: "feat: add user preferences for notifications",
      repo: "quori",
      date: "2025-07-10",
      platform: "GitHub",
    },
    {
      id: 3,
      type: "post",
      title: "Optimisation des performances API",
      engagement: 32,
      date: "2025-07-09",
      platform: "LinkedIn",
    },
  ];

  const topRepositories = [
    {
      name: "quori",
      description:
        "Générateur automatique de posts LinkedIn à partir de commits Git",
      language: "TypeScript",
      stars: 127,
      posts: 23,
    },
    {
      name: "api-service",
      description:
        "API REST pour la gestion des utilisateurs et authentification",
      language: "Node.js",
      stars: 45,
      posts: 12,
    },
    {
      name: "web-app",
      description: "Interface utilisateur moderne avec React et Next.js",
      language: "React",
      stars: 89,
      posts: 18,
    },
  ];

  const handleSave = () => {
    // Ici vous sauvegarderiez les informations de profil via votre API
    console.log("Sauvegarde du profil:", { bio, location, website });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
            <p className="text-gray-600 mt-1">
              Votre profil public et vos statistiques
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </Button>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Annuler" : "Modifier"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Vos informations de profil public
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={user.image || user.avatarUrl || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback className="text-xl">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <p className="text-gray-600">@{user.username}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Localisation</Label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {isEditing ? (
                            <Input
                              value={location}
                              onChange={e => setLocation(e.target.value)}
                              placeholder="Votre localisation"
                              className="text-sm"
                            />
                          ) : (
                            <span className="text-sm">{location}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <div className="flex items-center space-x-2">
                          <Github className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            github.com/{user.username}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Site web</Label>
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4 text-gray-500" />
                          {isEditing ? (
                            <Input
                              value={website}
                              onChange={e => setWebsite(e.target.value)}
                              placeholder="https://yourwebsite.com"
                              className="text-sm"
                            />
                          ) : (
                            <a
                              href={website}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {website}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          rows={3}
                          placeholder="Parlez-nous de vous..."
                        />
                      ) : (
                        <p className="text-gray-700">{bio}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <Activity className="mr-1 h-3 w-3" />
                        Actif
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-4 w-4" />
                        Membre depuis{" "}
                        {new Date(profileStats.joinedDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Activité récente
                </CardTitle>
                <CardDescription>
                  Vos dernières publications et commits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-3 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {activity.type === "post" ? (
                          <FileText className="h-5 w-5 text-blue-500" />
                        ) : (
                          <GitCommit className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{activity.platform}</span>
                          <span>•</span>
                          <span>
                            {new Date(activity.date).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                          {activity.engagement && (
                            <>
                              <span>•</span>
                              <span>{activity.engagement} interactions</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quotas */}
            <QuotaRate />

            {/* Dépôts principaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Github className="mr-2 h-5 w-5" />
                  Dépôts principaux
                </CardTitle>
                <CardDescription>Vos projets les plus actifs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRepositories.map(repo => (
                    <div
                      key={repo.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{repo.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {repo.language}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {repo.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>⭐ {repo.stars}</span>
                          <span>📝 {repo.posts} posts générés</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Statistiques */}
          <div className="space-y-6">
            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Statistiques
                </CardTitle>
                <CardDescription>Aperçu de votre activité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Posts publiés</span>
                    <span className="text-lg font-bold">
                      {profileStats.totalPosts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Commits traités</span>
                    <span className="text-lg font-bold">
                      {profileStats.totalCommits}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Taux d&apos;engagement
                    </span>
                    <span className="text-lg font-bold">
                      {profileStats.engagementRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Croissance</span>
                    <span className="text-lg font-bold text-green-600">
                      +{profileStats.followersGrowth}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Dernière activité :{" "}
                    {new Date(profileStats.lastActiveDate).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
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
                  <Link href="/posts">
                    <FileText className="mr-2 h-4 w-4" />
                    Mes posts
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/repositories">
                    <Github className="mr-2 h-4 w-4" />
                    Mes dépôts
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Badge de profil */}
            <Card>
              <CardHeader>
                <CardTitle>Badge de profil</CardTitle>
                <CardDescription>Partagez votre profil Quori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarImage
                        src={user.image || user.avatarUrl}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-xs text-gray-600">Quori Creator</p>
                    <div className="mt-2 text-xs">
                      {profileStats.totalPosts} posts •{" "}
                      {profileStats.totalCommits} commits
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Copier le lien du profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
