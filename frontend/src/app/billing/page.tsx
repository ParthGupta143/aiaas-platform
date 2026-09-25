// "use client";

// import { useEffect, useState } from "react";
// import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { useAuth } from "@/lib/auth-context";
// import { api, ApiError } from "@/lib/api";
// import { BillingSummary } from "@/lib/types";

// export default function BillingPage() {
//   const { token } = useAuth();
//   const [summary, setSummary] = useState<BillingSummary | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     api
//       .get<BillingSummary>("/billing/summary", token)
//       .then(setSummary)
//       .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load billing"));
//   }, [token]);

//   return (
//     <ProtectedRoute>
//       <h1 className="text-2xl font-semibold mb-2">Billing</h1>
//       <p className="text-sm text-gray-500 mb-6">
//         Simulated usage-based billing — not connected to real payment processing.
//       </p>

//       {error && <p className="text-red-600">{error}</p>}
//       {!error && summary === null && <p className="text-gray-500">Loading...</p>}

//       {summary && (
//         <>
//           <p className="text-sm text-gray-500 mb-4">Period: {summary.period}</p>

//           <table className="w-full text-sm border-collapse mb-6">
//             <thead>
//               <tr className="text-left border-b">
//                 <th className="pb-2">Service</th>
//                 <th className="pb-2">Requests Used</th>
//                 <th className="pb-2">Price / Request</th>
//                 <th className="pb-2">Estimated Cost</th>
//               </tr>
//             </thead>
//             <tbody>
//               {summary.lines.map((line) => (
//                 <tr key={line.service_slug} className="border-b">
//                   <td className="py-2">{line.service_name}</td>
//                   <td className="py-2">{line.requests_used.toLocaleString()}</td>
//                   <td className="py-2">${line.price_per_request.toFixed(4)}</td>
//                   <td className="py-2">${line.estimated_cost.toFixed(4)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="border-t pt-4 flex justify-between items-center">
//             <span className="font-medium">Total Estimated Cost</span>
//             <span className="text-xl font-semibold">
//               ${summary.total_estimated_cost.toFixed(4)}
//             </span>
//           </div>
//         </>
//       )}
//     </ProtectedRoute>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { BillingSummary } from "@/lib/types";

export default function BillingPage() {
  const { token } = useAuth();

  const [summary, setSummary] =
    useState<BillingSummary | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    api
      .get<BillingSummary>("/billing/summary", token)
      .then(setSummary)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load billing"
        )
      );
  }, [token]);

  return (
    <ProtectedRoute>
      <div className="max-w-[1400px] mx-auto">

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium mb-3">
            AIaaS / Billing
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-value">
                Billing
              </h1>

              <p className="mt-2 text-sm text-label">
                Review usage-based costs across your AI services.
              </p>
            </div>

            {summary && (
              <div className="text-xs text-muted">
                Period: {summary.period}
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* Simulation notice */}
        {/* ================================================= */}

        <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5">

          <div className="px-5 py-4 flex items-start gap-3">

            <div className="h-9 w-9 shrink-0 rounded-md bg-accent/10 border border-accent/10 flex items-center justify-center text-accent text-sm">
              $
            </div>

            <div>
              <p className="text-sm font-medium text-value">
                Simulated billing
              </p>

              <p className="text-xs text-label mt-1 leading-5">
                This page shows estimated usage-based charges.
                It is not connected to real payment processing.
              </p>
            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* Error */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* Loading */}
        {/* ================================================= */}

        {!error && summary === null && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-border bg-card p-5 animate-pulse"
                >
                  <div className="h-3 w-24 rounded bg-surface" />
                  <div className="h-8 w-32 rounded bg-surface mt-4" />
                  <div className="h-3 w-28 rounded bg-surface mt-3" />
                </div>
              ))}

            </div>

            <div className="rounded-lg border border-border bg-card h-64 animate-pulse" />

          </div>
        )}

        {/* ================================================= */}
        {/* Billing */}
        {/* ================================================= */}

        {summary && (
          <>

            {/* ================================================= */}
            {/* Summary cards */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Total cost */}

              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium text-muted">
                      Estimated cost
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-value">
                      $
                      {summary.total_estimated_cost.toFixed(4)}
                    </p>

                    <p className="mt-2 text-xs text-label">
                      Total for {summary.period}
                    </p>
                  </div>

                  <div className="h-9 w-9 rounded-md bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-400">
                    $
                  </div>

                </div>
              </div>

              {/* Services */}

              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium text-muted">
                      Services used
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-value">
                      {summary.lines.length}
                    </p>

                    <p className="mt-2 text-xs text-label">
                      Services included in this period
                    </p>
                  </div>

                  <div className="h-9 w-9 rounded-md bg-accent/10 border border-accent/10 flex items-center justify-center text-accent">
                    ◇
                  </div>

                </div>
              </div>

              {/* Requests */}

              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium text-muted">
                      Requests billed
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-value">
                      {summary.lines
                        .reduce(
                          (total, line) =>
                            total + line.requests_used,
                          0
                        )
                        .toLocaleString()}
                    </p>

                    <p className="mt-2 text-xs text-label">
                      Total requests across services
                    </p>
                  </div>

                  <div className="h-9 w-9 rounded-md bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-400">
                    ≋
                  </div>

                </div>
              </div>

            </div>

            {/* ================================================= */}
            {/* Service breakdown */}
            {/* ================================================= */}

            <section className="mt-6 rounded-lg border border-border bg-card overflow-hidden">

              <div className="px-5 py-4 border-b border-border">
                <div>
                  <h2 className="text-sm font-medium text-value">
                    Service breakdown
                  </h2>

                  <p className="text-xs text-muted mt-0.5">
                    Estimated charges by AI service.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-border text-left">

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                        Service
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                        Requests
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                        Price / Request
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted text-right">
                        Estimated Cost
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {summary.lines.map((line) => (
                      <tr
                        key={line.service_slug}
                        className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                      >

                        {/* Service */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-value">
                              {line.service_name}
                            </p>

                            <p className="text-[11px] text-muted mt-0.5 font-mono">
                              {line.service_slug}
                            </p>
                          </div>
                        </td>

                        {/* Requests */}

                        <td className="px-5 py-4">
                          <span className="text-value">
                            {line.requests_used.toLocaleString()}
                          </span>
                        </td>

                        {/* Price */}

                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-label">
                            $
                            {line.price_per_request.toFixed(4)}
                          </span>
                        </td>

                        {/* Cost */}

                        <td className="px-5 py-4 text-right">
                          <span className="font-medium text-value">
                            $
                            {line.estimated_cost.toFixed(4)}
                          </span>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>

              {/* ================================================= */}
              {/* Total */}
              {/* ================================================= */}

              <div className="px-5 py-5 border-t border-border bg-surface/40">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-value">
                      Total estimated cost
                    </p>

                    <p className="text-xs text-muted mt-1">
                      Based on recorded usage for {summary.period}.
                    </p>
                  </div>

                  <p className="text-2xl font-semibold text-value">
                    $
                    {summary.total_estimated_cost.toFixed(4)}
                  </p>

                </div>

              </div>

            </section>

          </>
        )}

      </div>
    </ProtectedRoute>
  );
}