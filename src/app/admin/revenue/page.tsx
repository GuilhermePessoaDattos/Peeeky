"use client";

import { useEffect, useState } from "react";

export default function AdminRevenue() {
  const [stats, setStats] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    fetch("/api/admin/organizations?plan=PRO").then((r) => r.json()).then((pro) => {
      fetch("/api/admin/organizations?plan=BUSINESS").then((r) => r.json()).then((biz) => {
        setOrgs([...pro, ...biz]);
      });
    });
  }, []);

  if (!stats) return <p className="text-white/30 text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Revenue</h1>
      <p className="text-sm text-white/40 mb-8">Billing overview</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 p-5">
          <p className="text-xs text-[#6C5CE7]/60 uppercase tracking-wider">MRR</p>
          <p className="mt-1 text-3xl font-bold text-[#6C5CE7]">${stats.mrr}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">ARR</p>
          <p className="mt-1 text-3xl font-bold text-white">${stats.arr.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">Paying Orgs</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats.proOrgs + stats.businessOrgs}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">Conversion</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats.conversionRate}%</p>
        </div>
      </div>

      <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Paying Organizations</h2>
      {orgs.length === 0 ? (
        <p className="text-white/30 text-sm">No paying organizations yet.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr className="text-white/40 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Organization</th>
                <th className="px-5 py-3 text-left font-medium">Plan</th>
                <th className="px-5 py-3 text-left font-medium">Revenue/mo</th>
                <th className="px-5 py-3 text-left font-medium">Docs</th>
                <th className="px-5 py-3 text-left font-medium">Views</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o: any) => (
                <tr key={o.id} className="border-b border-white/5">
                  <td className="px-5 py-3 text-white font-medium">{o.name}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      o.plan === "PRO" ? "bg-[#6C5CE7]/20 text-[#6C5CE7]" : "bg-amber-500/20 text-amber-400"
                    }`}>{o.plan}</span>
                  </td>
                  <td className="px-5 py-3 text-green-400 font-semibold">${o.plan === "PRO" ? 39 : 129}</td>
                  <td className="px-5 py-3 text-white/60">{o._count.documents}</td>
                  <td className="px-5 py-3 text-white/60">{o.totalViews.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
