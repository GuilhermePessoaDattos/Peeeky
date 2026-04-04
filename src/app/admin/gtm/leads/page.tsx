"use client";

import { useEffect, useState, useCallback } from "react";

/* ───── types ───── */

interface OutboundLead {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string | null;
  source: string;
  fundingRound: string | null;
  fundingAmount: string | null;
  status: string;
  emailedAt: string | null;
  followedUpAt: string | null;
  repliedAt: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  followUpBody: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Funnel {
  new: number;
  emailed: number;
  followed_up: number;
  replied: number;
  converted: number;
  unsubscribed: number;
}

interface LeadsResponse {
  leads: OutboundLead[];
  total: number;
  funnel: Funnel;
  conversionRates: {
    emailedToReplied: number;
    repliedToConverted: number;
  };
}

/* ───── constants ───── */

const STATUSES = [
  "new",
  "emailed",
  "followed_up",
  "replied",
  "converted",
  "unsubscribed",
] as const;

type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  emailed: "Emailed",
  followed_up: "Followed Up",
  replied: "Replied",
  converted: "Converted",
  unsubscribed: "Unsubscribed",
};

const STATUS_BADGE: Record<Status, string> = {
  new: "bg-white/15 text-white",
  emailed: "bg-blue-500/20 text-blue-400",
  followed_up: "bg-yellow-500/20 text-yellow-400",
  replied: "bg-green-500/20 text-green-400",
  converted: "bg-[#6C5CE7]/20 text-[#6C5CE7]",
  unsubscribed: "bg-red-500/20 text-red-400",
};

const STATUS_CARD_BORDER: Record<Status, string> = {
  new: "border-white/30",
  emailed: "border-blue-400/40",
  followed_up: "border-yellow-400/40",
  replied: "border-green-400/40",
  converted: "border-[#6C5CE7]/50",
  unsubscribed: "border-red-400/40",
};

const STATUS_CARD_VALUE: Record<Status, string> = {
  new: "text-white",
  emailed: "text-blue-400",
  followed_up: "text-yellow-400",
  replied: "text-green-400",
  converted: "text-[#6C5CE7]",
  unsubscribed: "text-red-400",
};

const PAGE_SIZE = 50;

