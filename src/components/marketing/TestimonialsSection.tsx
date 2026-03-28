"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Peeeky completely changed how we track investor engagement. We closed our Series A faster because we knew exactly who was interested.",
  },
  {
    quote: "The engagement score is a game changer. We prioritize follow-ups based on data, not guesswork. Our close rate went up 40%.",
  },
  {
    quote: "The Data Room feature with per-document permissions saved us weeks during our M&A process. The audit trail is exactly what compliance needed.",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 overflow-hidden bg-[#f9f9f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#0a0a0b]"
          >
            Loved by teams that share to win.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`bg-white border border-[#e5e7eb] rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 ${
                i === 1 ? "md:-translate-y-8" : ""
              }`}
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-lg text-[#0a0a0b] leading-relaxed font-medium">
                &ldquo;{t.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
