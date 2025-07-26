"use client";

import { Button } from "@/components/ui/button";

export function LinkedInConnectButton({ connected }: { connected?: boolean }) {
  const handleConnect = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin`;
  };
  return (
    <Button
      variant={connected ? "destructive" : "default"}
      size="sm"
      onClick={!connected ? handleConnect : undefined}
    >
      {connected ? "Déconnecter" : "Connecter"}
    </Button>
  );
}
