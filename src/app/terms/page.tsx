import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Peeeky",
  description: "Terms and conditions for using Peeeky.",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: March 28, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Peeeky ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. The Service is operated by Peeeky ("we", "us", "our").</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Description of Service</h2>
            <p>Peeeky is a document sharing and analytics platform that allows you to share documents via tracked links, view per-page engagement analytics, use AI-powered document chat, and collect electronic signatures. The Service is provided on a subscription basis with Free, Pro, and Business tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized access. One person or entity may not maintain more than one free account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Upload documents containing illegal content</li>
              <li>Use the Service for phishing, fraud, or deception</li>
              <li>Share documents that violate third-party intellectual property rights</li>
              <li>Attempt to circumvent access controls or rate limits</li>
              <li>Use automated tools to scrape or abuse the Service</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Document Ownership</h2>
            <p>You retain full ownership of all documents you upload. By uploading content, you grant us a limited license to store, process, and serve your documents for the purpose of providing the Service. We do not claim ownership of your content. We may extract text content for AI Chat functionality — this extracted content is not shared with third parties except OpenAI for generating responses.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Electronic Signatures</h2>
            <p>Peeeky provides electronic signature functionality. By using our eSignature feature, you agree that electronic signatures created through our Service are legally binding under applicable electronic signature laws (ESIGN Act, UETA, eIDAS, MP 2.200-2). Each signature is recorded with the signer's email, IP address, timestamp, and a cryptographic audit hash for tamper detection.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. Payment & Billing</h2>
            <p>Paid plans are billed monthly or annually through Stripe. You can cancel at any time through the Stripe Customer Portal. Upon cancellation, your plan will remain active until the end of the current billing period, then revert to the Free plan. Refunds are not provided for partial billing periods.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">8. Plan Limits</h2>
            <p>Free plan: 5 documents, 3 links per document, 1 team member, basic analytics, AI Chat (10/month). Pro plan ($39/mo): unlimited documents and links, 3 team members, AI Chat (50/month), full analytics. Business plan ($129/mo): everything in Pro, plus unlimited AI Chat, Data Rooms, custom domain, 10 team members, audit log.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">9. Service Availability</h2>
            <p>We target 99.9% uptime but do not guarantee uninterrupted service. We are not liable for downtime caused by third-party providers (Vercel, Supabase, Stripe, etc.), scheduled maintenance, or force majeure events.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">10. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages. Our total liability is limited to the amount you paid for the Service in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">11. Termination</h2>
            <p>We may terminate or suspend your account if you violate these Terms. You may delete your account at any time. Upon termination, your documents and data will be permanently deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">12. Changes to Terms</h2>
            <p>We may update these Terms at any time. Material changes will be communicated via email. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">13. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:hello@peeeky.com" className="text-[#6C5CE7] hover:underline">hello@peeeky.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
