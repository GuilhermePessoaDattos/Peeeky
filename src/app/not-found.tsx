import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9f9] px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-[#e5e7eb] mb-4">404</p>
        <h1 className="text-2xl font-bold text-[#0a0a0b] mb-2">Page not found</h1>
        <p className="text-[#6b7280] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5a4bd4] transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
