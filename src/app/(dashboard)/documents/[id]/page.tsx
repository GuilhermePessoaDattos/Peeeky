"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";

interface LinkItem {
  id: string;
  slug: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { views: number };
}

interface DocumentDetail {
  id: string;
  name: string;
  status: string;
  fileType: string;
  totalViews: number;
  pageCount: number;
  createdAt: string;
  links: LinkItem[];
}

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${id}`);
      const data = await res.json();
      setDoc(data.document);
    } catch (error) {
      console.error("Failed to fetch document:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const createLink = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/documents/${id}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchDocument();
      }
    } catch (error) {
      console.error("Failed to create link:", error);
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/view/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteDoc = async () => {
    if (!confirm("Delete this document and all its links?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    window.location.href = "/documents";
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Loading...</div>;
  }

  if (!doc) {
    return <div className="py-20 text-center text-sm text-gray-400">Document not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/documents" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]">
          &larr; Back to Documents
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">{doc.name}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span>{doc.fileType}</span>
              <span>&bull;</span>
              <span>{doc.totalViews} total views</span>
              <span>&bull;</span>
              <span>{doc.links.length} links</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createLink}
              disabled={creating}
              className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "+ Create Link"}
            </button>
            <button
              onClick={deleteDoc}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-medium uppercase text-gray-400">Total Views</div>
          <div className="mt-1 font-display text-2xl font-bold text-[#1A1A2E]">{doc.totalViews}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-medium uppercase text-gray-400">Links</div>
          <div className="mt-1 font-display text-2xl font-bold text-[#6C5CE7]">{doc.links.length}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-medium uppercase text-gray-400">Status</div>
          <div className={`mt-1 font-display text-2xl font-bold ${doc.status === "READY" ? "text-[#00B894]" : "text-yellow-600"}`}>
            {doc.status}
          </div>
        </div>
      </div>

      {/* Links */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-[#1A1A2E]">Links</h2>
        {doc.links.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="mb-4 text-sm text-gray-500">No links yet. Create one to start sharing.</p>
            <button
              onClick={createLink}
              className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white"
            >
              + Create Link
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {doc.links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium text-[#1A1A2E]">
                      /view/{link.slug}
                    </code>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      link.isActive ? "bg-[#00B894]/10 text-[#00B894]" : "bg-gray-100 text-gray-500"
                    }`}>
                      {link.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {link._count.views} views &bull; Created {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLink(link.slug)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    {copied === link.slug ? "Copied!" : "Copy Link"}
                  </button>
                  <a
                    href={`/view/${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Preview
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
