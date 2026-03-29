"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FileText, MessageSquare, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import Link from "next/link";

const stats = [
  { value: "10,000+", label: "Documents tracked" },
  { value: "50,000+", label: "Page views analyzed" },
  { value: "98%", label: "Uptime SLA" },
];

const pdfPages = [
  { label: "Executive Summary" },
  { label: "Market Opportunity" },
  { label: "Product Overview" },
  { label: "Financial Projections" },
  { label: "Team" },
];

const chatMessages = [
  {
    role: "user",
    text: "What's the market size mentioned in this deck?",
    delay: 0,
  },
  {
    role: "ai",
    text: "According to **page 2**, the TAM is **$4.2B**, with a projected CAGR of 23% through 2028.",
    delay: 1800,
  },
  {
    role: "user",
    text: "What are the main revenue streams?",
    delay: 4000,
  },
  {
    role: "ai",
    text: "The deck outlines **3 revenue streams**: SaaS subscriptions (72%), API licensing (18%), and Data Room fees (10%).",
    delay: 5800,
  },
];

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#6b7280]/50"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function ChatBubble({
  msg,
  isVisible,
}: {
  msg: (typeof chatMessages)[0];
  isVisible: boolean;
}) {
  const isUser = msg.role === "user";

  const formatText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="font-bold text-[#6C5CE7]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
        >
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-[#6C5CE7]/20 border border-[#6C5CE7]/30 flex items-center justify-center mr-2 shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-[#6C5CE7]" />
            </div>
          )}
          <div
            className={`max-w-[85%] text-xs leading-relaxed px-3 py-2.5 rounded-2xl ${
              isUser
                ? "bg-[#0a0a0b] text-white rounded-br-sm"
                : "bg-[#f3f4f6] text-[#0a0a0b] rounded-bl-sm border border-[#e5e7eb]/60"
            }`}
          >
            {formatText(msg.text)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function HeroSection() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const runCycle = () => {
      setVisibleMessages([]);
      setShowTyping(false);
      setActivePage(1);

      chatMessages.forEach((msg, i) => {
        if (msg.role === "ai") {
          const typingStart = setTimeout(() => setShowTyping(true), msg.delay - 600);
          const showMsg = setTimeout(() => {
            setShowTyping(false);
            setVisibleMessages((prev) => [...prev, i]);
            if (i === 1) setActivePage(1);
            if (i === 3) setActivePage(3);
          }, msg.delay);
          timeouts.push(typingStart, showMsg);
        } else {
          const showUser = setTimeout(() => {
            setVisibleMessages((prev) => [...prev, i]);
          }, msg.delay);
          timeouts.push(showUser);
        }
      });

      const restart = setTimeout(() => {
        setCycleKey((k) => k + 1);
      }, 9000);
      timeouts.push(restart);
    };

    runCycle();
    return () => timeouts.forEach(clearTimeout);
  }, [cycleKey]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden flex items-center min-h-[90vh]">
      <div
        className="absolute top-0 left-1/3 rounded-full pointer-events-none"
        style={{
          width: 700,
          height: 500,
          background: "radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)",
          filter: "blur(130px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3f4f6] text-sm font-medium mb-6 border border-[#e5e7eb] shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#6C5CE7] animate-pulse" />
              Document intelligence, reimagined
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-[#0a0a0b] mb-6"
            >
              Share documents.{" "}
              <span className="text-[#6C5CE7]">Let AI decode the interest.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-[#6b7280] leading-relaxed mb-8 max-w-lg"
            >
              Track every page, see engagement in real time, and let recipients chat with your content using AI. Built for teams that share to win.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto gap-1.5">
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See how it works
                </Button>
              </a>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-12 grid grid-cols-3 gap-6"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-[#0a0a0b]">
                    {stat.value}
                  </span>
                  <span className="text-sm text-[#6b7280] mt-1">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[480px] mx-auto">
              <div className="rounded-3xl border border-[#e5e7eb] bg-white shadow-2xl shadow-black/8 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e5e7eb]/60 bg-white">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3f4f6] text-xs text-[#6b7280] border border-[#e5e7eb]/60">
                      <FileText className="w-3 h-3" />
                      Series_A_Pitch_Deck.pdf
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </div>
                </div>

                <div
                  className="flex divide-x divide-[#e5e7eb]/60"
                  style={{ height: 380 }}
                >
                  <div className="w-[140px] shrink-0 bg-[#f3f4f6]/40 flex flex-col overflow-hidden">
                    <div className="px-3 pt-3 pb-2 text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider">
                      Pages
                    </div>
                    <div className="flex-1 overflow-hidden px-2 space-y-1.5 pb-3">
                      {pdfPages.map((page, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            backgroundColor: "transparent",
                            borderColor: "transparent",
                          }}
                          animate={{
                            backgroundColor:
                              i === activePage
                                ? "rgba(108,92,231,0.08)"
                                : "transparent",
                            borderColor:
                              i === activePage
                                ? "rgba(108,92,231,0.25)"
                                : "transparent",
                          }}
                          transition={{ duration: 0.4 }}
                          className="rounded-lg border px-2.5 py-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center text-[8px] font-bold ${
                                i === activePage
                                  ? "bg-[#6C5CE7] text-white"
                                  : "bg-[#e5e7eb] text-[#6b7280]"
                              }`}
                            >
                              {i + 1}
                            </div>
                            <span
                              className={`text-[10px] leading-tight font-medium ${
                                i === activePage
                                  ? "text-[#6C5CE7]"
                                  : "text-[#6b7280]"
                              }`}
                            >
                              {page.label}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 pl-5">
                            {[80, 60, 90, 40].map((w, li) => (
                              <div
                                key={li}
                                className="h-[3px] rounded-full bg-[#e5e7eb]"
                                style={{ width: `${w}%` }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#e5e7eb]/60 bg-white">
                      <div className="w-7 h-7 rounded-full bg-[#6C5CE7]/10 border border-[#6C5CE7]/25 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0a0a0b]">
                          AI Assistant
                        </div>
                        <div className="text-[10px] text-[#6b7280]">
                          Ask anything about this document
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden px-4 py-3 flex flex-col justify-end">
                      <div className="space-y-0">
                        {chatMessages.map((msg, i) => (
                          <ChatBubble
                            key={`${cycleKey}-${i}`}
                            msg={msg}
                            isVisible={visibleMessages.includes(i)}
                          />
                        ))}
                        {showTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mb-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#6C5CE7]/15 border border-[#6C5CE7]/25 flex items-center justify-center shrink-0">
                              <Sparkles className="w-3 h-3 text-[#6C5CE7]" />
                            </div>
                            <div className="bg-[#f3f4f6] rounded-2xl rounded-bl-sm border border-[#e5e7eb]/60">
                              <TypingDots />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 bg-[#f3f4f6] rounded-xl border border-[#e5e7eb] px-3 py-2.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#6b7280] shrink-0" />
                        <span className="text-xs text-[#6b7280] flex-1">
                          Ask about this document…
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-[#6C5CE7] flex items-center justify-center shrink-0 shadow-sm">
                          <ChevronRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10, x: 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -right-4 -top-5 bg-white border border-[#e5e7eb] shadow-xl p-3.5 rounded-2xl max-w-[190px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🔔</span>
                  <span className="text-xs font-bold text-[#0a0a0b]">New viewer</span>
                </div>
                <p className="text-[11px] text-[#6b7280] leading-snug">
                  Maria spent{" "}
                  <span className="font-semibold text-[#6C5CE7]">4m 32s</span> on
                  page 2 — high interest
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                className="absolute -left-4 -bottom-4 bg-white border border-[#e5e7eb] shadow-xl px-4 py-3 rounded-2xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                  <span className="text-base">✅</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0a0a0b]">
                    Engagement score
                  </div>
                  <div className="text-[11px] text-[#6b7280]">
                    87% —{" "}
                    <span className="font-semibold text-green-600">
                      Ready to follow up
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
