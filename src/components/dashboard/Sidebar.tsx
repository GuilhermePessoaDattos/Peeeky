"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface OrgItem {
  orgId: string;
  orgName: string;
  role: string;
}

interface SidebarProps {
  userName: string;
  userEmail: string;
  plan: string;
  currentOrgId?: string;
  orgs?: OrgItem[];
  signOutAction: () => Promise<void>;
}

const navLinks = [
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/datarooms",
    label: "Data Rooms",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    href: "/esignature",
    label: "eSignature",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    href: "/settings/team",
    label: "Team",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function Sidebar({ userName, userEmail, plan, currentOrgId, orgs, signOutAction }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/settings") return pathname === "/settings";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5 text-[#1A1A2E]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/documents" className="font-display text-lg font-bold text-[#1A1A2E]">
          p<span className="text-[#6C5CE7]">eee</span>ky
        </Link>
        <div className="w-9" />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-200
          md:relative md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/documents"
            className="font-display text-xl font-bold text-[#1A1A2E]"
            onClick={() => setOpen(false)}
          >
            p<span className="text-[#6C5CE7]">eee</span>ky
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 md:hidden"
            aria-label="Close menu"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? "bg-[#6C5CE7]/5 text-[#6C5CE7]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4">
          {/* Org Switcher */}
          {orgs && orgs.length > 1 && (
            <div className="mb-3 relative">
              <button
                onClick={() => setShowOrgSwitcher(!showOrgSwitcher)}
                className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-xs hover:bg-gray-50 transition"
              >
                <span className="truncate font-medium text-[#1A1A2E]">
                  {orgs.find(o => o.orgId === currentOrgId)?.orgName || "Workspace"}
                </span>
                <svg className={`h-3 w-3 text-gray-400 transition-transform ${showOrgSwitcher ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showOrgSwitcher && (
                <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
                  {orgs.map((org) => (
                    <button
                      key={org.orgId}
                      onClick={async () => {
                        await fetch("/api/auth/switch-org", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orgId: org.orgId }),
                        });
                        setShowOrgSwitcher(false);
                        router.refresh();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 transition ${
                        org.orgId === currentOrgId ? "bg-[#6C5CE7]/5 text-[#6C5CE7]" : "text-gray-700"
                      }`}
                    >
                      <span className="truncate font-medium">{org.orgName}</span>
                      <span className="text-[10px] text-gray-400">{org.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="mb-3 text-sm">
            <p className="truncate font-medium text-[#1A1A2E]">
              {userName || userEmail}
            </p>
            <p className="text-xs text-gray-500">{plan} plan</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-gray-500 hover:text-[#1A1A2E]"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
