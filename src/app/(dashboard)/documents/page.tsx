"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DocumentItem {
  id: string;
  name: string;
  status: string;
  fileType: string;
  totalViews: number;
  createdAt: string;
  _count: { links: number };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Upload failed");
        return;
      }

      await fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">Documents</h1>
        <label className={`cursor-pointer rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          {uploading ? "Uploading..." : "+ Upload Document"}
          <input
            type="file"
            accept=".pdf,.pptx"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20">
          <div className="mb-4 text-4xl">&#128196;</div>
          <h2 className="mb-2 font-display text-lg font-semibold text-[#1A1A2E]">No documents yet</h2>
          <p className="mb-6 text-sm text-gray-500">Upload your first document and start tracking who reads it.</p>
          <label className="cursor-pointer rounded-lg bg-[#6C5CE7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90">
            Upload Document
            <input type="file" accept=".pdf,.pptx" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md hover:border-[#6C5CE7]/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{doc.fileType === "PDF" ? "\u{1F4C4}" : "\u{1F4CA}"}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  doc.status === "READY" ? "bg-[#00B894]/10 text-[#00B894]" :
                  doc.status === "PROCESSING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {doc.status}
                </span>
              </div>
              <h3 className="mb-1 font-display font-semibold text-[#1A1A2E] truncate group-hover:text-[#6C5CE7]">
                {doc.name}
              </h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{doc.totalViews} views</span>
                <span>{doc._count.links} links</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
