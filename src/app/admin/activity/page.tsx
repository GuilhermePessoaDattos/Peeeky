"use client";

import { useEffect, useState } from "react";

const actionColors: Record<string, string> = {
  SUSPEND_ORG: "text-red-400",
  UNSUSPEND_ORG: "text-green-400",
  BLOCK_USER: "text-red-400",
  UNBLOCK_USER: "text-green-400",
  CHANGE_PLAN: "text-[#6C5CE7]",
  EXTEND_TRIAL: "text-blue-400",
  IMPERSONATE: "text-amber-400",
};

export default function AdminActivity() {
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/activity").then((r) => r.json()).then(setActions);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Admin Activity Log</h1>
      <p className="text-sm text-white/40 mb-6">All admin actions are recorded here.</p>

      {actions.length === 0 ? (
        <p className="text-white/30 text-sm">No admin actions yet.</p>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 flex items-center gap-4">
              <span className={`text-xs font-mono font-semibold ${actionColors[a.action] || "text-white/60"}`}>{a.action}</span>
              <span className="text-xs text-white/40">{a.targetType} : {a.targetId.slice(0, 12)}...</span>
              {a.reason && <span className="text-xs text-white/30 italic">"{a.reason}"</span>}
              <span className="ml-auto text-xs text-white/20">{a.adminEmail}</span>
              <span className="text-xs text-white/20">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
