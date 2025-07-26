"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeDebug() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    currentClass: 'N/A',
    localStorageValue: 'N/A'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateDebugInfo = () => {
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        setDebugInfo({
          currentClass: document.documentElement.className,
          localStorageValue: localStorage.getItem('theme') || 'N/A'
        });
      }
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 500);
    return () => clearInterval(interval);
  }, [mounted, theme, resolvedTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border p-3 rounded-lg text-xs z-50 shadow-lg max-w-xs">
      <div className="font-medium mb-2">Debug Thème</div>
      <div className="space-y-1">
        <div>Theme: {theme}</div>
        <div>Resolved: {resolvedTheme}</div>
        <div>Class: {debugInfo.currentClass}</div>
        <div>LocalStorage: {debugInfo.localStorageValue}</div>
      </div>
    </div>
  );
}