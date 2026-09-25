"use client";

import { useEffect, useState, FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { ApiKey, ApiKeyCreated } from "@/lib/types";

export default function ApiKeysPage() {
  const { token } = useAuth();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<ApiKeyCreated | null>(null);

  async function loadKeys() {
    try {
      const data = await api.get<ApiKey[]>("/api-keys", token);
      setKeys(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load API keys");
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
      const created = await api.post<ApiKeyCreated>("/api-keys", { name: newKeyName }, token);
      setRevealedKey(created);
      setNewKeyName("");
      await loadKeys();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      await api.delete(`/api-keys/${id}`, token);
      await loadKeys();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to revoke API key");
    }
  }

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">API Keys</h1>

      {revealedKey && (
        <div className="mb-6 border-2 border-black rounded-lg p-4 bg-yellow-50">
          <p className="font-medium mb-2">
            Copy this key now — you won&apos;t be able to see it again.
          </p>
          <code className="block bg-white border rounded px-3 py-2 text-sm break-all mb-3">
            {revealedKey.api_key}
          </code>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(revealedKey.api_key)}
              className="text-sm bg-black text-white px-3 py-1 rounded"
            >
              Copy
            </button>
            <button
              onClick={() => setRevealedKey(null)}
              className="text-sm text-gray-600 underline px-3 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="Key name (e.g. Production)"
          className="border rounded px-3 py-2 text-sm flex-1 max-w-xs"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Key"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {keys === null && !error && <p className="text-muted">Loading...</p>}

      {keys && keys.length === 0 && <p className="text-muted">No API keys yet.</p>}

      {keys && keys.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Key</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Created</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b">
                <td className="py-2">{key.name}</td>
                <td className="py-2 font-mono text-xs">{key.key_prefix}...</td>
                <td className="py-2">
                  <span className={key.status === "active" ? "text-green-700" : "text-muted"}>
                    {key.status}
                  </span>
                </td>
                <td className="py-2 text-value">
                  {new Date(key.created_at).toLocaleDateString()}
                </td>
                <td className="py-2">
                  {key.status === "active" && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-red-600 underline text-xs"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ProtectedRoute>
  );
}