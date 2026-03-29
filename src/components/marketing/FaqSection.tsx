"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How is Peeeky different from DocSend?",
    a: "Peeeky is built for modern teams who want more than just analytics. We add AI Chat — so your recipients can ask questions about the document, and you see every question they ask. We're also significantly more affordable, with a free tier that lets you start immediately without a credit card.",
  },
  {
    q: "Can recipients download my documents?",
    a: "That's entirely up to you. When creating a link, you can toggle download permission on or off. You can also restrict downloads to verified viewers only. When downloads are disabled, recipients view the document in our secure in-browser viewer without any way to save or print.",
  },
  {
    q: "How does the AI chat work?",
    a: "When you enable AI Chat on a link, Peeeky indexes your document's content. Recipients can then ask questions in plain language and get accurate, grounded answers pulled directly from the document — not hallucinated. You can see the full conversation log in your analytics dashboard.",
  },
  {
    q: "What file formats do you support?",
    a: "Currently we support PDF and PPTX (PowerPoint). PPTX files are automatically converted to PDF on upload. We're adding DOCX, Excel, and Google Slides support in Q2 2026.",
  },
  {
    q: "How secure are my documents?",
    a: "Your documents are encrypted at rest and in transit. We use AWS S3 with server-side encryption and signed URLs that expire in minutes. You can add additional layers: password protection, email verification, expiration dates, and view limits per link.",
  },
  {
    q: "Can I use Peeeky for a whole team?",
    a: "Yes. The Business plan ($129/mo) supports multiple team members, shared document libraries, team-level analytics, and a centralized dashboard. Each member can manage their own documents and links while admins see aggregate team performance.",
  },
  {
    q: "Is there a free plan?",
    a: "Absolutely. The Free plan includes 5 documents, AI Chat (10/month), eSignature, basic analytics, and password protection — forever, no credit card required.",
  },
  {
    q: "Does Peeeky support eSignature?",
    a: "Yes. Send documents for electronic signature with visual field placement, multiple signers, and One-Click NDA. Signatures are burned into the final PDF with a cryptographic audit trail. Save field layouts as templates for reuse.",
  },
  {
    q: "Can I organize documents in Data Rooms?",
    a: "Yes. Data Rooms support folders for organizing documents. Set per-viewer permissions so each party sees only what they should. Full analytics per party and document — built for M&A and due diligence.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/60 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-5 text-left gap-4 group">
        <span className="font-semibold text-foreground text-base group-hover:text-accent transition-colors">{q}</span>
        <div className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center shrink-0 group-hover:border-accent group-hover:text-accent transition-colors">
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Everything you need to know. Can&apos;t find the answer?{" "}
            <a href="mailto:hello@peeeky.com" className="text-accent hover:underline">Email us.</a>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden px-6 md:px-8"
        >
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