/* ───── helpers ───── */

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateShort(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ───── component ───── */

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set("status", statusFilter);
      qs.set("limit", String(PAGE_SIZE));
      qs.set("offset", String(offset));
      const res = await fetch(`/api/admin/gtm/leads?${qs}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [statusFilter, offset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── actions ── */

  async function updateLead(id: string, body: Record<string, unknown>) {
    await fetch(`/api/admin/gtm/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setActionMenuId(null);
    fetchData();
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead permanently?")) return;
    await fetch(`/api/admin/gtm/leads/${id}`, { method: "DELETE" });
    setActionMenuId(null);
    fetchData();
  }

  /* ── derived ── */

  const funnel = data?.funnel;
  const rates = data?.conversionRates;
  const leads = data?.leads || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  /* ── funnel card data ── */

  const funnelCards: { key: Status; label: string }[] = [
    { key: "new", label: "New" },
    { key: "emailed", label: "Emailed" },
    { key: "followed_up", label: "Followed Up" },
    { key: "replied", label: "Replied" },
    { key: "converted", label: "Converted" },
    { key: "unsubscribed", label: "Unsubscribed" },
  ];

  // Conversion rates between adjacent funnel stages
  function getArrowRate(fromIdx: number): string | null {
    if (!funnel) return null;
    // Show specific rates at known transitions
    if (fromIdx === 1) return `${rates?.emailedToReplied || 0}%`; // emailed -> ...replied
    if (fromIdx === 3) return `${rates?.repliedToConverted || 0}%`; // replied -> converted
    return null;
  }

  /* ── render ── */

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-white">Outbound Leads</h1>
        <button
          onClick={() => {
            setOffset(0);
            fetchData();
          }}
          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          Refresh
        </button>
      </div>
      <p className="text-sm text-white/40 mb-6">
        Lead pipeline and outbound funnel tracking
      </p>

      {/* ── Funnel cards ── */}
      <div className="flex items-stretch gap-1 mb-8 overflow-x-auto">
        {funnelCards.map((card, idx) => (
          <div key={card.key} className="flex items-center">
            <div
              className={`rounded-2xl border bg-white/5 p-4 min-w-[130px] ${STATUS_CARD_BORDER[card.key]}`}
            >
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                {card.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${STATUS_CARD_VALUE[card.key]}`}>
                {funnel ? funnel[card.key] : "—"}
              </p>
            </div>
            {idx < funnelCards.length - 1 && (
              <div className="flex flex-col items-center mx-1 min-w-[40px]">
                <span className="text-white/20 text-lg">&rarr;</span>
                {getArrowRate(idx) && (
                  <span className="text-[10px] text-white/40 whitespace-nowrap">
                    {getArrowRate(idx)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setOffset(0);
          }}
          className="text-sm bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#6C5CE7]"
        >
          <option value="" className="bg-[#0a0a0b]">
            All statuses
          </option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#0a0a0b]">
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <span className="text-xs text-white/30">
          {total} lead{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Loading ── */}
      {loading && !data && (
        <div className="text-white/40 text-sm py-12 text-center">Loading leads...</div>
      )}

      {/* ── Leads table ── */}
      {data && (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Name
                  </th>
                  <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Company
                  </th>
                  <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Funding
                  </th>
                  <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Emailed
                  </th>
                  <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Last Action
                  </th>
                  <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Notes
                  </th>
                  <th className="text-right text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const isExpanded = expandedId === lead.id;
                  const lastAction = lead.repliedAt
                    ? `Replied ${fmtDateShort(lead.repliedAt)}`
                    : lead.followedUpAt
                      ? `Followed up ${fmtDateShort(lead.followedUpAt)}`
                      : lead.emailedAt
                        ? `Emailed ${fmtDateShort(lead.emailedAt)}`
                        : "—";

                  return (
                    <tr key={lead.id} className="group">
                      <td colSpan={8} className="p-0">
                        {/* Main row */}
                        <div
                          className={`flex items-center cursor-pointer hover:bg-white/5 transition ${
                            isExpanded ? "bg-white/5" : ""
                          }`}
                          onClick={() =>
                            setExpandedId(isExpanded ? null : lead.id)
                          }
                        >
                          <div className="flex-1 grid grid-cols-[1fr_1fr_0.8fr_0.7fr_0.7fr_0.9fr_1fr] items-center">
                            <div className="px-4 py-3">
                              <span className="text-white/90 font-medium">
                                {lead.name}
                              </span>
                              <p className="text-[10px] text-white/30 truncate">
                                {lead.email}
                              </p>
                            </div>
                            <div className="px-4 py-3 text-white/60 truncate">
                              {lead.company}
                            </div>
                            <div className="px-4 py-3 text-white/50 text-xs">
                              {lead.fundingRound || "—"}
                              {lead.fundingAmount && (
                                <span className="ml-1 text-white/30">
                                  ({lead.fundingAmount})
                                </span>
                              )}
                            </div>
                            <div className="px-4 py-3">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  STATUS_BADGE[lead.status as Status] ||
                                  STATUS_BADGE.new
                                }`}
                              >
                                {STATUS_LABELS[lead.status as Status] ||
                                  lead.status}
                              </span>
                            </div>
                            <div className="px-4 py-3 text-white/40 text-xs">
                              {fmtDateShort(lead.emailedAt)}
                            </div>
                            <div className="px-4 py-3 text-white/40 text-xs">
                              {lastAction}
                            </div>
                            <div className="px-4 py-3 text-white/40 text-xs truncate max-w-[160px]">
                              {lead.notes || "—"}
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="px-4 py-3 flex-shrink-0 relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuId(
                                  actionMenuId === lead.id ? null : lead.id
                                );
                              }}
                              className="text-xs px-2 py-1 rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition"
                            >
                              &bull;&bull;&bull;
                            </button>
                            {actionMenuId === lead.id && (
                              <div className="absolute right-4 top-10 z-50 bg-[#18181b] border border-white/10 rounded-xl shadow-xl py-1 min-w-[160px]">
                                {STATUSES.filter(
                                  (s) => s !== lead.status
                                ).map((s) => (
                                  <button
                                    key={s}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateLead(lead.id, { status: s });
                                    }}
                                    className="block w-full text-left px-4 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                                  >
                                    Mark{" "}
                                    <span className="font-medium">
                                      {STATUS_LABELS[s]}
                                    </span>
                                  </button>
                                ))}
                                <div className="border-t border-white/10 my-1" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteLead(lead.id);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition"
                                >
                                  Delete lead
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="px-6 pb-5 pt-2 bg-white/[0.02] border-t border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Email */}
                              <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                                  Email Sent
                                </p>
                                {lead.emailSubject ? (
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-white/80 mb-2">
                                      Subject: {lead.emailSubject}
                                    </p>
                                    <p className="text-xs text-white/50 whitespace-pre-wrap leading-relaxed">
                                      {lead.emailBody}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-white/30">
                                    No email sent yet
                                  </p>
                                )}
                              </div>

                              {/* Follow-up */}
                              <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                                  Follow-up
                                </p>
                                {lead.followUpBody ? (
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs text-white/50 whitespace-pre-wrap leading-relaxed">
                                      {lead.followUpBody}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-white/30">
                                    No follow-up sent
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="mt-4">
                              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                                Metadata
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-white/30">Role</span>
                                  <p className="text-white/60">
                                    {lead.role || "—"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-white/30">Source</span>
                                  <p className="text-white/60">{lead.source}</p>
                                </div>
                                <div>
                                  <span className="text-white/30">
                                    Funding Round
                                  </span>
                                  <p className="text-white/60">
                                    {lead.fundingRound || "—"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-white/30">
                                    Funding Amount
                                  </span>
                                  <p className="text-white/60">
                                    {lead.fundingAmount || "—"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-white/30">Created</span>
                                  <p className="text-white/60">
                                    {fmtDate(lead.createdAt)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-white/30">
                                    Emailed At
                                  </span>
                                  <p className="text-white/60">
                                    {fmtDate(lead.emailedAt)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-white/30">
                                    Followed Up At
                                  </span>
                                  <p className="text-white/60">
                                    {fmtDate(lead.followedUpAt)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-white/30">
                                    Replied At
                                  </span>
                                  <p className="text-white/60">
                                    {fmtDate(lead.repliedAt)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Notes (editable inline) */}
                            {lead.notes && (
                              <div className="mt-4">
                                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                                  Notes
                                </p>
                                <p className="text-xs text-white/50 whitespace-pre-wrap">
                                  {lead.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-white/30 text-sm"
                    >
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-white/40">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
