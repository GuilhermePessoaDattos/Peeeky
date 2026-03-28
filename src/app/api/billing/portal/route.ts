import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { createPortalSession } from "@/modules/billing";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com";
    const url = await createPortalSession(session.user.orgId, appUrl);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
