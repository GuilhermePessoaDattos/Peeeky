import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agent = await prisma.gtmAgent.findUnique({ where: { id } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const run = await prisma.gtmAgentRun.create({
    data: {
      agentId: id,
      status: "running",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com";
  try {
    await fetch(`${baseUrl}/api/cron/gtm-agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ agentName: agent.name, runId: run.id }),
    });
  } catch (err) {
    await prisma.gtmAgentRun.update({
      where: { id: run.id },
      data: { status: "error", error: String(err), completedAt: new Date() },
    });
  }

  return NextResponse.json({ run });
}
