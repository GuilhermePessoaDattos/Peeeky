import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      memberships: {
        include: { org: { select: { name: true, plan: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    referralCode: u.referralCode,
    stripeConnectId: u.stripeConnectId,
    createdAt: u.createdAt,
    org: u.memberships[0]?.org || null,
    role: u.memberships[0]?.role || null,
  })));
}
