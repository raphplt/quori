/**
 * Hook personnalisé pour la génération de posts avec gestion d'état avancée
 *
 * Fonctionnalités :
 * - Mutation avec React Query pour la génération de posts
 * - Transformation des données d'événements GitHub en format requis par l'API
 * - Support des options de personnalisation (langue, ton, plateformes)
 * - Gestion d'erreurs et de succès intégrée
 * - Sauvegarde automatique des posts générés
 *
 * Usage dans ActivityFeed :
 * 1. L'utilisateur clique sur "Générer un post" dans une carte d'événement
 * 2. Le dialog s'ouvre avec les détails de l'événement
 * 3. L'utilisateur peut personnaliser les options et générer le contenu
 * 4. Le résultat est affiché avec options de copie et sauvegardé automatiquement
 *
 * API endpoint : POST /generate
 * - Authentification JWT requise
 * - Données d'événement + options de génération + paramètres de sauvegarde
 * - Retourne un résumé et un post formaté
 * - Sauvegarde automatiquement dans l'entité Post
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetcher } from "./useAuthenticatedQuery";
import { useQuota } from "@/contexts/QuotaContext";
import { GitHubEvent } from "@/types/githubEvent";

interface GeneratePostRequest {
  event: {
    title: string;
    desc: string;
    filesChanged: string[];
    diffStats: {
      filePath: string;
      additions: number;
      deletions: number;
      changes: number;
    }[];
    repoFullName: string;
    commitCount: number;
    timestamp: string;
  };
  options?: {
    lang?: string;
    tone?: string;
    output?: string[];
  };
  templateId?: number;
}

interface GeneratePostResponse {
  summary: string;
  post: string;
}

/**
 * Hook principal pour la génération de posts
 */
export function useGeneratePost() {
  const queryClient = useQueryClient();

  const { refetchQuota } = useQuota();

  return useMutation<
    GeneratePostResponse,
    Error,
    { request: GeneratePostRequest; event: GitHubEvent }
  >({
    mutationFn: async ({ request, event }) => {
      const params = new URLSearchParams();

      if (event.delivery_id) {
        params.append("eventDeliveryId", event.delivery_id);
      }

      const url = `/generate${params.toString() ? `?${params.toString()}` : ""}`;

      return authenticatedFetcher<GeneratePostResponse>(url, {
        method: "POST",
        body: JSON.stringify(request),
      });
    },
    onError: error => {
      console.error("Generate post error:", error);
    },
    onSuccess: data => {
      console.log("Generate post success:", data);

      queryClient.invalidateQueries({ queryKey: ["posts"] });

      queryClient.invalidateQueries({ queryKey: ["events"] });
      refetchQuota();
    },
  });
}

/**
 * Convertit un événement GitHub en requête de génération
 * Mappe les données du frontend vers le format attendu par l'API backend
 */
export function createGenerateRequestFromEvent(
  event: GitHubEvent
): GeneratePostRequest {
  const request = {
    event: {
      title: event.metadata?.title || event.event,
      desc:
        event.metadata?.desc ||
        `Événement ${event.event} sur ${event.repo_full_name}`,
      filesChanged: event.metadata?.filesChanged || [],
      diffStats: event.metadata?.diffStats?.map((stat, index) => ({
        filePath: event.metadata?.filesChanged?.[index] || `file-${index}`,
        additions: stat.additions,
        deletions: stat.deletions,
        changes: stat.changes,
      })) || [
        {
          filePath: "unknown",
          additions: 0,
          deletions: 0,
          changes: 0,
        },
      ],
      repoFullName: event.repo_full_name,
      commitCount: 1, // Valeur par défaut, pourrait être améliorée avec le nombre réel de commits
      timestamp: event.received_at,
    },
    options: {
      lang: "fr",
      tone: "professionnel",
      output: ["linkedin", "twitter"],
    },
  };

  console.log("Created request from event:", { event, request });
  return request;
}
