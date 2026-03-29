"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

interface Signer {
  id: string;
  email: string;
  name: string | null;
  order: number;
  status: string;
  signedAt: string | null;
}

interface SigRequest {
  id: string;
  title: string;
  signerEmail: string;
  status: string;
  slug: string;
  signedFileUrl: string | null;
  document: { name: string; pageCount: number };
  fields: Field[];
  signers: Signer[];
  pdfUrl: string | null;
  completion: {
    signerEmail: string;
    signerName: string | null;
    signatureMethod: string;
    completedAt: string;
    auditHash: string;
  } | null;
}

const fieldTypes = [
  { type: "SIGNATURE", label: "Signature", icon: "✍️", w: 22, h: 6, color: "#6C5CE7" },
  { type: "INITIALS", label: "Initials", icon: "🔤", w: 10, h: 5, color: "#a78bfa" },
  { type: "DATE", label: "Date", icon: "📅", w: 16, h: 4, color: "#f59e0b" },
  { type: "TEXT", label: "Text", icon: "📝", w: 22, h: 4, color: "#10b981" },
  { type: "CHECKBOX", label: "Checkbox", icon: "☑️", w: 4, h: 4, color: "#6b7280" },
];

const statusColor: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function SignatureRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [request, setRequest] = useState<SigRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [templates, setTemplates] = useState<{ id: string; name: string; fields: any[] }[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const fetchRequest = useCallback(() => {
    fetch(`/api/esignature/${id}`).then(r => r.json()).then(data => {
      setRequest(data.id ? data : null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => { fetchRequest(); }, [fetchRequest]);

  const fetchTemplates = () => {
    fetch("/api/esignature/templates").then(r => r.json()).then(data => {
      setTemplates(Array.isArray(data) ? data : []);
    });
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim() || !request?.fields.length) return;
    const fields = request.fields.map(f => ({
      type: f.type, pageNumber: f.pageNumber, x: f.x, y: f.y,
      width: f.width, height: f.height, label: f.label,
    }));
    await fetch("/api/esignature/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: templateName.trim(), fields }),
    });
    setTemplateName("");
    fetchTemplates();
  };

  const loadTemplate = async (template: { fields: any[] }) => {
    for (const f of template.fields) {
      await fetch(`/api/esignature/${id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
    }
    setShowTemplates(false);
    fetchRequest();
  };

  const handlePdfClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || !request || request.status !== "DRAFT") return;

    const container = pdfContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const ft = fieldTypes.find(f => f.type === activeTool);

    await fetch(`/api/esignature/${id}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: activeTool,
        pageNumber: currentPage,
        x: Math.max(0, Math.min(xPct - (ft?.w || 20) / 2, 100 - (ft?.w || 20))),
        y: Math.max(0, Math.min(yPct - (ft?.h || 5) / 2, 100 - (ft?.h || 5))),
        width: ft?.w || 20,
        height: ft?.h || 5,
        label: ft?.label,
      }),
    });

    setActiveTool(null);
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

  const handleFieldDragStart = (e: React.MouseEvent, fieldId: string) => {
    if (activeTool) return;
    e.stopPropagation();
    e.preventDefault();
    const container = pdfContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const field = request?.fields.find(f => f.id === fieldId);
    if (!field) return;
    const fieldXPx = (field.x / 100) * rect.width;
    const fieldYPx = (field.y / 100) * rect.height;
    setDragOffset({
      x: e.clientX - rect.left - fieldXPx,
      y: e.clientY - rect.top - fieldYPx,
    });
    setDragging(fieldId);
  };

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !pdfContainerRef.current) return;
    e.preventDefault();
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const field = request?.fields.find(f => f.id === dragging);
    if (!field) return;
    const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    // Update locally for smooth visual feedback
    const el = document.getElementById(`field-${dragging}`);
    if (el) {
      el.style.left = `${Math.max(0, Math.min(newX, 100 - field.width))}%`;
      el.style.top = `${Math.max(0, Math.min(newY, 100 - field.height))}%`;
    }
  }, [dragging, dragOffset, request?.fields]);

  const handleDragEnd = useCallback(async (e: React.MouseEvent) => {
    if (!dragging || !pdfContainerRef.current) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const field = request?.fields.find(f => f.id === dragging);
    if (!field) { setDragging(null); return; }
    const newX = Math.max(0, Math.min(((e.clientX - rect.left - dragOffset.x) / rect.width) * 100, 100 - field.width));
    const newY = Math.max(0, Math.min(((e.clientY - rect.top - dragOffset.y) / rect.height) * 100, 100 - field.height));
    setDragging(null);
    // Save to backend
    await fetch(`/api/esignature/${id}/fields`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldId: dragging, x: newX, y: newY }),
    });
    fetchRequest();
  }, [dragging, dragOffset, request?.fields, id, fetchRequest]);

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

  const pageFields = request.fields.filter(f => f.pageNumber === currentPage);

  return (
    <div>
      <Link href="/esignature" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]">
        &larr; Back to eSignature
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">{request.title}</h1>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColor[request.status]}`}>
              {request.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {request.document.name} &bull; {request.signers?.length || 1} signer{(request.signers?.length || 1) > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {request.status === "COMPLETED" && request.signedFileUrl && (
            <button
              onClick={async () => {
                const res = await fetch(`/api/esignature/${id}/download`);
                const data = await res.json();
                if (data.url) window.open(data.url, "_blank");
              }}
              className="rounded-lg bg-[#00B894] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00B894]/90"
            >
              Download Signed PDF
            </button>
          )}
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
            <div className="rounded-lg border border-gray-200 px-4 py-2.5">
              <p className="text-[10px] text-gray-400 mb-0.5">Share this link with signers:</p>
              <code className="text-xs text-[#6C5CE7]">{typeof window !== "undefined" ? window.location.origin : ""}/sign/{request.slug}</code>
            </div>
          )}
        </div>
      </div>

      {/* Completion info */}
      {request.completion && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <h3 className="text-sm font-semibold text-green-800 mb-2">&#9989; Signature Completed</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div><span className="text-green-600">Signer:</span><br/>{request.completion.signerEmail}</div>
            <div><span className="text-green-600">Method:</span><br/>{request.completion.signatureMethod}</div>
            <div><span className="text-green-600">Signed at:</span><br/>{new Date(request.completion.completedAt).toLocaleString()}</div>
            <div><span className="text-green-600">Audit hash:</span><br/><code className="text-[10px] break-all">{request.completion.auditHash.slice(0, 20)}...</code></div>
          </div>
        </div>
      )}

      {/* Signers */}
      {request.signers && request.signers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Signers</h3>
          <div className="flex flex-wrap gap-2">
            {request.signers.map((s) => (
              <div key={s.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                  {s.order + 1}
                </span>
                <span className="text-xs font-medium">{s.name || s.email}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                  s.status === "SIGNED" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                }`}>
                  {s.status === "SIGNED" ? "Signed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual PDF Editor (DRAFT only) */}
      {request.status === "DRAFT" && request.pdfUrl && (
        <div className="mb-6">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-2">Place field:</span>
            {fieldTypes.map(ft => (
              <button
                key={ft.type}
                onClick={() => setActiveTool(activeTool === ft.type ? null : ft.type)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  activeTool === ft.type
                    ? "border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {ft.icon} {ft.label}
              </button>
            ))}
            {activeTool && (
              <span className="text-xs text-[#6C5CE7] animate-pulse ml-2">
                Click on the PDF to place the {activeTool.toLowerCase()} field
              </span>
            )}
          </div>

          {/* Template actions */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button
              onClick={() => { setShowTemplates(!showTemplates); if (!showTemplates) fetchTemplates(); }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Load Template
            </button>
            {request.fields.length > 0 && (
              <div className="flex items-center gap-1">
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name..."
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs w-36 outline-none focus:border-[#6C5CE7]"
                />
                <button
                  onClick={saveAsTemplate}
                  disabled={!templateName.trim()}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          {showTemplates && (
            <div className="mb-3 rounded-xl border border-gray-200 bg-white p-3">
              {templates.length === 0 ? (
                <p className="text-xs text-gray-400">No saved templates yet.</p>
              ) : (
                <div className="space-y-1">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => loadTemplate(t)}
                      className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-gray-50 transition text-left"
                    >
                      <span className="font-medium text-[#1A1A2E]">{t.name}</span>
                      <span className="text-gray-400">{(t.fields as any[]).length} fields</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Page navigation */}
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-30">
              &larr; Prev
            </button>
            <span className="text-xs text-gray-500">
              Page {currentPage} of {numPages || request.document.pageCount || "?"}
            </span>
            <button onClick={() => setCurrentPage(Math.min(numPages || 999, currentPage + 1))} disabled={currentPage >= numPages} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-30">
              Next &rarr;
            </button>
          </div>

          {/* PDF with field overlays */}
          <div
            ref={pdfContainerRef}
            className={`relative border-2 rounded-xl overflow-hidden inline-block select-none ${
              activeTool ? "border-[#6C5CE7] cursor-crosshair" : dragging ? "border-blue-400 cursor-grabbing" : "border-gray-200"
            }`}
            onClick={handlePdfClick}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <Document
              file={request.pdfUrl}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              loading={<div className="w-[612px] h-[792px] bg-gray-50 flex items-center justify-center text-sm text-gray-400">Loading PDF...</div>}
            >
              <Page
                pageNumber={currentPage}
                width={612}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>

            {/* Field overlays */}
            {pageFields.map((f) => {
              const ft = fieldTypes.find(t => t.type === f.type);
              return (
                <div
                  key={f.id}
                  id={`field-${f.id}`}
                  className={`absolute group ${dragging === f.id ? "opacity-80 z-50" : ""}`}
                  style={{
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                    width: `${f.width}%`,
                    height: `${f.height}%`,
                    border: `2px ${dragging === f.id ? "solid" : "dashed"} ${ft?.color || "#6C5CE7"}`,
                    borderRadius: "6px",
                    background: `${ft?.color || "#6C5CE7"}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: ft?.color || "#6C5CE7",
                    cursor: activeTool ? "crosshair" : dragging === f.id ? "grabbing" : "grab",
                    pointerEvents: activeTool ? "none" : "auto",
                    boxShadow: dragging === f.id ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                    transition: dragging === f.id ? "none" : "box-shadow 0.2s",
                  }}
                  onMouseDown={(e) => handleFieldDragStart(e, f.id)}
                >
                  <span className="truncate px-1 pointer-events-none">{ft?.icon} {f.type}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeField(f.id); }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fields table */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">
          Fields ({request.fields.length})
        </h3>
        {request.fields.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">
              {request.status === "DRAFT" ? "Select a field type above and click on the PDF to place it." : "No fields."}
            </p>
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
                  {request.status === "DRAFT" && <th className="px-4 py-3 text-left font-medium text-gray-600"></th>}
                </tr>
              </thead>
              <tbody>
                {request.fields.map((f) => {
                  const ft = fieldTypes.find(t => t.type === f.type);
                  return (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        <span style={{ color: ft?.color }}>{ft?.icon} {f.type}</span>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
