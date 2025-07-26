"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Zap,
  Sparkles,
  Rocket,
  Users,
  TrendingUp,
  ChevronDown,
  Code,
  Globe,
  Target,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { ProofDemo } from "./ProofDemo";

interface HeroSectionProps {
  isVisible: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isVisible }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]); // Réduire de 150 à 100
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="hero"
      className="relative py-8 md:py-5 flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-chart-2/10 min-h-screen"
    >
      {/* Fond animé avec particules */}
      <div className="absolute inset-0">
        {/* Gradient animé de fond */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-3/10 animate-pulse" />

        {/* Grille de particules */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.6, 0.1],
                scale: [0.5, 1.2, 0.5],
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Cercles flottants */}
        <motion.div
          className="absolute top-20 left-20 w-24 h-24 bg-primary/5 rounded-full blur-xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-32 h-32 bg-chart-2/5 rounded-full blur-xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Effet de parallaxe sur le curseur */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          x: mousePosition.x * 0.005,
          y: mousePosition.y * 0.005,
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-chart-2/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Contenu Hero avec parallaxe */}
      <motion.div
        className="w-full px-4 relative z-10"
        style={{
          // Désactiver la parallaxe sur mobile
          y: typeof window !== "undefined" && window.innerWidth >= 768 ? y : 0,
          opacity,
        }}
      >
        <div className="text-center max-w-6xl mx-auto">
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {/* Badge amélioré avec animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  className="mb-6"
                >
                  <Badge className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-primary/15 to-chart-2/15 text-primary border-primary/25 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer">
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                      Convertissez vos commits en posts viraux
                    </span>
                    <Rocket className="h-4 w-4 ml-2 animate-bounce" />
                  </Badge>
                </motion.div>

                {/* Nouveau titre promesse explicite */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                >
                  <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent px-4">
                    Vos commits GitHub deviennent des posts LinkedIn viraux, en
                    1 clic.
                  </h1>
                </motion.div>

                {/* Sous-titre différenciant */}
                <motion.p
                  className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                >
                  <span className="text-foreground">
                    Un push Git ; un post LinkedIn déjà optimisé. Plus de temps
                    perdu à rédiger, plus d'excuse pour ne pas publier.
                  </span>
                  <br />
                  <span className="text-sm sm:text-base md:text-lg opacity-80">
                    +10 000 devs accélèrent leur personal brand avec Quori.
                  </span>
                </motion.p>

                {/* Preuve visuelle immédiate (ProofDemo) */}
                <motion.div
                  className="mb-8 flex justify-center px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <ProofDemo
                    src="/videos/Quori-demo.mp4"
                    poster="/demo/quori-demo-poster.png"
                    alt="Démo Quori : génération d'un post LinkedIn à partir d'un commit GitHub"
                  />
                </motion.div>

                {/* CTA inversés */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8 px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 text-lg font-medium border-2 border-primary/25 hover:border-primary/40 bg-background/80 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300"
                      onClick={() => setDemoOpen(true)}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Voir la démo
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <Button
                      size="lg"
                      onClick={() => signIn("github")}
                      className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    >
                      <Zap className="mr-2 h-5 w-5 animate-pulse" />
                      Commencer gratuitement
                    </Button>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-chart-2 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 -z-10" />
                  </motion.div>
                </motion.div>

                {/* Stats avec micro-légende */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7, duration: 0.6 }}
                >
                  {[
                    {
                      icon: Users,
                      number: "10K+",
                      label: "Développeurs actifs",
                      color: "from-primary to-chart-2",
                    },
                    {
                      icon: TrendingUp,
                      number: "500%",
                      label: "Engagement moyen",
                      color: "from-chart-2 to-chart-3",
                    },
                    {
                      icon: Rocket,
                      number: "1M+",
                      label: "Posts générés",
                      color: "from-chart-3 to-chart-4",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center group"
                      whileHover={{ scale: 1.03, y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.9 + index * 0.15, duration: 0.5 }}
                    >
                      <motion.div
                        className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <stat.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <motion.div
                        className="text-3xl font-bold mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 2.1 + index * 0.15,
                          duration: 0.4,
                          ease: "easeOut",
                        }}
                      >
                        <span
                          className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                        >
                          {stat.number}
                        </span>
                      </motion.div>
                      <div className="text-muted-foreground text-sm font-medium">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-3 mb-6 px-4">
                  Données 2024 / bêta fermée
                </div>

                {/* Emplacement logos social proof (à implémenter plus tard) */}
                {/* <div className="flex justify-center gap-4 mt-2 mb-8">LOGOS_COMMUNAUTÉS_ICI</div> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Scroll indicator amélioré */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center space-y-1">
          <ChevronDown className="h-6 w-6 text-primary/70 animate-pulse" />
          <span className="text-xs text-muted-foreground animate-pulse">
            Découvrir
          </span>
        </div>
      </motion.div>

      {/* Éléments décoratifs flottants */}
      <motion.div
        className="absolute top-1/4 right-8 text-primary/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Code className="h-12 w-12" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-8 text-chart-2/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <Globe className="h-10 w-10" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-1/4 text-chart-3/15"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Target className="h-6 w-6" />
      </motion.div>

      {/* Lightbox démo */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDemoOpen(false)}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="relative max-w-2xl w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <video
                src="/videos/Quori-demo.mp4"
                poster="/demo/quori-demo-poster.png"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-auto object-cover bg-black"
                aria-label="Démo Quori : génération d’un post LinkedIn à partir d’un commit GitHub"
              />
              <button
                className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                onClick={() => setDemoOpen(false)}
                aria-label="Fermer la démo"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
