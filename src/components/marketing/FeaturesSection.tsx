"use client";

import { motion } from "framer-motion";
import { BarChart3, Sparkles, Zap, Lock, FolderOpen } from "lucide-react";

function AnalyticsIllustration() {
  const pages = [
    { label: "p1", pct: 42, time: "0m 55s" },
    { label: "p2", pct: 100, time: "4m 32s", active: true },
    { label: "p3", pct: 68, time: "1m 48s" },
    { label: "p4", pct: 30, time: "0m 41s" },
    { label: "p5", pct: 55, time: "1m 12s" },
  ];
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-8 px-8 pointer-events-none">
      <div className="w-full max-w-md">
        <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
          Time spent per page
        </div>
        <div className="flex items-end gap-3 h-28">
          {pages.map((p, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-semibold" style={{ color: p.active ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))" }}>
                {p.time}
              </span>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${p.pct * 0.72}px`,
                  background: p.active
                    ? "linear-gradient(to top, hsl(var(--accent)), hsl(var(--accent)/0.6))"
                    : "hsl(var(--border))",
                }}
              />
              <span className="text-[9px] font-bold" style={{ color: p.active ? "hsl(var(--accent))" : "hsl(var(--muted-foreground)/0.6)" }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-accent/8 border border-accent/15">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-medium text-accent">
            Page 2 — highest engagement · viewer spent 4m 32s
          </span>
        </div>
      </div>
    </div>
  );
}

function AIChatIllustration() {
  return (
    <div className="absolute inset-0 flex flex-col justify-start pt-6 px-5 gap-2 pointer-events-none overflow-hidden">
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-foreground text-background text-[10px] px-3 py-2 rounded-2xl rounded-br-sm leading-relaxed">
          What&apos;s the projected revenue for year 2?
        </div>
      </div>
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-2.5 h-2.5 text-accent" />
        </div>
        <div className="max-w-[80%] bg-secondary text-foreground text-[10px] px-3 py-2 rounded-2xl rounded-bl-sm border border-border/50 leading-relaxed">
          On <span className="font-bold text-accent">page 4</span>, projected Year 2 revenue is{" "}
          <span className="font-bold text-accent">$2.4M</span>, assuming 180% net revenue retention.
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-foreground text-background text-[10px] px-3 py-2 rounded-2xl rounded-br-sm leading-relaxed">
          What&apos;s the burn rate?
        </div>
      </div>
      <div className="flex items-center gap-1.5 pl-7 mt-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function AlertsIllustration() {
  const alerts = [
    { emoji: "🔔", title: "Maria opened your deck", sub: "Just now · 3m 20s read", color: "border-accent/20 bg-accent/5" },
    { emoji: "🔥", title: "High engagement detected", sub: "Page 3 — spent 2m 18s", color: "border-orange-400/20 bg-orange-50 dark:bg-orange-900/10" },
    { emoji: "↩️", title: "Return visit", sub: "John opened it again · 2nd time", color: "border-border/60 bg-secondary/50" },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-start pt-6 px-4 gap-2 pointer-events-none">
      {alerts.map((a, i) => (
        <div key={i} className={`rounded-xl border px-3 py-2.5 ${a.color}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm">{a.emoji}</span>
            <span className="text-[10px] font-bold text-foreground">{a.title}</span>
          </div>
          <span className="text-[9px] text-muted-foreground pl-6">{a.sub}</span>
        </div>
      ))}
    </div>
  );
}

function AccessIllustration() {
  const controls = [
    { label: "Password protection", on: true },
    { label: "Email verification", on: true },
    { label: "Expiration date", on: false },
    { label: "Allow downloads", on: false },
    { label: "Watermarking", on: true },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-start pt-6 px-4 gap-1.5 pointer-events-none">
      {controls.map((c, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/60 border border-border/40">
          <span className="text-[10px] font-medium text-foreground/80">{c.label}</span>
          <div className="w-7 h-4 rounded-full flex items-center px-0.5" style={{ background: c.on ? "hsl(var(--accent))" : "hsl(var(--border))" }}>
            <div className="w-3 h-3 rounded-full bg-white shadow-sm" style={{ transform: c.on ? "translateX(12px)" : "translateX(0)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DataRoomIllustration() {
  const docs = [
    { name: "NDA.pdf", viewers: 2 },
    { name: "Pitch Deck.pdf", viewers: 5 },
    { name: "Term Sheet.pdf", viewers: 1 },
    { name: "Financials.xlsx", viewers: 3 },
    { name: "Cap Table.pdf", viewers: 2 },
    { name: "IP Report.pdf", viewers: 0 },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-start pt-6 px-6 pointer-events-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent/15 border border-accent/20 flex items-center justify-center">
            <FolderOpen className="w-3 h-3 text-accent" />
          </div>
          <span className="text-[10px] font-bold text-foreground">Series A — Due Diligence</span>
        </div>
        <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">6 docs · 8 viewers</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {docs.map((doc, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-white dark:bg-card p-2.5 shadow-sm">
            <div className="w-full h-10 rounded-lg bg-gradient-to-br from-secondary to-border/30 mb-2 flex items-center justify-center">
              <div className="space-y-1 w-full px-2">
                {[100, 70, 85].map((w, li) => (
                  <div key={li} className="h-[2px] rounded-full bg-border/80" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div className="text-[8px] font-semibold text-foreground truncate">{doc.name}</div>
            <div className="text-[8px] text-muted-foreground">
              {doc.viewers > 0 ? `${doc.viewers} viewer${doc.viewers > 1 ? "s" : ""}` : "Not viewed"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    title: "Page-level analytics",
    description: "See exactly which pages each viewer reads, how long they spend, and where they drop off. Heatmaps reveal engagement intensity across every page.",
    icon: BarChart3,
    span: "md:col-span-2",
    accent: "#6C5CE7",
    Illustration: AnalyticsIllustration,
  },
  {
    title: "AI Chat",
    description: "Recipients ask questions and get instant answers from your document. You see every question — revealing exactly what they care about.",
    icon: Sparkles,
    span: "md:col-span-1",
    accent: "#a78bfa",
    Illustration: AIChatIllustration,
  },
  {
    title: "Smart alerts",
    description: "Get notified the moment someone views your document. High-engagement alerts include AI-suggested follow-up actions.",
    icon: Zap,
    span: "md:col-span-1",
    accent: "#f59e0b",
    Illustration: AlertsIllustration,
  },
  {
    title: "Access controls",
    description: "Password protection, email verification, expiration dates, download control, and watermarking per viewer. Your documents, your rules.",
    icon: Lock,
    span: "md:col-span-1",
    accent: "#10b981",
    Illustration: AccessIllustration,
  },
  {
    title: "Data Rooms",
    description: "Bundle documents into a single secure link with per-viewer permissions. Built for M&A, fundraising, and due diligence processes.",
    icon: FolderOpen,
    span: "md:col-span-2",
    accent: "#6C5CE7",
    Illustration: DataRoomIllustration,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Everything you need to{" "}
            <br className="hidden md:block" />share with confidence.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Page-level analytics, AI chat, and smart follow-ups — in one elegant viewer.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${feature.span}`}
              style={{ minHeight: 320 }}
            >
              <feature.Illustration />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent z-10" />
              <div className="relative z-20 p-7 pt-0 h-full flex flex-col justify-end" style={{ minHeight: 320 }}>
                <div
                  className="w-11 h-11 rounded-2xl bg-white dark:bg-black/40 border border-border/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform"
                  style={{ boxShadow: `0 4px 14px ${feature.accent}25` }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: feature.accent }} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-1.5 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
