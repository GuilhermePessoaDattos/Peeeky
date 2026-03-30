"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/gtm", label: "GTM Strategy", icon: "🚀" },
  { href: "/admin/organizations", label: "Organizations", icon: "🏢" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/revenue", label: "Revenue", icon: "💰" },
  { href: "/admin/usage", label: "Usage", icon: "📈" },
  { href: "/admin/referrals", label: "Referrals", icon: "🔗" },
  { href: "/admin/activity", label: "Activity Log", icon: "📋" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0a0a0b]">
      <aside className="w-56 border-r border-white/10 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/admin" className="text-lg font-bold text-white">
            p<span className="text-[#6C5CE7]">eee</span>ky
          </Link>
          <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest font-semibold">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href))
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span className="text-sm">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <Link href="/documents" className="text-xs text-white/30 hover:text-white/60 transition">
            &larr; Back to app
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
