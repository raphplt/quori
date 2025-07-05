import React from "react";
import { Button } from "@/components/ui/button";

const page = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Transformez vos commits en
          <span className="text-primary"> publications LinkedIn</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Donnez de la visibilité à votre travail de développeur. Quori analyse
          vos commits Git et génère automatiquement des publications
          professionnelles engageantes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 py-3">
            Commencer gratuitement
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3">
            Voir la démo
          </Button>
        </div>
      </div>

      {/* Section fonctionnalités */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Connexion GitHub</h3>
          <p className="text-muted-foreground">
            Connectez vos dépôts GitHub et laissez Quori analyser vos commits
            automatiquement.
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">IA Intelligente</h3>
          <p className="text-muted-foreground">
            Notre IA transforme vos commits techniques en histoires engageantes
            pour LinkedIn.
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📈</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Croissance professionnelle
          </h3>
          <p className="text-muted-foreground">
            Augmentez votre visibilité et construisez votre marque personnelle
            de développeur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
