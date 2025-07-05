"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si on a un token dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('Erreur d\'authentification:', error);
      router.push('/auth/login?error=auth_failed');
      return;
    }

    if (token) {
      // Stocker le token
      localStorage.setItem('authToken', token);
      
      // Rediriger vers le dashboard
      router.push('/dashboard');
    } else {
      // Pas de token, rediriger vers la page de connexion
      router.push('/auth/login?error=no_token');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Finalisation de la connexion...
        </h2>
        <p className="text-gray-600">
          Veuillez patienter pendant que nous finalisons votre connexion.
        </p>
      </div>
    </div>
  );
}
