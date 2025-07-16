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
    <section className="py-20 bg-background">
      <div className="w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Workflow className="h-4 w-4 mr-2" />
            Technologie avancée
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-primary">
            La magie derrière la simplicité
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Découvrez comment notre IA transforme votre code en contenu viral
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full relative">
                  <div className="absolute top-4 right-4 text-6xl font-black text-primary/10">
                    {phase.step}
                  </div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <phase.icon className="h-8 w-8 text-primary" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-primary">
                      {phase.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {phase.description}
                    </p>

                    <ul className="space-y-2">
                      {phase.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {detail}
                        </li>
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
            <h3 className="text-3xl font-bold mb-12 text-primary">
              Propulsé par les meilleures technologies
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {technologies.map((tech, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <tech.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{tech.name}</h4>
                  <p className="text-sm text-muted-foreground">{tech.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
