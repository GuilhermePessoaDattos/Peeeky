"use client";

import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockReason, setBlockReason] = useState("");
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("/api/admin/users").then((r) => r.json()).then((data) => { setUsers(data); setLoading(false); });
  };
  useEffect(() => { fetchUsers(); }, []);

  const blockUser = async (userId: string) => {
    if (!blockReason) return alert("Enter a reason");
    await fetch(`/api/admin/users/${userId}/block`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: blockReason }) });
    setBlockingId(null); setBlockReason(""); fetchUsers();
  };

  const unblockUser = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/unblock`, { method: "POST" });
    fetchUsers();
  };

  const impersonate = async (userId: string) => {
    await fetch("/api/admin/impersonate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    window.open("/documents", "_blank");
  };

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
              <th className="px-5 py-3 text-left font-medium">Plan</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Joined</th>
              <th className="px-5 py-3 text-left font-medium">Actions</th>
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
                <td className="px-5 py-3">
                  {u.org?.plan && <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.org.plan === "PRO" ? "bg-[#6C5CE7]/20 text-[#6C5CE7]" : u.org.plan === "BUSINESS" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"}`}>{u.org.plan}</span>}
                </td>
                <td className="px-5 py-3">
                  {u.blocked
                    ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400">BLOCKED</span>
                    : <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 text-green-400">Active</span>}
                </td>
                <td className="px-5 py-3 text-white/30">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => impersonate(u.id)} className="text-[10px] text-[#6C5CE7] hover:underline">Impersonate</button>
                    {u.blocked ? (
                      <button onClick={() => unblockUser(u.id)} className="text-[10px] text-green-400 hover:underline">Unblock</button>
                    ) : blockingId === u.id ? (
                      <div className="flex items-center gap-1">
                        <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason..." className="rounded bg-white/5 border border-white/10 px-2 py-1 text-[10px] text-white w-24 outline-none" />
                        <button onClick={() => blockUser(u.id)} className="text-[10px] text-red-400 hover:underline">OK</button>
                        <button onClick={() => setBlockingId(null)} className="text-[10px] text-white/30">X</button>
                      </div>
                    ) : (
                      <button onClick={() => setBlockingId(u.id)} className="text-[10px] text-red-400 hover:underline">Block</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
