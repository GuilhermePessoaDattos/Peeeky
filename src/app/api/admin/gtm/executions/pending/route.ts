import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const executions = await prisma.gtmExecution.findMany({
    where: {
      actionType: { in: ["linkedin_post", "reddit_comment"] },
      status: { in: ["pending", "approved"] },
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const actions = executions.map((exec) => {
    let metadata: Record<string, unknown> = {};
    if (exec.metadata) {
      try {
        metadata = JSON.parse(exec.metadata);
      } catch {
        // leave metadata empty if parsing fails
      }
    }

    return {
      id: exec.id,
      actionType: exec.actionType,
      title: exec.title,
      scheduledAt: exec.scheduledAt,
      metadata,
    };
  });

  return NextResponse.json({ actions });
}
