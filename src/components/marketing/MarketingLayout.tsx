"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

const compareLinks = [
  { name: "vs DocSend", href: "/vs/docsend" },
  { name: "vs Google Drive", href: "/vs/google-drive" },
  { name: "vs WeTransfer", href: "/vs/wetransfer" },
];

const useCaseLinks = [
  { name: "Fundraising", href: "/for/fundraising" },
  { name: "Sales Teams", href: "/for/sales" },
  { name: "M&A", href: "/for/mna" },
];

function PeeekyLogo() {
  return (
    <span style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.03em", color: "#0a0a0a" }}>
      p<span style={{ color: "#6C5CE7" }}>eee</span>ky
    </span>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          borderBottom: isScrolled ? "1px solid rgba(229,231,235,0.8)" : "1px solid transparent",
          background: isScrolled
            ? "rgba(249,249,249,0.85)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "none",
          padding: isScrolled ? "0.75rem 0" : "1.25rem 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/"><PeeekyLogo /></Link>

            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-[#e5e7eb]">
                <a href="/#features" className="text-sm font-medium text-[#6b7280] hover:text-[#0a0a0b] transition-colors px-3 py-1">
                  Features
                </a>

                {/* Compare dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium text-[#6b7280] hover:text-[#0a0a0b] transition-colors px-3 py-1">
                    Compare <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl p-2 min-w-[180px]">
                      {compareLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="block px-4 py-2.5 text-sm text-[#6b7280] hover:text-[#0a0a0b] hover:bg-[#f3f4f6] rounded-xl transition-colors">
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Use Cases dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium text-[#6b7280] hover:text-[#0a0a0b] transition-colors px-3 py-1">
                    Use Cases <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl p-2 min-w-[180px]">
                      {useCaseLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="block px-4 py-2.5 text-sm text-[#6b7280] hover:text-[#0a0a0b] hover:bg-[#f3f4f6] rounded-xl transition-colors">
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <a href="/#pricing" className="text-sm font-medium text-[#6b7280] hover:text-[#0a0a0b] transition-colors px-3 py-1">
                  Pricing
                </a>
                <a href="/blog" className="text-sm font-medium text-[#6b7280] hover:text-[#0a0a0b] transition-colors px-3 py-1">
                  Blog
                </a>
                <a href="/#faq" className="text-sm font-medium text-[#6b7280] hover:text-[#0a0a0b] transition-colors px-3 py-1">
                  FAQ
                </a>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                Sign In
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 -mr-2 text-[#0a0a0b]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 pt-24 pb-8 px-4 flex flex-col md:hidden"
            style={{
              background: "rgba(249,249,249,0.97)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex flex-col gap-4 text-center text-lg font-medium">
              <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-[#374151]">Features</a>

              <div>
                <p className="py-2 text-[#374151] font-semibold">Compare</p>
                <div className="flex flex-col gap-1 mt-1">
                  {compareLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 text-base text-[#6b7280]">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="py-2 text-[#374151] font-semibold">Use Cases</p>
                <div className="flex flex-col gap-1 mt-1">
                  {useCaseLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 text-base text-[#6b7280]">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <a href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-[#374151]">Pricing</a>
              <a href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-[#374151]">Blog</a>
              <a href="/#faq" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-[#374151]">FAQ</a>

              <hr className="border-[#e5e7eb]" />
              <Link
                href="/login"
                className="py-2 text-[#374151]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full mt-2">Get Started for Free</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <Link href="/" className="mb-4 inline-block"><PeeekyLogo /></Link>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              Secure document sharing with page-level analytics and AI intelligence.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              Product
            </h4>
            <div className="space-y-3">
              <Link
                href="/#features"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/#how-it-works"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                How it works
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              Compare
            </h4>
            <div className="space-y-3">
              <Link
                href="/vs/docsend"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                vs DocSend
              </Link>
              <Link
                href="/vs/google-drive"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                vs Google Drive
              </Link>
              <Link
                href="/vs/wetransfer"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                vs WeTransfer
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              Use Cases
            </h4>
            <div className="space-y-3">
              <Link
                href="/for/fundraising"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                Fundraising
              </Link>
              <Link
                href="/for/sales"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                Sales
              </Link>
              <Link
                href="/for/mna"
                className="block text-sm text-[#6b7280] hover:text-[#6C5CE7] transition-colors"
              >
                M&amp;A
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#f3f4f6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9ca3af]">&copy; 2026 Peeeky. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-[#9ca3af] hover:text-[#6b7280] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[#9ca3af] hover:text-[#6b7280] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
