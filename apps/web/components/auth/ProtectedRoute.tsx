"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  // Affichage du loader pendant le chargement
  if (status === "loading") {
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vérification de l&apos;authentification...
            </h2>
            <p className="text-gray-600">Veuillez patienter.</p>
          </div>
        </div>
      )
    );
  }

  // Si pas authentifié, on ne rend rien (la redirection se fait via useEffect)
  if (status !== "authenticated") {
    return null;
  }

  // Si authentifié, on rend les enfants
  return <>{children}</>;
}
