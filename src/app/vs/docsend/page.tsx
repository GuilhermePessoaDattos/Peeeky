import { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const metadata: Metadata = {
  title: "Peeeky vs DocSend: Free Alternative with AI Chat (2026)",
  description:
    "Compare Peeeky and DocSend. Peeeky offers page-level time tracking, AI chat, engagement scoring, and a free tier — at a lower price.",
};

const rows = [
  { feature: "Page-level time tracking", competitor: true, peeeky: true },
  { feature: "AI Chat on documents", competitor: false, peeeky: true },
  { feature: "Engagement scoring", competitor: false, peeeky: true },
  { feature: "Email capture / gating", competitor: true, peeeky: true },
  { feature: "Password protection", competitor: true, peeeky: true },
  { feature: "Real-time notifications", competitor: true, peeeky: true },
  { feature: "Custom branding", competitor: true, peeeky: true },
  { feature: "Free tier", competitor: false, peeeky: true },
  { feature: "Starting price", competitor: "$45/user/mo", peeeky: "$39/mo flat" },
  { feature: "Per-seat pricing", competitor: true, peeeky: false },
  { feature: "CRM integrations", competitor: true, peeeky: "Coming soon" },
  { feature: "NDA e-signatures", competitor: true, peeeky: false },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm text-gray-700">{value}</span>;
  return value ? (
    <span className="text-[#00B894] font-semibold">&#10003;</span>
  ) : (
    <span className="text-gray-300">&#10007;</span>
  );
}

export default function VsDocSend() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#6C5CE7]">Home</Link> &rarr; Compare &rarr; DocSend
        </p>

        {/* Hero */}
        <h1 className="font-display text-4xl font-bold text-[#1A1A2E] leading-tight">
          Peeeky vs DocSend: The Free DocSend Alternative with AI Built In
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          DocSend pioneered document tracking for startups. But at $45 per user per month with no free tier,
          it&apos;s become the tool teams sign up for and then look to replace. Peeeky gives you everything
          DocSend does &mdash; page-level analytics, email gating, real-time notifications &mdash; plus an AI
          chat layer that lets viewers ask questions about your document. All starting at $39/month flat, not
          per seat. And yes, there&apos;s a generous free tier to get started.
        </p>

        {/* Comparison Table */}
        <div className="mt-12 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FC]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Feature</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">DocSend</th>
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
              AI Chat Turns Passive Readers into Engaged Prospects
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              DocSend lets you see who opened your deck. Peeeky lets your deck talk back. With AI Chat,
              viewers can ask questions about your pitch, your financials, or your product &mdash; and get
              instant answers grounded in the document. That investor reviewing your Series A deck at
              midnight? They don&apos;t have to wait until your next meeting to get clarity. They get it right
              there, embedded in the viewer. This isn&apos;t a gimmick &mdash; it fundamentally changes how
              documents work. Instead of a static PDF that readers skim and forget, Peeeky turns every
              document into a two-way conversation.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">
              Engagement Scoring Tells You Who&apos;s Genuinely Interested
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              DocSend shows you raw numbers &mdash; page views, time per page, total visits. But you still
              have to interpret all that data yourself. Peeeky calculates an engagement score for every
              viewer, factoring in total time spent, pages viewed, return visits, and interactions with the
              AI chat. A founder who sent their pitch to 60 investors can instantly see which five are
              actually interested, ranked by score. No spreadsheets required. The engagement score turns
              analytics from a reporting feature into an action signal: follow up with the people who
              scored highest, deprioritize the rest.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">
              Flat Pricing That Doesn&apos;t Punish Team Growth
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              DocSend charges per seat. Add three people to your sales team and your bill jumps $135/month
              overnight. Peeeky uses flat pricing &mdash; $39/month covers your entire team. Whether you have
              2 users or 10, the price stays the same. For early-stage startups and lean sales teams, this
              is the difference between a tool you can actually adopt and one you have to ration. Plus,
              Peeeky&apos;s free tier includes 5 documents with full analytics. Test it with real deals before
              you commit a dollar.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#1A1A2E] p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Ready to switch from DocSend?</h2>
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
