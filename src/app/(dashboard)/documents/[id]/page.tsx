"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Heatmap } from "@/components/analytics/Heatmap";

interface LinkItem {
  id: string;
  slug: string;
  name: string | null;
  isActive: boolean;
  password: string | null;
  requireEmail: boolean;
  allowDownload: boolean;
  enableWatermark: boolean;
  enableAIChat: boolean;
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

interface ViewItem {
  id: string;
  viewerEmail: string | null;
  ip: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  duration: number;
  completionRate: number;
  createdAt: string;
  engagementScore: number;
  link: { slug: string; name: string | null };
  pageViews: { pageNumber: number; duration: number }[];
}

interface PageAnalyticsItem {
  page: number;
  totalDuration: number;
  avgDuration: number;
}

interface AnalyticsData {
  totalViews: number;
  uniqueViewers: number;
  avgDuration: number;
  avgCompletion: number;
  views: ViewItem[];
  pageAnalytics: PageAnalyticsItem[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#00B894";
  if (score >= 30) return "#FDCB6E";
  return "#E17055";
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
  const [enableAIChat, setEnableAIChat] = useState(link.enableAIChat);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={enableAIChat}
            onChange={(e) => {
              setEnableAIChat(e.target.checked);
              save("enableAIChat", e.target.checked);
            }}
            className="rounded border-gray-300 text-[#6C5CE7] focus:ring-[#6C5CE7]"
          />
          AI Chat
        </label>
      </div>

      {/* Expiry & Max Views */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

function AnalyticsTab({ documentId, pageCount }: { documentId: string; pageCount: number }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/documents/${documentId}/analytics`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [documentId]);

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="py-12 text-center text-sm text-gray-400">Failed to load analytics</div>;
  }

  const maxDuration = Math.max(...analytics.pageAnalytics.map(p => p.avgDuration), 1);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-medium uppercase text-gray-400">Total Views</div>
          <div className="mt-1 font-display text-2xl font-bold text-[#1A1A2E]">{analytics.totalViews}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-medium uppercase text-gray-400">Unique Viewers</div>
          <div className="mt-1 font-display text-2xl font-bold text-[#6C5CE7]">{analytics.uniqueViewers}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-medium uppercase text-gray-400">Avg Duration</div>
          <div className="mt-1 font-display text-2xl font-bold text-[#1A1A2E]">{formatDuration(analytics.avgDuration)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-medium uppercase text-gray-400">Avg Completion</div>
          <div className="mt-1 font-display text-2xl font-bold text-[#00B894]">{analytics.avgCompletion}%</div>
        </div>
      </div>

      {/* Page Engagement Heatmap */}
      {analytics.pageAnalytics.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Heatmap
            pages={analytics.pageAnalytics}
            totalPages={pageCount || analytics.pageAnalytics.length}
          />
        </div>
      )}

      {/* Per-Page Time Chart */}
      {analytics.pageAnalytics.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-[#1A1A2E]">Time Spent Per Page</h3>
          <div className="space-y-2">
            {analytics.pageAnalytics.map((p) => (
              <div key={p.page} className="flex items-center gap-3">
                <span className="w-16 text-right text-xs text-gray-500">Page {p.page}</span>
                <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-[#6C5CE7] rounded"
                    style={{ width: `${Math.min((p.avgDuration / maxDuration) * 100, 100)}%` }}
                  />
                </div>
                <span className="w-12 text-xs text-gray-500">{formatDuration(p.avgDuration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viewers Table */}
      {analytics.views.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-display text-sm font-semibold text-[#1A1A2E]">Viewers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-xs font-medium uppercase text-gray-400">Viewer</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase text-gray-400">Link</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase text-gray-400">Device</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase text-gray-400">Duration</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase text-gray-400">Completion</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase text-gray-400">Score</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics.views.map((view) => (
                  <tr key={view.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="text-sm text-[#1A1A2E]">
                        {view.viewerEmail || view.ip || "Anonymous"}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <code className="text-xs text-gray-500">{view.link.slug}</code>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {[view.device, view.browser].filter(Boolean).join(" / ") || "-"}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-600 font-medium">
                      {formatDuration(view.duration)}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-600">
                      {Math.round(view.completionRate * 100)}%
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `${getScoreColor(view.engagementScore)}15`,
                          color: getScoreColor(view.engagementScore),
                        }}
                      >
                        {view.engagementScore}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">
                      {new Date(view.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">No views yet. Share a link to start tracking engagement.</p>
        </div>
      )}
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
  const [upgradeNeeded, setUpgradeNeeded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"links" | "analytics">("links");

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
        setUpgradeNeeded(false);
        await fetchDocument();
      } else {
        const data = await res.json();
        if (data.upgrade) {
          setUpgradeNeeded(true);
        }
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">{doc.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
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

      {upgradeNeeded && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#6C5CE7]/20 bg-[#6C5CE7]/5 p-4">
          <div>
            <p className="text-sm font-medium text-[#1A1A2E]">You&apos;ve reached your plan limit</p>
            <p className="text-xs text-gray-500">Upgrade to Pro for unlimited documents, links, and AI chat.</p>
          </div>
          <a href="/settings/billing" className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6C5CE7]/90">
            Upgrade
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-0 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("links")}
          className={`relative px-4 py-3 text-sm font-medium transition ${
            activeTab === "links"
              ? "text-[#6C5CE7]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Links
          {activeTab === "links" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C5CE7] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`relative px-4 py-3 text-sm font-medium transition ${
            activeTab === "analytics"
              ? "text-[#6C5CE7]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Analytics
          {activeTab === "analytics" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C5CE7] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "links" && (
        <div>
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
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
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
                    <div className="flex flex-wrap items-center gap-2">
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
      )}

      {activeTab === "analytics" && <AnalyticsTab documentId={id} pageCount={doc.pageCount} />}
    </div>
  );
}
