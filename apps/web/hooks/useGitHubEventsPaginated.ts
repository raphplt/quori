import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";
import { GitHubEvent } from "@/types/githubEvent";

export interface EventsPaginatedResponse {
  events: GitHubEvent[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UseGitHubEventsPaginatedReturn {
  data: EventsPaginatedResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useGitHubEventsPaginated(
  page: number = 1,
  limit: number = 10
): UseGitHubEventsPaginatedReturn {
  const { data: session } = useSession();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["events-paginated", page, limit],
    queryFn: () =>
      authenticatedFetcher<EventsPaginatedResponse>(
        `/github/events/paginated?page=${page}&limit=${limit}`
      ),
    enabled: !!session,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
