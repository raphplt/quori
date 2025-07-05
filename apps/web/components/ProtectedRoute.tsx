"use client";

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  fallback 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si on n'est pas en train de charger et qu'il n'y a pas de session
    if (status !== "loading" && status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Affichage du loading
  if (status === "loading") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Chargement...</p>
          </div>
        </div>
      )
    );
  }

  // Si pas authentifié, ne rien afficher (la redirection est en cours)
  if (status === "unauthenticated") {
    return null;
  }

  // Si authentifié, afficher le contenu
  return <>{children}</>;
}
