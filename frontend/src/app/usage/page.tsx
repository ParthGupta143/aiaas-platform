"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { UsageStats } from "@/lib/types";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function UsagePage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<UsageStats>("/usage", token)
      .then(setStats)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load usage"));
  }, [token]);

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">Usage</h1>

      {error && <p className="text-red-600">{error}</p>}
      {!error && stats === null && <p className="text-gray-500">Loading...</p>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={stats.total_requests.toLocaleString()} />
          <StatCard label="Error Rate" value={`${(stats.error_rate * 100).toFixed(1)}%`} />
          <StatCard label="Avg Latency" value={`${stats.avg_latency_ms.toFixed(0)} ms`} />
          <StatCard label="Estimated Cost" value={`$${stats.estimated_cost.toFixed(4)}`} />
        </div>
      )}
    </ProtectedRoute>
  );
}