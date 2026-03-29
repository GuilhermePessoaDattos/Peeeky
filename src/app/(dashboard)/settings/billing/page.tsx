"use client";

import { useState } from "react";
import Link from "next/link";

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (
    plan: "PRO" | "BUSINESS",
    interval: "month" | "year"
  ) => {
    setLoading(`${plan}_${interval}`);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <Link
        href="/documents"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#6C5CE7]"
      >
        &larr; Back to Documents
      </Link>
      <h1 className="mb-2 font-display text-2xl font-bold text-[#1A1A2E]">
        Billing
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Choose the plan that fits your needs.
      </p>

      {/* Manage existing subscription */}
      <button
        onClick={handlePortal}
        disabled={loading === "portal"}
        className="mb-8 text-sm text-[#6C5CE7] hover:underline disabled:opacity-50"
      >
        {loading === "portal" ? "Loading..." : "Manage existing subscription \u2192"}
      </button>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-[#1A1A2E]">
            Free
          </h3>
          <div className="mt-2 mb-4">
            <span className="font-display text-3xl font-bold text-[#1A1A2E]">
              $0
            </span>
            <span className="text-sm text-gray-500">/mo</span>
          </div>
          <ul className="mb-6 space-y-2 text-sm text-gray-600">
            <li>&#10003; 5 documents</li>
            <li>&#10003; 3 links per document</li>
            <li>&#10003; Basic analytics</li>
            <li>&#10003; AI Chat (10/month)</li>
            <li>&#10003; Password protection</li>
          </ul>
          <div className="rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-500">
            Current plan
          </div>
        </div>

        {/* Pro */}
        <div className="relative rounded-xl border-2 border-[#6C5CE7] bg-white p-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6C5CE7] px-3 py-0.5 text-xs font-semibold text-white">
            Popular
          </div>
          <h3 className="font-display text-lg font-bold text-[#1A1A2E]">
            Pro
          </h3>
          <div className="mt-2 mb-4">
            <span className="font-display text-3xl font-bold text-[#1A1A2E]">
              $39
            </span>
            <span className="text-sm text-gray-500">/mo</span>
          </div>
          <ul className="mb-6 space-y-2 text-sm text-gray-600">
            <li>&#10003; Unlimited documents</li>
            <li>&#10003; Page-level analytics</li>
            <li>&#10003; AI Chat (50/mo)</li>
            <li>&#10003; Email notifications</li>
            <li>&#10003; Watermarks &amp; email gate</li>
            <li>&#10003; Custom logo</li>
          </ul>
          <div className="space-y-2">
            <button
              onClick={() => handleCheckout("PRO", "month")}
              disabled={loading !== null}
              className="w-full rounded-lg bg-[#6C5CE7] py-2.5 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90 disabled:opacity-50"
            >
              {loading === "PRO_month" ? "Loading..." : "Upgrade \u2014 $39/mo"}
            </button>
            <button
              onClick={() => handleCheckout("PRO", "year")}
              disabled={loading !== null}
              className="w-full rounded-lg border border-[#6C5CE7] py-2.5 text-sm font-semibold text-[#6C5CE7] hover:bg-[#6C5CE7]/5 disabled:opacity-50"
            >
              {loading === "PRO_year" ? "Loading..." : "$390/yr (save 17%)"}
            </button>
          </div>
        </div>

        {/* Business */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-[#1A1A2E]">
            Business
          </h3>
          <div className="mt-2 mb-4">
            <span className="font-display text-3xl font-bold text-[#1A1A2E]">
              $129
            </span>
            <span className="text-sm text-gray-500">/mo</span>
          </div>
          <ul className="mb-6 space-y-2 text-sm text-gray-600">
            <li>&#10003; Everything in Pro</li>
            <li>&#10003; 10 team members</li>
            <li>&#10003; Custom domain</li>
            <li>&#10003; Slack notifications</li>
            <li>&#10003; Unlimited AI Chat</li>
            <li>&#10003; Audit log</li>
          </ul>
          <div className="space-y-2">
            <button
              onClick={() => handleCheckout("BUSINESS", "month")}
              disabled={loading !== null}
              className="w-full rounded-lg bg-[#1A1A2E] py-2.5 text-sm font-semibold text-white hover:bg-[#1A1A2E]/90 disabled:opacity-50"
            >
              {loading === "BUSINESS_month"
                ? "Loading..."
                : "Upgrade \u2014 $129/mo"}
            </button>
            <button
              onClick={() => handleCheckout("BUSINESS", "year")}
              disabled={loading !== null}
              className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading === "BUSINESS_year"
                ? "Loading..."
                : "$1,290/yr (save 17%)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
