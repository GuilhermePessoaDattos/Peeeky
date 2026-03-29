"use client";

export function ImpersonationBanner({ userEmail }: { userEmail: string }) {
  const stopImpersonating = async () => {
    await fetch("/api/admin/impersonate", { method: "DELETE" });
    window.location.href = "/admin/users";
  };

  return (
    <div className="bg-amber-400 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">&#9888;&#65039;</span>
        <span className="text-sm font-semibold text-amber-900">
          Impersonating: {userEmail}
        </span>
      </div>
      <button
        onClick={stopImpersonating}
        className="rounded-lg bg-amber-900 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-800"
      >
        Stop Impersonating
      </button>
    </div>
  );
}
