"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedeemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("code") || "";

  const [code, setCode] = useState(prefillCode);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/appsumo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`License redeemed! You're now on the ${data.plan} plan.`);
        setTimeout(() => router.push("/documents"), 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to redeem license");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-2xl font-bold mb-2">Redeem License</h1>
      <p className="text-gray-500 mb-8">
        Enter your AppSumo license code to activate your plan.
      </p>

      <form onSubmit={handleRedeem} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-center text-lg tracking-widest font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          maxLength={19}
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={!code || status === "loading" || status === "success"}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Redeeming..." : "Redeem License"}
        </button>
      </form>

      {status === "success" && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          {message}
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {message}
        </div>
      )}
    </div>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md py-16 text-gray-400">Loading...</div>}>
      <RedeemForm />
    </Suspense>
  );
}
