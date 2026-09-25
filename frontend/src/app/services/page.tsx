"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api, ApiError } from "@/lib/api";
import { Service } from "@/lib/types";

function StatusBadge({ status }: { status: Service["status"] }) {
  const isProduction = status === "production";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${
        isProduction
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isProduction ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />

      {isProduction ? "Production" : "Designed"}
    </span>
  );
}

function ServiceIcon({ isFraud }: { isFraud: boolean }) {
  return (
    <div className="h-10 w-10 rounded-md bg-accent/10 border border-accent/10 text-accent flex items-center justify-center text-lg">
      {isFraud ? "✦" : "◇"}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Service[]>("/services")
      .then(setServices)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load services"
        )
      );
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-[1400px] mx-auto">

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium mb-3">
            AIaaS / Services
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-value">
                AI Services
              </h1>

              <p className="mt-2 text-sm text-label">
                Explore the AI services available through your platform.
              </p>
            </div>

            {services && services.length > 0 && (
              <div className="text-xs text-muted">
                {services.length}{" "}
                {services.length === 1 ? "service" : "services"} available
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* Error */}
        {/* ================================================= */}

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 mb-6">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* Loading */}
        {/* ================================================= */}

        {!error && services === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ServiceSkeleton />
            <ServiceSkeleton />
          </div>
        )}

        {/* ================================================= */}
        {/* Empty */}
        {/* ================================================= */}

        {services && services.length === 0 && (
          <div className="rounded-lg border border-border bg-card min-h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-11 w-11 rounded-md border border-border bg-surface flex items-center justify-center">
                <span className="text-accent">◇</span>
              </div>

              <p className="text-sm text-value">
                No services available
              </p>

              <p className="text-xs text-muted mt-1">
                AI services will appear here when they are available.
              </p>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* Services */}
        {/* ================================================= */}

        {services && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              const isFraud =
                service.name.toLowerCase().includes("fraud");

              const card = (
                <div
                  className="
                    group
                    h-full
                    rounded-lg
                    border border-border
                    bg-card
                    p-5
                    transition-all
                    hover:bg-card-hover
                    hover:border-[#34404D]
                  "
                >
                  {/* Top row */}

                  <div className="flex items-start justify-between gap-4">
                    <ServiceIcon isFraud={isFraud} />

                    <StatusBadge status={service.status} />
                  </div>

                  {/* Service information */}

                  <div className="mt-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-medium text-value">
                        {service.name}
                      </h2>

                      {isFraud && (
                        <span className="text-[10px] uppercase tracking-wider text-accent">
                          API
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-label leading-6 mt-2">
                      {service.description}
                    </p>
                  </div>

                  {/* Bottom section */}

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted">
                        Price
                      </p>

                      <p className="text-sm font-medium text-value mt-1">
                        ${service.price_per_request.toFixed(4)}
                        <span className="text-xs text-muted font-normal">
                          {" "}
                          / request
                        </span>
                      </p>
                    </div>

                    <span className="text-muted group-hover:text-accent transition-colors text-sm">
                      {isFraud ? "Open service ↗" : "Available"}
                    </span>
                  </div>
                </div>
              );

              return isFraud ? (
                <Link
                  key={service.id}
                  href="/services/fraud"
                  className="block h-full"
                >
                  {card}
                </Link>
              ) : (
                <div key={service.id} className="h-full">
                  {card}
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================= */}
        {/* Bottom status */}
        {/* ================================================= */}

        {services && services.length > 0 && (
          <div className="mt-6 rounded-lg border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />

              <p className="text-xs text-label">
                Services are available through the AIaaS platform.
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

/* ========================================================= */
/* Loading skeleton                                          */
/* ========================================================= */

function ServiceSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-pulse">
      <div className="flex justify-between">
        <div className="h-10 w-10 rounded-md bg-surface" />
        <div className="h-6 w-20 rounded-full bg-surface" />
      </div>

      <div className="mt-5">
        <div className="h-4 w-40 rounded bg-surface" />
        <div className="h-3 w-full rounded bg-surface mt-3" />
        <div className="h-3 w-3/4 rounded bg-surface mt-2" />
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="h-3 w-24 rounded bg-surface" />
        <div className="h-4 w-32 rounded bg-surface mt-2" />
      </div>
    </div>
  );
}