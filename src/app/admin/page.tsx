"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  totalOrgs: number;
  totalDocs: number;
  totalViews: number;
  mrr: number;
  arr: number;
  proOrgs: number;
  businessOrgs: number;
  freeOrgs: number;
  signupsToday: number;
  docsToday: number;
  viewsToday: number;
  aiChatsMonth: number;
  sigRequests: number;
  sigCompleted: number;
  conversionRate: string;
  signupsByDay: Record<string, number>;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? "text-[#6C5CE7]" : "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white/40 text-sm">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-400 text-sm">Failed to load stats</div>;

  const days = Object.entries(stats.signupsByDay).slice(-14);
  const maxSignups = Math.max(...days.map(([, v]) => v), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-sm text-white/40 mb-8">Business overview</p>

      {/* Today */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Today</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="New Signups" value={stats.signupsToday} />
          <StatCard label="Docs Created" value={stats.docsToday} />
          <StatCard label="Views" value={stats.viewsToday} />
          <StatCard label="AI Chats (month)" value={stats.aiChatsMonth} />
        </div>
      </div>

      {/* Revenue */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Revenue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="MRR" value={`$${stats.mrr}`} accent />
          <StatCard label="ARR" value={`$${stats.arr}`} />
          <StatCard label="Paying Orgs" value={stats.proOrgs + stats.businessOrgs} sub={`${stats.proOrgs} Pro + ${stats.businessOrgs} Biz`} />
          <StatCard label="Conversion" value={`${stats.conversionRate}%`} sub="Free → Paid" />
        </div>
      </div>

      {/* Overview */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Totals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Users" value={stats.totalUsers} />
          <StatCard label="Organizations" value={stats.totalOrgs} />
          <StatCard label="Documents" value={stats.totalDocs} />
          <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} />
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Plan Distribution</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Free</span>
              <span className="text-2xl font-bold text-white">{stats.freeOrgs}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-white/30" style={{ width: `${stats.totalOrgs ? (stats.freeOrgs / stats.totalOrgs * 100) : 0}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6C5CE7]">Pro</span>
              <span className="text-2xl font-bold text-[#6C5CE7]">{stats.proOrgs}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#6C5CE7]/20">
              <div className="h-2 rounded-full bg-[#6C5CE7]" style={{ width: `${stats.totalOrgs ? (stats.proOrgs / stats.totalOrgs * 100) : 0}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-400">Business</span>
              <span className="text-2xl font-bold text-amber-400">{stats.businessOrgs}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-amber-500/20">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: `${stats.totalOrgs ? (stats.businessOrgs / stats.totalOrgs * 100) : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* eSignature */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">eSignature</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Requests" value={stats.sigRequests} />
          <StatCard label="Completed" value={stats.sigCompleted} />
        </div>
      </div>

      {/* Signups chart */}
      {days.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Signups (last 14 days)</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-end gap-1 h-32">
              {days.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-white/30">{count}</span>
                  <div
                    className="w-full rounded-t bg-[#6C5CE7] min-h-[2px]"
                    style={{ height: `${(count / maxSignups) * 100}%` }}
                  />
                  <span className="text-[8px] text-white/20">{day.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
