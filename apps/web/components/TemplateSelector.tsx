"use client";
import { useGenerateContext } from "@/contexts/GenerateContext";

export default function TemplateSelector() {
  const { templates, templateId, selectTemplate, loading, error } =
    useGenerateContext();

  if (loading) return <div>Chargement des templates...</div>;
  if (error) return <div>Erreur lors du chargement</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => selectTemplate(t.id)}
          className={`border rounded p-2 text-left hover:bg-muted transition ${templateId === t.id ? 'border-primary shadow' : 'border-muted'}`}
        >
          <div className="font-medium">{t.name}</div>
          <div className="text-sm text-muted-foreground">{t.description}</div>
        </button>
      ))}
    </div>
  );
}
