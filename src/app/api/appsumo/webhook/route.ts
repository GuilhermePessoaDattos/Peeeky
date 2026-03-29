import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-appsumo-signature");

  const expected = crypto
    .createHmac("sha256", process.env.APPSUMO_WEBHOOK_SECRET || "")
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const { action, plan_id, uuid } = payload;

  if (action === "activate") {
    const tier = getTierFromPlanId(plan_id);
    const code = generateLicenseCode();
    await prisma.appSumoLicense.create({ data: { code, tier } });

    return NextResponse.json({
      message: "License activated",
      redirect_url: `https://peeeky.com/redeem?code=${code}`,
      license_key: code,
    });
  }

  if (action === "refund") {
    const license = await prisma.appSumoLicense.findFirst({
      where: { code: uuid },
      include: { redeemedBy: true },
    });

    if (license?.redeemedById) {
      await prisma.organization.update({
        where: { id: license.redeemedById },
        data: { plan: "FREE" },
      });
    }

    return NextResponse.json({ message: "License refunded" });
  }

  return NextResponse.json({ message: "OK" });
}

function getTierFromPlanId(planId: string): number {
  const mapping: Record<string, number> = {
    [process.env.APPSUMO_TIER1_PLAN_ID || "tier1"]: 1,
    [process.env.APPSUMO_TIER2_PLAN_ID || "tier2"]: 2,
    [process.env.APPSUMO_TIER3_PLAN_ID || "tier3"]: 3,
  };
  return mapping[planId] || 1;
}

function generateLicenseCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}
