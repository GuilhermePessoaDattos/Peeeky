"use client";

import { useEffect, useState } from "react";

export default function AdminUsage() {
  const [stats, setStats] = useState<any>(null);
  const [topOrgs, setTopOrgs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    fetch("/api/admin/organizations").then((r) => r.json()).then((orgs) => {
      setTopOrgs(orgs.sort((a: any, b: any) => b.totalViews - a.totalViews).slice(0, 20));
    });
  }, []);

  if (!stats) return <p className="text-white/30 text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Usage</h1>
      <p className="text-sm text-white/40 mb-8">Product usage metrics</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">Total Docs</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats.totalDocs}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">Total Views</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">AI Chats (month)</p>
          <p className="mt-1 text-3xl font-bold text-[#6C5CE7]">{stats.aiChatsMonth}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">eSignatures</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats.sigRequests}</p>
          <p className="text-xs text-white/30">{stats.sigCompleted} completed</p>
        </div>
      </div>

      <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Top Organizations by Views</h2>
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-white/40 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left font-medium">#</th>
              <th className="px-5 py-3 text-left font-medium">Organization</th>
              <th className="px-5 py-3 text-left font-medium">Plan</th>
              <th className="px-5 py-3 text-left font-medium">Docs</th>
              <th className="px-5 py-3 text-left font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {topOrgs.map((o: any, i: number) => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="px-5 py-3 text-white/30">{i + 1}</td>
                <td className="px-5 py-3 text-white font-medium">{o.name}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    o.plan === "PRO" ? "bg-[#6C5CE7]/20 text-[#6C5CE7]" : o.plan === "BUSINESS" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"
                  }`}>{o.plan}</span>
                </td>
                <td className="px-5 py-3 text-white/60">{o._count.documents}</td>
                <td className="px-5 py-3 text-white/60">{o.totalViews.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
