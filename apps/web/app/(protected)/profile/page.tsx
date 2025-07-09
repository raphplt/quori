"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSession, signOut } from "next-auth/react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Globe,
  Github,
  Mail,
  Calendar,
  Save,
  FileText,
  Shield,
} from "lucide-react";
import { useState } from "react";

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

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: false,
      postGenerated: true,
      postScheduled: true,
      weeklyReport: false,
      errorAlerts: true,
    },
    language: "fr",
    timezone: "Europe/Paris",
    posting: {
      autoGenerate: true,
      requireApproval: true,
      preferredStyle: "professionnel",
      maxPostsPerDay: 3,
    },
    privacy: {
      showProfile: true,
      showActivity: false,
    },
  });

  const [bio, setBio] = useState(
    "Développeur passionné qui transforme du code en contenu LinkedIn engageant."
  );
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return null;
  }

  const handleSave = () => {
    // Ici vous sauvegarderiez les préférences via votre API
    console.log("Sauvegarde des préférences:", preferences);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Profil personnel
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos informations et préférences
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? "Annuler" : "Modifier"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            )}
            <Button onClick={() => signOut()} variant="destructive" size="sm">
              Se déconnecter
            </Button>
          </div>
        </div>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </CardTitle>
            <CardDescription>
              Informations de base de votre profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={user.name}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username GitHub</Label>
                    <div className="flex items-center space-x-2">
                      <Github className="h-4 w-4 text-gray-500" />
                      <Input
                        id="username"
                        value={`@${user.username}`}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        value={user.email}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="member-since">Membre depuis</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Input
                        id="member-since"
                        value={new Date(user.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setBio(e.target.value)
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    rows={3}
                    placeholder="Parlez-nous de vous..."
                  />
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
          </CardContent>
        </Card>

        {/* Préférences de notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Préférences de notification</span>
            </CardTitle>
            <CardDescription>
              Gérez les notifications que vous souhaitez recevoir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des notifications importantes par email
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Post généré</Label>
                  <p className="text-sm text-muted-foreground">
                    Notification quand un nouveau post est généré
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.postGenerated}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        postGenerated: checked,
                      },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Post planifié</Label>
                  <p className="text-sm text-muted-foreground">
                    Notification avant la publication d&apos;un post
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.postScheduled}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        postScheduled: checked,
                      },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapport hebdomadaire</Label>
                  <p className="text-sm text-muted-foreground">
                    Résumé de votre activité chaque semaine
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.weeklyReport}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        weeklyReport: checked,
                      },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes d&apos;erreur</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications en cas de problème technique
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.errorAlerts}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        errorAlerts: checked,
                      },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Langue et fuseau horaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Langue et fuseau horaire</span>
            </CardTitle>
            <CardDescription>Paramètres de localisation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={preferences.language}
                  onValueChange={value =>
                    setPreferences(prev => ({ ...prev, language: value }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={value =>
                    setPreferences(prev => ({ ...prev, timezone: value }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Paris">
                      Europe/Paris (UTC+1)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      Europe/London (UTC+0)
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      America/New_York (UTC-5)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      America/Los_Angeles (UTC-8)
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">
                      Asia/Tokyo (UTC+9)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Préférences de publication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Préférences de publication</span>
            </CardTitle>
            <CardDescription>
              Configurez comment vos posts sont générés et publiés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Génération automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Générer automatiquement des posts à partir de vos commits
                </p>
              </div>
              <Switch
                checked={preferences.posting.autoGenerate}
                onCheckedChange={(checked: boolean) =>
                  setPreferences(prev => ({
                    ...prev,
                    posting: { ...prev.posting, autoGenerate: checked },
                  }))
                }
                disabled={!isEditing}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Approbation requise</Label>
                <p className="text-sm text-muted-foreground">
                  Approuver manuellement chaque post avant publication
                </p>
              </div>
              <Switch
                checked={preferences.posting.requireApproval}
                onCheckedChange={(checked: boolean) =>
                  setPreferences(prev => ({
                    ...prev,
                    posting: { ...prev.posting, requireApproval: checked },
                  }))
                }
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style">Style de rédaction préféré</Label>
                <Select
                  value={preferences.posting.preferredStyle}
                  onValueChange={value =>
                    setPreferences(prev => ({
                      ...prev,
                      posting: { ...prev.posting, preferredStyle: value },
                    }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professionnel">Professionnel</SelectItem>
                    <SelectItem value="decontracte">Décontracté</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="inspirant">Inspirant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPosts">Posts maximum par jour</Label>
                <Select
                  value={preferences.posting.maxPostsPerDay.toString()}
                  onValueChange={value =>
                    setPreferences(prev => ({
                      ...prev,
                      posting: {
                        ...prev.posting,
                        maxPostsPerDay: parseInt(value),
                      },
                    }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 post</SelectItem>
                    <SelectItem value="2">2 posts</SelectItem>
                    <SelectItem value="3">3 posts</SelectItem>
                    <SelectItem value="5">5 posts</SelectItem>
                    <SelectItem value="10">10 posts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Confidentialité</span>
            </CardTitle>
            <CardDescription>
              Contrôlez la visibilité de votre profil et activité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profil public</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux autres utilisateurs de voir votre profil
                </p>
              </div>
              <Switch
                checked={preferences.privacy.showProfile}
                onCheckedChange={(checked: boolean) =>
                  setPreferences(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showProfile: checked },
                  }))
                }
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activité publique</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre activité de publication dans les statistiques
                  globales
                </p>
              </div>
              <Switch
                checked={preferences.privacy.showActivity}
                onCheckedChange={(checked: boolean) =>
                  setPreferences(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showActivity: checked },
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
