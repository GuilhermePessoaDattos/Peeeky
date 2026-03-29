import { auth } from "@/modules/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { signOutAction } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
