// "use client";

// import { useEffect, useState } from "react";
// import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { useAuth } from "@/lib/auth-context";
// import { api, ApiError } from "@/lib/api";
// import { UsageStats } from "@/lib/types";

// function StatCard({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="border rounded-lg p-4 bg-white">
//       <p className="text-xs text-label mb-1">{label}</p>
//       <p className="text-2xl font-semibold">{value}</p>
//     </div>
//   );
// }

// export default function UsagePage() {
//   const { token } = useAuth();
//   const [stats, setStats] = useState<UsageStats | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     api
//       .get<UsageStats>("/usage", token)
//       .then(setStats)
//       .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load usage"));
//   }, [token]);

//   return (
//     <ProtectedRoute>
//       <h1 className="text-2xl font-semibold mb-6">Usage</h1>

//       {error && <p className="text-red-600">{error}</p>}
//       {!error && stats === null && <p className="text-gray-500">Loading...</p>}

//       {stats && (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatCard label="Total Requests" value={stats.total_requests.toLocaleString()} />
//           <StatCard label="Error Rate" value={`${(stats.error_rate * 100).toFixed(1)}%`} />
//           <StatCard label="Avg Latency" value={`${stats.avg_latency_ms.toFixed(0)} ms`} />
//           <StatCard label="Estimated Cost" value={`$${stats.estimated_cost.toFixed(4)}`} />
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { UsageStats } from "@/lib/types";

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium text-muted">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-value">
            {value}
          </p>

          <p className="mt-2 text-xs text-label">
            {description}
          </p>
        </div>

        <div className="h-9 w-9 rounded-md bg-accent/10 border border-accent/10 flex items-center justify-center text-accent text-sm">
          {icon}
        </div>
      </div>
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
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load usage"
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
            AIaaS / Usage
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-value">
                Usage &amp; Analytics
              </h1>

              <p className="mt-2 text-sm text-label">
                Monitor API consumption and estimated costs.
              </p>
            </div>

            <div className="text-xs text-muted">
              Current usage
            </div>
          </div>
        </section>

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

        {!error && stats === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border bg-card p-5 animate-pulse"
              >
                <div className="h-3 w-24 rounded bg-surface" />
                <div className="h-9 w-28 rounded bg-surface mt-4" />
                <div className="h-3 w-32 rounded bg-surface mt-3" />
              </div>
            ))}

          </div>
        )}

        {/* ================================================= */}
        {/* Stats */}
        {/* ================================================= */}

        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

              <StatCard
                label="API Requests"
                value={stats.total_requests.toLocaleString()}
                description="Total requests"
                icon="⌁"
              />

              <StatCard
                label="Success Rate"
                value={`${(
                  (1 - stats.error_rate) *
                  100
                ).toFixed(1)}%`}
                description={`${stats.error_count.toLocaleString()} errors`}
                icon="✓"
              />

              <StatCard
                label="Avg. Latency"
                value={`${stats.avg_latency_ms.toFixed(0)} ms`}
                description="Average response time"
                icon="◈"
              />

              <StatCard
                label="Estimated Cost"
                value={`$${stats.estimated_cost.toFixed(4)}`}
                description="Current usage estimate"
                icon="$"
              />

            </div>

            {/* ================================================= */}
            {/* Usage overview */}
            {/* ================================================= */}

            <section className="mt-6 rounded-lg border border-border bg-card">

              <div className="px-5 py-4 border-b border-border">
                <div>
                  <h2 className="text-sm font-medium text-value">
                    Usage overview
                  </h2>

                  <p className="text-xs text-muted mt-0.5">
                    Current API consumption across your organization.
                  </p>
                </div>
              </div>

              <div className="p-5">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Requests */}

                  <div className="rounded-md border border-border bg-surface p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Requests processed
                    </p>

                    <p className="text-xl font-semibold text-value mt-2">
                      {stats.total_requests.toLocaleString()}
                    </p>

                    <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full w-full bg-accent rounded-full" />
                    </div>
                  </div>

                  {/* Errors */}

                  <div className="rounded-md border border-border bg-surface p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Errors
                    </p>

                    <p className="text-xl font-semibold text-value mt-2">
                      {stats.error_count.toLocaleString()}
                    </p>

                    <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{
                          width: `${Math.min(
                            stats.error_rate * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="text-[11px] text-muted mt-2">
                      {(stats.error_rate * 100).toFixed(1)}% of requests
                    </p>
                  </div>

                  {/* Cost */}

                  <div className="rounded-md border border-border bg-surface p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Estimated spend
                    </p>

                    <p className="text-xl font-semibold text-value mt-2">
                      ${stats.estimated_cost.toFixed(4)}
                    </p>

                    <p className="text-[11px] text-muted mt-4">
                      Based on current usage
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* ================================================= */}
            {/* Information */}
            {/* ================================================= */}

            <section className="mt-6 rounded-lg border border-border bg-card">

              <div className="p-5 flex items-start gap-3">

                <div className="h-8 w-8 shrink-0 rounded-md bg-accent/10 border border-accent/10 flex items-center justify-center text-accent text-sm">
                  i
                </div>

                <div>
                  <p className="text-sm font-medium text-value">
                    About usage metrics
                  </p>

                  <p className="text-xs text-label mt-1 leading-5">
                    Request counts, error rates, latency, and estimated
                    costs are calculated from activity recorded by the
                    platform.
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