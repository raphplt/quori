"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Linkedin, X } from "lucide-react";
import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";
import { useState } from "react";

export function LinkedInAppAlert() {
  const { user } = useLinkedInStatus();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("linkedinAlertDismissed", "true");
  };

  const handleConnect = () => {
    const userId = user?.id;
    if (userId) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin?userId=${userId}`;
    }
  };

  if (
    user?.linkedInId ||
    dismissed ||
    localStorage.getItem("linkedinAlertDismissed")
  ) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
      <AlertDescription className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleDismiss} className="p-2 mr-2">
          <X className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <strong className="text-orange-800 dark:text-orange-200">
            LinkedIn non connecté
          </strong>
          <p className="text-orange-700 dark:text-orange-300 mt-1">
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
