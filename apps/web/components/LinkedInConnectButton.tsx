"use client";

import { Button } from "@/components/ui/button";
import { authenticatedFetch } from "@/lib/api-client";
import { useSession } from "next-auth/react";

export function LinkedInConnectButton({ connected }: { connected?: boolean }) {
  const { data: session } = useSession();
  const user = session?.user;

  const handleConnect = () => {
    const userId = user?.id;
    if (userId) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin?userId=${userId}`;
    }
  };

  const handleDisconnect = async () => {
    try {
      await authenticatedFetch("/auth/linkedin/disconnect", {
        method: "POST",
      });
      // Recharger la page pour mettre à jour l'état
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la déconnexion LinkedIn:", error);
    }
  };

  return (
    <Button
      variant={connected ? "destructive" : "default"}
      size="sm"
      onClick={connected ? handleDisconnect : handleConnect}
    >
      {connected ? "Déconnecter" : "Connecter"}
    </Button>
  );
}
