"use client";

import { useState } from "react";

interface AccessGateProps {
  linkId: string;
  slug: string;
  requirePassword: boolean;
  requireEmail: boolean;
  documentName: string;
}

export function AccessGate({ linkId, slug, requirePassword, requireEmail, documentName }: AccessGateProps) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (requirePassword) {
        const res = await fetch(`/api/links/${linkId}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (!res.ok) {
          setError("Invalid password");
          setLoading(false);
          return;
        }
      }

      // Redirect to viewer with verified params
      const params = new URLSearchParams();
      if (requirePassword) params.set("p", "1");
      if (requireEmail && email) params.set("email", email);
      window.location.href = `/view/${slug}/doc?${params.toString()}`;
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A2E] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8">
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl">&#128274;</div>
          <h1 className="font-display text-lg font-bold text-[#1A1A2E]">Protected Document</h1>
          <p className="mt-1 text-sm text-gray-500">{documentName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requireEmail && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Your email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
              />
            </div>
          )}

          {requirePassword && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#6C5CE7] py-3 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "View Document"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="https://peeeky.com" className="text-[10px] text-gray-300 hover:text-gray-400">
            Secured by Peeeky
          </a>
        </div>
      </div>
    </div>
  );
}
