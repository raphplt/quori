"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Rocket, Sparkles, Zap, ArrowRight } from "lucide-react";

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="w-full px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-8 px-8 py-3 text-lg font-semibold bg-primary text-white">
              <Rocket className="h-5 w-5 mr-3" />
              Rejoignez la révolution du dev content
              <Sparkles className="h-5 w-5 ml-3" />
            </Badge>

            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="block text-primary">Prêt à devenir</span>
              <span className="block text-primary font-extrabold">VIRAL ?</span>
            </h2>

            <p className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Rejoignez{" "}
              <span className="text-primary font-bold">
                10,000+ développeurs
              </span>{" "}
              qui transforment déjà leur code en influence.
              <br />
              <span className="text-lg">
                Votre prochain commit pourrait changer votre carrière.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16">
              <Button size="lg" className="px-12 py-6 text-2xl font-bold">
                <Zap className="mr-3 h-7 w-7" />
                Commencer MAINTENANT
                <ArrowRight className="ml-3 h-7 w-7" />
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Gratuit • Sans engagement • Résultats immédiats
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                    Setup en 2 min
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                    Aucune carte requise
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                    Support 24/7
                  </div>
                </div>
              </div>
            </div>

            {/* Urgence */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <p className="text-lg font-semibold mb-2">
                    🔥{" "}
                    <span className="text-primary">
                      Offre de lancement limitée
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Les 1000 premiers utilisateurs bénéficient de
                    fonctionnalités premium gratuites à vie
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">847</div>
                    <div className="text-xs text-muted-foreground">
                      Places restantes
                    </div>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">⏰</div>
                    <div className="text-xs text-muted-foreground">
                      Temps limité
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
