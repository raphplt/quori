"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";

interface Quota {
  used: number;
  remaining: number;
}

interface QuotaContextType {
  quota: Quota | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export function QuotaProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const {
    data: quota,
    isLoading,
    error,
    refetch,
  }: UseQueryResult<Quota, Error> = useQuery({
    queryKey: ["quota"],
    queryFn: () => authenticatedFetcher<Quota>("/quota"),
    enabled: !!session,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const value: QuotaContextType = {
    quota,
    isLoading,
    error,
    refetch,
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
