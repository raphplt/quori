"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Workflow,
  Github,
  Cpu,
  Rocket,
  Database,
  Cloud,
  Shield,
  Palette,
} from "lucide-react";

export const TechnologySection: React.FC = () => {
  const phases = [
    {
      step: "01",
      icon: Github,
      title: "Analyse intelligente",
      description:
        "Notre IA analyse vos commits, comprend le contexte, identifie les patterns et extrait les insights les plus pertinents.",
      details: [
        "Analyse sémantique du code",
        "Détection des fonctionnalités clés",
        "Évaluation de l'impact technique",
        "Identification des bonnes pratiques",
      ],
    },
    {
      step: "02",
      icon: Cpu,
      title: "Génération créative",
      description:
        "Transformation de vos données techniques en narratifs engageants adaptés à chaque plateforme sociale.",
      details: [
        "Storytelling automatique",
        "Adaptation au ton de voix",
        "Optimisation pour l'engagement",
        "Génération de hashtags pertinents",
      ],
    },
    {
      step: "03",
      icon: Rocket,
      title: "Diffusion optimisée",
      description:
        "Publication automatique au moment optimal avec suivi des performances et suggestions d'amélioration.",
      details: [
        "Timing optimal basé sur l'audience",
        "A/B testing automatique",
        "Analytics en temps réel",
        "Optimisation continue",
      ],
    },
  ];

  const technologies = [
    { icon: Database, name: "Machine Learning", desc: "Modèles avancés" },
    { icon: Cloud, name: "Cloud Native", desc: "Infrastructure scalable" },
    { icon: Shield, name: "Sécurité", desc: "Données protégées" },
    { icon: Palette, name: "Design IA", desc: "Visuels automatiques" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-chart-2/5 relative overflow-hidden">
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
          className="text-center mb-16"
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
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
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
                  <motion.div
                    className="absolute top-4 right-4 text-5xl font-black text-primary/10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {phase.step}
                  </motion.div>

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

                    <ul className="space-y-3">
                      {phase.details.map((detail, detailIndex) => (
                        <motion.li
                          key={detailIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.8 + detailIndex * 0.1,
                            duration: 0.5,
                          }}
                          viewport={{ once: true }}
                          className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Technologies */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-12"
            >
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Propulsé par les meilleures technologies
              </span>
            </motion.h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300"
                  >
                    <tech.icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h4 className="font-semibold mb-2 text-foreground">
                    {tech.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
