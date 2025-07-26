"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Share2, Zap, Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    quote:
      "Quori a transformé ma présence LinkedIn. Mes commits deviennent du contenu engageant sans effort !",
    name: "Marion Dardel",
    role: "Senior Developer @TechCorp",
    avatar:
      "https://images.unsplash.com/photo-1669844444850-5acd7e8c71c5?q=150&w=150&h=150&auto=format&fit=crop&crop=face",
    github: "mariondardel",
    likes: 156,
    comments: 24,
    shares: 12,
    timestamp: "2h",
    verified: true,
  },
  {
    quote:
      "Enfin un outil qui comprend les développeurs. Plus besoin de passer des heures à rédiger des posts.",
    name: "Thomas Martin",
    role: "Full Stack Developer @StartupXYZ",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    github: "thomasmartin",
    likes: 89,
    comments: 15,
    shares: 8,
    timestamp: "13h",
    verified: false,
  },
  {
    quote:
      "500% d'engagement en plus sur mes posts tech grâce à Quori. L'IA génère vraiment du contenu viral !",
    name: "Alex Chen",
    role: "DevOps Engineer @CloudScale",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    github: "alexchen",
    likes: 234,
    comments: 31,
    shares: 18,
    verified: true,
    timestamp: "20h",
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-16 bg-background">
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/15 to-chart-2/15 text-primary border-primary/25">
              <Star className="h-4 w-4 mr-2" />
              Témoignages bêta
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Ce que disent les développeurs
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez les retours de nos utilisateurs bêta
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 bg-white border border-gray-200 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                {/* Header tweet-style */}
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      {testimonial.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{testimonial.github} • {testimonial.role}
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-primary" />
                </div>

                {/* Quote tweet-style */}
                <blockquote className="text-base mb-4 leading-relaxed text-foreground">
                  "{testimonial.quote}"
                </blockquote>

                {/* Engagement metrics tweet-style */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{testimonial.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{testimonial.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>{testimonial.shares}</span>
                  </div>
                  <div className="text-xs">Il y a {testimonial.timestamp}</div>
                </div>

                {/* Quori badge */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Badge className="bg-gradient-to-r from-primary/10 to-chart-2/10 text-primary border-primary/20">
                    <Zap className="h-3 w-3 mr-1" />
                    Généré avec Quori
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
