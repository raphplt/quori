"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Zap,
  Calendar,
  Play,
} from "lucide-react";

const features = [
  {
    icon: <GitBranch className="h-6 w-6" />,
    title: "Instant Git parsing",
    description:
      "Push → Résumé + post automatiquement généré depuis vos commits",
    snippet:
      "🚀 Just shipped a new feature: real-time data synchronization with WebSocket support. This commit adds 3x faster updates and reduces server load by 40%. #WebDev #Performance #RealTime",
    status: "live",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "IA sur‑mesure",
    description:
      "Ton pro, léger humour, prêt à publier directement sur LinkedIn",
    snippet:
      "💡 Pro tip: Always validate your data at the boundaries! This refactor caught 15+ edge cases we missed before. Clean code = fewer bugs = happier users. #CleanCode #BestPractices",
    status: "beta",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Planification & Analytics",
    description: "Programmez vos posts et suivez l'impact de votre contenu",
    snippet:
      "📊 Analytics update: Our new dashboard feature is live! 2.5k+ views in the first week, 300% increase in user engagement. Data-driven decisions FTW! #Analytics #Productivity",
    status: "coming",
  },
];

export const FeaturesSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + features.length) % features.length);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        );
      case "beta":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Beta
          </Badge>
        );
      case "coming":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            À venir
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <section id="features" className="py-16 bg-muted/30">
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Fonctionnalités puissantes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour transformer votre code en
              contenu engageant
            </p>
          </motion.div>
        </div>

        {/* Slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Navigation buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 border border-primary/20"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 border border-primary/20"
            >
              <ChevronRight className="h-6 w-6 text-primary" />
            </button>

            {/* Slides */}
            <div className="relative overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-xl border border-primary/20"
                >
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Feature info */}
                    <div className="p-8 lg:p-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {features[currentSlide].icon}
                        </div>
                        {getStatusBadge(features[currentSlide].status)}
                      </div>

                      <h3 className="text-2xl font-bold mb-4 text-foreground">
                        {features[currentSlide].title}
                      </h3>
                      <p className="text-muted-foreground mb-8 leading-relaxed">
                        {features[currentSlide].description}
                      </p>

                      {/* GIF/Video placeholder */}
                      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-chart-2/10 border border-primary/20">
                        <div className="aspect-video flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">
                              Démo {features[currentSlide].title}
                            </p>
                            <p className="text-sm text-muted-foreground/70">
                              GIF/Video à ajouter
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Generated post snippet */}
                    <div className="p-8 lg:p-12 bg-gradient-to-br from-primary/5 to-chart-2/5 border-l border-primary/20">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">
                        Post généré
                      </h4>
                      <div className="bg-white rounded-xl p-6 shadow-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {features[currentSlide].snippet}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>💬 24</span>
                            <span>👍 156</span>
                            <span>🔄 12</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Il y a 2h
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-primary scale-125"
                      : "bg-primary/30 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
