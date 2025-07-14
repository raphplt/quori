import { useCallback } from "react";
import { useAuthenticatedQuery } from "./useAuthenticatedQuery";
import { authenticatedFetch } from "@/lib/api-client";
import { useSession } from "next-auth/react";

export type UserPreferences = {
  userId: string;
  favoriteTone: string;
  customContext?: string;
  preferredLanguage?: string;
  defaultOutputs?: string[];
  hashtagPreferences?: string[];
  modelSettings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

export function useUserPreferences() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useAuthenticatedQuery<UserPreferences | null>(
    ["user-preferences", userId],
    userId ? `/preferences/${userId}` : "",
    undefined,
    {
      enabled: !!userId,
      retry: false,
      select: data => data,
    }
  );

  // Si erreur 404, considérer comme pas de préférences (null)
  const safePreferences =
    error && String(error).includes("404") ? null : preferences;

  // Créer ou mettre à jour les préférences
  const savePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      if (!userId) throw new Error("User not authenticated");
      const method = safePreferences ? "PATCH" : "POST";
      const url = safePreferences ? `/preferences/${userId}` : "/preferences";
      const body = JSON.stringify({ ...prefs, userId });
      const res = await authenticatedFetch(url, {
        method,
        body,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la sauvegarde des préférences");
      }
      await refetch();
      return res.json();
    },
    [userId, safePreferences, refetch]
  );

  return {
    preferences: safePreferences,
    isLoading,
    error: error && !String(error).includes("404") ? error : null,
    savePreferences,
  };
}
