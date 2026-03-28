"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Blog", href: "/#blog" },
  { name: "FAQ", href: "/#faq" },
];

function PeeekyLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M11 1C7 1 3 4.5 1 8C3 11.5 7 15 11 15C15 15 19 11.5 21 8C19 4.5 15 1 11 1Z" stroke="#6C5CE7" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <circle cx="11" cy="8" r="3" fill="#6C5CE7" />
        <circle cx="12" cy="7" r="1" fill="white" opacity="0.6" />
      </svg>
      <span style={{ fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)", fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em", color: "#0a0a0a" }}>
        P<span style={{ color: "#6C5CE7" }}>eee</span>ky
      </span>
    </div>
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
              <div className="flex items-center gap-6 bg-white/70 backdrop-blur-md px-6 py-2 rounded-full border border-[#e5e7eb]">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-[#6b7280] hover:text-[#0a0a0b] transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
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
            <div className="flex flex-col gap-6 text-center text-lg font-medium">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-[#374151] hover:text-[#0a0a0b]"
                >
                  {link.name}
                </a>
              ))}
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
