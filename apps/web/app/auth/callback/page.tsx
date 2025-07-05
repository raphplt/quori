"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Encore en cours de chargement

    if (status === "authenticated" && session) {
      // Authentification réussie, rediriger vers le dashboard
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      // Authentification échouée, rediriger vers la page de connexion
      router.push("/auth/login?error=auth_failed");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Finalisation de l&apos;authentification...</p>
      </div>
    </div>
  );
}
