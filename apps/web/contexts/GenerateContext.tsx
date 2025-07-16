"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";

export interface TemplateInfo {
  id: number;
  name: string;
  description: string;
}

interface GenerateContextType {
  templateId: number | null;
  templates: TemplateInfo[];
  loading: boolean;
  error: Error | null;
  selectTemplate: (id: number) => void;
}

const GenerateContext = createContext<GenerateContextType | undefined>(undefined);

export function GenerateProvider({ children }: { children: ReactNode }) {
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authenticatedFetcher<TemplateInfo[]>("/templates");
        setTemplates(data);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectTemplate = (id: number) => setTemplateId(id);

  return (
    <GenerateContext.Provider
      value={{ templateId, templates, loading, error, selectTemplate }}
    >
      {children}
    </GenerateContext.Provider>
  );
}

export function useGenerateContext() {
  const ctx = useContext(GenerateContext);
  if (!ctx) throw new Error("useGenerateContext must be used within GenerateProvider");
  return ctx;
}
