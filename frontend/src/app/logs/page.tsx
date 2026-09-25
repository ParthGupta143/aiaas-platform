// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { useAuth } from "@/lib/auth-context";
// import { api, ApiError } from "@/lib/api";
// import { RequestLogsResponse } from "@/lib/types";

// const PAGE_SIZE = 10;

// function StatusPill({ code }: { code: number }) {
//   const ok = code < 400;
//   return (
//     <span className={`text-xs px-2 py-1 rounded font-medium ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//       {code}
//     </span>
//   );
// }

// export default function LogsPage() {
//   const { token } = useAuth();
//   const [data, setData] = useState<RequestLogsResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(1);

//   const loadLogs = useCallback(
//     (targetPage: number) => {
//       api
//         .get<RequestLogsResponse>(`/logs?page=${targetPage}&page_size=${PAGE_SIZE}`, token)
//         .then(setData)
//         .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load logs"));
//     },
//     [token]
//   );

//   useEffect(() => {
//     loadLogs(page);
//   }, [page, loadLogs]);

//   const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

//   return (
//     <ProtectedRoute>
//       <h1 className="text-2xl font-semibold mb-6">Request Logs</h1>

//       {error && <p className="text-red-600">{error}</p>}
//       {!error && data === null && <p className="text-muted">Loading...</p>}

//       {data && data.items.length === 0 && <p className="text-muted">No requests logged yet.</p>}

//       {data && data.items.length > 0 && (
//         <>
//           <table className="w-full text-sm border-collapse mb-4">
//             <thead>
//               <tr className="text-left border-b">
//                 <th className="pb-2">Service</th>
//                 <th className="pb-2">Status</th>
//                 <th className="pb-2">Latency</th>
//                 <th className="pb-2">Model</th>
//                 <th className="pb-2">Time</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.items.map((log) => (
//                 <tr key={log.id} className="border-b">
//                   <td className="py-2">{log.service}</td>
//                   <td className="py-2"><StatusPill code={log.status_code} /></td>
//                   <td className="py-2">{log.latency_ms.toFixed(1)} ms</td>
//                   <td className="py-2 text-value">{log.model_version ?? "—"}</td>
//                   <td className="py-2 text-muted">{new Date(log.created_at).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="flex items-center gap-3 text-sm">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page <= 1}
//               className="px-3 py-1 border rounded disabled:opacity-40"
//             >
//               Previous
//             </button>
//             <span className="text-muted">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page >= totalPages}
//               className="px-3 py-1 border rounded disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </ProtectedRoute>
//   );
// }

"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { RequestLogsResponse } from "@/lib/types";

const PAGE_SIZE = 10;

function StatusPill({ code }: { code: number }) {
  const ok = code < 400;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${
        ok
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          ok ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {code}
    </span>
  );
}

export default function LogsPage() {
  const { token } = useAuth();

  const [data, setData] =
    useState<RequestLogsResponse | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [page, setPage] = useState(1);

  const loadLogs = useCallback(
    (targetPage: number) => {
      setError(null);

      api
        .get<RequestLogsResponse>(
          `/logs?page=${targetPage}&page_size=${PAGE_SIZE}`,
          token
        )
        .then(setData)
        .catch((err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load logs"
          )
        );
    },
    [token]
  );

  useEffect(() => {
    loadLogs(page);
  }, [page, loadLogs]);

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / PAGE_SIZE))
    : 1;

  return (
    <ProtectedRoute>
      <div className="max-w-[1400px] mx-auto">

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium mb-3">
            AIaaS / Request Logs
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-value">
                Request Logs
              </h1>

              <p className="mt-2 text-sm text-label">
                Review recent API activity across your services.
              </p>
            </div>

            {data && (
              <div className="text-xs text-muted">
                {data.total.toLocaleString()}{" "}
                {data.total === 1 ? "request" : "requests"}
              </div>
            )}
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

        {!error && data === null && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">

            <div className="px-5 py-4 border-b border-border">
              <div className="h-4 w-32 rounded bg-surface animate-pulse" />
            </div>

            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="px-5 py-4 flex items-center gap-6 animate-pulse"
                >
                  <div className="h-4 w-24 rounded bg-surface" />
                  <div className="h-5 w-14 rounded-full bg-surface" />
                  <div className="h-4 w-20 rounded bg-surface" />
                  <div className="h-4 w-20 rounded bg-surface" />
                  <div className="h-4 w-32 rounded bg-surface ml-auto" />
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* Empty */}
        {/* ================================================= */}

        {data && data.items.length === 0 && (
          <div className="rounded-lg border border-border bg-card min-h-64 flex items-center justify-center">

            <div className="text-center max-w-sm">

              <div className="mx-auto h-11 w-11 rounded-md border border-border bg-surface flex items-center justify-center text-accent">
                ≡
              </div>

              <p className="text-sm text-value mt-4">
                No requests logged yet
              </p>

              <p className="text-xs text-muted mt-1">
                API activity will appear here once your
                services receive requests.
              </p>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* Logs table */}
        {/* ================================================= */}

        {data && data.items.length > 0 && (
          <section className="rounded-lg border border-border bg-card overflow-hidden">

            {/* Table heading */}

            <div className="px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-medium text-value">
                  Recent requests
                </h2>

                <p className="text-xs text-muted mt-0.5">
                  Latest API activity recorded by the platform.
                </p>
              </div>
            </div>

            {/* Table */}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-border text-left">

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Service
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Latency
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Model
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted text-right">
                      Time
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {data.items.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                    >

                      {/* Service */}

                      <td className="px-5 py-4">
                        <span className="font-medium text-value">
                          {log.service}
                        </span>
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <StatusPill
                          code={log.status_code}
                        />
                      </td>

                      {/* Latency */}

                      <td className="px-5 py-4">
                        <span className="font-medium text-value">
                          {log.latency_ms.toFixed(1)} ms
                        </span>
                      </td>

                      {/* Model */}

                      <td className="px-5 py-4">
                        <code className="text-xs font-mono text-label">
                          {log.model_version ?? "—"}
                        </code>
                      </td>

                      {/* Time */}

                      <td className="px-5 py-4 text-right">
                        <span className="text-xs text-muted whitespace-nowrap">
                          {new Date(
                            log.created_at
                          ).toLocaleString()}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* ================================================= */}
            {/* Pagination */}
            {/* ================================================= */}

            <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">

              <p className="text-xs text-muted">
                Showing{" "}
                <span className="text-value">
                  {(page - 1) * PAGE_SIZE + 1}
                </span>
                {" "}–{" "}
                <span className="text-value">
                  {Math.min(
                    page * PAGE_SIZE,
                    data.total
                  )}
                </span>
                {" "}of{" "}
                <span className="text-value">
                  {data.total}
                </span>
              </p>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page <= 1}
                  className="
                    h-8
                    px-3
                    rounded-md
                    border
                    border-border
                    text-xs
                    text-label
                    hover:text-value
                    hover:bg-surface
                    transition-colors
                    disabled:opacity-30
                    disabled:cursor-not-allowed
                  "
                >
                  Previous
                </button>

                <span className="h-8 min-w-20 px-3 rounded-md bg-surface border border-border flex items-center justify-center text-xs text-label">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={page >= totalPages}
                  className="
                    h-8
                    px-3
                    rounded-md
                    border
                    border-border
                    text-xs
                    text-label
                    hover:text-value
                    hover:bg-surface
                    transition-colors
                    disabled:opacity-30
                    disabled:cursor-not-allowed
                  "
                >
                  Next
                </button>

              </div>

            </div>

          </section>
        )}

      </div>
    </ProtectedRoute>
  );
}