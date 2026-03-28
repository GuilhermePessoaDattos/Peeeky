"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, FileText, BarChart3, Users } from "lucide-react";

const posts = [
  {
    title: "Introducing Peeeky — Track Every Page of Your Shared Documents",
    description: "Share documents securely and know exactly how they're consumed. Every link is a window into your recipient's intent.",
    date: "Mar 27, 2026",
    readTime: "4 min",
    tags: ["launch", "product"],
    href: "/blog/introducing-peeeky",
    gradient: "from-[#6C5CE7] to-[#a78bfa]",
    icon: FileText,
  },
  {
    title: "How Founders Use Peeeky to Track Investor Engagement",
    description: "Stop guessing which investors are interested. Track every page of your pitch deck and follow up at the right moment.",
    date: "Mar 26, 2026",
    readTime: "5 min",
    tags: ["fundraising", "use-case"],
    href: "/blog/investor-engagement",
    gradient: "from-emerald-500 to-teal-400",
    icon: BarChart3,
  },
  {
    title: "Sales Teams: Know Exactly When to Follow Up",
    description: "Use document analytics to time your follow-ups perfectly and close deals faster.",
    date: "Mar 25, 2026",
    readTime: "3 min",
    tags: ["sales", "use-case"],
    href: "/blog/sales-follow-up",
    gradient: "from-orange-500 to-amber-400",
    icon: Users,
  },
];

const tagColors: Record<string, string> = {
  launch: "bg-[#6C5CE7]/10 text-[#6C5CE7]",
  product: "bg-[#a78bfa]/10 text-[#7c3aed]",
  fundraising: "bg-emerald-50 text-emerald-700",
  "use-case": "bg-amber-50 text-amber-700",
  sales: "bg-orange-50 text-orange-700",
};

export function BlogSection() {
  return (
    <section id="blog" className="py-24 bg-secondary/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">From the blog</h2>
            <p className="text-muted-foreground">Insights on document intelligence, sales, and fundraising.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link href="/blog" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              All posts <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={post.href}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                  <post.icon className="w-16 h-16 text-white/30 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${tagColors[tag] ?? "bg-secondary text-muted-foreground"}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-foreground text-base leading-snug mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">{post.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime} read
                    </div>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            View all posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
