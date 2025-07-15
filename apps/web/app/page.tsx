"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  Play,
  GitBranch,
  Zap,
  Calendar,
  Users,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface NavLink {
  text: string;
  href: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const QuoriLandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center items-center">
            <Spinner />
            <span className="ml-2 text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  const features: Feature[] = [
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "Instant Git parsing",
      description:
        "Push → Résumé + post automatiquement généré depuis vos commits",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "IA sur‑mesure",
      description:
        "Ton pro, léger humour, prêt à publier directement sur LinkedIn",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Planification & Analytics",
      description: "Programmez vos posts et suivez l'impact de votre contenu",
    },
  ];

  const steps: Step[] = [
    {
      number: "1",
      title: "Connectez votre repo",
      description: "Liez votre repository GitHub en quelques clics",
    },
    {
      number: "2",
      title: "Poussez du code",
      description: "Continuez votre workflow habituel de développement",
    },
    {
      number: "3",
      title: "Copiez votre post LinkedIn",
      description: "Récupérez votre contenu optimisé et publiez",
    },
  ];

  const pricingTiers: PricingTier[] = [
    {
      name: "Free",
      price: "0€",
      description: "Pour commencer",
      features: ["5 posts par mois", "1 repository", "Support communautaire"],
      buttonText: "Commencer gratuitement",
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
      ],
      buttonText: "Essayer Pro",
      popular: true,
    },
    {
      name: "Team",
      price: "49€",
      description: "Pour les équipes",
      features: [
        "Tout de Pro",
        "Repositories illimités",
        "Collaboration équipe",
        "API access",
      ],
      buttonText: "Contacter l'équipe",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      quote:
        "Quori a transformé ma présence LinkedIn. Mes commits deviennent du contenu engageant sans effort !",
      name: "Marie Dubois",
      role: "Senior Developer @TechCorp",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      quote:
        "Enfin un outil qui comprend les développeurs. Plus besoin de passer des heures à rédiger des posts.",
      name: "Thomas Martin",
      role: "Full Stack Developer @StartupXYZ",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-6">
                <Zap className="h-3 w-3 mr-1" />
                SaaS pour développeurs
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Code it. Post it. Own it.
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Transformez vos commits en contenu premium, en un clic.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="group">
                  Rejoindre la waitlist
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="group">
                  <Play className="mr-2 h-4 w-4" />
                  Voir la démo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" id="features">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fonctionnalités puissantes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour transformer votre code en
              contenu engageant
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça marche
            </h2>
            <p className="text-xl text-muted-foreground">
              Trois étapes simples pour transformer vos commits en posts
              LinkedIn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" id="pricing">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-muted-foreground">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`p-6 h-full relative ${tier.popular ? "border-primary shadow-lg" : ""}`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      Populaire
                    </Badge>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold mb-2">
                      {tier.price}
                      {tier.price !== "0€" && (
                        <span className="text-sm text-muted-foreground">
                          /mois
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{tier.description}</p>
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
                  >
                    {tier.buttonText}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ce que disent les développeurs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuoriLandingPage;
