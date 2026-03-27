import { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const metadata: Metadata = {
  title: "Track Your Pitch Deck — Know Which Investors Are Interested | Peeeky",
  description:
    "Send your pitch deck to 50 investors and know exactly who read it, which pages they spent time on, and when to follow up. Free to start.",
};

export default function ForFundraising() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#6C5CE7]">Home</Link> &rarr; Use Cases &rarr; Fundraising
        </p>

        {/* Hero */}
        <h1 className="font-display text-4xl font-bold text-[#1A1A2E] leading-tight">
          Stop Guessing Which Investors Read Your Deck
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          You send your pitch deck to 50 investors. Three reply. But how many actually opened it? How many
          got past the cover page? Which ones spent time on your financials &mdash; the ones who are
          seriously evaluating? With a Google Drive link or a PDF attachment, you&apos;ll never know. With
          Peeeky, you know everything.
        </p>

        {/* Problem */}
        <div className="mt-12 rounded-xl border-l-4 border-[#E17055] bg-[#FFF5F3] p-6">
          <h2 className="font-display text-xl font-bold text-[#1A1A2E]">The Problem</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Fundraising is a numbers game played in the dark. You blast your deck, wait for replies, and
            follow up blindly with &ldquo;Just checking if you had a chance to look at our deck.&rdquo;
            That email is a confession: you have no idea what&apos;s happening on the other side. Meanwhile,
            the investors who are genuinely interested get the same generic follow-up as the ones who
            deleted your email without opening it. You waste time on cold leads and under-invest in warm
            ones.
          </p>
        </div>

        {/* Solution */}
        <div className="mt-8 rounded-xl border-l-4 border-[#00B894] bg-[#F0FFF9] p-6">
          <h2 className="font-display text-xl font-bold text-[#1A1A2E]">The Peeeky Solution</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Upload your deck once. Generate a tracked link. Send it to every investor on your list. From
            that moment, you have full visibility. You see who opened it, when they opened it, how long
            they spent on each page, and whether they came back for a second or third look. Peeeky&apos;s
            engagement score ranks your investors by genuine interest &mdash; not by who replies the
            fastest, but by who actually reads the most.
          </p>
        </div>

        {/* Key Features */}
        <div className="mt-16 space-y-10">
          <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">Built for Founders Raising Capital</h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                📊
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">Engagement Scoring</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Every investor gets a score based on time spent, pages viewed, return visits, and AI chat
                interactions. Sort by score to find your warmest leads instantly.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                🤖
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">AI Chat for Late-Night Due Diligence</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Investors reviewing your deck at 11 PM can ask questions and get instant, document-grounded
                answers. No more waiting until your next meeting for clarification.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                🔔
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">Real-Time Open Alerts</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Get notified the instant an investor opens your deck. Know when to send that perfectly
                timed follow-up while your pitch is fresh in their mind.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 rounded-xl bg-[#F8F9FC] p-8">
          <blockquote className="text-lg text-gray-700 leading-relaxed italic">
            &ldquo;We sent our Series A deck to 40 investors. Peeeky showed us that 12 read past the
            financials page. We focused our follow-ups on those 12 and closed our round in 6 weeks.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-semibold text-[#1A1A2E]">
            &mdash; Early-stage founder, SaaS
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#1A1A2E] p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Your deck deserves to be tracked</h2>
          <p className="mt-2 text-gray-400">Upload your pitch deck and start seeing who&apos;s interested. Free, no credit card.</p>
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
