import { auth } from "@/modules/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { signOutAction } from "./actions";
import { ImpersonationBanner } from "@/components/dashboard/ImpersonationBanner";
import { SuspendedBanner } from "@/components/dashboard/SuspendedBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Check if user is blocked
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blocked: true },
  });
  if (user?.blocked) redirect("/blocked");

  // Update lastLoginAt
  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastLoginAt: new Date() },
  }).catch(() => {});

  // Check if org is suspended
  const org = await prisma.organization.findUnique({
    where: { id: session.user.orgId },
    select: { suspended: true, suspendReason: true },
  });

  // Check impersonation
  const cookieStore = await cookies();
  const impersonating = cookieStore.get("admin_impersonating")?.value;

  // Fetch user's orgs for org switcher
  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { org: { select: { id: true, name: true } } },
  });
  const orgs = memberships.map((m) => ({
    orgId: m.org.id,
    orgName: m.org.name,
    role: m.role,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FC] md:flex-row">
      <Sidebar
        userName={session.user.name || ""}
        userEmail={session.user.email || ""}
        plan={session.user.plan || "FREE"}
        currentOrgId={session.user.orgId || ""}
        orgs={orgs}
        signOutAction={signOutAction}
      />
      <div className="flex-1 flex flex-col">
        {impersonating && <ImpersonationBanner userEmail={session.user.email || ""} />}
        {org?.suspended ? (
          <SuspendedBanner reason={org.suspendReason} />
        ) : (
          <main className="flex-1 p-4 md:p-8">{children}</main>
        )}
      </div>
    </div>
  );
}
