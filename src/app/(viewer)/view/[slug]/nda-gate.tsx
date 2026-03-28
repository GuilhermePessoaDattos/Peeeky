"use client";

import { useState } from "react";

export function NdaGate({
  linkId,
  slug,
  ndaText,
  documentName,
}: {
  linkId: string;
  slug: string;
  ndaText: string;
  documentName: string;
}) {
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!accepted) {
      setError("You must agree to the terms");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/links/${linkId}/nda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        // Set cookie and redirect to viewer
        document.cookie = `viewer_email=${encodeURIComponent(email)};path=/;max-age=${60 * 60 * 24}`;
        window.location.href = `/view/${slug}/doc?email=${encodeURIComponent(email)}`;
      } else {
        setError("Failed to record acceptance. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A2E] px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8">
        <div className="mb-6 text-center">
          <div className="mb-3 text-3xl">&#128220;</div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">
            Non-Disclosure Agreement
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            You must accept the following agreement before viewing &ldquo;{documentName}&rdquo;
          </p>
        </div>

        <div className="mb-6 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {ndaText}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Your Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
          />
        </div>

        <label className="mb-6 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-[#6C5CE7] focus:ring-[#6C5CE7]"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            I have read and agree to the terms above. I understand that this acceptance is legally binding and recorded with my email, IP address, and timestamp.
          </span>
        </label>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={loading || !accepted || !email}
          className="w-full rounded-xl bg-[#6C5CE7] py-3 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Recording acceptance..." : "I Agree — View Document"}
        </button>

        <p className="mt-4 text-center text-[10px] text-gray-400">
          Your acceptance is logged with timestamp and IP for legal compliance.
        </p>
      </div>
    </div>
  );
}
