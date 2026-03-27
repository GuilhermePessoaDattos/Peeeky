import { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const metadata: Metadata = {
  title: "Virtual Data Rooms for M&A Without the Enterprise Price | Peeeky",
  description:
    "Secure document sharing for M&A deals. Password protection, email gating, audit trails, and page-level analytics at 1/10th the cost of Intralinks.",
};

export default function ForMnA() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#6C5CE7]">Home</Link> &rarr; Use Cases &rarr; M&amp;A
        </p>

        {/* Hero */}
        <h1 className="font-display text-4xl font-bold text-[#1A1A2E] leading-tight">
          Virtual Data Rooms That Don&apos;t Cost More Than Your Legal Fees
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          Enterprise virtual data rooms like Intralinks and Datasite charge $15,000+ for a single deal.
          For mid-market M&amp;A, that&apos;s a tax on doing business. Peeeky gives you the security,
          access controls, and audit trails you need for due diligence &mdash; at a fraction of the cost.
          Password-protected documents, email-gated access, page-level tracking, and a complete log of
          who viewed what and when.
        </p>

        {/* Problem */}
        <div className="mt-12 rounded-xl border-l-4 border-[#E17055] bg-[#FFF5F3] p-6">
          <h2 className="font-display text-xl font-bold text-[#1A1A2E]">The Problem</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            M&amp;A deals involve sharing some of the most sensitive documents a company has &mdash;
            financial statements, customer contracts, IP documentation, employee data. Traditional VDRs
            offer the security you need, but at enterprise prices that don&apos;t make sense for deals
            under $50M. The alternative &mdash; sharing via Dropbox or email &mdash; has zero security,
            zero tracking, and zero audit trail. You end up choosing between spending $15K on a VDR or
            flying blind with consumer file-sharing tools.
          </p>
        </div>

        {/* Solution */}
        <div className="mt-8 rounded-xl border-l-4 border-[#00B894] bg-[#F0FFF9] p-6">
          <h2 className="font-display text-xl font-bold text-[#1A1A2E]">The Peeeky Solution</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Peeeky sits in the sweet spot between consumer file sharing and enterprise VDRs. Upload your
            due diligence documents, set password and email requirements, and share secure links with
            potential buyers or their advisors. Every view is logged with timestamps, viewer identity,
            device information, and page-by-page engagement. You get an audit trail that would satisfy any
            lawyer, at a price that doesn&apos;t require board approval. For sell-side advisors running
            competitive processes, Peeeky&apos;s engagement analytics reveal which buyers are doing real
            diligence and which are just kicking tires.
          </p>
        </div>

        {/* Key Features */}
        <div className="mt-16 space-y-10">
          <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">Built for Deal Security</h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                🔒
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">Layered Access Controls</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Require email verification, set passwords, disable downloads, and set link expiration
                dates. Control who sees what, and revoke access instantly if a buyer drops out.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                📋
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">Complete Audit Trail</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Every document view is logged with viewer identity, timestamp, pages viewed, and time
                spent. Export your audit log for legal records or compliance reviews.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                📊
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">Buyer Intent Analytics</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                In a competitive auction, know which buyers are doing deep diligence. Engagement scores
                reveal who&apos;s serious, helping sellers and advisors manage the process strategically.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 rounded-xl bg-[#F8F9FC] p-8">
          <blockquote className="text-lg text-gray-700 leading-relaxed italic">
            &ldquo;We ran a sell-side process with 8 potential buyers. Peeeky showed us that only 3 were
            doing real diligence &mdash; the rest barely opened the CIM. We focused our energy on the
            serious bidders and closed at a higher multiple.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-semibold text-[#1A1A2E]">
            &mdash; M&amp;A Advisor, mid-market
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#1A1A2E] p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Secure data rooms, startup pricing</h2>
          <p className="mt-2 text-gray-400">Share deal documents securely. Start free, no credit card required.</p>
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
