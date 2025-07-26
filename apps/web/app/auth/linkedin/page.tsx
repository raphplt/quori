"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LinkedInCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const status = params.get("status");
    const token = params.get("token");
    if (status === "success" && token) {
      localStorage.setItem("linkedin_token", token);
      router.push("/settings");
    } else {
      router.push("/settings?linkedin=error");
    }
  }, [params, router]);

  return <p>Connexion LinkedIn...</p>;
}

export default function LinkedInCallbackPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <LinkedInCallbackContent />
    </Suspense>
  );
}
