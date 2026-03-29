"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function AdminOrgDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/organizations/${id}`)
      .then((r) => r.json())
      .then((data) => { setOrg(data); setLoading(false); });
  }, [id]);

  const changePlan = async (plan: string) => {
    if (!confirm(`Change plan to ${plan}?`)) return;
    setChanging(true);
    await fetch(`/api/admin/organizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setOrg({ ...org, plan });
    setChanging(false);
  };

  if (loading) return <p className="text-white/30 text-sm">Loading...</p>;
  if (!org) return <p className="text-red-400 text-sm">Not found</p>;

  return (
    <div>
      <Link href="/admin/organizations" className="text-xs text-white/30 hover:text-white/60 mb-4 inline-block">&larr; Organizations</Link>

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">{org.name}</h1>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          org.plan === "PRO" ? "bg-[#6C5CE7]/20 text-[#6C5CE7]" : org.plan === "BUSINESS" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"
        }`}>{org.plan}</span>
      </div>

      {/* Plan Actions */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Change Plan</h2>
        <div className="flex gap-2">
          {["FREE", "PRO", "BUSINESS"].map((p) => (
            <button
              key={p}
              onClick={() => changePlan(p)}
              disabled={changing || org.plan === p}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                org.plan === p ? "bg-white/15 text-white cursor-default" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              } disabled:opacity-40`}
            >
              {p}
            </button>
          ))}
        </div>
        {org.stripeCustomerId && (
          <p className="mt-3 text-xs text-white/30">Stripe: {org.stripeCustomerId}</p>
        )}
      </div>

      {/* Members */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Members ({org.members.length})</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr className="text-white/40 text-xs">
                <th className="px-5 py-2.5 text-left">Name</th>
                <th className="px-5 py-2.5 text-left">Email</th>
                <th className="px-5 py-2.5 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {org.members.map((m: any) => (
                <tr key={m.id} className="border-b border-white/5">
                  <td className="px-5 py-2.5 text-white">{m.user.name || "—"}</td>
                  <td className="px-5 py-2.5 text-white/60">{m.user.email}</td>
                  <td className="px-5 py-2.5 text-white/40">{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Documents ({org.documents.length})</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr className="text-white/40 text-xs">
                <th className="px-5 py-2.5 text-left">Name</th>
                <th className="px-5 py-2.5 text-left">Status</th>
                <th className="px-5 py-2.5 text-left">Views</th>
                <th className="px-5 py-2.5 text-left">Links</th>
                <th className="px-5 py-2.5 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {org.documents.map((d: any) => (
                <tr key={d.id} className="border-b border-white/5">
                  <td className="px-5 py-2.5 text-white">{d.name}</td>
                  <td className="px-5 py-2.5"><span className={`text-xs ${d.status === "READY" ? "text-green-400" : "text-yellow-400"}`}>{d.status}</span></td>
                  <td className="px-5 py-2.5 text-white/60">{d.totalViews}</td>
                  <td className="px-5 py-2.5 text-white/60">{d._count.links}</td>
                  <td className="px-5 py-2.5 text-white/30">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* eSignature */}
      {org.signatureRequests?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">eSignature ({org.signatureRequests.length})</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-white/40 text-xs">
                  <th className="px-5 py-2.5 text-left">Title</th>
                  <th className="px-5 py-2.5 text-left">Signer</th>
                  <th className="px-5 py-2.5 text-left">Status</th>
                  <th className="px-5 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {org.signatureRequests.map((s: any) => (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="px-5 py-2.5 text-white">{s.title}</td>
                    <td className="px-5 py-2.5 text-white/60">{s.signerEmail}</td>
                    <td className="px-5 py-2.5"><span className={`text-xs ${s.status === "COMPLETED" ? "text-green-400" : s.status === "PENDING" ? "text-yellow-400" : "text-white/40"}`}>{s.status}</span></td>
                    <td className="px-5 py-2.5 text-white/30">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
