"use client";

import { motion } from "framer-motion";
import { Upload, Eye, Bell } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload & share",
    description:
      "Upload your PDF, pitch deck, or proposal. Get a secure, trackable link in seconds — no downloads required for your recipients.",
  },
  {
    icon: Eye,
    title: "Track engagement",
    description:
      "See in real time who opened your document, which pages they read, how long they spent, and where they dropped off.",
  },
  {
    icon: Bell,
    title: "Act at the right moment",
    description:
      "Receive instant notifications with AI-powered follow-up suggestions. Reach out exactly when interest is highest — and close faster.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 relative"
      style={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#0a0a0b]"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#6b7280]"
          >
            Three simple steps to stop guessing and start closing.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-[#e5e7eb] z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full bg-white border-4 border-[#f9f9f9] shadow-xl flex items-center justify-center mb-8 relative group-hover:scale-105 transition-transform duration-300">
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)",
                      transform: "scale(1.5)",
                    }}
                  />
                  <step.icon className="w-8 h-8 text-[#6C5CE7]" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0a0a0b] text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0a0a0b]">
                  {step.title}
                </h3>
                <p className="text-[#6b7280] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
