
"use client";

import { useState, FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import {
  FraudCheckRequest,
  FraudCheckResponse,
} from "@/lib/types";

const MERCHANT_CATEGORIES = [
  "electronics",
  "groceries",
  "travel",
  "entertainment",
  "other",
];

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`text-sm px-3 py-1 rounded-full font-medium ${
        colors[level] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {level}
    </span>
  );
}

export default function FraudTestPage() {
  const { token } = useAuth();

  const [form, setForm] = useState<FraudCheckRequest>({
    amount: 100,
    transaction_hour: 12,
    merchant_category: "electronics",
    customer_age: 30,
    previous_transactions: 5,
  });

  const [result, setResult] =
    useState<FraudCheckResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof FraudCheckRequest>(
    key: K,
    value: FraudCheckRequest[K]
  ) {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post<FraudCheckResponse>(
        "/fraud/test",
        form,
        token
      );

      setResult(res);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to analyze transaction"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">
        Fraud Detection — Test
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount ($)
            </label>

            <input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                updateField(
                  "amount",
                  parseFloat(e.target.value) || 0
                )
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction Hour (0–23)
            </label>

            <input
              type="number"
              min={0}
              max={23}
              value={form.transaction_hour}
              onChange={(e) =>
                updateField(
                  "transaction_hour",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Merchant Category
            </label>

            <select
              value={form.merchant_category}
              onChange={(e) =>
                updateField(
                  "merchant_category",
                  e.target.value
                )
              }
              className="w-full border rounded px-3 py-2"
            >
              {MERCHANT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Age
            </label>

            <input
              type="number"
              min={0}
              max={120}
              value={form.customer_age}
              onChange={(e) =>
                updateField(
                  "customer_age",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Previous Transactions
            </label>

            <input
              type="number"
              min={0}
              value={form.previous_transactions}
              onChange={(e) =>
                updateField(
                  "previous_transactions",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
          >
            {loading
              ? "Analyzing..."
              : "Analyze Transaction"}
          </button>
        </form>

        <div>
          {error && (
            <p className="text-red-600">
              {error}
            </p>
          )}

          {!error && !result && !loading && (
            <p className="text-gray-400 text-sm">
              Submit a transaction to see the prediction.
            </p>
          )}

          {result && (
            <div className="border rounded-lg p-5 bg-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-label">Prediction</span>
<span className="font-semibold uppercase text-value">{result.prediction}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-label">
                  Fraud Probability
                </span>

                <span className="font-semibold uppercase text-value">
                  {(result.fraud_probability * 100).toFixed(0)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-label">
                  Risk Level
                </span>

                <RiskBadge level={result.risk_level} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-label">
                  Model Version
                </span>

                <span className="font-semibold uppercase text-value">
                  {result.model_version}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-500 block mb-1">
                  Risk Factors
                </span>

                <ul className="text-sm list-disc list-inside">
                  {result.top_risk_factors.map((factor) => (
                    <li key={factor}>
                      {factor.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t">
                Request ID: {result.request_id}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}