"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          organization_name: organizationName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
  const message =
    typeof data.detail === "string"
      ? data.detail
      : Array.isArray(data.detail)
        ? data.detail.map((err: any) => err.msg).join(", ")
        : "Registration failed.";

  throw new Error(message);
}

      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
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

        {/* Register card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-[#0f141b] shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold">
              Create account
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create your AI infrastructure account.
            </p>
          </div>

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
            <div className="mb-5">
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
                minLength={8}
                autoComplete="new-password"
                placeholder="Create a password"
                className="w-full rounded-lg border border-slate-700 bg-[#080b0f] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/*Organization Name */}
            <div className="mb-5">
            <label
                htmlFor="organizationName"
                className="mb-2 block text-sm font-medium text-slate-300"
            >
                Organization Name
            </label>

            <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                placeholder="Your organization"
                className="w-full rounded-lg border border-slate-700 bg-[#080b0f] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            </div>

            {/* Confirm password */}
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-slate-700 bg-[#080b0f] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>

          {/* Login link */}
          <div className="border-t border-slate-800 px-6 py-4 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-cyan-400 hover:text-cyan-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}