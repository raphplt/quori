"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Github } from "lucide-react";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Vous êtes déjà connecté. Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow bg-secondary">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-default-900">Connexion</h1>
          <p className="mt-2 text-default-600">
            Connectez-vous avec votre compte GitHub pour accéder à Quori
          </p>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => signIn("github")}
            className="w-full flex items-center justify-center"
            size="lg"
          >
            <Github className="mr-2" />
            Se connecter avec GitHub
          </Button>
        </div>

        <div className="text-center text-sm text-default-600">
          En vous connectant, vous acceptez d&apos;autoriser Quori à accéder à
          vos dépôts GitHub pour analyser vos commits.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
