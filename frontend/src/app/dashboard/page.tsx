"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p className="text-label">
  Welcome back, <span className="text-value">{user?.email}</span>.
</p>
    </ProtectedRoute>
  );
}