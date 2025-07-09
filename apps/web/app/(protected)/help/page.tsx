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
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  Search,
  MessageCircle,
  BookOpen,
  Video,
  ExternalLink,
} from "lucide-react";

const HelpPage = () => {
  const faqItems = [
    {
      id: 1,
      question: "Comment connecter mon dépôt GitHub ?",
      answer:
        "Rendez-vous dans la section Dépôts, cliquez sur 'Ajouter un dépôt' et suivez les instructions pour autoriser l'accès.",
      category: "Configuration",
    },
    {
      id: 2,
      question: "Puis-je modifier un post après génération ?",
      answer:
        "Oui, tous les posts générés sont modifiables avant publication. Vous pouvez les éditer dans la section Brouillons.",
      category: "Posts",
    },
    {
      id: 3,
      question: "Comment fonctionne la planification automatique ?",
      answer:
        "La planification automatique analyse votre activité Git et génère des posts selon vos préférences de fréquence.",
      category: "Planification",
    },
    {
      id: 4,
      question: "Quels événements Git déclenchent la génération ?",
      answer:
        "Push, Pull Requests, Merges, et Releases peuvent déclencher la génération automatique selon votre configuration.",
      category: "Git",
    },
  ];

  const resources = [
    {
      id: 1,
      title: "Guide de démarrage",
      description: "Premiers pas avec Quori",
      type: "guide",
      url: "/docs/getting-started",
    },
    {
      id: 2,
      title: "Configuration des webhooks",
      description: "Tutoriel vidéo",
      type: "video",
      url: "/docs/webhooks",
    },
    {
      id: 3,
      title: "Meilleures pratiques LinkedIn",
      description: "Optimisez vos publications",
      type: "guide",
      url: "/docs/best-practices",
    },
    {
      id: 4,
      title: "API Documentation",
      description: "Intégrez Quori dans vos outils",
      type: "api",
      url: "/docs/api",
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "api":
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Aide & Support</h1>
          <p className="text-muted-foreground">
            Trouvez des réponses à vos questions et contactez notre équipe
          </p>
        </div>

        {/* Barre de recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Rechercher dans l&apos;aide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Recherchez une question, un tutoriel..."
                className="flex-1"
              />
              <Button>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                Questions fréquentes
              </CardTitle>
              <CardDescription>
                Les réponses aux questions les plus courantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqItems.map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{item.question}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ressources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Centre de documentation</CardTitle>
                <CardDescription>Guides et tutoriels détaillés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resources.map(resource => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        {getResourceIcon(resource.type)}
                        <div>
                          <h4 className="font-medium text-sm">
                            {resource.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contactez-nous
                </CardTitle>
                <CardDescription>
                  Notre équipe est là pour vous aider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ouvrir le chat support
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Ou envoyez-nous un email
                  </p>
                  <a
                    href="mailto:support@quori.dev"
                    className="text-sm text-primary hover:underline"
                  >
                    support@quori.dev
                  </a>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-2">
                    Horaires de support
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Lundi - Vendredi : 9h - 18h</p>
                    <p>Samedi : 10h - 16h</p>
                    <p>Dimanche : Fermé</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Liens rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Liens utiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Guide de démarrage
              </Button>
              <Button variant="outline" className="justify-start">
                <Video className="mr-2 h-4 w-4" />
                Tutoriels vidéo
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Communauté Discord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default HelpPage;
