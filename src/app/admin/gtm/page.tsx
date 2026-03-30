"use client";

import { useEffect, useState, useCallback } from "react";

interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  schedule: string;
  status: string;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  runsTotal: number;
  runsSuccess: number;
  runsFailed: number;
  runs: AgentRun[];
}

interface AgentRun {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  output: string | null;
  itemsCreated: number;
}

interface Activity {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: number;
  output: string | null;
  notes: string | null;
  completedAt: string | null;
}

interface Week {
  id: string;
  weekStart: string;
  weekNumber: number;
  goals: string | null;
  activities: Activity[];
  stats: {
    total: number;
    done: number;
    inProgress: number;
    pending: number;
  };
}

interface GtmStats {
  overview: {
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
    completionRate: number;
  };
  agents: Agent[];
  currentWeek: Week | null;
  recentRuns: Array<AgentRun & { agent: { displayName: string } }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  content: "bg-blue-500/20 text-blue-400",
  social: "bg-purple-500/20 text-purple-400",
  community: "bg-green-500/20 text-green-400",
  outbound: "bg-orange-500/20 text-orange-400",
  github: "bg-gray-500/20 text-gray-400",
  ads: "bg-red-500/20 text-red-400",
  appsumo: "bg-yellow-500/20 text-yellow-400",
  other: "bg-white/10 text-white/60",
};

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-400",
  paused: "text-yellow-400",
  error: "text-red-400",
};

export default function GtmDashboard() {
  const [stats, setStats] = useState<GtmStats | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"calendar" | "agents">("calendar");

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, weeksRes] = await Promise.all([
        fetch("/api/admin/gtm/stats"),
        fetch("/api/admin/gtm/weeks"),
      ]);
      setStats(await statsRes.json());
      setWeeks(await weeksRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggleActivity(id: string, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await fetch(`/api/admin/gtm/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  }

  async function toggleAgent(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await fetch(`/api/admin/gtm/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  }

  async function triggerAgent(id: string) {
    await fetch(`/api/admin/gtm/agents/${id}/trigger`, { method: "POST" });
    fetchData();
  }

  if (loading) return <div className="text-white/40">Loading GTM dashboard...</div>;
  if (!stats) return <div className="text-red-400">Failed to load</div>;

  const isCurrentWeek = (weekStart: string) => {
    const ws = new Date(weekStart);
    const now = new Date();
    const weekEnd = new Date(ws);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return now >= ws && now < weekEnd;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">GTM Strategy</h1>
      <p className="text-sm text-white/40 mb-6">R$20K/month in 12 months — track progress and manage agents</p>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Completion</p>
          <p className="mt-1 text-3xl font-bold text-[#6C5CE7]">{stats.overview.completionRate}%</p>
          <p className="text-xs text-white/30">{stats.overview.completedActivities}/{stats.overview.totalActivities} activities</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">This Week</p>
          <p className="mt-1 text-3xl font-bold text-white">
            {stats.currentWeek?.stats.done || 0}/{stats.currentWeek?.stats.total || 0}
          </p>
          <p className="text-xs text-white/30">tasks done</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Agents Active</p>
          <p className="mt-1 text-3xl font-bold text-green-400">
            {stats.agents.filter((a) => a.status === "active").length}/{stats.agents.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Pending</p>
          <p className="mt-1 text-3xl font-bold text-orange-400">{stats.overview.pendingActivities}</p>
          <p className="text-xs text-white/30">activities remaining</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`text-sm font-medium pb-2 border-b-2 transition ${
            activeTab === "calendar" ? "border-[#6C5CE7] text-white" : "border-transparent text-white/40 hover:text-white/60"
          }`}
        >
          Weekly Calendar
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`text-sm font-medium pb-2 border-b-2 transition ${
            activeTab === "agents" ? "border-[#6C5CE7] text-white" : "border-transparent text-white/40 hover:text-white/60"
          }`}
        >
          Agent Management
        </button>
      </div>

      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          {weeks.map((week) => {
            const isCurrent = isCurrentWeek(week.weekStart);
            const goals = week.goals ? JSON.parse(week.goals) : null;
            const weekEnd = new Date(week.weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            return (
              <div
                key={week.id}
                className={`rounded-2xl border p-5 ${
                  isCurrent ? "border-[#6C5CE7]/50 bg-[#6C5CE7]/5" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white">
                      Week {week.weekNumber}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-[#6C5CE7] text-white px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-white/30">
                      {new Date(week.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" — "}
                      {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {goals?.focus && (
                      <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                        {goals.focus}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">
                      {week.stats.done}/{week.stats.total}
                    </span>
                    <div className="w-24 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-[#6C5CE7] transition-all"
                        style={{ width: `${week.stats.total > 0 ? (week.stats.done / week.stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {week.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 group"
                    >
                      <button
                        onClick={() => toggleActivity(activity.id, activity.status)}
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition ${
                          activity.status === "done"
                            ? "bg-[#6C5CE7] border-[#6C5CE7]"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {activity.status === "done" && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </button>
                      <span
                        className={`text-sm flex-1 ${
                          activity.status === "done" ? "text-white/30 line-through" : "text-white/80"
                        }`}
                      >
                        {activity.title}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.other}`}>
                        {activity.category}
                      </span>
                      {activity.priority === 1 && (
                        <span className="text-[10px] text-red-400">HIGH</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === "agents" && (
        <div className="space-y-4">
          {stats.agents.map((agent) => (
            <div key={agent.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{agent.displayName}</h3>
                  <p className="text-xs text-white/40">{agent.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${STATUS_COLORS[agent.status]}`}>
                    {agent.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => toggleAgent(agent.id, agent.status)}
                    className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
                  >
                    {agent.status === "active" ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => triggerAgent(agent.id)}
                    className="text-xs px-3 py-1 rounded-lg bg-[#6C5CE7] text-white hover:bg-[#5A4BD1] transition"
                  >
                    Run Now
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-white/30">Schedule</span>
                  <p className="text-white/60 font-mono">{agent.schedule}</p>
                </div>
                <div>
                  <span className="text-white/30">Last Run</span>
                  <p className="text-white/60">
                    {agent.lastRunAt
                      ? new Date(agent.lastRunAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Never"}
                  </p>
                </div>
                <div>
                  <span className="text-white/30">Runs</span>
                  <p className="text-white/60">
                    {agent.runsTotal} total ({agent.runsSuccess} ok, {agent.runsFailed} err)
                  </p>
                </div>
                <div>
                  <span className="text-white/30">Last Status</span>
                  <p className={agent.lastRunStatus === "success" ? "text-green-400" : agent.lastRunStatus === "error" ? "text-red-400" : "text-white/40"}>
                    {agent.lastRunStatus || "—"}
                  </p>
                </div>
              </div>

              {agent.runs && agent.runs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Recent Runs</p>
                  <div className="space-y-1">
                    {agent.runs.slice(0, 3).map((run) => (
                      <div key={run.id} className="flex items-center gap-3 text-xs">
                        <span className={`w-2 h-2 rounded-full ${
                          run.status === "success" ? "bg-green-400" :
                          run.status === "error" ? "bg-red-400" :
                          run.status === "running" ? "bg-yellow-400 animate-pulse" : "bg-white/20"
                        }`} />
                        <span className="text-white/40">
                          {new Date(run.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-white/60 flex-1 truncate">{run.output || "—"}</span>
                        {run.duration && <span className="text-white/30">{run.duration}s</span>}
                        {run.itemsCreated > 0 && <span className="text-[#6C5CE7]">{run.itemsCreated} items</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
