"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationSettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then(r => r.json())
      .then(data => setWebhookUrl(data.slackWebhookUrl || ""))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slackWebhookUrl: webhookUrl }),
      });
      if (res.ok) {
        setMessage("Saved successfully!");
      } else {
        setMessage("Failed to save.");
      }
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]">
        &larr; Back to Settings
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-[#1A1A2E]">Notification Settings</h1>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-[#1A1A2E]">Slack Webhook URL</h2>
          <p className="mb-4 text-xs text-gray-400">
            Get notified in Slack when someone views your documents. Create an incoming webhook in your Slack workspace and paste the URL here.
          </p>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
          />
          {message && (
            <p className={`mt-2 text-sm ${message.includes("success") ? "text-[#00B894]" : "text-red-500"}`}>
              {message}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 rounded-lg bg-[#6C5CE7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
