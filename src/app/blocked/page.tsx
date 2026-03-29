import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9] px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">&#128683;</div>
        <h1 className="text-2xl font-bold text-[#0a0a0b] mb-2">Account Blocked</h1>
        <p className="text-[#6b7280] mb-6">
          Your account has been blocked. If you believe this is an error, please contact support.
        </p>
        <a href="mailto:hello@peeeky.com" className="inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5a4bd4]">
          Contact Support
        </a>
      </div>
    </div>
  );
}
