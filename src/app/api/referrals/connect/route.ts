import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Create Stripe Connect onboarding link for referral payouts
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com";
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeConnectId: true, email: true },
  });

  let connectId = user?.stripeConnectId;

  if (!connectId) {
    // Create new Connect account
    const account = await stripe.accounts.create({
      type: "express",
      email: user?.email || session.user.email,
      metadata: { userId: session.user.id },
      capabilities: {
        transfers: { requested: true },
      },
    });
    connectId = account.id;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeConnectId: connectId },
    });
  }

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: connectId,
    refresh_url: `${appUrl}/settings/referrals`,
    return_url: `${appUrl}/settings/referrals?connected=true`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// Check Connect status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeConnectId: true },
  });

  if (!user?.stripeConnectId) {
    return NextResponse.json({ connected: false });
  }

  const account = await stripe.accounts.retrieve(user.stripeConnectId);

  return NextResponse.json({
    connected: true,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });
}
