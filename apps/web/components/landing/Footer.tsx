"use client";

import React from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="py-16 border-t">
      <div className="w-full px-4">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-6 mb-8">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="h-6 w-6" />
            </a>
          </div>

          <p className="text-muted-foreground mb-4">
            Transformez votre code en influence. Construisez votre marque de
            développeur.
          </p>

          <p className="text-sm text-muted-foreground">
            © 2024 Quori. Fait avec ❤️ pour la communauté dev.
          </p>
        </div>
      </div>
    </footer>
  );
};
