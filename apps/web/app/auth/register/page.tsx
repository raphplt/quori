"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GithubIcon } from "lucide-react";

const RegisterPage = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  React.useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Vous êtes déjà connecté. Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Inscription</h1>
          <p className="mt-2 text-gray-600">
            Créez votre compte Quori avec GitHub
          </p>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => signIn("github")}
            className="w-full flex items-center justify-center"
            size="lg"
          >
            <GithubIcon />
            S&apos;inscrire avec GitHub
          </Button>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium">Ce que Quori va faire :</h3>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Analyser vos commits Git</li>
              <li>Générer des publications LinkedIn engageantes</li>
              <li>Accéder à vos dépôts publics et privés</li>
            </ul>
          </div>

          <div className="text-center">
            En vous inscrivant, vous acceptez nos conditions d&apos;utilisation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
