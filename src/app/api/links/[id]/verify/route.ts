import { NextRequest, NextResponse } from "next/server";
import { verifyLinkPassword } from "@/modules/links";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

const passwordRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "60 s"), // 5 attempts per minute
  prefix: "rl:password",
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const { success } = await passwordRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const { id } = await params;
    const { password } = await req.json();

    const valid = await verifyLinkPassword(id, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
