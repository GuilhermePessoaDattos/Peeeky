import Link from "next/link";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="font-display text-xl font-bold text-[#1A1A2E]">
            p<span className="text-[#6C5CE7]">eee</span>ky
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-[#1A1A2E]">Features</Link>
            <Link href="/#pricing" className="text-sm text-gray-600 hover:text-[#1A1A2E]">Pricing</Link>
            <Link href="/login" className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      {children}

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-[#F8F9FC] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <Link href="/" className="font-display text-lg font-bold text-[#1A1A2E]">
                p<span className="text-[#6C5CE7]">eee</span>ky
              </Link>
              <p className="mt-2 text-sm text-gray-500">Secure document sharing with page-level analytics.</p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Product</h4>
              <div className="space-y-2">
                <Link href="/#features" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">Features</Link>
                <Link href="/#pricing" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Compare</h4>
              <div className="space-y-2">
                <Link href="/vs/docsend" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">vs DocSend</Link>
                <Link href="/vs/google-drive" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">vs Google Drive</Link>
                <Link href="/vs/wetransfer" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">vs WeTransfer</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Use Cases</h4>
              <div className="space-y-2">
                <Link href="/for/fundraising" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">Fundraising</Link>
                <Link href="/for/sales" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">Sales</Link>
                <Link href="/for/mna" className="block text-sm text-gray-600 hover:text-[#6C5CE7]">M&A</Link>
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-gray-400">&copy; 2026 Peeeky. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
