"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, Share2 } from "lucide-react";

const steps = [
  {
    icon: GitBranch,
    title: "Connectez votre repo",
    description: "Liez votre repository GitHub en quelques clics",
  },
  {
    icon: Zap,
    title: "Poussez du code",
    description: "Continuez votre workflow habituel de développement",
  },
  {
    icon: Share2,
    title: "Publiez en 1 clic",
    description: "Récupérez votre contenu optimisé et publiez",
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Comment ça marche
            </h2>
            <p className="text-xl text-muted-foreground">
              Trois étapes simples pour transformer vos commits en posts
              LinkedIn
            </p>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Desktop: 3 cercles sur la même ligne horizontale */}
          <div className="hidden md:flex items-center justify-center gap-8 mb-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center flex-1 max-w-xs"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center text-white shadow-lg mb-6"
                >
                  <step.icon className="h-10 w-10" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mobile: vertical empilé */}
          <div className="md:hidden space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex items-center space-x-6"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0"
                >
                  <step.icon className="h-8 w-8" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Ligne de connexion desktop */}
          <div className="hidden md:block relative">
            <div className="absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
