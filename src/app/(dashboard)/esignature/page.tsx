"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SigRequest {
  id: string;
  title: string;
  signerEmail: string;
  status: string;
  slug: string;
  completedAt: string | null;
  createdAt: string;
  document: { name: string };
  _count: { fields: number };
}

export default function ESignaturePage() {
  const [requests, setRequests] = useState<SigRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [docs, setDocs] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ documentId: "", title: "", message: "" });
  const [signerInputs, setSignerInputs] = useState([{ email: "", name: "" }]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/esignature").then(r => r.json()).then(data => {
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const loadDocs = () => {
    fetch("/api/documents").then(r => r.json()).then(data => {
      setDocs((data.documents || []).filter((d: any) => d.status === "READY"));
    });
  };

  const addSigner = () => setSignerInputs([...signerInputs, { email: "", name: "" }]);
  const removeSigner = (i: number) => setSignerInputs(signerInputs.filter((_, idx) => idx !== i));
  const updateSigner = (i: number, field: string, value: string) => {
    const updated = [...signerInputs];
    (updated[i] as any)[field] = value;
    setSignerInputs(updated);
  };

  const create = async () => {
    const validSigners = signerInputs.filter(s => s.email);
    if (!form.documentId || !form.title || validSigners.length === 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/esignature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, signers: validSigners }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/esignature/${data.id}`;
      }
    } finally {
      setCreating(false);
    }
  };

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PENDING: "bg-yellow-50 text-yellow-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-600",
  };

  if (loading) return <div className="py-20 text-center text-sm text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">eSignature</h1>
          <p className="text-sm text-gray-500 mt-1">Request signatures on your documents.</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); loadDocs(); }}
          className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          + New Request
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">Create Signature Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Document</label>
              <select
                value={form.documentId}
                onChange={(e) => setForm({ ...form, documentId: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7]"
              >
                <option value="">Select a document</option>
                {docs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. NDA for Series A"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7]"
              />
            </div>
          </div>

          {/* Signers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-600">Signers</label>
              <button onClick={addSigner} className="text-xs font-medium text-[#6C5CE7] hover:underline">+ Add signer</button>
            </div>
            {signerInputs.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={s.email}
                  onChange={(e) => updateSigner(i, "email", e.target.value)}
                  placeholder={`Signer ${i + 1} email`}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7]"
                />
                <input
                  value={s.name}
                  onChange={(e) => updateSigner(i, "name", e.target.value)}
                  placeholder="Name (optional)"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7]"
                />
                {signerInputs.length > 1 && (
                  <button onClick={() => removeSigner(i)} className="text-xs text-red-500 hover:underline px-2">Remove</button>
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Message (optional)</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Please review and sign this document..."
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7] resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={create} disabled={creating} className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {creating ? "Creating..." : "Create & Add Fields"}
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Requests list */}
      {requests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="text-4xl mb-4">&#9997;&#65039;</div>
          <h2 className="font-display text-lg font-semibold text-[#1A1A2E] mb-2">No signature requests</h2>
          <p className="text-sm text-gray-500">Create your first signature request to get documents signed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/esignature/${r.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1A1A2E]">{r.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.document.name} &bull; To: {r.signerEmail} &bull; {r._count.fields} field{r._count.fields !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {r.completedAt ? `Signed ${new Date(r.completedAt).toLocaleDateString()}` : new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
