// "use client";

// import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { useAuth } from "@/lib/auth-context";

// export default function DashboardPage() {
//   const { user } = useAuth();

//   return (
//     <ProtectedRoute>
//       <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
//       <p className="text-label">
//   Welcome back, <span className="text-value">{user?.email}</span>.
// </p>
//     </ProtectedRoute>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import {
  UsageStats,
  RequestLogsResponse,
  RequestLogEntry,
} from "@/lib/types";

export default function DashboardPage() {
  const { user, token } = useAuth();

  const [stats, setStats] = useState<UsageStats | null>(null);
  const [logs, setLogs] = useState<RequestLogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.get<UsageStats>("/usage", token),
      api.get<RequestLogsResponse>("/logs?page=1&page_size=8", token),
    ])
      .then(([usageData, logsData]) => {
        setStats(usageData);
        setLogs(logsData);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load dashboard data"
        );
      });
  }, [token]);

  const successRate = stats
    ? ((1 - stats.error_rate) * 100).toFixed(1)
    : "—";

  return (
    <ProtectedRoute>
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ================================================== */}
        {/* Header */}
        {/* ================================================== */}

        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium mb-3">
              AIaaS / Overview
            </p>

            <p className="mt-2 text-sm text-label">
  Here's what's happening across your AI infrastructure.
</p>

            <p className="mt-2 text-sm text-label">
              Here&apos;s what&apos;s happening across your AI infrastructure.
            </p>
          </div>

          <Link
            href="/services"
            className="
              inline-flex items-center justify-center
              rounded-md
              border border-border
              bg-card
              px-4 py-2.5
              text-sm text-value
              hover:bg-card-hover
              transition-colors
            "
          >
            Explore services
            <span className="ml-2 text-muted">↗</span>
          </Link>
        </section>

        {/* ================================================== */}
        {/* Error */}
        {/* ================================================== */}

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* ================================================== */}
        {/* Metrics */}
        {/* ================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="API Requests"
            value={
              stats
                ? stats.total_requests.toLocaleString()
                : "—"
            }
            description="Total requests"
            icon="⌁"
            accent="cyan"
          />

          <MetricCard
            label="Success Rate"
            value={stats ? `${successRate}%` : "—"}
            description={
              stats
                ? `${stats.error_count.toLocaleString()} errors`
                : "Request health"
            }
            icon="✓"
            accent="green"
          />

          <MetricCard
            label="Avg. Latency"
            value={
              stats
                ? `${stats.avg_latency_ms.toFixed(0)} ms`
                : "—"
            }
            description="Average response time"
            icon="◈"
            accent="purple"
          />

          <MetricCard
            label="Estimated Cost"
            value={
              stats
                ? `$${stats.estimated_cost.toFixed(4)}`
                : "—"
            }
            description="Current usage estimate"
            icon="$"
            accent="amber"
          />
        </section>

        {/* ================================================== */}
        {/* Main dashboard */}
        {/* ================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)] gap-4">

          {/* Recent activity */}
          <RecentActivity logs={logs} />

          {/* Quick actions */}
          <QuickActions />

        </section>

        {/* ================================================== */}
        {/* System status */}
        {/* ================================================== */}

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />

                <h2 className="text-sm font-medium text-value">
                  All systems operational
                </h2>
              </div>

              <p className="text-xs text-muted mt-2">
                Your AIaaS platform services are available.
              </p>
            </div>

            <div className="text-xs text-muted">
              Environment
              <span className="ml-2 text-value font-medium">
                Development
              </span>
            </div>

          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}

/* ========================================================== */
/* Metric Card */
/* ========================================================== */

