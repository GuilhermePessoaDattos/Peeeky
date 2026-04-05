import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Playwright reports execution status back via this endpoint
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { executionId, status, output, error, executedAt, completedAt, duration } = body;

  if (!executionId || !status) {
    return NextResponse.json({ error: "executionId and status required" }, { status: 400 });
  }

  const execution = await prisma.gtmExecution.update({
    where: { id: executionId },
    data: {
      status,
      output: output || undefined,
      error: error || undefined,
      executedAt: executedAt ? new Date(executedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      duration: duration || undefined,
    },
  });

  return NextResponse.json({ execution });
}
