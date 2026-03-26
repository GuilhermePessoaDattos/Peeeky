import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const urls = [
    `postgres://postgres.kvlethhzcoiondjvbsce:ysbzNJs9t6DPxpAC@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgres://postgres.kvlethhzcoiondjvbsce:ysbzNJs9t6DPxpAC@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:ysbzNJs9t6DPxpAC@db.kvlethhzcoiondjvbsce.supabase.co:5432/postgres`,
  ];

  const results = [];

  for (const url of urls) {
    const masked = url.replace(/:[^@]+@/, ":***@");
    const client = new PrismaClient({ datasources: { db: { url } } });
    try {
      await client.$queryRaw`SELECT 1 as ok`;
      results.push({ url: masked, status: "connected" });
      await client.$disconnect();
      break;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message.split("\n").pop() : String(error);
      results.push({ url: masked, status: "failed", error: msg });
      await client.$disconnect();
    }
  }

  return NextResponse.json({ results, env_url: process.env.DATABASE_URL?.replace(/:[^@]+@/, ":***@") });
}
