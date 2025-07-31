"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useQuotaSSE } from "@/hooks/useQuotaSSE";

interface Quota {
  used: number;
  remaining: number;
}

interface QuotaContextType {
  quota: Quota | undefined;
  isLoading: boolean;
  error: Error | null;
  refetchQuota: () => void;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export function QuotaProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { quota, isConnected, error } = useQuotaSSE();

  const refetchQuota = () => {
    // Avec SSE, pas besoin de refetch manuel
    // Les données sont mises à jour automatiquement
  };

  const value: QuotaContextType = {
    quota,
    isLoading: !isConnected && !error,
    error,
    refetchQuota,
  };

  return (
    <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>
  );
}

export function useQuota() {
  const ctx = useContext(QuotaContext);
  if (!ctx) throw new Error("useQuota must be used within a QuotaProvider");
  return ctx;
}
