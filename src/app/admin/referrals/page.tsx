"use client";

import { useEffect, useState } from "react";

export default function AdminReferrals() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/referrals").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="text-white/30 text-sm">Loading...</p>;

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    PAID: "bg-[#6C5CE7]/20 text-[#6C5CE7]",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Referrals</h1>
      <p className="text-sm text-white/40 mb-8">Referral program overview</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">Total</p>
          <p className="mt-1 text-3xl font-bold text-white">{data.total}</p>
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
          <p className="text-xs text-green-400/60 uppercase tracking-wider">Active</p>
          <p className="mt-1 text-3xl font-bold text-green-400">{data.active}</p>
        </div>
        <div className="rounded-2xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 p-5">
          <p className="text-xs text-[#6C5CE7]/60 uppercase tracking-wider">Paid Out</p>
          <p className="mt-1 text-3xl font-bold text-[#6C5CE7]">{data.paid}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">Commission/mo</p>
          <p className="mt-1 text-3xl font-bold text-white">${data.totalCommission}</p>
        </div>
      </div>

      {data.referrals.length === 0 ? (
        <p className="text-white/30 text-sm">No referrals yet.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr className="text-white/40 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Referrer</th>
                <th className="px-5 py-3 text-left font-medium">Referred Org</th>
                <th className="px-5 py-3 text-left font-medium">Plan</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Commission</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.referrals.map((r: any) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-5 py-3 text-white">{r.referrer.email}</td>
                  <td className="px-5 py-3 text-white/60">{r.referredOrg.name}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      r.referredOrg.plan === "PRO" ? "bg-[#6C5CE7]/20 text-[#6C5CE7]" : r.referredOrg.plan === "BUSINESS" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"
                    }`}>{r.referredOrg.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor[r.status] || ""}`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-3 text-white/60">{Math.round(r.commission * 100)}%</td>
                  <td className="px-5 py-3 text-white/30">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
