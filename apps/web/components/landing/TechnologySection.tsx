"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  Github,
  Cpu,
  Rocket,
  Database,
  Cloud,
  Shield,
  Palette,
  Zap,
  Sparkles,
  BarChart3,
} from "lucide-react";

export const TechnologySection: React.FC = () => {
  const phases = [
    {
      icon: Github,
      title: "Analyse intelligente",
      description:
        "Notre IA analyse vos commits, comprend le contexte, identifie les patterns et extrait les insights les plus pertinents.",
      features: [
        { icon: Zap, text: "Storytelling auto" },
        { icon: Sparkles, text: "Engagement boost" },
        { icon: BarChart3, text: "Analytics temps réel" },
      ],
    },
    {
      icon: Cpu,
      title: "Génération créative",
      description:
        "Transformation de vos données techniques en narratifs engageants adaptés à chaque plateforme sociale.",
      features: [
        { icon: Zap, text: "IA créative" },
        { icon: Sparkles, text: "Ton personnalisé" },
        { icon: BarChart3, text: "Hashtags optimisés" },
      ],
    },
    {
      icon: Rocket,
      title: "Diffusion optimisée",
      description:
        "Publication automatique au moment optimal avec suivi des performances et suggestions d'amélioration.",
      features: [
        { icon: Zap, text: "Timing optimal" },
        { icon: Sparkles, text: "A/B testing" },
        { icon: BarChart3, text: "Optimisation continue" },
      ],
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background via-primary/5 to-chart-2/5 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-48 h-48 bg-chart-2/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      <div className="w-full px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-primary/15 to-chart-2/15 text-primary border-primary/25 backdrop-blur-sm">
              <Workflow className="h-4 w-4 mr-2" />
              Technologie avancée
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
              La magie derrière la simplicité
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            Découvrez comment notre IA transforme votre code en contenu viral
          </motion.p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="p-8 h-full relative bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm">
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-16 h-16 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    >
                      <phase.icon className="h-8 w-8 text-primary" />
                    </motion.div>

                    <h3 className="text-xl md:text-2xl font-bold mb-4">
                      <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                        {phase.title}
                      </span>
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {phase.description}
                    </p>

                    {/* Features en icônes + 3 mots */}
                    <div className="flex flex-wrap gap-3">
                      {phase.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.8 + featureIndex * 0.1,
                            duration: 0.5,
                          }}
                          viewport={{ once: true }}
                          className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-sm text-primary font-medium"
                        >
                          <feature.icon className="h-4 w-4" />
                          {feature.text}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Message différenciant */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-block p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-chart-2/10 border border-primary/20 backdrop-blur-sm"
            >
              <Database className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  ML propriétaire → posts qui performent 5×
                </span>
              </h3>
              <p className="text-muted-foreground">
                Notre IA unique optimise chaque post pour maximiser l'engagement
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
