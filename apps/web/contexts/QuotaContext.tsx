"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { useSession } from "next-auth/react";

interface Quota {
  used: number;
  remaining: number;
}

interface QuotaContextType {
  quota: Quota | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export function QuotaProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [quota, setQuota] = useState<Quota | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = async () => {
    setIsLoading(true);
    try {
      const data = await authenticatedFetcher<Quota>("/quota");
      setQuota(data);
      setError(null);
    } catch {
      setError("Impossible de récupérer le quota");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchQuota();
    }
  }, [session]);

  const value: QuotaContextType = {
    quota,
    isLoading,
    error,
    refresh: fetchQuota,
  };

  return <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>;
}

export function useQuota() {
  const ctx = useContext(QuotaContext);
  if (!ctx) throw new Error("useQuota must be used within a QuotaProvider");
  return ctx;
}
