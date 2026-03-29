"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AuditItem {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audit")
      .then(r => {
        if (r.status === 403) {
          setPlan("FREE");
          return { events: [] };
        }
        return r.json();
      })
      .then(data => {
        setEvents(data.events || []);
        if (data.plan) setPlan(data.plan);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const needsUpgrade = plan === "FREE" || plan === "PRO";

  return (
    <div>
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]">
        &larr; Back to Settings
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-[#1A1A2E]">Audit Log</h1>

      {needsUpgrade ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="mb-4 text-4xl">🔒</div>
          <h2 className="text-lg font-bold text-[#1A1A2E]">Business plan feature</h2>
          <p className="mt-2 text-sm text-gray-500">
            Audit logs are available on the Business plan. Track every action in your workspace for compliance and security.
          </p>
          <Link
            href="/settings/billing"
            className="mt-4 inline-flex items-center rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white hover:bg-[#5B4BD5] transition-colors"
          >
            Upgrade to Business
          </Link>
        </div>
      ) : loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400">No events recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {events.map(e => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div>
                <span className="text-sm font-medium text-[#1A1A2E]">{e.action}</span>
                <span className="ml-2 text-xs text-gray-400">{e.resourceType} &middot; {e.resourceId.slice(0, 8)}...</span>
              </div>
              <span className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
