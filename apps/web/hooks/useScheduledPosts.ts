import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetcher } from "@/hooks/useAuthenticatedQuery";

export interface ScheduledPost {
  id: string;
  post_id: number;
  scheduled_at: string;
  status: string;
}

export function useCreateScheduledPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { postId: number; scheduledAt: string }) =>
      authenticatedFetcher<ScheduledPost>("/scheduled-posts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useScheduledPosts(status?: string) {
  return useQuery({
    queryKey: ["scheduled-posts", status],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      return authenticatedFetcher<{ items: ScheduledPost[]; total: number }>(
        `/scheduled-posts?${params.toString()}`
      );
    },
  });
}

export function useUpdateScheduledPost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ scheduledAt: string; status: string }>) =>
      authenticatedFetcher<ScheduledPost>(`/scheduled-posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-posts"] }),
  });
}

export function useDeleteScheduledPost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      authenticatedFetcher(`/scheduled-posts/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-posts"] }),
  });
}
