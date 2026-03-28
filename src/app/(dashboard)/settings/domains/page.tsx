"use client";

import { useEffect, useState } from "react";

interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  createdAt: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchDomains = () => {
    fetch("/api/settings/domains")
      .then((r) => r.json())
      .then((data) => { setDomains(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDomains(); }, []);

  const addDomain = async () => {
    if (!newDomain) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/settings/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add domain");
      } else {
        setNewDomain("");
        fetchDomains();
      }
    } catch {
      setError("Failed to add domain");
    } finally {
      setAdding(false);
    }
  };

  const removeDomain = async (domainId: string) => {
    await fetch("/api/settings/domains", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId }),
    });
    fetchDomains();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Custom Domains</h1>
      <p className="text-gray-500 mb-8">
        Use your own domain for document sharing links. Requires Business plan.
      </p>

      {/* Add Domain */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Add a domain</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="docs.yourcompany.com"
            className="flex-1 px-3 py-2 bg-white border rounded text-sm outline-none focus:border-[#6C5CE7]"
          />
          <button
            onClick={addDomain}
            disabled={adding || !newDomain}
            className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add Domain"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {/* Domain List */}
      {domains.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="text-3xl mb-3">&#127760;</div>
          <p className="text-sm text-gray-500">No custom domains configured.</p>
          <p className="text-xs text-gray-400 mt-1">Add a domain above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1A1A2E]">{d.domain}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    d.verified
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {d.verified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
                {!d.verified && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Add this CNAME record to your DNS:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="text-xs">
                        <thead>
                          <tr className="text-gray-400">
                            <th className="pr-6 pb-1 text-left font-medium">Type</th>
                            <th className="pr-6 pb-1 text-left font-medium">Name</th>
                            <th className="pb-1 text-left font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-gray-700">
                            <td className="pr-6 py-1 font-mono">CNAME</td>
                            <td className="pr-6 py-1 font-mono">{d.domain.split(".")[0]}</td>
                            <td className="py-1 font-mono">cname.vercel-dns.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400">
                      DNS changes can take up to 48 hours to propagate.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeDomain(d.id)}
                className="text-xs text-red-500 hover:text-red-600 font-medium shrink-0 ml-4"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
