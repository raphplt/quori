"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";

export function LinkedInAppAlert() {
  const { user } = useLinkedInStatus();

  const handleConnect = () => {
    const userId = user?.id;
    if (userId) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin?userId=${userId}`;
    }
  };

  if (user?.linkedInId) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Linkedin className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong className="text-orange-800">LinkedIn non connecté</strong>
          <p className="text-orange-700 mt-1">
            Pour utiliser Quori et analyser vos posts, vous devez connecter
            votre compte LinkedIn.
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button onClick={handleConnect} size="sm">
            <Linkedin className="mr-2 h-4 w-4" />
            Connecter LinkedIn
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
