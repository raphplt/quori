"use client";

import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Récupérer le thème depuis localStorage
    try {
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme") as Theme;
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
          setTheme(savedTheme);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du thème:", error);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    try {
      if (typeof window !== "undefined") {
        const root = window.document.documentElement;

        // Supprimer les classes existantes
        root.classList.remove("light", "dark");

        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
          setResolvedTheme(systemTheme);
        } else {
          root.classList.add(theme);
          setResolvedTheme(theme);
        }

        // Sauvegarder dans localStorage
        localStorage.setItem("theme", theme);
        console.log(
          "Thème sauvegardé:",
          theme,
          "Classe appliquée:",
          root.className
        ); // Debug
      }
    } catch (error) {
      console.error("Erreur lors de l'application du thème:", error);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.classList.add(systemTheme);
        setResolvedTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}
