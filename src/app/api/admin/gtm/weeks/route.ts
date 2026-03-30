import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "12");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const weeks = await prisma.gtmWeek.findMany({
    take: limit,
    skip: offset,
    orderBy: { weekStart: "asc" },
    include: {
      activities: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const weeksWithStats = weeks.map((week) => ({
    ...week,
    stats: {
      total: week.activities.length,
      done: week.activities.filter((a) => a.status === "done").length,
      inProgress: week.activities.filter((a) => a.status === "in_progress").length,
      pending: week.activities.filter((a) => a.status === "pending").length,
    },
  }));

  return NextResponse.json(weeksWithStats);
}
