"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Éviter le flash de contenu en appliquant le thème immédiatement
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system"
      | null;

    if (savedTheme) {
      if (savedTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(savedTheme);
      }
    } else {
      // Par défaut, utiliser le thème système
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    }
  }, [mounted]);

  // Éviter le rendu côté serveur pour éviter les problèmes d'hydratation
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
