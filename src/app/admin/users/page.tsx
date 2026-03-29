"use client";

import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((data) => { setUsers(data); setLoading(false); });
  }, []);

  if (loading) return <p className="text-white/30 text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-sm text-white/40 mb-6">{users.length} total</p>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-white/40 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left font-medium">User</th>
              <th className="px-5 py-3 text-left font-medium">Organization</th>
              <th className="px-5 py-3 text-left font-medium">Role</th>
              <th className="px-5 py-3 text-left font-medium">Plan</th>
              <th className="px-5 py-3 text-left font-medium">Referral</th>
              <th className="px-5 py-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-5 py-3">
                  <p className="text-white font-medium">{u.name || "—"}</p>
                  <p className="text-white/40 text-xs">{u.email}</p>
                </td>
                <td className="px-5 py-3 text-white/60">{u.org?.name || "—"}</td>
                <td className="px-5 py-3 text-white/40">{u.role || "—"}</td>
                <td className="px-5 py-3">
                  {u.org?.plan && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.org.plan === "PRO" ? "bg-[#6C5CE7]/20 text-[#6C5CE7]" : u.org.plan === "BUSINESS" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"
                    }`}>{u.org.plan}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-white/30 font-mono text-xs">{u.referralCode || "—"}</td>
                <td className="px-5 py-3 text-white/30">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
