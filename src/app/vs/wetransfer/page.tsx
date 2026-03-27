import { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const metadata: Metadata = {
  title: "Peeeky vs WeTransfer: Sharing vs Tracking (2026)",
  description:
    "WeTransfer sends files. Peeeky sends intelligence. Track who opens your documents, which pages they read, and when to follow up.",
};

const rows = [
  { feature: "Document viewer", competitor: false, peeeky: true },
  { feature: "Page-level analytics", competitor: false, peeeky: true },
  { feature: "View tracking", competitor: "Download only", peeeky: true },
  { feature: "Time per page", competitor: false, peeeky: true },
  { feature: "Email gating", competitor: false, peeeky: true },
  { feature: "AI Chat on documents", competitor: false, peeeky: true },
  { feature: "Engagement scoring", competitor: false, peeeky: true },
  { feature: "Link expiration", competitor: "7 days (free)", peeeky: "Custom" },
  { feature: "File size limit", competitor: "2 GB (free)", peeeky: "50 MB/doc" },
  { feature: "Large file transfer", competitor: true, peeeky: false },
  { feature: "Video / zip support", competitor: true, peeeky: "PDF/PPTX" },
  { feature: "Price", competitor: "Free / $12/mo", peeeky: "Free / $39/mo" },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm text-gray-700">{value}</span>;
  return value ? (
    <span className="text-[#00B894] font-semibold">&#10003;</span>
  ) : (
    <span className="text-gray-300">&#10007;</span>
  );
}

export default function VsWeTransfer() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#6C5CE7]">Home</Link> &rarr; Compare &rarr; WeTransfer
        </p>

        {/* Hero */}
        <h1 className="font-display text-4xl font-bold text-[#1A1A2E] leading-tight">
          Peeeky vs WeTransfer: Sending Files Is Not the Same as Sharing Documents
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          WeTransfer is built for moving large files from point A to point B. It does that well. But the
          moment someone downloads your file, the trail goes cold. You don&apos;t know if they opened it,
          read it, or deleted it. Peeeky takes a fundamentally different approach: your document stays in
          a secure viewer, and every interaction &mdash; every page view, every second spent, every return
          visit &mdash; is tracked and scored. If you&apos;re sending a pitch deck, a sales proposal, or a
          consulting report, you don&apos;t just need file transfer. You need document intelligence.
        </p>

        {/* Comparison Table */}
        <div className="mt-12 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FC]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Feature</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">WeTransfer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#6C5CE7]">Peeeky</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-t border-gray-100">
                  <td className="px-6 py-3 text-sm text-gray-700">{row.feature}</td>
                  <td className="px-6 py-3 text-sm"><Cell value={row.competitor} /></td>
                  <td className="px-6 py-3 text-sm"><Cell value={row.peeeky} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Differences */}
        <div className="mt-16 space-y-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">
              File Transfer vs Document Intelligence
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              WeTransfer is a pipe. You put a file in one end, someone downloads it from the other end,
              and the pipe goes away. That&apos;s the product. There&apos;s no viewer &mdash; the recipient
              downloads the raw file and opens it in whatever application they have. There&apos;s no
              tracking beyond &ldquo;downloaded&rdquo; or &ldquo;not downloaded.&rdquo; Peeeky keeps your
              document in a beautiful, branded viewer. The recipient never downloads the file (unless you
              allow it). Every second they spend is logged. You can see they spent 3 minutes on your
              pricing page but skipped your team bio. That&apos;s actionable intelligence you can use to
              tailor your follow-up. WeTransfer gives you a delivery receipt. Peeeky gives you a reading
              receipt &mdash; for every page.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">
              Links That Don&apos;t Expire on Someone Else&apos;s Schedule
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              WeTransfer free links expire in 7 days. If your investor takes two weeks to look at your
              deck (they will), the link is dead. They email you asking for another copy. You resend.
              They forget again. With Peeeky, you control the link lifecycle. Set it to expire in 30 days,
              or never. Revoke access instantly if a deal falls through. Update the document behind the
              same link without sending a new URL. Your link is a living, controllable asset &mdash; not
              a ticking clock.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">
              When to Use Each Tool
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Use WeTransfer when you need to send someone a 1.5 GB video file or a folder of raw design
              assets. It&apos;s great for that. Use Peeeky when you&apos;re sharing a document that matters
              &mdash; a pitch deck to investors, a proposal to a client, a report to a board member &mdash;
              and you need to know what happens after you hit send. They&apos;re not competing products.
              They solve different problems. But if you&apos;ve been using WeTransfer to send pitch decks
              because it was the easiest option, you&apos;ve been leaving intelligence on the table.
              Switch to Peeeky for documents that deserve tracking, and keep WeTransfer for raw file
              transfers.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#1A1A2E] p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Share smarter, not just faster</h2>
          <p className="mt-2 text-gray-400">Start tracking your documents for free. No credit card required.</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-[#6C5CE7] px-8 py-3 font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            Start Free
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
