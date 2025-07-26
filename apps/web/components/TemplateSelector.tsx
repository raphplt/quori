"use client";
import { useGenerateContext } from "@/contexts/GenerateContext";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

export default function TemplateSelector() {
  const { templates, templateId, selectTemplate, loading, error } =
    useGenerateContext();

  if (loading) return <div>Chargement des templates...</div>;
  if (error) return <div>Erreur lors du chargement</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {templates.map(t => (
        <Card
          key={t.id}
          onClick={() => selectTemplate(t.id)}
          className={cn(
            " hover:bg-muted transition",
            templateId === t.id ? "border-primary shadow" : "border-muted"
          )}
        >
          <CardContent>
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-muted-foreground">{t.description}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
