"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authClient } from "../lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session au chargement
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser({
          id: session.data.user.id,
          name: session.data.user.name,
          email: session.data.user.email,
          avatarUrl: session.data.user.image || undefined,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = () => {
    // Rediriger vers GitHub via notre API
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/sign-in/github`;
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
