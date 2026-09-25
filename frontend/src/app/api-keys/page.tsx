// "use client";

// import { useEffect, useState, FormEvent } from "react";
// import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { useAuth } from "@/lib/auth-context";
// import { api, ApiError } from "@/lib/api";
// import { ApiKey, ApiKeyCreated } from "@/lib/types";

// export default function ApiKeysPage() {
//   const { token } = useAuth();
//   const [keys, setKeys] = useState<ApiKey[] | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [newKeyName, setNewKeyName] = useState("");
//   const [creating, setCreating] = useState(false);
//   const [revealedKey, setRevealedKey] = useState<ApiKeyCreated | null>(null);

//   async function loadKeys() {
//     try {
//       const data = await api.get<ApiKey[]>("/api-keys", token);
//       setKeys(data);
//     } catch (err) {
//       setError(err instanceof ApiError ? err.message : "Failed to load API keys");
//     }
//   }

//   useEffect(() => {
//     loadKeys();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function handleCreate(e: FormEvent) {
//     e.preventDefault();
//     if (!newKeyName.trim()) return;
//     setCreating(true);
//     setError(null);
//     try {
//       const created = await api.post<ApiKeyCreated>("/api-keys", { name: newKeyName }, token);
//       setRevealedKey(created);
//       setNewKeyName("");
//       await loadKeys();
//     } catch (err) {
//       setError(err instanceof ApiError ? err.message : "Failed to create API key");
//     } finally {
//       setCreating(false);
//     }
//   }

//   async function handleRevoke(id: string) {
//     if (!confirm("Revoke this API key? This cannot be undone.")) return;
//     try {
//       await api.delete(`/api-keys/${id}`, token);
//       await loadKeys();
//     } catch (err) {
//       setError(err instanceof ApiError ? err.message : "Failed to revoke API key");
//     }
//   }

//   return (
//     <ProtectedRoute>
//       <h1 className="text-2xl font-semibold mb-6">API Keys</h1>

//       {revealedKey && (
//         <div className="mb-6 border-2 border-black rounded-lg p-4 bg-yellow-50">
//           <p className="font-medium mb-2">
//             Copy this key now — you won&apos;t be able to see it again.
//           </p>
//           <code className="block bg-white border rounded px-3 py-2 text-sm break-all mb-3">
//             {revealedKey.api_key}
//           </code>
//           <div className="flex gap-2">
//             <button
//               onClick={() => navigator.clipboard.writeText(revealedKey.api_key)}
//               className="text-sm bg-black text-white px-3 py-1 rounded"
//             >
//               Copy
//             </button>
//             <button
//               onClick={() => setRevealedKey(null)}
//               className="text-sm text-gray-600 underline px-3 py-1"
//             >
//               Dismiss
//             </button>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleCreate} className="mb-6 flex gap-2">
//         <input
//           type="text"
//           value={newKeyName}
//           onChange={(e) => setNewKeyName(e.target.value)}
//           placeholder="Key name (e.g. Production)"
//           className="border rounded px-3 py-2 text-sm flex-1 max-w-xs"
//         />
//         <button
//           type="submit"
//           disabled={creating}
//           className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
//         >
//           {creating ? "Creating..." : "Create Key"}
//         </button>
//       </form>

//       {error && <p className="text-red-600 mb-4">{error}</p>}

//       {keys === null && !error && <p className="text-muted">Loading...</p>}

//       {keys && keys.length === 0 && <p className="text-muted">No API keys yet.</p>}

//       {keys && keys.length > 0 && (
//         <table className="w-full text-sm border-collapse">
//           <thead>
//             <tr className="text-left border-b">
//               <th className="pb-2">Name</th>
//               <th className="pb-2">Key</th>
//               <th className="pb-2">Status</th>
//               <th className="pb-2">Created</th>
//               <th className="pb-2"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {keys.map((key) => (
//               <tr key={key.id} className="border-b">
//                 <td className="py-2">{key.name}</td>
//                 <td className="py-2 font-mono text-xs">{key.key_prefix}...</td>
//                 <td className="py-2">
//                   <span className={key.status === "active" ? "text-green-700" : "text-muted"}>
//                     {key.status}
//                   </span>
//                 </td>
//                 <td className="py-2 text-value">
//                   {new Date(key.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="py-2">
//                   {key.status === "active" && (
//                     <button
//                       onClick={() => handleRevoke(key.id)}
//                       className="text-red-600 underline text-xs"
//                     >
//                       Revoke
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </ProtectedRoute>
//   );
// }

"use client";

