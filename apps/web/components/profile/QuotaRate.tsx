import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useQuota } from "@/contexts/QuotaContext";
import { Gauge } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { Progress } from "../ui/progress";

const QuotaRate = () => {
  const { quota, isLoading, error } = useQuota();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gauge className="mr-2 w-5 h-5" />
          Utilisation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner className="w-6 h-6" />
        ) : error ? (
          <p className="text-red-500">Erreur: {error.message}</p>
        ) : quota ? (
          <div className="flex flex-col">
            <p className=" text-gray-700 mb-2 font-semibold text-right">
              {((quota.used / (quota.used + quota.remaining)) * 100).toFixed(0)}
              %
            </p>
            <Progress
              value={(quota.used / (quota.used + quota.remaining)) * 100}
              className="mb-2"
            />
            <div className="text-sm text-gray-500">
              <p>
                Utilisé: {quota.used} / {quota.used + quota.remaining} tokens
              </p>
              <p>Restant: {quota.remaining} tokens</p>
            </div>
          </div>
        ) : (
          <p>Aucune information de quota disponible.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default QuotaRate;
