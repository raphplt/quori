"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Crown, Users } from "lucide-react";
import { signIn } from "next-auth/react";

const pricingTiers = [
  {
    name: "Free",
    price: "0€",
    description: "Pour commencer",
    features: [
      "5 posts AI/mois",
      "1 repository",
      "Support communautaire",
      "Sans CB",
    ],
    buttonText: "Commencer gratuitement",
    icon: Zap,
    popular: false,
  },
  {
    name: "Pro",
    price: "19€",
    description: "Pour les développeurs actifs",
    features: [
      "Posts illimités",
      "5 repositories",
      "Analytics avancées",
      "Support prioritaire",
      "Planification automatique",
    ],
    buttonText: "Essayer Pro",
    icon: Crown,
    popular: true,
  },
  {
    name: "Team",
    price: "Sur devis",
    description: "Pour les équipes",
    features: [
      "Tout de Pro",
      "Repositories illimités",
      "Collaboration équipe",
      "API access",
      "Déploiement dédié",
    ],
    buttonText: "Contacter l'équipe",
    icon: Users,
    popular: false,
  },
];

export const PricingSection: React.FC = () => {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <section id="pricing" className="py-16 bg-muted/30">
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500/15 to-red-500/15 text-orange-600 border-orange-500/25">
              ⚡ Tarifs pré-bêta -50%
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-muted-foreground">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </motion.div>
        </div>

        <AnimatePresence>
          {!showPricing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <Card className="p-12 bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
                <Crown className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Découvrez nos tarifs
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Accédez à nos plans tarifaires et choisissez celui qui vous
                  convient le mieux. Tarifs pré-bêta avec réduction de 50% pour
                  les premiers utilisateurs.
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowPricing(true)}
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Accéder aux tarifs
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 h-full relative transition-all duration-300 hover:scale-105 ${
                      tier.popular
                        ? "border-primary shadow-lg scale-105"
                        : "hover:border-primary/30"
                    }`}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                        ⭐ Populaire
                      </Badge>
                    )}
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <tier.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="text-3xl font-bold mb-2 text-primary">
                        {tier.price}
                        {tier.price !== "0€" && tier.price !== "Sur devis" && (
                          <span className="text-sm text-muted-foreground">
                            /mois
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {tier.description}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => {
                        if (tier.name === "Free" || tier.name === "Pro") {
                          signIn("github");
                        } else {
                          // Ouvrir modal contact ou rediriger vers page contact
                          window.open("mailto:contact@quori.dev", "_blank");
                        }
                      }}
                    >
                      {tier.buttonText}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
