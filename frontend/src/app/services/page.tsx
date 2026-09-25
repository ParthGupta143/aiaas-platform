
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api, ApiError } from "@/lib/api";
import { Service } from "@/lib/types";

function StatusBadge({ status }: { status: Service["status"] }) {
  const isProduction = status === "production";

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${
        isProduction
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {isProduction ? "Production" : "Designed"}
    </span>
  );
}

export default function ServicesPage() {
  const [services, setServices] =
    useState<Service[] | null>(null);

  const [error, setError] =
    useState<string | null>(null);

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
      <h1 className="text-2xl font-semibold mb-6">
        AI Services
      </h1>

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      {!error && services === null && (
        <p className="text-muted">
          Loading...
        </p>
      )}

      {services && services.length === 0 && (
        <p className="text-muted">
          No services available yet.
        </p>
      )}

      {services && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const isFraud =
              service.name.toLowerCase().includes("fraud");

            const card = (
              <div className="border rounded-lg p-4 bg-white hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-medium">
                    {service.name}
                  </h2>

                  <StatusBadge status={service.status} />
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {service.description}
                </p>

                <p className="text-xs text-muted">
                  ${service.price_per_request.toFixed(4)} / request
                </p>
              </div>
            );

            return isFraud ? (
              <Link
                key={service.id}
                href="/services/fraud"
              >
                {card}
              </Link>
            ) : (
              <div key={service.id}>
                {card}
              </div>
            );
          })}
        </div>
      )}
    </ProtectedRoute>
  );
}