import React, { createContext, useContext, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/api-client";

interface OnboardingStatus {
  id: string;
  step: number;
  finished: boolean;
  startedAt?: string;
  completedAt?: string;
}

interface OnboardingContextType {
  onboardingStatus?: OnboardingStatus | null;
  loading: boolean;
  error: Error | null;
  currentStep: number;
  advanceStep: () => void;
  finishOnboarding: () => void;
  skipOnboarding: () => void;
  refetchOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["onboarding-status", userId];

  // Only call the query if userId is defined
  const shouldFetch = !!userId;

  const onboardingQuery = useQuery<OnboardingStatus | null, Error>({
    queryKey,
    queryFn: async () => {
      if (!shouldFetch) return null;
      const res = await authenticatedFetch(`/onboarding-status/${userId}`);
      if (!res.ok) throw new Error("Erreur récupération onboarding");
      const json = await res.json();
      if (
        !json ||
        typeof json !== "object" ||
        typeof json.step !== "number" ||
        typeof json.finished !== "boolean"
      )
        return null;
      return json as OnboardingStatus;
    },
    enabled: shouldFetch,
  });
  const onboardingStatus = onboardingQuery.data;
  const loading = onboardingQuery.isLoading;
  const error = onboardingQuery.error ?? null;

  const advanceMutation = useMutation<OnboardingStatus, Error, void>({
    mutationFn: async () => {
      if (!userId) throw new Error("No user");
      const nextStep = (onboardingStatus?.step || 0) + 1;
      const res = await authenticatedFetch(
        `/onboarding-status/${userId}/step`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: nextStep }),
        }
      );
      if (!res.ok) throw new Error("Erreur avancée onboarding");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const finishMutation = useMutation<OnboardingStatus, Error, void>({
    mutationFn: async () => {
      if (!userId) throw new Error("No user");
      const res = await authenticatedFetch(
        `/onboarding-status/${userId}/finish`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Erreur finalisation onboarding");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const skipMutation = useMutation<OnboardingStatus, Error, void>({
    mutationFn: async () => {
      if (!userId) throw new Error("No user");
      const res = await authenticatedFetch(
        `/onboarding-status/${userId}/skip`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Erreur skip onboarding");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const advanceStep = useCallback(
    () => advanceMutation.mutate(),
    [advanceMutation]
  );
  const finishOnboarding = useCallback(
    () => finishMutation.mutate(),
    [finishMutation]
  );
  const skipOnboarding = useCallback(
    () => skipMutation.mutate(),
    [skipMutation]
  );
  const refetchOnboarding = useCallback(
    () => onboardingQuery.refetch(),
    [onboardingQuery]
  );

  return (
    <OnboardingContext.Provider
      value={{
        onboardingStatus,
        loading,
        error,
        currentStep:
          onboardingStatus && typeof onboardingStatus.step === "number"
            ? onboardingStatus.step
            : 0,
        advanceStep,
        finishOnboarding,
        skipOnboarding,
        refetchOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
