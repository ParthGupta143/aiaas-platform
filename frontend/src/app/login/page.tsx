"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      const destination =
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : "/dashboard";

      router.replace(destination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#080b0f] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
  <img
    src="/mindora-icon.png"
    alt="Mindora"
    className="h-12 w-12 object-contain"
  />
</div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Mindora
          </h1>

          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            AIaaS Platform
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-[#0f141b] shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold">
              Sign in
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Access your AI infrastructure dashboard.
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">

            {error && (
              <div className="mb-5 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-700 bg-[#080b0f] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-700 bg-[#080b0f] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 px-6 py-4">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>All systems operational</span>
            </div>
          </div>
        </form>

        {/* Bottom text */}
        <p className="mt-6 text-center text-xs text-slate-600">
          AIaaS Platform · Secure Control Plane
        </p>
      </div>
    </main>
  );
}