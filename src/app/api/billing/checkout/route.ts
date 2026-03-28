import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { createCheckoutSession } from "@/modules/billing";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, interval } = await req.json();

    if (
      !["PRO", "BUSINESS"].includes(plan) ||
      !["month", "year"].includes(interval)
    ) {
      return NextResponse.json(
        { error: "Invalid plan or interval" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com";
    const url = await createCheckoutSession(
      session.user.orgId,
      plan,
      interval,
      appUrl
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
