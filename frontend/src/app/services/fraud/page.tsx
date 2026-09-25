
// "use client";

// import { useState, FormEvent } from "react";
// import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { useAuth } from "@/lib/auth-context";
// import { api, ApiError } from "@/lib/api";
// import {
//   FraudCheckRequest,
//   FraudCheckResponse,
// } from "@/lib/types";

// const MERCHANT_CATEGORIES = [
//   "electronics",
//   "groceries",
//   "travel",
//   "entertainment",
//   "other",
// ];

// function RiskBadge({ level }: { level: string }) {
//   const colors: Record<string, string> = {
//     HIGH: "bg-red-100 text-red-700",
//     MEDIUM: "bg-yellow-100 text-yellow-700",
//     LOW: "bg-green-100 text-green-700",
//   };

//   return (
//     <span
//       className={`text-sm px-3 py-1 rounded-full font-medium ${
//         colors[level] ?? "bg-gray-100 text-gray-700"
//       }`}
//     >
//       {level}
//     </span>
//   );
// }

// export default function FraudTestPage() {
//   const { token } = useAuth();

//   const [form, setForm] = useState<FraudCheckRequest>({
//     amount: 100,
//     transaction_hour: 12,
//     merchant_category: "electronics",
//     customer_age: 30,
//     previous_transactions: 5,
//   });

//   const [result, setResult] =
//     useState<FraudCheckResponse | null>(null);

