"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { BillingSummary } from "@/lib/types";

export default function BillingPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<BillingSummary>("/billing/summary", token)
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load billing"));
  }, [token]);

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-2">Billing</h1>
      <p className="text-sm text-gray-500 mb-6">
        Simulated usage-based billing — not connected to real payment processing.
      </p>

      {error && <p className="text-red-600">{error}</p>}
      {!error && summary === null && <p className="text-gray-500">Loading...</p>}

      {summary && (
        <>
          <p className="text-sm text-gray-500 mb-4">Period: {summary.period}</p>

          <table className="w-full text-sm border-collapse mb-6">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Service</th>
                <th className="pb-2">Requests Used</th>
                <th className="pb-2">Price / Request</th>
                <th className="pb-2">Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              {summary.lines.map((line) => (
                <tr key={line.service_slug} className="border-b">
                  <td className="py-2">{line.service_name}</td>
                  <td className="py-2">{line.requests_used.toLocaleString()}</td>
                  <td className="py-2">${line.price_per_request.toFixed(4)}</td>
                  <td className="py-2">${line.estimated_cost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-medium">Total Estimated Cost</span>
            <span className="text-xl font-semibold">
              ${summary.total_estimated_cost.toFixed(4)}
            </span>
          </div>
        </>
      )}
    </ProtectedRoute>
  );
}