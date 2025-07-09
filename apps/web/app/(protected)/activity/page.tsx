"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ActivityFeed from "@/components/ActivityFeed";

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Flux Git</h1>
          <p className="text-muted-foreground">
            Chronologie de vos événements Git avec génération de posts en 1-clic
          </p>
        </div>
        <ActivityFeed />
      </div>
    </ProtectedRoute>
  );
}
