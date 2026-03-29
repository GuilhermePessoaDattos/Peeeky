"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

function daysUntil(date: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function AdminOrgDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suspendReason, setSuspendReason] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [acting, setActing] = useState(false);

  const fetchOrg = () => {
    fetch(`/api/admin/organizations/${id}`).then((r) => r.json()).then((data) => { setOrg(data); setLoading(false); });
  };
  useEffect(() => { fetchOrg(); }, [id]);

  const doAction = async (url: string, body?: any) => {
    setActing(true);
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    fetchOrg();
    setActing(false);
  };

  const changePlan = async (plan: string) => {
    setActing(true);
    await fetch(`/api/admin/organizations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    fetchOrg();
    setActing(false);
  };

  if (loading) return <p className="text-white/30 text-sm">Loading...</p>;
  if (!org) return <p className="text-red-400 text-sm">Not found</p>;

  const trial = daysUntil(org.trialEndsAt);

  return (
    <div>
      <Link href="/admin/organizations" className="text-xs text-white/30 hover:text-white/60 mb-4 inline-block">&larr; Organizations</Link>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white">{org.name}</h1>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${org.plan === "PRO" ? "bg-[#6C5CE7]/20 text-[#6C5CE7]" : org.plan === "BUSINESS" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"}`}>{org.plan}</span>
        {org.suspended && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">SUSPENDED</span>}
        {trial !== null && trial > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">TRIAL ({trial}d)</span>}
        {trial !== null && trial <= 0 && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">TRIAL EXPIRED</span>}
      </div>
      <p className="text-sm text-white/30 mb-8">{org.slug} &bull; {new Date(org.createdAt).toLocaleDateString()}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {/* Suspend */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">{org.suspended ? "Suspended" : "Suspend"}</h3>
          {org.suspended ? (
            <div>
              <p className="text-xs text-red-400 mb-2">Reason: {org.suspendReason}</p>
              <button onClick={() => doAction(`/api/admin/organizations/${id}/unsuspend`)} disabled={acting} className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Unsuspend</button>
            </div>
          ) : (
            <div>
              <input value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Reason..." className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none mb-2" />
              <button onClick={() => suspendReason && doAction(`/api/admin/organizations/${id}/suspend`, { reason: suspendReason })} disabled={acting || !suspendReason} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Suspend</button>
            </div>
          )}
        </div>

        {/* Plan */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Plan</h3>
          <div className="flex gap-2">
            {["FREE", "PRO", "BUSINESS"].map((p) => (
              <button key={p} onClick={() => changePlan(p)} disabled={acting || org.plan === p} className={`rounded-lg px-3 py-2 text-xs font-semibold ${org.plan === p ? "bg-white/15 text-white" : "bg-white/5 text-white/50 hover:text-white"} disabled:opacity-40`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Trial */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Trial</h3>
          {trial !== null ? <p className={`text-sm font-semibold mb-2 ${trial > 0 ? "text-blue-400" : "text-red-400"}`}>{trial > 0 ? `${trial} days left` : `Expired`}</p> : <p className="text-xs text-white/30 mb-2">No trial</p>}
          <div className="flex gap-2">
            <input type="number" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} className="w-16 rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-xs text-white outline-none" />
            <button onClick={() => doAction(`/api/admin/organizations/${id}/extend-trial`, { days: parseInt(trialDays) })} disabled={acting} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{trial !== null ? "Extend" : "Start"}</button>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Members ({org.members?.length || 0})</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5"><tr className="text-white/40 text-xs"><th className="px-5 py-2.5 text-left">Name</th><th className="px-5 py-2.5 text-left">Email</th><th className="px-5 py-2.5 text-left">Role</th><th className="px-5 py-2.5 text-left"></th></tr></thead>
            <tbody>
              {(org.members || []).map((m: any) => (
                <tr key={m.id} className="border-b border-white/5">
                  <td className="px-5 py-2.5 text-white">{m.user.name || "—"}</td>
                  <td className="px-5 py-2.5 text-white/60">{m.user.email}</td>
                  <td className="px-5 py-2.5 text-white/40">{m.role}</td>
                  <td className="px-5 py-2.5"><button onClick={async () => { await fetch("/api/admin/impersonate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: m.user.id }) }); window.open("/documents", "_blank"); }} className="text-[10px] text-[#6C5CE7] hover:underline">Impersonate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents */}
      {org.documents?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Documents ({org.documents.length})</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5"><tr className="text-white/40 text-xs"><th className="px-5 py-2.5 text-left">Name</th><th className="px-5 py-2.5 text-left">Views</th><th className="px-5 py-2.5 text-left">Links</th><th className="px-5 py-2.5 text-left">Created</th></tr></thead>
              <tbody>
                {org.documents.map((d: any) => (
                  <tr key={d.id} className="border-b border-white/5"><td className="px-5 py-2.5 text-white">{d.name}</td><td className="px-5 py-2.5 text-white/60">{d.totalViews}</td><td className="px-5 py-2.5 text-white/60">{d._count.links}</td><td className="px-5 py-2.5 text-white/30">{new Date(d.createdAt).toLocaleDateString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit */}
      {org.audits?.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Activity Timeline</h2>
          <div className="space-y-1">
            {org.audits.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 text-xs">
                <span className="text-white/60 font-mono">{a.action}</span>
                <span className="text-white/30">{a.resource}</span>
                <span className="ml-auto text-white/20">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
