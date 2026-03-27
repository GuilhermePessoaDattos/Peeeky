import { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const metadata: Metadata = {
  title: "Peeeky vs Google Drive for Document Sharing (2026)",
  description:
    "Why Google Drive links don't cut it for sales proposals and pitch decks. Peeeky adds tracking, analytics, and access controls.",
};

const rows = [
  { feature: "View tracking", competitor: false, peeeky: true },
  { feature: "Page-level analytics", competitor: false, peeeky: true },
  { feature: "Time per page", competitor: false, peeeky: true },
  { feature: "Email gating", competitor: false, peeeky: true },
  { feature: "Password protection", competitor: false, peeeky: true },
  { feature: "Real-time open notifications", competitor: false, peeeky: true },
  { feature: "AI Chat on documents", competitor: false, peeeky: true },
  { feature: "Engagement scoring", competitor: false, peeeky: true },
  { feature: "Download control", competitor: "Limited", peeeky: true },
  { feature: "Collaboration / editing", competitor: true, peeeky: false },
  { feature: "Storage", competitor: "15 GB free", peeeky: "5 docs free" },
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

export default function VsGoogleDrive() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#6C5CE7]">Home</Link> &rarr; Compare &rarr; Google Drive
        </p>

        {/* Hero */}
        <h1 className="font-display text-4xl font-bold text-[#1A1A2E] leading-tight">
          Peeeky vs Google Drive: Why Sharing a Link Isn&apos;t Enough
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          Google Drive is great for collaboration. It&apos;s terrible for sharing documents externally when
          you need to know what happens next. You paste a Drive link into an email, hit send, and then...
          silence. Did they open it? Did they read past the first page? Are they sharing it with their
          team? With Google Drive, you&apos;ll never know. Peeeky is purpose-built for outbound document
          sharing &mdash; pitch decks, proposals, reports &mdash; where tracking engagement isn&apos;t optional, it&apos;s
          the whole point.
        </p>

        {/* Comparison Table */}
        <div className="mt-12 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FC]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Feature</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Google Drive</th>
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
              Google Drive Has Zero Visibility After You Share
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              When you share a Google Drive link, the analytics stop at &ldquo;link copied.&rdquo; You
              can&apos;t see who opened the document, how long they spent on each page, or whether they
              forwarded it to a colleague. For internal team docs, this is fine. For a sales proposal you
              sent to a $200K prospect? It&apos;s flying blind. Peeeky shows you exactly who viewed your
              document, when they opened it, how many seconds they spent on each page, and whether they
              came back for a second look. Every view is logged with a timestamp, device info, and
              location. The difference is the difference between guessing and knowing.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">
              Access Controls That Actually Control Access
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Google Drive permissions are binary: either someone has the link or they don&apos;t. Anyone
              with the link can forward it to anyone else, download it, and do whatever they want with it.
              Peeeky gives you layered access controls &mdash; require an email address before viewing,
              set a password, disable downloads, set an expiration date, or limit the number of views. If
              you&apos;re sharing a confidential financial model or an investor update, these aren&apos;t nice-to-haves
              &mdash; they&apos;re requirements. With Peeeky, your documents stay under your control even after
              you share them.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A2E]">
              Different Tools for Different Jobs
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Google Drive is a storage and collaboration tool. It excels at letting five people edit a
              spreadsheet simultaneously. Peeeky is a document intelligence tool. It excels at telling
              you what happens after you share a document externally. Most teams need both: Drive for
              internal collaboration, Peeeky for external sharing. Upload your final PDF or deck to Peeeky,
              generate a tracked link, and send that instead of a Drive link. You keep Google&apos;s
              collaboration. You add Peeeky&apos;s intelligence. The combination gives you full visibility
              across the entire document lifecycle &mdash; from creation to consumption.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#1A1A2E] p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Stop sharing blind</h2>
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
