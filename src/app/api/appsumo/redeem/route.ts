import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/modules/auth/auth";

const TIER_TO_PLAN = {
  1: "APPSUMO_TIER1",
  2: "APPSUMO_TIER2",
  3: "APPSUMO_TIER3",
} as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "License code required" }, { status: 400 });
  }

  const license = await prisma.appSumoLicense.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!license) {
    return NextResponse.json({ error: "Invalid license code" }, { status: 404 });
  }

  if (license.redeemedAt) {
    return NextResponse.json({ error: "License already redeemed" }, { status: 409 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, role: "OWNER" },
    select: { orgId: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 });
  }

  const plan = TIER_TO_PLAN[license.tier as keyof typeof TIER_TO_PLAN];
  if (!plan) {
    return NextResponse.json({ error: "Invalid license tier" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.appSumoLicense.update({
      where: { id: license.id },
      data: { redeemedAt: new Date(), redeemedById: membership.orgId },
    }),
    prisma.organization.update({
      where: { id: membership.orgId },
      data: { plan },
    }),
  ]);

  await redis.del(`plan:${membership.orgId}`);

  return NextResponse.json({ success: true, plan, tier: license.tier });
}
