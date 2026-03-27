import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { getOrCreateReferralCode, getReferralStats } from "@/modules/referrals";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = await getOrCreateReferralCode(session.user.id);
  const stats = await getReferralStats(session.user.id);

  return NextResponse.json({ code, ...stats });
}
