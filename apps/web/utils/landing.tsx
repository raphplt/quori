import { Calendar, GitBranch, Zap } from "lucide-react";

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
export const features: Feature[] = [
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

export const steps: Step[] = [
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

export const pricingTiers: PricingTier[] = [
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

export const testimonials: Testimonial[] = [
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
