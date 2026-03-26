"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";

interface LinkItem {
  id: string;
  slug: string;
  name: string | null;
  isActive: boolean;
  password: string | null;
  requireEmail: boolean;
  allowDownload: boolean;
  enableWatermark: boolean;
  expiresAt: string | null;
  maxViews: number | null;
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

function LinkSettings({
  link,
  onUpdate,
}: {
  link: LinkItem;
  onUpdate: () => void;
}) {
  const [password, setPassword] = useState("");
  const [requireEmail, setRequireEmail] = useState(link.requireEmail);
  const [allowDownload, setAllowDownload] = useState(link.allowDownload);
  const [enableWatermark, setEnableWatermark] = useState(link.enableWatermark);
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? link.expiresAt.slice(0, 16) : ""
  );
  const [maxViews, setMaxViews] = useState(link.maxViews?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (field: string, value: unknown) => {
    setSaving(true);
    try {
      await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      onUpdate();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSet = async () => {
    if (!password) return;
    await save("password", password);
    setPassword("");
  };

  const handlePasswordClear = async () => {
    await save("password", null);
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 space-y-4">
      {saved && (
        <div className="text-xs font-medium text-[#00B894]">Settings saved</div>
      )}

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          Password Protection
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={link.password ? "Change password..." : "Set a password..."}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#6C5CE7]"
          />
          <button
            onClick={handlePasswordSet}
            disabled={!password || saving}
            className="rounded-lg bg-[#6C5CE7] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            Set
          </button>
          {link.password && (
            <button
              onClick={handlePasswordClear}
              disabled={saving}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        {link.password && (
          <p className="mt-1 text-[10px] text-[#00B894]">Password is set</p>
        )}
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={requireEmail}
            onChange={(e) => {
              setRequireEmail(e.target.checked);
              save("requireEmail", e.target.checked);
            }}
            className="rounded border-gray-300 text-[#6C5CE7] focus:ring-[#6C5CE7]"
          />
          Require Email
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={allowDownload}
            onChange={(e) => {
              setAllowDownload(e.target.checked);
              save("allowDownload", e.target.checked);
            }}
            className="rounded border-gray-300 text-[#6C5CE7] focus:ring-[#6C5CE7]"
          />
          Allow Download
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={enableWatermark}
            onChange={(e) => {
              setEnableWatermark(e.target.checked);
              save("enableWatermark", e.target.checked);
            }}
            className="rounded border-gray-300 text-[#6C5CE7] focus:ring-[#6C5CE7]"
          />
          Watermark
        </label>
      </div>

      {/* Expiry & Max Views */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Expires At
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#6C5CE7]"
            />
            <button
              onClick={() => save("expiresAt", expiresAt || null)}
              disabled={saving}
              className="rounded-lg bg-gray-100 px-2 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              Set
            </button>
            {link.expiresAt && (
              <button
                onClick={() => {
                  setExpiresAt("");
                  save("expiresAt", null);
                }}
                disabled={saving}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Max Views
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="Unlimited"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#6C5CE7]"
            />
            <button
              onClick={() =>
                save("maxViews", maxViews ? parseInt(maxViews) : null)
              }
              disabled={saving}
              className="rounded-lg bg-gray-100 px-2 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              Set
            </button>
            {link.maxViews && (
              <button
                onClick={() => {
                  setMaxViews("");
                  save("maxViews", null);
                }}
                disabled={saving}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
  const [expandedLink, setExpandedLink] = useState<string | null>(null);

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

  const toggleLinkActive = async (linkId: string) => {
    try {
      await fetch(`/api/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      await fetchDocument();
    } catch (error) {
      console.error("Failed to toggle link:", error);
    }
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
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="flex items-center justify-between p-4">
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
                      {link.password && (
                        <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-semibold text-yellow-600">
                          Password
                        </span>
                      )}
                      {link.requireEmail && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                          Email
                        </span>
                      )}
                      {link.expiresAt && (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                          Expires
                        </span>
                      )}
                      {link.maxViews && (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                          Max {link.maxViews} views
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {link._count.views} views &bull; Created {new Date(link.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLinkActive(link.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        link.isActive
                          ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                          : "border-[#00B894]/30 text-[#00B894] hover:bg-[#00B894]/5"
                      }`}
                    >
                      {link.isActive ? "Disable" : "Enable"}
                    </button>
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
                    <button
                      onClick={() =>
                        setExpandedLink(expandedLink === link.id ? null : link.id)
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        expandedLink === link.id
                          ? "border-[#6C5CE7] bg-[#6C5CE7]/5 text-[#6C5CE7]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Settings
                    </button>
                  </div>
                </div>

                {expandedLink === link.id && (
                  <LinkSettings link={link} onUpdate={fetchDocument} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
