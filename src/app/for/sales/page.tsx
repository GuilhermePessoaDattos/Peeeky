import { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const metadata: Metadata = {
  title: "Sales Proposals That Tell You When to Follow Up | Peeeky",
  description:
    "Send sales proposals with built-in tracking. Know who opened them, which sections they read, and follow up at the perfect moment.",
};

export default function ForSales() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#6C5CE7]">Home</Link> &rarr; Use Cases &rarr; Sales
        </p>

        {/* Hero */}
        <h1 className="font-display text-4xl font-bold text-[#1A1A2E] leading-tight">
          Know the Exact Moment Your Prospect Reads Your Proposal
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          You spent two hours crafting the perfect sales proposal. You sent it Tuesday afternoon. It&apos;s
          now Thursday and you haven&apos;t heard back. Do you follow up? Wait? The old answer was &ldquo;trust
          your gut.&rdquo; The Peeeky answer is: check your dashboard. If they opened it at 9 AM today and
          spent 4 minutes on the pricing page, you call them right now.
        </p>

        {/* Problem */}
        <div className="mt-12 rounded-xl border-l-4 border-[#E17055] bg-[#FFF5F3] p-6">
          <h2 className="font-display text-xl font-bold text-[#1A1A2E]">The Problem</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Sales teams send proposals into a black hole. The proposal goes out as a PDF attachment or a
            Google Drive link, and from that moment, the rep is blind. They don&apos;t know if the prospect
            opened it, forwarded it to their CFO, or let it sit in their inbox unread. So they follow up
            too early (annoying) or too late (the prospect went with a competitor). Timing is everything
            in sales, and most teams are timing their follow-ups based on nothing.
          </p>
        </div>

        {/* Solution */}
        <div className="mt-8 rounded-xl border-l-4 border-[#00B894] bg-[#F0FFF9] p-6">
          <h2 className="font-display text-xl font-bold text-[#1A1A2E]">The Peeeky Solution</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Upload your proposal to Peeeky and send a tracked link instead of an attachment. The moment
            your prospect opens it, you get a real-time notification. You can see they&apos;re reading the
            scope of work, lingering on pricing, and just opened it for the second time &mdash; this time
            from a different device (their CFO&apos;s laptop, maybe). With Peeeky, every proposal comes
            with a built-in intent signal. Follow up when engagement is highest, not when your calendar
            reminder goes off.
          </p>
        </div>

        {/* Key Features */}
        <div className="mt-16 space-y-10">
          <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">Built for Sales Teams That Close</h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                ⚡
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">Real-Time Notifications</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Get an instant alert when a prospect opens your proposal. See which pages they&apos;re
                viewing in real time. Strike while the iron is hot.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                🎯
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">Engagement-Based Prioritization</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Stop treating all prospects equally. Peeeky&apos;s engagement score tells you who&apos;s
                seriously evaluating and who&apos;s just being polite. Focus your energy where it counts.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                💬
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#1A1A2E]">AI Chat Handles Objections 24/7</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Prospects can ask questions about your proposal and get instant answers. The AI uses your
                document as context, so responses are accurate and on-brand.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 rounded-xl bg-[#F8F9FC] p-8">
          <blockquote className="text-lg text-gray-700 leading-relaxed italic">
            &ldquo;I saw a prospect open my proposal at 8:47 AM. I called at 8:52. They said: &lsquo;I was
            literally just reading your pricing.&rsquo; We closed the deal that week.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-semibold text-[#1A1A2E]">
            &mdash; Account Executive, B2B SaaS
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#1A1A2E] p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Close more deals with less guessing</h2>
          <p className="mt-2 text-gray-400">Send your next proposal with Peeeky. Free to start, no credit card required.</p>
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
