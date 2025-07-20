"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSolutionSection } from "@/components/landing/ProblemSolutionSection";
import { TechnologySection } from "@/components/landing/TechnologySection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import Head from "next/head";

const QuoriLandingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const [isVisible, setIsVisible] = useState(false);

  //Fix bug

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="loading-shimmer w-16 h-16 rounded-full mx-auto mb-4" />
          <div className="loading-shimmer w-32 h-4 rounded mx-auto mb-2" />
          <div className="loading-shimmer w-24 h-3 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Quori – Convertissez vos commits en posts viraux</title>
        <meta
          name="description"
          content="Vos commits GitHub deviennent des posts LinkedIn viraux, en 1 clic. Découvrez la preuve visuelle et rejoignez +10 000 devs qui accélèrent leur personal brand avec Quori."
        />
      </Head>
      <div className="min-h-screen bg-background text-foreground">
        <HeroSection isVisible={isVisible} />
        <ProblemSolutionSection />
        <TechnologySection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
      </div>
    </>
  );
};

export default QuoriLandingPage;
