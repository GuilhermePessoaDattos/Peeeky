import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {};

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "fail";
  }

  // Redis
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "fail";
  }

  // Stripe
  checks.stripe = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
    ? "ok"
    : "fail";

  // Cron secret
  checks.cron_secret = process.env.CRON_SECRET ? "ok" : "fail";

  // Resend
  checks.resend = process.env.RESEND_API_KEY ? "ok" : "fail";

  // OpenAI
  checks.openai = process.env.OPENAI_API_KEY ? "ok" : "fail";

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      checks,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}
