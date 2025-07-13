"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ActivityFeed from "@/components/ActivityFeed";
import StatCard from "@/components/activity/StatsCard";

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Flux Git</h1>
        <StatCard />
        <ActivityFeed />
      </div>
    </ProtectedRoute>
  );
}