function MetricCard({
  label,
  value,
  description,
  icon,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
  accent: "cyan" | "green" | "purple" | "amber";
}) {
  const accentClasses = {
    cyan: "bg-cyan-500/10 text-cyan-400",
    green: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-violet-500/10 text-violet-400",
    amber: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 hover:bg-card-hover transition-colors">

      <div className="flex items-start justify-between gap-4">
        <p className="text-xs text-label">
          {label}
        </p>

        <div
          className={`h-9 w-9 rounded-md flex items-center justify-center text-sm ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-3xl font-semibold tracking-tight text-value">
          {value}
        </p>

        <p className="text-xs text-muted mt-2">
          {description}
        </p>
      </div>

    </div>
  );
}

/* ========================================================== */
/* Recent Activity */
/* ========================================================== */

function RecentActivity({
  logs,
}: {
  logs: RequestLogsResponse | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">

      <div className="flex items-start justify-between px-5 py-5 border-b border-border">
        <div>
          <h2 className="text-sm font-medium text-value">
            Recent request activity
          </h2>

          <p className="text-xs text-muted mt-1">
            Latest requests across your AI services
          </p>
        </div>

        <Link
          href="/logs"
          className="text-xs text-label hover:text-accent transition-colors"
        >
          View all →
        </Link>
      </div>

      {!logs && (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-muted">
            Loading activity...
          </p>
        </div>
      )}

      {logs && logs.items.length === 0 && (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-border bg-surface flex items-center justify-center">
              <span className="text-accent">⌁</span>
            </div>

            <p className="text-sm text-value">
              No requests yet
            </p>

            <p className="text-xs text-muted mt-1">
              Your request activity will appear here.
            </p>
          </div>
        </div>
      )}

      {logs && logs.items.length > 0 && (
        <div className="divide-y divide-border">
          {logs.items.slice(0, 6).map((log) => (
            <RequestRow
              key={log.id}
              log={log}
            />
          ))}
        </div>
      )}

    </div>
  );
}

/* ========================================================== */
/* Request Row */
/* ========================================================== */

function RequestRow({
  log,
}: {
  log: RequestLogEntry;
}) {
  const success = log.status_code >= 200 && log.status_code < 300;

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-card-hover transition-colors">

      <div
        className={`h-8 w-8 shrink-0 rounded-md flex items-center justify-center ${
          success
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {success ? "✓" : "!"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-value truncate">
          {log.service}
        </p>

        <p className="text-xs text-muted mt-0.5">
          {log.model_version ?? "Unknown model"}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm text-value">
          {log.latency_ms.toFixed(1)} ms
        </p>

        <p
          className={`text-xs mt-0.5 ${
            success
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {log.status_code}
        </p>
      </div>

    </div>
  );
}

/* ========================================================== */
/* Quick Actions */
/* ========================================================== */

function QuickActions() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">

      <div className="px-5 py-5 border-b border-border">
        <h2 className="text-sm font-medium text-value">
          Quick actions
        </h2>

        <p className="text-xs text-muted mt-1">
          Jump into your workflow
        </p>
      </div>

      <div className="p-3">

        <QuickAction
          href="/api-keys"
          icon="⌁"
          title="Create API key"
          description="Authenticate your application"
        />

        <QuickAction
          href="/services/fraud"
          icon="✦"
          title="Run fraud detection"
          description="Test the fraud detection service"
        />

        <QuickAction
          href="/usage"
          icon="▥"
          title="View usage"
          description="Inspect API consumption"
        />

        <QuickAction
          href="/logs"
          icon="≡"
          title="Inspect request logs"
          description="Review recent API activity"
        />

      </div>
    </div>
  );
}

/* ========================================================== */
/* Quick Action Item */
/* ========================================================== */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-3
        rounded-md
        px-3 py-3
        hover:bg-card-hover
        transition-colors
        group
      "
    >
      <div className="h-9 w-9 shrink-0 rounded-md bg-accent/10 text-accent flex items-center justify-center">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-value group-hover:text-accent transition-colors">
          {title}
        </p>

        <p className="text-xs text-muted mt-0.5">
          {description}
        </p>
      </div>

      <span className="text-muted group-hover:text-value transition-colors">
        ↗
      </span>
    </Link>
  );
}

/* ========================================================== */
/* Helpers */
/* ========================================================== */

function getFirstName(email?: string | null) {
  if (!email) return "there";

  const name = email.split("@")[0];

  if (!name) return "there";

  return name
    .split(/[._-]/)[0]
    .replace(/^\w/, (char) => char.toUpperCase());
}