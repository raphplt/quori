"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Clock,
  Lightbulb,
  Eye,
  TrendingUp,
  Zap,
  Sparkles,
  Share2,
  BarChart3,
} from "lucide-react";

export const ProblemSolutionSection: React.FC = () => {
  const problems = [
    {
      icon: Clock,
      title: "Manque de temps",
      description: "Créer du contenu prend des heures que vous n'avez pas",
    },
    {
      icon: Lightbulb,
      title: "Manque d'inspiration",
      description: "Difficile de savoir quoi partager et comment le présenter",
    },
    {
      icon: Eye,
      title: "Visibilité limitée",
      description: "Votre travail reste invisible dans votre repo GitHub",
    },
    {
      icon: TrendingUp,
      title: "Croissance stagnante",
      description: "Votre réseau professionnel n'évolue pas assez vite",
    },
  ];

  const solutions = [
    {
      icon: Zap,
      title: "Automatisation complète",
      description: "Vos commits deviennent du contenu en quelques secondes",
    },
    {
      icon: Sparkles,
      title: "IA créative",
      description:
        "Génération intelligente de posts engageants et personnalisés",
    },
    {
      icon: Share2,
      title: "Multi-plateformes",
      description: "Diffusion simultanée sur LinkedIn, Twitter, et plus",
    },
    {
      icon: BarChart3,
      title: "Analytics avancés",
      description:
        "Suivez l'impact de votre contenu et optimisez votre stratégie",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="w-full px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Target className="h-4 w-4 mr-2" />
              Le problème que nous résolvons
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-primary">
              Votre code mérite d'être vu
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Chaque jour, des milliers de développeurs créent du code
              incroyable. Mais combien partagent réellement leurs réalisations ?
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Problèmes actuels */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-8 text-primary">
                Les défis d'aujourd'hui
              </h3>
              <div className="space-y-6">
                {problems.map((problem, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                  >
                    <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <problem.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">
                        {problem.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notre solution */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-8 text-primary">
                Notre solution
              </h3>
              <div className="space-y-6">
                {solutions.map((solution, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <solution.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">
                        {solution.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
