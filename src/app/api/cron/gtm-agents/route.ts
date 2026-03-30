import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/modules/gtm/agent-runner";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await prisma.gtmAgent.findMany({
    where: { status: "active" },
  });

  const results: Record<string, unknown> = {};

  for (const agent of agents) {
    if (shouldRunNow(agent.schedule, agent.lastRunAt)) {
      results[agent.name] = await runAgent(agent.name);
    } else {
      results[agent.name] = { skipped: true, reason: "not scheduled now" };
    }
  }

  return NextResponse.json({ results, timestamp: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentName, runId } = await req.json();
  const result = await runAgent(agentName, runId);
  return NextResponse.json(result);
}

function shouldRunNow(cronExpr: string, lastRunAt: Date | null): boolean {
  const now = new Date();
  const parts = cronExpr.split(" ");
  if (parts.length < 5) return false;

  const [minute, hour, , , dayOfWeek] = parts;

  if (lastRunAt) {
    const hoursSinceLastRun = (now.getTime() - new Date(lastRunAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastRun < 1) return false;
  }

  if (minute !== "*") {
    const cronMinute = parseInt(minute);
    if (Math.abs(now.getUTCMinutes() - cronMinute) > 5) return false;
  }

  if (hour !== "*") {
    if (parseInt(hour) !== now.getUTCHours()) return false;
  }

  if (dayOfWeek !== "*") {
    const days = dayOfWeek.includes("-")
      ? expandRange(dayOfWeek)
      : dayOfWeek.split(",").map(Number);
    if (!days.includes(now.getUTCDay())) return false;
  }

  return true;
}

function expandRange(range: string): number[] {
  const [start, end] = range.split("-").map(Number);
  const result = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}
