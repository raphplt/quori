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
  Users,
  UserPlus,
  Settings,
  Mail,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Eye,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";

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

const Team = () => {
  return (
    <ProtectedRoute>
      <TeamContent />
    </ProtectedRoute>
  );
};

function TeamContent() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser;

  if (!user) {
    return null;
  }

  // Mock data
  const teamStats = {
    totalMembers: 5,
    activeMembers: 4,
    pendingInvitations: 2,
    totalRepositories: 12,
  };

  const teamMembers = [
    {
      id: "1",
      name: "Alice Martin",
      email: "alice@quori.com",
      role: "owner",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b0e0?w=100&h=100&fit=crop&crop=face",
      joinedAt: "2024-01-15",
      lastActive: "2025-07-11T14:30:00Z",
      repositories: 8,
      posts: 45,
      status: "active",
    },
    {
      id: "2",
      name: "Bob Johnson",
      email: "bob@quori.com",
      role: "admin",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      joinedAt: "2024-02-20",
      lastActive: "2025-07-11T10:15:00Z",
      repositories: 5,
      posts: 32,
      status: "active",
    },
    {
      id: "3",
      name: "Clara Dubois",
      email: "clara@quori.com",
      role: "member",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      joinedAt: "2024-03-10",
      lastActive: "2025-07-10T16:45:00Z",
      repositories: 3,
      posts: 18,
      status: "active",
    },
    {
      id: "4",
      name: "David Chen",
      email: "david@quori.com",
      role: "member",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      joinedAt: "2024-04-05",
      lastActive: "2025-07-08T09:20:00Z",
      repositories: 2,
      posts: 12,
      status: "inactive",
    },
    {
      id: "5",
      name: "Emma Wilson",
      email: "emma@quori.com",
      role: "member",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      joinedAt: "2024-05-15",
      lastActive: "2025-07-11T11:30:00Z",
      repositories: 1,
      posts: 8,
      status: "active",
    },
  ];

  const pendingInvitations = [
    {
      id: "1",
      email: "john@example.com",
      role: "member",
      invitedBy: "Alice Martin",
      invitedAt: "2025-07-09",
    },
    {
      id: "2",
      email: "sarah@example.com",
      role: "admin",
      invitedBy: "Alice Martin",
      invitedAt: "2025-07-08",
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge variant="default">Propriétaire</Badge>;
      case "admin":
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">Membre</Badge>;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Maintenant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Équipe</h1>
            <p className="text-gray-600 mt-1">
              Gérez les membres de votre équipe et leurs permissions.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres d&apos;équipe
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un membre
            </Button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Membres total
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                {teamStats.activeMembers} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Invitations en attente
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats.pendingInvitations}
              </div>
              <p className="text-xs text-muted-foreground">
                Envoyées cette semaine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dépôts partagés
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats.totalRepositories}
              </div>
              <p className="text-xs text-muted-foreground">
                Accessibles à l&apos;équipe
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Posts générés
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.reduce((total, member) => total + member.posts, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Membres de l&apos;équipe
                </CardTitle>
                <CardDescription>
                  {teamStats.totalMembers} membres • {teamStats.activeMembers}{" "}
                  actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          {getRoleIcon(member.role)}
                          {getRoleBadge(member.role)}
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>
                            Rejoint le{" "}
                            {new Date(member.joinedAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                          <span>•</span>
                          <span>{formatLastActive(member.lastActive)}</span>
                          <span>•</span>
                          <span>{member.repositories} dépôts</span>
                          <span>•</span>
                          <span>{member.posts} posts</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            member.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {member.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Invitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Invitations en attente
                </CardTitle>
                <CardDescription>
                  {pendingInvitations.length} invitations envoyées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingInvitations.map(invitation => (
                    <div key={invitation.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {invitation.email}
                        </p>
                        {getRoleBadge(invitation.role)}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Invité par {invitation.invitedBy}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(invitation.invitedAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Renvoyer
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {pendingInvitations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune invitation en attente
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inviter par email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Permissions par défaut
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="mr-2 h-4 w-4" />
                  Journaux d&apos;activité
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier l&apos;équipe
                </Button>
              </CardContent>
            </Card>

            {/* Team Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Niveaux d&apos;accès de votre équipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Propriétaire</p>
                    <p className="text-xs text-gray-500">Accès complet</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Administrateur</p>
                    <p className="text-xs text-gray-500">
                      Gestion équipe et settings
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Membre</p>
                    <p className="text-xs text-gray-500">
                      Accès aux projets assignés
                    </p>
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

export default Team;
