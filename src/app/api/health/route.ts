import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      db: "connected",
      userCount,
      dbUrl: process.env.DATABASE_URL?.replace(/:[^@]+@/, ":***@"),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        error: message,
        dbUrl: process.env.DATABASE_URL?.replace(/:[^@]+@/, ":***@"),
      },
      { status: 500 }
    );
  }
}
