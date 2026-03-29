"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  stripeCustomerId: string | null;
  createdAt: string;
  totalViews: number;
  _count: { members: number; documents: number; dataRooms: number };
}

const planBadge: Record<string, string> = {
  FREE: "bg-white/10 text-white/60",
  PRO: "bg-[#6C5CE7]/20 text-[#6C5CE7]",
  BUSINESS: "bg-amber-500/20 text-amber-400",
};

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("plan", filter);
    if (search) params.set("search", search);
    fetch(`/api/admin/organizations?${params}`)
      .then((r) => r.json())
      .then((data) => { setOrgs(Array.isArray(data) ? data : []); setLoading(false); });
  }, [filter, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Organizations</h1>
      <p className="text-sm text-white/40 mb-6">{orgs.length} total</p>

      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#6C5CE7] w-64"
        />
        <div className="flex gap-1">
          {["ALL", "FREE", "PRO", "BUSINESS"].map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                filter === p ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-white/30 text-sm">Loading...</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr className="text-white/40 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Organization</th>
                <th className="px-5 py-3 text-left font-medium">Plan</th>
                <th className="px-5 py-3 text-left font-medium">Members</th>
                <th className="px-5 py-3 text-left font-medium">Docs</th>
                <th className="px-5 py-3 text-left font-medium">Views</th>
                <th className="px-5 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-3">
                    <Link href={`/admin/organizations/${org.id}`} className="text-white font-medium hover:text-[#6C5CE7] transition">
                      {org.name}
                    </Link>
                    <p className="text-white/30 text-xs">{org.slug}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${planBadge[org.plan] || ""}`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/60">{org._count.members}</td>
                  <td className="px-5 py-3 text-white/60">{org._count.documents}</td>
                  <td className="px-5 py-3 text-white/60">{org.totalViews.toLocaleString()}</td>
                  <td className="px-5 py-3 text-white/30">{new Date(org.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
