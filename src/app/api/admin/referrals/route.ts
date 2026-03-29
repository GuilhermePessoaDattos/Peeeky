import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const referrals = await prisma.referral.findMany({
    include: {
      referrer: { select: { email: true, name: true } },
      referredOrg: { select: { name: true, plan: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = referrals.length;
  const active = referrals.filter((r) => r.status === "ACTIVE").length;
  const paid = referrals.filter((r) => r.status === "PAID").length;
  const totalCommission = referrals
    .filter((r) => r.status === "ACTIVE" || r.status === "PAID")
    .reduce((sum, r) => {
      const planPrice = r.referredOrg.plan === "BUSINESS" ? 129 : r.referredOrg.plan === "PRO" ? 39 : 0;
      return sum + planPrice * r.commission;
    }, 0);

  return NextResponse.json({ referrals, total, active, paid, totalCommission: Math.round(totalCommission * 100) / 100 });
}
