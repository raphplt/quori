"use client";

import { User } from "@/type/user";
import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback 
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Fonction utilitaire pour les requêtes authentifiées
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalide, on le supprime
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualiser les données utilisateur
  const refreshUser = useCallback(async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur lors de l\'actualisation des données utilisateur:', error);
    }
  }, []);

  // Connexion
  const signIn = useCallback(() => {
    // Rediriger vers l'authentification GitHub via notre API
    window.location.href = `${API_BASE_URL}/auth/github`;
  }, []);

  // Déconnexion
  const signOut = useCallback(async () => {
    try {
      // Optionnel: appeler l'endpoint de déconnexion de l'API
      await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer le token et réinitialiser l'état
      localStorage.removeItem('authToken');
      setUser(null);
      
      // Rediriger vers la page d'accueil
      window.location.href = '/';
    }
  }, []);

  // Gérer le callback après authentification GitHub
  useEffect(() => {
    // Vérifier si on est sur la page de callback avec un token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Stocker le token
      localStorage.setItem('authToken', token);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Vérifier l'authentification avec le nouveau token
      checkAuth();
      
      return;
    }

    // Vérification normale de l'authentification
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshUser,
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