import { useEffect, useState, FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { ApiKey, ApiKeyCreated } from "@/lib/types";

function StatusBadge({ status }: { status: ApiKey["status"] }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-slate-500"
        }`}
      />

      {active ? "Active" : "Revoked"}
    </span>
  );
}

export default function ApiKeysPage() {
  const { token } = useAuth();

  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] =
    useState<ApiKeyCreated | null>(null);

  async function loadKeys() {
    try {
      const data = await api.get<ApiKey[]>("/api-keys", token);
      setKeys(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load API keys"
      );
    }
  }

  useEffect(() => {
    loadKeys();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();

    if (!newKeyName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const created = await api.post<ApiKeyCreated>(
        "/api-keys",
        { name: newKeyName },
        token
      );

      setRevealedKey(created);
      setNewKeyName("");

      await loadKeys();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create API key"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (
      !confirm(
        "Revoke this API key? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api-keys/${id}`, token);
      await loadKeys();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to revoke API key"
      );
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
            AIaaS / API Keys
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-value">
                API Keys
              </h1>

              <p className="mt-2 text-sm text-label">
                Manage credentials used by your applications.
              </p>
            </div>

            {keys && (
              <div className="text-xs text-muted">
                {keys.length}{" "}
                {keys.length === 1 ? "key" : "keys"} configured
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* Newly created key */}
        {/* ================================================= */}

        {revealedKey && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">

            <div className="px-5 py-4 border-b border-amber-500/20">
              <div className="flex items-start gap-3">

                <div className="h-9 w-9 shrink-0 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  !
                </div>

                <div>
                  <p className="text-sm font-medium text-value">
                    API key created
                  </p>

                  <p className="text-xs text-label mt-1">
                    Copy this key now — you won&apos;t be able
                    to see it again.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-5">

              <code className="block rounded-md border border-border bg-[#080B10] px-4 py-3 text-xs font-mono text-value break-all">
                {revealedKey.api_key}
              </code>

              <div className="flex items-center gap-2 mt-4">

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      revealedKey.api_key
                    )
                  }
                  className="
                    h-9
                    px-4
                    rounded-md
                    bg-accent
                    text-[#061014]
                    text-xs
                    font-semibold
                    hover:bg-accent-hover
                    transition-colors
                  "
                >
                  Copy key
                </button>

                <button
                  onClick={() => setRevealedKey(null)}
                  className="
                    h-9
                    px-4
                    rounded-md
                    border
                    border-border
                    text-xs
                    text-label
                    hover:text-value
                    hover:bg-surface
                    transition-colors
                  "
                >
                  Dismiss
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* Create key */}
        {/* ================================================= */}

        <section className="rounded-lg border border-border bg-card mb-6">

          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-md bg-accent/10 border border-accent/10 flex items-center justify-center text-accent">
                +
              </div>

              <div>
                <h2 className="text-sm font-medium text-value">
                  Create API key
                </h2>

                <p className="text-xs text-muted mt-0.5">
                  Generate a credential for authenticating your application.
                </p>
              </div>

            </div>
          </div>

          <form
            onSubmit={handleCreate}
            className="p-5 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={newKeyName}
              onChange={(e) =>
                setNewKeyName(e.target.value)
              }
              placeholder="Key name (e.g. Production)"
              className="
                h-10
                border
                border-border
                rounded-md
                bg-surface
                px-3
                text-sm
                text-value
                placeholder:text-muted
                outline-none
                flex-1
                max-w-md
                focus:border-accent
                focus:ring-1
                focus:ring-accent/30
              "
            />

            <button
              type="submit"
              disabled={creating}
              className="
                h-10
                px-5
                rounded-md
                bg-accent
                text-[#061014]
                text-sm
                font-semibold
                hover:bg-accent-hover
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {creating ? "Creating..." : "Create API key"}
            </button>
          </form>
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

        {keys === null && !error && (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-32 rounded bg-surface" />
              <div className="h-10 w-full rounded bg-surface" />
              <div className="h-10 w-full rounded bg-surface" />
              <div className="h-10 w-full rounded bg-surface" />
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* Empty state */}
        {/* ================================================= */}

        {keys && keys.length === 0 && (
          <div className="rounded-lg border border-border bg-card min-h-64 flex items-center justify-center">

            <div className="text-center max-w-sm">

              <div className="mx-auto h-11 w-11 rounded-md border border-border bg-surface flex items-center justify-center text-accent">
                ⌁
              </div>

              <p className="text-sm text-value mt-4">
                No API keys yet
              </p>

              <p className="text-xs text-muted mt-1">
                Create your first API key to authenticate
                requests to the platform.
              </p>

            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* Keys table */}
        {/* ================================================= */}

        {keys && keys.length > 0 && (
          <section className="rounded-lg border border-border bg-card overflow-hidden">

            {/* Table header */}

            <div className="px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-medium text-value">
                  Your API keys
                </h2>

                <p className="text-xs text-muted mt-0.5">
                  Credentials associated with your organization.
                </p>
              </div>
            </div>

            {/* Desktop table */}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-border text-left">

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Name
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Key
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted">
                      Created
                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-muted text-right">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {keys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                    >

                      {/* Name */}

                      <td className="px-5 py-4">
                        <span className="font-medium text-value">
                          {key.name}
                        </span>
                      </td>

                      {/* Key prefix */}

                      <td className="px-5 py-4">
                        <code className="text-xs font-mono text-label">
                          {key.key_prefix}...
                        </code>
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <StatusBadge status={key.status} />
                      </td>

                      {/* Created */}

                      <td className="px-5 py-4 text-xs text-muted">
                        {new Date(
                          key.created_at
                        ).toLocaleDateString()}
                      </td>

                      {/* Action */}

                      <td className="px-5 py-4 text-right">
                        {key.status === "active" && (
                          <button
                            onClick={() =>
                              handleRevoke(key.id)
                            }
                            className="
                              text-xs
                              text-red-400
                              hover:text-red-300
                              transition-colors
                            "
                          >
                            Revoke
                          </button>
                        )}

                        {key.status === "revoked" && (
                          <span className="text-xs text-muted">
                            —
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* Security footer */}

            <div className="px-5 py-3 border-t border-border bg-surface/40">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />

                <p className="text-[11px] text-muted">
                  Raw API keys are only displayed once when created.
                </p>
              </div>
            </div>

          </section>
        )}

      </div>
    </ProtectedRoute>
  );
}