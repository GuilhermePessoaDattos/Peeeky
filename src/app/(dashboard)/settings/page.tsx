import Link from "next/link";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-[#1A1A2E]">Settings</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/settings/billing" className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <h2 className="font-display text-lg font-semibold text-[#1A1A2E]">Billing</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your plan and subscription.</p>
        </Link>
        <Link href="/settings/team" className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <h2 className="font-display text-lg font-semibold text-[#1A1A2E]">Team</h2>
          <p className="mt-1 text-sm text-gray-500">Invite members and manage roles.</p>
        </Link>
        <Link href="/settings/audit" className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <h2 className="font-display text-lg font-semibold text-[#1A1A2E]">Audit Log</h2>
          <p className="mt-1 text-sm text-gray-500">View recent activity and changes.</p>
        </Link>
        <Link href="/settings/notifications" className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <h2 className="font-display text-lg font-semibold text-[#1A1A2E]">Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">Configure Slack and email notifications.</p>
        </Link>
        <Link href="/settings/referrals" className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <h2 className="font-display text-lg font-semibold text-[#1A1A2E]">Referrals</h2>
          <p className="mt-1 text-sm text-gray-500">Earn 20% commission by referring customers.</p>
        </Link>
      </div>
    </div>
  );
}
