"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Execution {
  id: string;
  agentName: string;
  actionType: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  executedAt: string | null;
  duration: number | null;
  output: string | null;
  error: string | null;
  metadata: string | Record<string, unknown> | null;
}

interface Stats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  awaitingApproval: number;
  successRate: number;
}

interface ConversionMetrics {
  emailsSent30d: number;
  signupsFromLeads: number;
  signupsConversion: number;
  paidFromLeads: number;
  paidConversion: number;
  blogPosts30d: number;
  linkedinPosts30d: number;
  redditComments30d: number;
}

interface ApiResponse {
  executions: Execution[];
  total: number;
  stats: Stats;
  conversionMetrics: ConversionMetrics;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  awaiting_approval: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  success: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  rejected: "bg-red-300/20 text-red-300 border-red-300/30",
};

const AGENT_BADGE: Record<string, string> = {
  "cold-email": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "blog-writer": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "social-media": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const AGENTS = ["cold-email", "blog-writer", "social-media"] as const;
const STATUSES = ["pending", "awaiting_approval", "approved", "running", "success", "failed", "rejected"] as const;
const PAGE_SIZE = 30;

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " +
    dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(ms: number | null) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function truncate(s: string, len = 48) {
  return s.length > len ? s.slice(0, len) + "..." : s;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ExecutionsDashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [previewExec, setPreviewExec] = useState<Execution | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkMsg, setBulkMsg] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (agentFilter) params.set("agent", agentFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/gtm/executions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      // silently fail on auto-refresh
    } finally {
      setLoading(false);
    }
  }, [agentFilter, statusFilter, offset]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 15s
  useEffect(() => {
    const interval = setInterval(fetchData, 15_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Bulk Selection Helpers ─────────────────────────────────────────────────

  const awaitingIds = (data?.executions || [])
    .filter((e) => e.status === "awaiting_approval")
    .map((e) => e.id);

  const allAwaitingSelected = awaitingIds.length > 0 && awaitingIds.every((id) => selectedIds.has(id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allAwaitingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(awaitingIds));
    }
  }

  async function handleBulkApprove() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkApproving(true);
    setBulkProgress({ current: 0, total: ids.length });

    for (let i = 0; i < ids.length; i++) {
      setBulkProgress({ current: i + 1, total: ids.length });
      try {
        await fetch(`/api/admin/gtm/executions/${ids[i]}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" }),
        });
      } catch { /* continue on error */ }
    }

    setSelectedIds(new Set());
    setBulkApproving(false);
    setBulkMsg(`${ids.length} items approved and sent`);
    setTimeout(() => setBulkMsg(""), 4000);
    await fetchData();
  }

  // Clear selection on filter/page change
  useEffect(() => { setSelectedIds(new Set()); }, [agentFilter, statusFilter, offset]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const [copiedMsg, setCopiedMsg] = useState("");

  async function handleApprove(id: string) {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/gtm/executions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      await fetchData();
      setPreviewExec(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleApproveAndCopy(exec: Execution) {
    setActionLoading(exec.id);
    try {
      // Parse metadata for content
      let meta: Record<string, unknown> = {};
      try {
        meta = typeof exec.metadata === "string" ? JSON.parse(exec.metadata) : (exec.metadata as Record<string, unknown>) || {};
      } catch { /* empty */ }

      // Build text to copy
      let textToCopy = "";
      let threadUrl = "";

      if (exec.actionType === "linkedin_post") {
        const content = (meta.content as string) || "";
        const hashtags = (meta.hashtags as string[]) || [];
        textToCopy = hashtags.length > 0
          ? `${content}\n\n${hashtags.map(h => h.startsWith("#") ? h : `#${h}`).join(" ")}`
          : content;
      } else if (exec.actionType === "reddit_comment") {
        textToCopy = (meta.comment as string) || (meta.content as string) || "";
        threadUrl = (meta.threadUrl as string) || "";
      }

      // Copy to clipboard
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
      }

      // Approve
      await fetch(`/api/admin/gtm/executions/${exec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      // Open thread URL for Reddit
      if (threadUrl) {
        window.open(threadUrl, "_blank");
      }

      setCopiedMsg(exec.actionType === "linkedin_post"
        ? "Copied! Open LinkedIn and paste."
        : "Copied! Reddit thread opened — paste your comment.");
      setTimeout(() => setCopiedMsg(""), 5000);

      await fetchData();
      setPreviewExec(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/gtm/executions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionNote }),
      });
      setRejectionNote("");
      await fetchData();
      setPreviewExec(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRerun(id: string) {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/gtm/executions/${id}`, { method: "POST" });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const stats = data?.stats;
  const cm = data?.conversionMetrics;
  const executions = data?.executions ?? [];
  const total = data?.total ?? 0;
  const pageStart = offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">GTM Execution Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Monitor agent executions, approve content, track conversions</p>
        </div>
        <span className="text-xs text-white/30">Auto-refreshes every 15s</span>
      </div>

      {/* ── 7-day Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total (7d)", value: stats?.total ?? 0, color: "text-white" },
          { label: "Success", value: stats?.success ?? 0, color: "text-green-400" },
          { label: "Failed", value: stats?.failed ?? 0, color: "text-red-400" },
          { label: "Pending", value: stats?.pending ?? 0, color: "text-yellow-400" },
          { label: "Awaiting Approval", value: stats?.awaitingApproval ?? 0, color: "text-amber-400" },
          { label: "Success Rate", value: `${(stats?.successRate ?? 0).toFixed(1)}%`, color: "text-[#6C5CE7]" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/40 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── 30-day Conversion Metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Emails Sent (30d)", value: cm?.emailsSent30d ?? 0 },
          {
            label: "Leads \u2192 Signup",
            value: cm?.signupsFromLeads ?? 0,
            sub: `${(cm?.signupsConversion ?? 0).toFixed(1)}% conv`,
          },
          {
            label: "Signup \u2192 Paid",
            value: cm?.paidFromLeads ?? 0,
            sub: `${(cm?.paidConversion ?? 0).toFixed(1)}% conv`,
          },
          { label: "Blog Posts (30d)", value: cm?.blogPosts30d ?? 0 },
          { label: "Social Posts (30d)", value: (cm?.linkedinPosts30d ?? 0) + (cm?.redditComments30d ?? 0) },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/40 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-white">{c.value}</p>
            {"sub" in c && c.sub && <p className="text-[11px] text-[#6C5CE7] mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={agentFilter}
          onChange={(e) => { setAgentFilter(e.target.value); setOffset(0); }}
          className="rounded-lg border border-white/10 bg-white/5 text-white text-sm px-3 py-2 outline-none focus:border-[#6C5CE7]/50"
        >
          <option value="" className="bg-[#0a0a0b]">All Agents</option>
          {AGENTS.map((a) => (
            <option key={a} value={a} className="bg-[#0a0a0b]">{a}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          className="rounded-lg border border-white/10 bg-white/5 text-white text-sm px-3 py-2 outline-none focus:border-[#6C5CE7]/50"
        >
          <option value="" className="bg-[#0a0a0b]">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#0a0a0b]">{s}</option>
          ))}
        </select>

        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-sm px-4 py-2 transition"
        >
          Refresh
        </button>
      </div>

      {/* ── Bulk Action Bar ───────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 p-3 mb-4 flex items-center gap-4">
          <span className="text-sm text-white font-medium">{selectedIds.size} selected</span>
          <button
            onClick={handleBulkApprove}
            disabled={bulkApproving}
            className="rounded-lg bg-[#6C5CE7] text-white text-sm px-4 py-1.5 font-medium hover:bg-[#5A4BD1] disabled:opacity-50 transition flex items-center gap-2"
          >
            {bulkApproving ? (
              <>{`Approving ${bulkProgress.current}/${bulkProgress.total}...`}</>
            ) : (
              "Approve All"
            )}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-white/50 hover:text-white transition"
          >
            Deselect
          </button>
        </div>
      )}
      {bulkMsg && selectedIds.size === 0 && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 mb-4 text-sm text-green-400">
          {bulkMsg}
        </div>
      )}

      {/* ── Executions Table ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {loading && !data ? (
          <div className="p-12 text-center text-white/30">Loading...</div>
        ) : executions.length === 0 ? (
          <div className="p-12 text-center text-white/30">No executions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wider">
                  <th className="px-4 py-3 w-10">
                    {awaitingIds.length > 0 && (
                      <input
                        type="checkbox"
                        checked={allAwaitingSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#6C5CE7] cursor-pointer"
                      />
                    )}
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Executed</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Output / Error</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((ex) => (
                  <tr key={ex.id} className="border-b border-white/5 hover:bg-white/[0.03] transition">
                    {/* Checkbox */}
                    <td className="px-4 py-3 w-10">
                      {ex.status === "awaiting_approval" && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(ex.id)}
                          onChange={() => toggleSelect(ex.id)}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#6C5CE7] cursor-pointer"
                        />
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[ex.status] ?? "bg-white/10 text-white/60 border-white/10"}`}
                      >
                        {ex.status === "running" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                        )}
                        {ex.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Agent */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${AGENT_BADGE[ex.agentName] ?? "bg-white/10 text-white/60 border-white/10"}`}
                      >
                        {ex.agentName}
                      </span>
                    </td>

                    {/* Action / Title */}
                    <td className="px-4 py-3 text-white/80 max-w-[260px]">
                      <span title={ex.title}>{truncate(ex.title)}</span>
                    </td>

                    {/* Scheduled */}
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">{fmtDate(ex.scheduledAt)}</td>

                    {/* Executed */}
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">{fmtDate(ex.executedAt)}</td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">{fmtDuration(ex.duration)}</td>

                    {/* Output / Error */}
                    <td className="px-4 py-3 max-w-[200px]">
                      {ex.error ? (
                        <span className="text-red-400 text-xs" title={ex.error}>{truncate(ex.error, 36)}</span>
                      ) : ex.output ? (
                        <span className="text-white/50 text-xs" title={ex.output}>{truncate(ex.output, 36)}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setPreviewExec(ex); setRejectionNote(""); }}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 transition"
                        >
                          Preview
                        </button>
                        {ex.status === "failed" && (
                          <button
                            onClick={() => handleRerun(ex.id)}
                            disabled={actionLoading === ex.id}
                            className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-400 hover:bg-orange-500/20 transition disabled:opacity-50"
                          >
                            Re-run
                          </button>
                        )}
                        {ex.status === "awaiting_approval" && (
                          <>
                            {(ex.actionType === "linkedin_post" || ex.actionType === "reddit_comment") ? (
                              <button
                                onClick={() => handleApproveAndCopy(ex)}
                                disabled={actionLoading === ex.id}
                                className="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
                              >
                                Approve & Copy
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove(ex.id)}
                                disabled={actionLoading === ex.id}
                                className="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => { setPreviewExec(ex); setRejectionNote(""); }}
                              disabled={actionLoading === ex.id}
                              className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">
            {pageStart}-{pageEnd} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Preview Modal ─────────────────────────────────────────────────── */}
      {previewExec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewExec(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewExec(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-lg transition"
            >
              &times;
            </button>

            {/* Modal header */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[previewExec.status] ?? "bg-white/10 text-white/60 border-white/10"}`}
              >
                {previewExec.status.replace("_", " ")}
              </span>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${AGENT_BADGE[previewExec.agentName] ?? "bg-white/10 text-white/60 border-white/10"}`}
              >
                {previewExec.agentName}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white mb-4">{previewExec.title}</h2>

            {/* Metadata content */}
            <PreviewContent execution={previewExec} />

            {/* Execution info */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/40">
              <div>Scheduled: {fmtDate(previewExec.scheduledAt)}</div>
              <div>Executed: {fmtDate(previewExec.executedAt)}</div>
              <div>Duration: {fmtDuration(previewExec.duration)}</div>
              <div>ID: {previewExec.id.slice(0, 8)}...</div>
            </div>

            {/* Error display */}
            {previewExec.error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-medium text-red-400 mb-1">Error</p>
                <pre className="text-xs text-red-300/80 whitespace-pre-wrap">{previewExec.error}</pre>
              </div>
            )}

            {/* Output display */}
            {previewExec.output && !previewExec.error && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-medium text-white/40 mb-1">Output</p>
                <pre className="text-xs text-white/60 whitespace-pre-wrap">{previewExec.output}</pre>
              </div>
            )}

            {/* Copied toast */}
            {copiedMsg && (
              <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                {copiedMsg}
              </div>
            )}

            {/* Approval actions */}
            {previewExec.status === "awaiting_approval" && (
              <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                <div className="flex gap-2">
                  {(previewExec.actionType === "linkedin_post" || previewExec.actionType === "reddit_comment") ? (
                    <button
                      onClick={() => handleApproveAndCopy(previewExec)}
                      disabled={actionLoading === previewExec.id}
                      className="flex-1 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium py-2.5 text-sm transition disabled:opacity-50"
                    >
                      {actionLoading === previewExec.id ? "Processing..." : "Approve & Copy to Clipboard"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(previewExec.id)}
                      disabled={actionLoading === previewExec.id}
                      className="flex-1 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium py-2.5 text-sm transition disabled:opacity-50"
                    >
                      {actionLoading === previewExec.id ? "Processing..." : "Approve"}
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <textarea
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="Rejection note (optional)..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 text-white text-sm px-3 py-2 outline-none focus:border-red-500/50 resize-none h-20 placeholder:text-white/20"
                  />
                  <button
                    onClick={() => handleReject(previewExec.id)}
                    disabled={actionLoading === previewExec.id}
                    className="w-full rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-2.5 text-sm transition disabled:opacity-50"
                  >
                    {actionLoading === previewExec.id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview Content Sub-component ────────────────────────────────────────────

function PreviewContent({ execution }: { execution: Execution }) {
  let meta: Record<string, unknown> | null = null;
  if (execution.metadata) {
    try {
      meta = typeof execution.metadata === "string"
        ? JSON.parse(execution.metadata)
        : execution.metadata as Record<string, unknown>;
    } catch {
      meta = null;
    }
  }
  if (!meta) {
    return <p className="text-sm text-white/30">No metadata available</p>;
  }

  const actionType = execution.actionType?.toLowerCase() ?? "";

  // Email
  if (actionType.includes("email")) {
    return (
      <div className="space-y-3">
        <Field label="From" value={meta.from as string} />
        <Field label="To" value={meta.to as string} />
        <Field label="Subject" value={meta.subject as string} />
        <div>
          <p className="text-xs font-medium text-white/40 mb-1">Body</p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {(meta.body as string) ?? "—"}
          </div>
        </div>
      </div>
    );
  }

  // LinkedIn
  if (actionType.includes("linkedin")) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-white/40 mb-1">Post</p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {(meta.text as string) ?? (meta.content as string) ?? "—"}
          </div>
        </div>
        {meta.hashtags ? (
          <div>
            <p className="text-xs font-medium text-white/40 mb-1">Hashtags</p>
            <p className="text-sm text-[#6C5CE7]">{String(meta.hashtags)}</p>
          </div>
        ) : null}
      </div>
    );
  }

  // Reddit
  if (actionType.includes("reddit")) {
    return (
      <div className="space-y-3">
        <Field label="Subreddit" value={meta.subreddit as string} />
        <div>
          <p className="text-xs font-medium text-white/40 mb-1">Thread</p>
          {meta.threadUrl ? (
            <a
              href={meta.threadUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#6C5CE7] hover:underline"
            >
              {(meta.threadTitle as string) ?? "View thread"}
            </a>
          ) : (
            <p className="text-sm text-white/70">{(meta.threadTitle as string) ?? "—"}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-white/40 mb-1">Comment</p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {(meta.comment as string) ?? (meta.text as string) ?? "—"}
          </div>
        </div>
      </div>
    );
  }

  // Blog
  if (actionType.includes("blog")) {
    return (
      <div className="space-y-3">
        <Field label="Title" value={meta.title as string} />
        <Field label="Description" value={meta.description as string} />
        <div>
          <p className="text-xs font-medium text-white/40 mb-1">Content Preview</p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70 whitespace-pre-wrap max-h-72 overflow-y-auto">
            {(meta.content as string) ?? "—"}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: show raw JSON
  return (
    <div>
      <p className="text-xs font-medium text-white/40 mb-1">Metadata</p>
      <pre className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/50 whitespace-pre-wrap max-h-60 overflow-y-auto">
        {JSON.stringify(meta, null, 2)}
      </pre>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-white/40 mb-0.5">{label}</p>
      <p className="text-sm text-white/70">{value ?? "—"}</p>
    </div>
  );
}
