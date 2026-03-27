"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setMessage("");
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Invite sent!");
        setEmail("");
        await fetchMembers();
      } else {
        setMessage(data.error || "Failed to invite");
      }
    } catch {
      setMessage("Failed to invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/team/${userId}`, { method: "DELETE" });
    await fetchMembers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch(`/api/team/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    await fetchMembers();
  };

  return (
    <div>
      <Link href="/documents" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]">
        &larr; Back to Documents
      </Link>
      <h1 className="mb-2 font-display text-2xl font-bold text-[#1A1A2E]">Team</h1>
      <p className="mb-8 text-sm text-gray-500">Manage your workspace members.</p>

      {/* Invite form */}
      <form onSubmit={handleInvite} className="mb-8 flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "MEMBER" | "ADMIN")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={inviting}
          className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90 disabled:opacity-50"
        >
          {inviting ? "Sending..." : "Invite"}
        </button>
      </form>

      {message && (
        <p className={`mb-4 text-sm ${message.includes("sent") ? "text-[#00B894]" : "text-red-500"}`}>{message}</p>
      )}

      {/* Members list */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-sm font-bold text-[#6C5CE7]">
                  {(m.user.name || m.user.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E]">{m.user.name || m.user.email}</p>
                  <p className="text-xs text-gray-500">{m.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {m.role === "OWNER" ? (
                  <span className="rounded-full bg-[#1A1A2E]/10 px-3 py-1 text-xs font-semibold text-[#1A1A2E]">Owner</span>
                ) : (
                  <>
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.user.id, e.target.value)}
                      className="rounded border border-gray-200 px-2 py-1 text-xs"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                    </select>
                    <button
                      onClick={() => handleRemove(m.user.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
