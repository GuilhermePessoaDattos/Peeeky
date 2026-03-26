import { auth } from "@/modules/auth/auth";
import { redirect } from "next/navigation";

export async function getTenantContext() {
  const session = await auth();

  if (!session?.user?.orgId) {
    redirect("/login");
  }

  return {
    userId: session.user.id,
    orgId: session.user.orgId,
    role: session.user.role,
    plan: session.user.plan,
  };
}
