import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Request payout for active referrals
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeConnectId: true },
  });

  if (!user?.stripeConnectId) {
    return NextResponse.json({ error: "Connect Stripe account first" }, { status: 400 });
  }

  // Check account is ready
  const account = await stripe.accounts.retrieve(user.stripeConnectId);
  if (!account.payouts_enabled) {
    return NextResponse.json({ error: "Complete Stripe onboarding first" }, { status: 400 });
  }

  // Get active referrals that haven't been paid
  const referrals = await prisma.referral.findMany({
    where: {
      referrerId: session.user.id,
      status: "ACTIVE",
    },
    include: {
      referredOrg: { select: { plan: true } },
    },
  });

  if (referrals.length === 0) {
    return NextResponse.json({ error: "No active referrals to pay out" }, { status: 400 });
  }

  // Calculate payout: 20% of $39/mo per active Pro referral, 20% of $129/mo per Business
  let totalCents = 0;
  for (const ref of referrals) {
    if (ref.referredOrg.plan === "PRO") totalCents += Math.round(3900 * 0.2); // $7.80
    if (ref.referredOrg.plan === "BUSINESS") totalCents += Math.round(12900 * 0.2); // $25.80
  }

  if (totalCents === 0) {
    return NextResponse.json({ error: "No payable amount" }, { status: 400 });
  }

  try {
    // Transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: totalCents,
      currency: "usd",
      destination: user.stripeConnectId,
      description: `Peeeky referral payout — ${referrals.length} active referral(s)`,
    });

    // Mark referrals as paid
    await prisma.referral.updateMany({
      where: {
        referrerId: session.user.id,
        status: "ACTIVE",
      },
      data: { status: "PAID" },
    });

    return NextResponse.json({
      success: true,
      amount: totalCents / 100,
      transferId: transfer.id,
      referralsPaid: referrals.length,
    });
  } catch (error: any) {
    console.error("Payout error:", error);
    return NextResponse.json({ error: error.message || "Payout failed" }, { status: 500 });
  }
}
