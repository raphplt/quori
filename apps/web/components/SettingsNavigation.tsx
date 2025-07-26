"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Settings2,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "preferences", label: "Préférences", icon: Settings2 },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "integrations", label: "Intégrations", icon: Globe },
  { id: "data", label: "Données", icon: Database },
];

interface SettingsNavigationProps {
  activeSection?: string;
}

export function SettingsNavigation({ activeSection }: SettingsNavigationProps) {
  const [currentSection, setCurrentSection] = useState(
    activeSection || "notifications"
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setCurrentSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="sticky top-24">
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-default-600 hover:bg-default-100 hover:text-default-900"
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
