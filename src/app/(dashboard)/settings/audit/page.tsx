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

  useEffect(() => {
    fetch("/api/audit")
      .then(r => r.json())
      .then(data => setEvents(data.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]">
        &larr; Back to Settings
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-[#1A1A2E]">Audit Log</h1>

      {loading ? (
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
