"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Download,
  CheckCircle,
  ArrowUpRight,
  Receipt,
  TrendingUp,
  Package,
} from "lucide-react";

type ExtendedUser = {
  id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
};

const Billing = () => {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
};

function BillingContent() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser;

  if (!user) {
    return null;
  }

  // Mock data
  const currentPlan = {
    name: "Pro",
    price: 29,
    billing: "monthly",
    features: [
      "100 posts automatiques/mois",
      "Analytics avancées",
      "Templates personnalisés",
      "Support prioritaire",
      "Intégrations illimitées",
    ],
    nextBilling: "2025-08-11",
  };

  const usageStats = {
    postsUsed: 67,
    postsLimit: 100,
    storageUsed: 2.4,
    storageLimit: 10,
  };

  const invoices = [
    {
      id: "INV-2025-07",
      date: "2025-07-11",
      amount: 29,
      status: "paid",
      plan: "Pro Monthly",
    },
    {
      id: "INV-2025-06",
      date: "2025-06-11",
      amount: 29,
      status: "paid",
      plan: "Pro Monthly",
    },
    {
      id: "INV-2025-05",
      date: "2025-05-11",
      amount: 29,
      status: "paid",
      plan: "Pro Monthly",
    },
    {
      id: "INV-2025-04",
      date: "2025-04-11",
      amount: 29,
      status: "paid",
      plan: "Pro Monthly",
    },
  ];

  const availablePlans = [
    {
      name: "Free",
      price: 0,
      billing: "monthly",
      features: [
        "10 posts automatiques/mois",
        "Analytics de base",
        "Templates prédéfinis",
        "Support communautaire",
      ],
      current: false,
    },
    {
      name: "Pro",
      price: 29,
      billing: "monthly",
      features: [
        "100 posts automatiques/mois",
        "Analytics avancées",
        "Templates personnalisés",
        "Support prioritaire",
        "Intégrations illimitées",
      ],
      current: true,
    },
    {
      name: "Enterprise",
      price: 99,
      billing: "monthly",
      features: [
        "Posts illimités",
        "Analytics en temps réel",
        "Templates sur mesure",
        "Support dédié 24/7",
        "API complète",
        "Équipe collaborative",
      ],
      current: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facturation</h1>
            <p className="text-gray-600 mt-1">
              Gérez votre abonnement et consultez vos factures.
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Télécharger toutes les factures
          </Button>
        </div>

        {/* Current Plan & Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Plan actuel
                  </CardTitle>
                  <CardDescription>
                    Votre abonnement {currentPlan.name}
                  </CardDescription>
                </div>
                <Badge variant="default" className="text-sm">
                  {currentPlan.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {currentPlan.price}€
                    <span className="text-lg font-normal text-muted-foreground">
                      /{currentPlan.billing === "monthly" ? "mois" : "an"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prochaine facturation le{" "}
                    {new Date(currentPlan.nextBilling).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline">Modifier le plan</Button>
                  <Button variant="destructive">Annuler</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Fonctionnalités incluses :</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Utilisation
              </CardTitle>
              <CardDescription>Ce mois-ci</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Posts générés</span>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.postsUsed}/{usageStats.postsLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${
                        (usageStats.postsUsed / usageStats.postsLimit) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Stockage</span>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.storageUsed}GB/{usageStats.storageLimit}GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (usageStats.storageUsed / usageStats.storageLimit) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  Voir les détails d&apos;utilisation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Factures récentes
              </CardTitle>
              <CardDescription>Historique de vos paiements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map(invoice => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{invoice.id}</p>
                        <Badge
                          variant={
                            invoice.status === "paid" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {invoice.status === "paid" ? "Payée" : "En attente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {invoice.plan} •{" "}
                        {new Date(invoice.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{invoice.amount}€</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Voir toutes les factures
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Méthode de paiement
              </CardTitle>
              <CardDescription>
                Gérez vos informations de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                    <p className="text-xs text-gray-500">Expire 12/27</p>
                  </div>
                </div>
                <Badge variant="default" className="text-xs">
                  Défaut
                </Badge>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Ajouter une carte
                </Button>
                <Button variant="outline" className="w-full">
                  Modifier les informations de facturation
                </Button>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Paiements sécurisés avec Stripe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Plans disponibles</CardTitle>
            <CardDescription>
              Choisissez le plan qui correspond le mieux à vos besoins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map(plan => (
                <div
                  key={plan.name}
                  className={`border rounded-lg p-4 ${
                    plan.current ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="text-3xl font-bold mt-2">
                      {plan.price}€
                      <span className="text-sm font-normal text-muted-foreground">
                        /mois
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.current ? "secondary" : "default"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Plan actuel" : "Choisir ce plan"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Billing;
