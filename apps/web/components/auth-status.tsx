"use client";

import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";
import Image from "next/image";

export function AuthStatus() {
  const { user, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {user.avatarUrl && (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium">
            Connecté en tant que {user.name}
          </span>
        </div>
        <Button onClick={signOut} variant="outline" size="sm">
          Se déconnecter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Non connecté</span>
      <Button onClick={signIn} size="sm">
        Se connecter avec GitHub
      </Button>
    </div>
  );
}