//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   function updateField<K extends keyof FraudCheckRequest>(
//     key: K,
//     value: FraudCheckRequest[K]
//   ) {
//     setForm((f) => ({
//       ...f,
//       [key]: value,
//     }));
//   }

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     try {
//       const res = await api.post<FraudCheckResponse>(
//         "/fraud/test",
//         form,
//         token
//       );

//       setResult(res);
//     } catch (err) {
//       setError(
//         err instanceof ApiError
//           ? err.message
//           : "Failed to analyze transaction"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <ProtectedRoute>
//       <h1 className="text-2xl font-semibold mb-6">
//         Fraud Detection — Test
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Amount ($)
//             </label>

//             <input
//               type="number"
//               min={0}
//               step="0.01"
//               value={form.amount}
//               onChange={(e) =>
//                 updateField(
//                   "amount",
//                   parseFloat(e.target.value) || 0
//                 )
//               }
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Transaction Hour (0–23)
//             </label>

//             <input
//               type="number"
//               min={0}
//               max={23}
//               value={form.transaction_hour}
//               onChange={(e) =>
//                 updateField(
//                   "transaction_hour",
//                   parseInt(e.target.value) || 0
//                 )
//               }
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Merchant Category
//             </label>

//             <select
//               value={form.merchant_category}
//               onChange={(e) =>
//                 updateField(
//                   "merchant_category",
//                   e.target.value
//                 )
//               }
//               className="w-full border rounded px-3 py-2"
//             >
//               {MERCHANT_CATEGORIES.map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Customer Age
//             </label>

//             <input
//               type="number"
//               min={0}
//               max={120}
//               value={form.customer_age}
//               onChange={(e) =>
//                 updateField(
//                   "customer_age",
//                   parseInt(e.target.value) || 0
//                 )
//               }
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Previous Transactions
//             </label>

//             <input
//               type="number"
//               min={0}
//               value={form.previous_transactions}
//               onChange={(e) =>
//                 updateField(
//                   "previous_transactions",
//                   parseInt(e.target.value) || 0
//                 )
//               }
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
//           >
//             {loading
//               ? "Analyzing..."
//               : "Analyze Transaction"}
//           </button>
//         </form>

//         <div>
//           {error && (
//             <p className="text-red-600">
//               {error}
//             </p>
//           )}

//           {!error && !result && !loading && (
//             <p className="text-gray-400 text-sm">
//               Submit a transaction to see the prediction.
//             </p>
//           )}

//           {result && (
//             <div className="border rounded-lg p-5 bg-white space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-label">Prediction</span>
// <span className="font-semibold uppercase text-value">{result.prediction}</span>
//               </div>

//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-label">
//                   Fraud Probability
//                 </span>

//                 <span className="font-semibold uppercase text-value">
//                   {(result.fraud_probability * 100).toFixed(0)}%
//                 </span>
//               </div>

//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-label">
//                   Risk Level
//                 </span>

//                 <RiskBadge level={result.risk_level} />
//               </div>

//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-label">
//                   Model Version
//                 </span>

//                 <span className="font-semibold uppercase text-value">
//                   {result.model_version}
//                 </span>
//               </div>

//               <div>
//                 <span className="text-sm text-gray-500 block mb-1">
//                   Risk Factors
//                 </span>

//                 <ul className="text-sm list-disc list-inside">
//                   {result.top_risk_factors.map((factor) => (
//                     <li key={factor}>
//                       {factor.replace(/_/g, " ")}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div className="text-xs text-gray-400 pt-2 border-t">
//                 Request ID: {result.request_id}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

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
  const normalizedLevel = level.toUpperCase();

  const styles: Record<string, string> = {
    HIGH:
      "bg-red-500/10 text-red-400 border-red-500/20",
    MEDIUM:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    LOW:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const dots: Record<string, string> = {
    HIGH: "bg-red-400",
    MEDIUM: "bg-amber-400",
    LOW: "bg-emerald-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${
        styles[normalizedLevel] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          dots[normalizedLevel] ?? "bg-slate-400"
        }`}
      />

      {normalizedLevel}
    </span>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-medium text-label">
        {children}
      </label>

      {hint && (
        <span className="text-[10px] text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}

const inputClassName =
  "w-full h-10 rounded-md border border-border bg-surface px-3 text-sm text-value outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent/30";

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
      <div className="max-w-[1400px] mx-auto">

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium mb-3">
            AIaaS / Services / Fraud Detection
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-value">
                Fraud Detection
              </h1>

              <p className="mt-2 text-sm text-label">
                Test the fraud detection model using a transaction.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-label">
              <span className="h-2 w-2 rounded-full bg-success" />
              Model operational
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* Main grid */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">

          {/* ================================================= */}
          {/* Transaction form */}
          {/* ================================================= */}

          <section className="rounded-lg border border-border bg-card">

            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-accent/10 border border-accent/10 flex items-center justify-center text-accent">
                  ✦
                </div>

                <div>
                  <h2 className="text-sm font-medium text-value">
                    Transaction details
                  </h2>

                  <p className="text-xs text-muted mt-0.5">
                    Provide the transaction attributes for analysis.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-5"
            >

              {/* Amount */}

              <div>
                <FieldLabel hint="USD">
                  Amount
                </FieldLabel>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    $
                  </span>

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
                    className={`${inputClassName} pl-7`}
                  />
                </div>
              </div>

              {/* Transaction hour */}

              <div>
                <FieldLabel hint="0–23">
                  Transaction hour
                </FieldLabel>

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
                  className={inputClassName}
                />
              </div>

              {/* Merchant category */}

              <div>
                <FieldLabel>
                  Merchant category
                </FieldLabel>

                <select
                  value={form.merchant_category}
                  onChange={(e) =>
                    updateField(
                      "merchant_category",
                      e.target.value
                    )
                  }
                  className={inputClassName}
                >
                  {MERCHANT_CATEGORIES.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-card text-value"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer age */}

              <div>
                <FieldLabel hint="Years">
                  Customer age
                </FieldLabel>

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
                  className={inputClassName}
                />
              </div>

              {/* Previous transactions */}

              <div>
                <FieldLabel>
                  Previous transactions
                </FieldLabel>

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
                  className={inputClassName}
                />
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <p className="text-xs text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  h-10
                  rounded-md
                  bg-accent
                  text-[#061014]
                  text-sm
                  font-semibold
                  transition-all
                  hover:bg-accent-hover
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {loading
                  ? "Analyzing transaction..."
                  : "Run prediction"}
              </button>
            </form>
          </section>

          {/* ================================================= */}
          {/* Result panel */}
          {/* ================================================= */}

          <section className="rounded-lg border border-border bg-card min-h-[500px]">

            <div className="px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-medium text-value">
                  Prediction result
                </h2>

                <p className="text-xs text-muted mt-0.5">
                  Model output from the latest transaction analysis.
                </p>
              </div>
            </div>

            <div className="p-5">

              {/* Empty state */}

              {!error && !result && !loading && (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center max-w-xs">

                    <div className="mx-auto h-12 w-12 rounded-lg border border-border bg-surface flex items-center justify-center text-accent text-lg">
                      ◇
                    </div>

                    <p className="text-sm text-value mt-4">
                      No prediction yet
                    </p>

                    <p className="text-xs text-muted leading-5 mt-1">
                      Submit a transaction on the left to see
                      the model prediction and risk analysis.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading */}

              {loading && (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center">

                    <div className="mx-auto h-8 w-8 rounded-full border-2 border-border border-t-accent animate-spin" />

                    <p className="text-sm text-value mt-4">
                      Analyzing transaction
                    </p>

                    <p className="text-xs text-muted mt-1">
                      Running the fraud detection model...
                    </p>
                  </div>
                </div>
              )}

              {/* Result */}

              {result && (
                <div className="space-y-6">

                  {/* Main prediction */}

                  <div className="rounded-lg border border-border bg-surface p-5">
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Prediction
                    </p>

                    <div className="flex items-center justify-between gap-4 mt-2">
                      <p className="text-2xl font-semibold uppercase text-value">
                        {result.prediction}
                      </p>

                      <RiskBadge level={result.risk_level} />
                    </div>
                  </div>

                  {/* Metrics */}

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-md border border-border bg-surface p-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted">
                        Fraud probability
                      </p>

                      <p className="text-xl font-semibold text-value mt-2">
                        {(result.fraud_probability * 100).toFixed(0)}%
                      </p>
                    </div>

                    <div className="rounded-md border border-border bg-surface p-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted">
                        Model version
                      </p>

                      <p className="text-sm font-medium text-value mt-3">
                        {result.model_version}
                      </p>
                    </div>
                  </div>

                  {/* Risk factors */}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-medium text-label">
                        Risk factors
                      </h3>

                      <span className="text-[10px] text-muted">
                        {result.top_risk_factors.length} detected
                      </span>
                    </div>

                    <div className="space-y-2">
                      {result.top_risk_factors.map((factor) => (
                        <div
                          key={factor}
                          className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />

                          <span className="text-sm text-value capitalize">
                            {factor.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Request ID */}

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] uppercase tracking-wider text-muted">
                        Request ID
                      </span>

                      <span className="text-[10px] font-mono text-muted truncate">
                        {result.request_id}
                      </span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </section>
        </div>

        {/* ================================================= */}
        {/* Service info */}
        {/* ================================================= */}

        <div className="mt-5 rounded-lg border border-border bg-card px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />

              <span className="text-xs text-label">
                Fraud Detection API operational
              </span>
            </div>

            <span className="text-xs text-muted">
              Real-time transaction scoring
            </span>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}