"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorPageContent />
    </Suspense>
  );
}

function ErrorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const error = searchParams?.get('error');
    
    switch (error) {
      case 'auth_failed':
        setErrorMessage("L'authentification a échoué. Veuillez réessayer.");
        break;
      case 'no_token':
        setErrorMessage("Aucun token d'authentification reçu.");
        break;
      case 'access_denied':
        setErrorMessage("Accès refusé. Vous avez annulé l'authentification.");
        break;
      default:
        setErrorMessage("Une erreur d'authentification s'est produite.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Erreur d&apos;authentification
          </h1>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Réessayer la connexion
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
