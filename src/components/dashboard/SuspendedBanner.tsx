export function SuspendedBanner({ reason }: { reason: string | null }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">&#128683;</div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">Account Suspended</h1>
        <p className="text-gray-500 mb-4">
          Your organization has been suspended.
          {reason && <> Reason: <strong>{reason}</strong></>}
        </p>
        <p className="text-sm text-gray-400">
          Contact <a href="mailto:hello@peeeky.com" className="text-[#6C5CE7] hover:underline">hello@peeeky.com</a> for assistance.
        </p>
      </div>
    </div>
  );
}
