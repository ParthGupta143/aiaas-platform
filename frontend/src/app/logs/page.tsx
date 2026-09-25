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
    <span className={`text-xs px-2 py-1 rounded font-medium ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {code}
    </span>
  );
}

export default function LogsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<RequestLogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(
    (targetPage: number) => {
      api
        .get<RequestLogsResponse>(`/logs?page=${targetPage}&page_size=${PAGE_SIZE}`, token)
        .then(setData)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load logs"));
    },
    [token]
  );

  useEffect(() => {
    loadLogs(page);
  }, [page, loadLogs]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">Request Logs</h1>

      {error && <p className="text-red-600">{error}</p>}
      {!error && data === null && <p className="text-muted">Loading...</p>}

      {data && data.items.length === 0 && <p className="text-muted">No requests logged yet.</p>}

      {data && data.items.length > 0 && (
        <>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Service</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Latency</th>
                <th className="pb-2">Model</th>
                <th className="pb-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="py-2">{log.service}</td>
                  <td className="py-2"><StatusPill code={log.status_code} /></td>
                  <td className="py-2">{log.latency_ms.toFixed(1)} ms</td>
                  <td className="py-2 text-value">{log.model_version ?? "—"}</td>
                  <td className="py-2 text-muted">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </ProtectedRoute>
  );
}