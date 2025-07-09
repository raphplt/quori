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
import { Palette, Plus, Edit, Eye, Copy } from "lucide-react";

const TemplatesPage = () => {
  const templates = [
    {
      id: 1,
      name: "Nouvelle fonctionnalité",
      category: "Feature",
      description: "Template pour annoncer une nouvelle fonctionnalité",
      content:
        "🚀 Nouvelle fonctionnalité disponible !\n\n[Description de la fonctionnalité]\n\n💡 Pourquoi cette fonctionnalité ?\n[Explication du besoin]\n\n🔧 Comment l'utiliser ?\n[Instructions]\n\n#WebDev #Innovation",
      tone: "Professional",
      usage: 12,
    },
    {
      id: 2,
      name: "Bug fix",
      category: "Fix",
      description: "Template pour communiquer sur les corrections de bugs",
      content:
        "🐛 Bug résolu !\n\n[Description du problème]\n\n✅ Solution implémentée :\n[Explication de la solution]\n\n🔍 Apprentissages :\n[Ce que j'ai appris]\n\n#Debug #Development",
      tone: "Technical",
      usage: 8,
    },
    {
      id: 3,
      name: "Refactoring",
      category: "Improvement",
      description: "Template pour les améliorations de code",
      content:
        "♻️ Refactoring du jour !\n\n[Code avant/après]\n\n📈 Améliorations :\n• Performance\n• Lisibilité\n• Maintenabilité\n\n💭 Retour d'expérience :\n[Réflexions]\n\n#CleanCode #Refactoring",
      tone: "Educational",
      usage: 15,
    },
  ];

  const styles = [
    {
      id: 1,
      name: "Professionnel",
      description: "Ton formel et technique",
      active: true,
    },
    {
      id: 2,
      name: "Décontracté",
      description: "Ton amical et accessible",
      active: false,
    },
    {
      id: 3,
      name: "Éducatif",
      description: "Ton pédagogique et explicatif",
      active: true,
    },
  ];

  const getToneBadge = (tone: string) => {
    switch (tone) {
      case "Professional":
        return <Badge variant="default">Professionnel</Badge>;
      case "Technical":
        return <Badge variant="secondary">Technique</Badge>;
      case "Educational":
        return <Badge variant="outline">Éducatif</Badge>;
      default:
        return <Badge variant="secondary">{tone}</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates & Styles</h1>
            <p className="text-muted-foreground">
              Gérez vos modèles et styles de publication
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Bibliothèque de templates
                </CardTitle>
                <CardDescription>
                  Modèles réutilisables pour vos publications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.category}</Badge>
                          {getToneBadge(template.tone)}
                        </div>
                        <Badge variant="secondary">
                          {template.usage} utilisations
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>

                      <div className="bg-muted rounded-lg p-3 mb-3">
                        <pre className="text-sm whitespace-pre-wrap">
                          {template.content}
                        </pre>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Aperçu
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="mr-2 h-4 w-4" />
                          Dupliquer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Styles */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Styles de rédaction</CardTitle>
                <CardDescription>
                  Configurez le ton de vos publications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {styles.map(style => (
                  <div key={style.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{style.name}</h4>
                      <Badge variant={style.active ? "default" : "secondary"}>
                        {style.active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {style.description}
                    </p>
                    <Button
                      size="sm"
                      variant={style.active ? "outline" : "default"}
                      className="w-full"
                    >
                      {style.active ? "Désactiver" : "Activer"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Accroches populaires</CardTitle>
                <CardDescription>
                  Phrases d&apos;accroche les plus utilisées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "🚀 Nouvelle fonctionnalité disponible !",
                    "💡 Astuce du jour :",
                    "🔧 Comment j'ai résolu ce problème :",
                    "📈 Amélioration de performance :",
                    "🐛 Bug résolu !",
                  ].map((hook, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{hook}</span>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-3 w-3" />
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

export default TemplatesPage;
