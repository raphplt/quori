import { FileText, TrendingUp, Eye, GitCommit, Clock } from "lucide-react";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useGetKpis } from "@/app/(protected)/dashboard/utils";

const KpisCards = () => {
  const { monthlyEventsLength, monthlyPostsLength } = useGetKpis();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Posts this month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Posts ce mois-ci
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyPostsLength?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+3</span> depuis la semaine
            dernière
          </p>
        </CardContent>
      </Card>

      {/* Commits treated */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commits traités</CardTitle>
          <GitCommit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyEventsLength?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">Ce mois-ci</p>
        </CardContent>
      </Card>

      {/* Engagement Rate (Coming Soon) */}
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taux d'engagement
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="filter blur-sm">
          <div className="text-2xl font-bold">15%</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+0.4%</span> vs mois dernier
          </p>
        </CardContent>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
          <Clock className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-sm font-medium">À venir</span>
        </div>
      </Card>

      {/* Total Impressions (Coming Soon) */}
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Impressions totales
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="filter blur-sm">
          <div className="text-2xl font-bold">1,234,567</div>
          <p className="text-xs text-muted-foreground">Ce mois-ci</p>
        </CardContent>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
          <Clock className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-sm font-medium">À venir</span>
        </div>
      </Card>
    </div>
  );
};

export default KpisCards;
