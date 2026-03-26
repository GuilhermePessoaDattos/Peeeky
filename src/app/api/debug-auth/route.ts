import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check env vars
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "set" : "MISSING";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "MISSING";
  checks.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? "set" : "MISSING";
  checks.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ? "set" : "MISSING";
  checks.RESEND_API_KEY = process.env.RESEND_API_KEY ? "set" : "MISSING";
  checks.DATABASE_URL = process.env.DATABASE_URL?.replace(/:[^@]+@/, ":***@") || "MISSING";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "set" : "not set";

  // Check DB
  try {
    const userCount = await prisma.user.count();
    const accountCount = await prisma.account.count();
    checks.db = { connected: true, users: userCount, accounts: accountCount };
  } catch (e: unknown) {
    checks.db = { connected: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Check if Account table has correct columns
  try {
    const cols = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Account'
      ORDER BY ordinal_position
    `;
    checks.accountColumns = cols;
  } catch (e: unknown) {
    checks.accountColumns = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(checks);
}
