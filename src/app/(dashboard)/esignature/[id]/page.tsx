"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Field {
  id: string;
  type: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string | null;
  value: string | null;
}

interface SigRequest {
  id: string;
  title: string;
  signerEmail: string;
  signerName: string | null;
  status: string;
  slug: string;
  message: string | null;
  completedAt: string | null;
  document: { name: string; pageCount: number };
  fields: Field[];
  completion: {
    signerEmail: string;
    signerName: string | null;
    signatureMethod: string;
    completedAt: string;
    auditHash: string;
  } | null;
}

const fieldTypes = [
  { type: "SIGNATURE", label: "Signature", icon: "✍️", w: 20, h: 6 },
  { type: "INITIALS", label: "Initials", icon: "🔤", w: 8, h: 5 },
  { type: "DATE", label: "Date", icon: "📅", w: 15, h: 4 },
  { type: "TEXT", label: "Text", icon: "📝", w: 20, h: 4 },
  { type: "CHECKBOX", label: "Checkbox", icon: "☑️", w: 4, h: 4 },
];

export default function SignatureRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [request, setRequest] = useState<SigRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRequest = () => {
    fetch(`/api/esignature/${id}`).then(r => r.json()).then(data => {
      setRequest(data.id ? data : null);
      setLoading(false);
    });
  };

  useEffect(() => { fetchRequest(); }, [id]);

  const addField = async (type: string) => {
    const ft = fieldTypes.find(f => f.type === type);
    await fetch(`/api/esignature/${id}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        pageNumber: currentPage,
        x: 30 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        width: ft?.w || 20,
        height: ft?.h || 5,
        label: ft?.label,
      }),
    });
    fetchRequest();
  };

  const removeField = async (fieldId: string) => {
    await fetch(`/api/esignature/${id}/fields`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldId }),
    });
    fetchRequest();
  };

  const sendRequest = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/esignature/${id}/send`, { method: "POST" });
      if (res.ok) fetchRequest();
      else {
        const data = await res.json();
        alert(data.error || "Failed to send");
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-sm text-gray-400">Loading...</div>;
  if (!request) return <div className="py-20 text-center text-sm text-gray-400">Not found</div>;

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PENDING: "bg-yellow-50 text-yellow-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-600",
  };

  const pageFields = request.fields.filter(f => f.pageNumber === currentPage);

  return (
    <div>
      <Link href="/esignature" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]">
        &larr; Back to eSignature
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">{request.title}</h1>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColor[request.status]}`}>
              {request.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {request.document.name} &bull; To: {request.signerEmail}
          </p>
        </div>
        {request.status === "DRAFT" && (
          <button
            onClick={sendRequest}
            disabled={sending || request.fields.length === 0}
            className="rounded-lg bg-[#6C5CE7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send for Signature"}
          </button>
        )}
        {request.status === "PENDING" && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Sign link:</p>
            <code className="text-xs text-[#6C5CE7]">{typeof window !== "undefined" ? window.location.origin : ""}/sign/{request.slug}</code>
          </div>
        )}
      </div>

      {/* Completed info */}
      {request.completion && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <h3 className="text-sm font-semibold text-green-800 mb-2">&#9989; Signature Completed</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div><span className="text-green-600">Signer:</span><br/>{request.completion.signerEmail}</div>
            <div><span className="text-green-600">Method:</span><br/>{request.completion.signatureMethod}</div>
            <div><span className="text-green-600">Signed at:</span><br/>{new Date(request.completion.completedAt).toLocaleString()}</div>
            <div><span className="text-green-600">Audit hash:</span><br/><code className="text-[10px] break-all">{request.completion.auditHash.slice(0, 16)}...</code></div>
          </div>
        </div>
      )}

      {/* Field placement (DRAFT only) */}
      {request.status === "DRAFT" && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Add Fields to Page {currentPage}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {fieldTypes.map(ft => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-[#6C5CE7] transition"
              >
                {ft.icon} {ft.label}
              </button>
            ))}
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-30">
              &larr; Prev
            </button>
            <span className="text-xs text-gray-500">
              Page {currentPage} of {request.document.pageCount || "?"}
            </span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= (request.document.pageCount || 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-30">
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Fields list */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">
          Signature Fields ({request.fields.length})
        </h3>
        {request.fields.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No fields added yet. Add signature fields above.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Page</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Position</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Value</th>
                  {request.status === "DRAFT" && <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>}
                </tr>
              </thead>
              <tbody>
                {request.fields.map((f) => (
                  <tr key={f.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {fieldTypes.find(ft => ft.type === f.type)?.icon} {f.type}
                    </td>
                    <td className="px-4 py-3 text-gray-500">Page {f.pageNumber}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                      ({Math.round(f.x)}%, {Math.round(f.y)}%)
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {f.value ? <span className="text-green-600">{f.value.slice(0, 30)}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    {request.status === "DRAFT" && (
                      <td className="px-4 py-3">
                        <button onClick={() => removeField(f.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
