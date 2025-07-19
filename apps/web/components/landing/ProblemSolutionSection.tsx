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
    <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-primary/5 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 bg-chart-2/5 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="w-full px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-primary/15 to-chart-2/15 text-primary border-primary/25 backdrop-blur-sm">
                <Target className="h-4 w-4 mr-2" />
                Le problème que nous résolvons
              </Badge>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                Votre code mérite d'être vu
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            >
              Chaque jour, des milliers de développeurs créent du code
              incroyable. Mais combien partagent réellement leurs réalisations ?
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Problèmes actuels */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold mb-8"
              >
                <span className="bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
                  Les défis d'aujourd'hui
                </span>
              </motion.h3>
              <div className="space-y-6">
                {problems.map((problem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-r from-destructive/5 to-orange-500/5 border border-destructive/20 hover:border-destructive/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-gradient-to-br from-destructive/10 to-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                    >
                      <problem.icon className="h-6 w-6 text-destructive" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2 text-foreground">
                        {problem.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </motion.div>
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
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold mb-8"
              >
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  Notre solution
                </span>
              </motion.h3>
              <div className="space-y-6">
                {solutions.map((solution, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-chart-2/5 border border-primary/20 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                    >
                      <solution.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2 text-foreground">
                        {solution.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {solution.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
