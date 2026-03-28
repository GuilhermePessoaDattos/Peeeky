"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "For getting started.",
    features: [
      "5 documents",
      "Basic page analytics",
      "1 Data Room",
      "Email notifications",
      "Secure shareable links",
    ],
    buttonText: "Get started",
    buttonHref: "/login",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$39",
    period: "/mo",
    description: "For growing teams.",
    features: [
      "Unlimited documents",
      "Full page-level analytics & heatmaps",
      "AI Chat for recipients",
      "Smart engagement alerts",
      "Password & email verification",
      "Download control & watermarking",
      "Priority support",
    ],
    buttonText: "Start free trial",
    buttonHref: "/login",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$129",
    period: "/mo",
    description: "For serious deal flow.",
    features: [
      "Everything in Pro",
      "Unlimited Data Rooms",
      "Per-viewer permissions",
      "Full audit trails",
      "Custom domain",
      "API access",
      "Dedicated account manager",
    ],
    buttonText: "Contact us",
    buttonHref: "mailto:hello@peeeky.com",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 relative border-t border-[#e5e7eb]"
      style={{ backgroundColor: "#f9f9f9" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#0a0a0b]"
          >
            Simple, transparent pricing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#6b7280]"
          >
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative bg-white rounded-3xl p-8 border ${
                plan.highlighted
                  ? "border-[#6C5CE7] shadow-2xl md:scale-105 z-10"
                  : "border-[#e5e7eb] shadow-sm"
              }`}
              style={
                plan.highlighted
                  ? { boxShadow: "0 0 0 4px rgba(108,92,231,0.1), 0 25px 50px -12px rgba(0,0,0,0.15)" }
                  : {}
              }
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6C5CE7] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold mb-2 text-[#0a0a0b]">{plan.name}</h3>
              <p className="text-[#6b7280] text-sm mb-6">{plan.description}</p>

              <div className="mb-8 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight text-[#0a0a0b]">
                  {plan.price}
                </span>
                <span className="text-[#6b7280] ml-1 font-medium">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#6C5CE7] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-[#374151]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.buttonHref}>
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
