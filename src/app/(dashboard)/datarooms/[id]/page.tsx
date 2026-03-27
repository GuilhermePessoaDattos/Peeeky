"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";

interface DataRoomDoc {
  id: string;
  order: number;
  document: {
    id: string;
    name: string;
    fileType: string;
    pageCount: number;
    totalViews: number;
  };
}

interface DataRoomDetail {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  documents: DataRoomDoc[];
}

interface OrgDocument {
  id: string;
  name: string;
  fileType: string;
  status: string;
}

interface DataRoomViewer {
  viewer: string;
  device: string | null;
  docsViewed: number;
  totalDocs: number;
  totalDuration: number;
  avgScore: number;
  scoreColor: string;
  scoreLabel: string;
  lastSeen: string;
  viewCount: number;
}

interface DocBreakdown {
  documentId: string;
  name: string;
  fileType: string;
  pageCount: number;
  totalViews: number;
  avgDuration: number;
  avgCompletion: number;
}

interface DataRoomAnalytics {
  uniqueViewers: number;
  totalViews: number;
  avgEngagement: number;
  viewers: DataRoomViewer[];
  docBreakdown: DocBreakdown[];
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function DataRoomAnalyticsTab({ dataRoomId }: { dataRoomId: string }) {
  const [analytics, setAnalytics] = useState<DataRoomAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/datarooms/${dataRoomId}/analytics`)
      .then((r) => r.json())
      .then((data) => { setAnalytics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dataRoomId]);

  if (loading) return <div className="py-8 text-center text-sm text-gray-400">Loading analytics...</div>;
  if (!analytics) return <div className="py-8 text-center text-sm text-gray-400">Failed to load analytics.</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500">Unique Viewers</p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A2E]">{analytics.uniqueViewers}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500">Total Views</p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A2E]">{analytics.totalViews}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500">Avg Engagement</p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A2E]">{analytics.avgEngagement}</p>
        </div>
      </div>

      {/* Viewers Table */}
      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-[#1A1A2E]">Viewers</h3>
        {analytics.viewers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No views yet. Share the Data Room link to start tracking.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Viewer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Docs Viewed</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Views</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {analytics.viewers.map((v, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1A1A2E]">{v.viewer}</div>
                      {v.device && <div className="text-xs text-gray-400">{v.device}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#1A1A2E]">{v.docsViewed}</span>
                      <span className="text-gray-400"> / {v.totalDocs}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.viewCount}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDuration(v.totalDuration)}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: v.scoreColor + "20", color: v.scoreColor }}
                      >
                        {v.avgScore} — {v.scoreLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(v.lastSeen).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per-Document Breakdown */}
      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-[#1A1A2E]">Document Breakdown</h3>
        <div className="space-y-2">
          {analytics.docBreakdown.map((d) => (
            <div key={d.documentId} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">{d.fileType === "PDF" ? "\u{1F4C4}" : "\u{1F4CA}"}</span>
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E]">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.pageCount} pages</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-[#1A1A2E]">{d.totalViews}</p>
                  <p className="text-xs text-gray-400">views</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-[#1A1A2E]">{formatDuration(d.avgDuration)}</p>
                  <p className="text-xs text-gray-400">avg time</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-[#1A1A2E]">{d.avgCompletion}%</p>
                  <p className="text-xs text-gray-400">completion</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DataRoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [room, setRoom] = useState<DataRoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [orgDocs, setOrgDocs] = useState<OrgDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"documents" | "analytics">("documents");

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/datarooms/${id}`);
      const data = await res.json();
      setRoom(data.dataRoom || null);
    } catch (error) {
      console.error("Failed to fetch data room:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const fetchOrgDocs = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setOrgDocs(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAddDoc = async (documentId: string) => {
    try {
      const res = await fetch(`/api/datarooms/${id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to add document");
        return;
      }

      setShowAddDoc(false);
      await fetchRoom();
    } catch (error) {
      console.error("Add document error:", error);
      alert("Failed to add document");
    }
  };

  const handleRemoveDoc = async (documentId: string) => {
    if (!confirm("Remove this document from the data room?")) return;

    try {
      const res = await fetch(`/api/datarooms/${id}/documents?documentId=${documentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to remove document");
        return;
      }

      await fetchRoom();
    } catch (error) {
      console.error("Remove document error:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this data room? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/datarooms/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/datarooms";
      } else {
        alert("Failed to delete data room");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const copyLink = () => {
    if (!room) return;
    const url = `${window.location.origin}/room/${room.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-gray-500">Data room not found.</p>
        <Link href="/datarooms" className="mt-2 text-sm text-[#6C5CE7] hover:underline">
          Back to Data Rooms
        </Link>
      </div>
    );
  }

  const alreadyAdded = new Set(room.documents.map((d) => d.document.id));
  const availableDocs = orgDocs.filter((d) => !alreadyAdded.has(d.id) && d.status === "READY");

  return (
    <div>
      <div className="mb-2">
        <Link href="/datarooms" className="text-sm text-gray-500 hover:text-[#6C5CE7]">
          &larr; Data Rooms
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">{room.name}</h1>
          {room.description && <p className="mt-1 text-sm text-gray-500">{room.description}</p>}
        </div>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Delete Room
        </button>
      </div>

      {/* Share link */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1A1A2E]">Share Link</p>
            <p className="mt-0.5 text-xs text-gray-400 font-mono">
              {typeof window !== "undefined" ? window.location.origin : ""}/room/{room.slug}
            </p>
          </div>
          <button
            onClick={copyLink}
            className="rounded-lg bg-[#6C5CE7]/10 px-4 py-2 text-sm font-medium text-[#6C5CE7] transition hover:bg-[#6C5CE7]/20"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "documents" ? "bg-white text-[#1A1A2E] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Documents ({room.documents.length})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "analytics" ? "bg-white text-[#1A1A2E] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === "analytics" && <DataRoomAnalyticsTab dataRoomId={id} />}

      {/* Documents */}
      {activeTab === "documents" && <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[#1A1A2E]">
          Documents ({room.documents.length})
        </h2>
        <button
          onClick={() => { setShowAddDoc(true); fetchOrgDocs(); }}
          className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90"
        >
          + Add Document
        </button>
      </div>

      {/* Add document dropdown */}
      {showAddDoc && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[#1A1A2E]">Select a document to add</p>
            <button
              onClick={() => setShowAddDoc(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
          {loadingDocs ? (
            <p className="text-xs text-gray-400">Loading documents...</p>
          ) : availableDocs.length === 0 ? (
            <p className="text-xs text-gray-400">No available documents to add.</p>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {availableDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleAddDoc(doc.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5"
                >
                  <span className="text-lg">{doc.fileType === "PDF" ? "\u{1F4C4}" : "\u{1F4CA}"}</span>
                  <span className="text-sm font-medium text-[#1A1A2E] truncate">{doc.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {room.documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16">
          <p className="text-sm text-gray-500">No documents in this data room yet.</p>
          <p className="mt-1 text-xs text-gray-400">Add documents to share them via a single link.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {room.documents.map((d, i) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-sm font-semibold text-[#6C5CE7]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-[#1A1A2E]">{d.document.name}</h3>
                  <p className="text-xs text-gray-400">
                    {d.document.fileType} &middot; {d.document.pageCount} pages &middot; {d.document.totalViews} views
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveDoc(d.document.id)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      </>}
    </div>
  );
}
