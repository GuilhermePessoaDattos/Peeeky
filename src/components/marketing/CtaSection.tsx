"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#0a0a0b]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(108,92,231,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Share, track, sign —{" "}
            <span className="text-[#a78bfa]">all in one place.</span>
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Analytics, AI Chat, eSignature, and Data Rooms. Everything teams need
            to share documents with confidence and close faster.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-3 text-white text-lg font-medium">
              <span className="text-2xl">🎉</span> You&apos;re on the list — we&apos;ll be in touch soon!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 h-14 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] backdrop-blur-md transition-all"
              />
              <Button type="submit" size="lg" className="h-14 px-8 rounded-full">
                Get started free
              </Button>
            </form>
          )}
          <p className="text-sm text-white/40 mt-4">
            Free plan available. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
