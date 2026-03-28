import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Peeeky",
  description: "How Peeeky collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            p<span className="text-[#6C5CE7]">eee</span>ky
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">&larr; Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: March 28, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
            <p><strong>Account Data:</strong> When you sign up, we collect your name, email address, and authentication credentials (via Google OAuth or magic link).</p>
            <p><strong>Document Data:</strong> We store the documents you upload (PDFs, PPTX files) on encrypted cloud storage (Cloudflare R2). We extract text content for AI Chat functionality.</p>
            <p><strong>Viewer Analytics:</strong> When someone views a shared document, we collect: IP address, device type, browser, operating system, approximate location (country/city via Vercel geolocation headers), time spent per page, and completion rate.</p>
            <p><strong>Signature Data:</strong> For eSignature features, we collect signer email, IP address, signature image, and generate a tamper-proof audit hash.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide document sharing, tracking, and analytics services</li>
              <li>Send email notifications (view alerts, signature requests, welcome emails)</li>
              <li>Power AI Chat responses based on document content</li>
              <li>Process payments via Stripe</li>
              <li>Improve our product and fix bugs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Data Storage & Security</h2>
            <p>Documents are stored on Cloudflare R2 with encryption at rest. Access is controlled via short-lived signed URLs. Database is hosted on Supabase (PostgreSQL) with TLS encryption. We use Upstash Redis for caching with encrypted connections.</p>
            <p>We implement rate limiting, input validation, and authentication checks on all API endpoints. Sentry is used for error monitoring — no sensitive user data is sent to Sentry.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>OpenAI</strong> — AI Chat responses (document content sent for context)</li>
              <li><strong>Vercel</strong> — hosting and deployment</li>
              <li><strong>Supabase</strong> — database hosting</li>
              <li><strong>Cloudflare R2</strong> — document storage</li>
              <li><strong>Sentry</strong> — error monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Data Retention</h2>
            <p>Free plan: analytics data retained for 30 days. Pro plan: 365 days. Business plan: unlimited retention. Documents are retained until you delete them. When you delete a document, all associated links, views, and embeddings are permanently deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
            <p>You can:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your data through the dashboard</li>
              <li>Export viewer data as CSV</li>
              <li>Delete your documents and associated data at any time</li>
              <li>Request account deletion by emailing hello@peeeky.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. Cookies</h2>
            <p>We use essential cookies for authentication (NextAuth session). We use a referral tracking cookie (90-day duration) when you sign up via a referral link. We do not use advertising or third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">8. Contact</h2>
            <p>For questions about this privacy policy or your data, contact us at <a href="mailto:hello@peeeky.com" className="text-[#6C5CE7] hover:underline">hello@peeeky.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
