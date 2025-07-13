"use client";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useQuota } from "@/contexts/QuotaContext";

export default function QuotaBadge() {
  const { quota, isLoading, error } = useQuota();

  if (isLoading) {
    return <Spinner size="small" />;
  }

  if (error) {
    return (
      <Badge variant="destructive" title={error}>
        {error}
      </Badge>
    );
  }

  if (!quota) return null;

  return (
    <Badge variant="secondary">
      Quota utilisé : {quota.used}/5 — Restant : {quota.remaining}
    </Badge>
  );
}
