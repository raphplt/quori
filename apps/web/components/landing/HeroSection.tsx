"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  Zap,
  Sparkles,
  Rocket,
  Users,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

interface HeroSectionProps {
  isVisible: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isVisible }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-2/5" />

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + i * 5}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Contenu Hero */}
      <div className="w-full px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Badge className="mb-8 px-6 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Révolutionnez votre présence dev
                    <Rocket className="h-4 w-4 ml-2" />
                  </Badge>
                </motion.div>

                {/* Titre principal */}
                <motion.h1
                  className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <span className="block text-primary">Transformez</span>
                  <span className="block text-primary">votre code en</span>
                  <span className="block text-primary font-extrabold">
                    INFLUENCE
                  </span>
                </motion.h1>

                {/* Sous-titre */}
                <motion.p
                  className="text-xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  De simples commits à du contenu viral.
                  <span className="text-primary font-semibold">
                    {" "}
                    Automatiquement.
                  </span>
                  <br />
                  Rejoignez les développeurs qui construisent leur marque
                  personnelle.
                </motion.p>

                {/* Boutons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Button
                    size="lg"
                    onClick={() => signIn("github")}
                    className="px-8 py-4 text-lg font-semibold"
                  >
                    Commencer gratuitement
                    <Zap className="mr-2 h-5 w-5" />
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 text-lg font-semibold"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Voir la démo
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  {[
                    {
                      icon: Users,
                      number: "10K+",
                      label: "Développeurs actifs",
                    },
                    {
                      icon: TrendingUp,
                      number: "500%",
                      label: "Engagement moyen",
                    },
                    { icon: Rocket, number: "1M+", label: "Posts générés" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <stat.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {stat.number}
                      </div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="h-8 w-8 text-primary/60" />
      </motion.div>
    </section>
  );
};
