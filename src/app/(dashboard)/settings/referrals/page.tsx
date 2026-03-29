"use client";

import { useEffect, useState } from "react";

interface Referral {
  id: string;
  status: string;
  commission: number;
  createdAt: string;
  referredOrg: {
    name: string;
    plan: string;
    createdAt: string;
  };
}

export default function ReferralsPage() {
  const [code, setCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; payoutsEnabled?: boolean } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [payingOut, setPayingOut] = useState(false);
  const [payoutResult, setPayoutResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/referrals/connect").then(r => r.json()).then(setConnectStatus).catch(() => {});
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((data) => {
        setCode(data.code);
        setReferrals(data.referrals || []);
        setTotal(data.total || 0);
        setActive(data.active || 0);
        setLoading(false);
      });
  }, []);

  const referralUrl = `https://peeeky.com/signup?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Referral Program</h1>
      <p className="text-gray-500 mb-8">
        Earn 20% commission for 12 months on every paying customer you refer.
      </p>

      {/* Referral Link */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Your referral link
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono"
          />
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Active (Paying)</p>
          <p className="text-2xl font-bold text-green-600">{active}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Est. Monthly Earnings</p>
          <p className="text-2xl font-bold">
            ${(active * 39 * 0.2).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Stripe Connect Payouts */}
      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Payout Settings</h2>
        {!connectStatus?.connected ? (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Connect your Stripe account to receive automatic referral payouts (20% commission).
            </p>
            <button
              onClick={async () => {
                setConnecting(true);
                try {
                  const res = await fetch("/api/referrals/connect", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } finally {
                  setConnecting(false);
                }
              }}
              disabled={connecting}
              className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90 disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Stripe Account"}
            </button>
          </div>
        ) : !connectStatus.payoutsEnabled ? (
          <div>
            <p className="text-xs text-yellow-600 mb-3">
              Stripe account connected but onboarding incomplete. Complete setup to receive payouts.
            </p>
            <button
              onClick={async () => {
                const res = await fetch("/api/referrals/connect", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="rounded-lg border border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50"
            >
              Complete Setup
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-medium text-green-700">Stripe connected — payouts enabled</span>
            </div>
            {active > 0 && (
              <div>
                <button
                  onClick={async () => {
                    setPayingOut(true);
                    setPayoutResult(null);
                    try {
                      const res = await fetch("/api/referrals/payout", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        setPayoutResult(`Payout of $${data.amount} sent for ${data.referralsPaid} referral(s)`);
                      } else {
                        setPayoutResult(data.error || "Payout failed");
                      }
                    } catch {
                      setPayoutResult("Payout failed");
                    } finally {
                      setPayingOut(false);
                    }
                  }}
                  disabled={payingOut}
                  className="rounded-lg bg-[#00B894] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00B894]/90 disabled:opacity-50"
                >
                  {payingOut ? "Processing..." : `Request Payout ($${(active * 39 * 0.2).toFixed(0)})`}
                </button>
                {payoutResult && (
                  <p className="mt-2 text-xs text-gray-600">{payoutResult}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Referral List */}
      {referrals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Referrals</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Organization</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{ref.referredOrg.name}</td>
                    <td className="px-4 py-3">{ref.referredOrg.plan}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          ref.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : ref.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
