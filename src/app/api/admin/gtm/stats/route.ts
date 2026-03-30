import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const [
    totalActivities,
    completedActivities,
    pendingActivities,
    agents,
    currentWeek,
    recentRuns,
  ] = await Promise.all([
    prisma.gtmActivity.count(),
    prisma.gtmActivity.count({ where: { status: "done" } }),
    prisma.gtmActivity.count({ where: { status: "pending" } }),
    prisma.gtmAgent.findMany({ orderBy: { name: "asc" } }),
    prisma.gtmWeek.findFirst({
      where: { weekStart: { lte: now } },
      orderBy: { weekStart: "desc" },
      include: {
        activities: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
      },
    }),
    prisma.gtmAgentRun.findMany({
      take: 20,
      orderBy: { startedAt: "desc" },
      include: { agent: { select: { displayName: true } } },
    }),
  ]);

  const currentWeekWithStats = currentWeek
    ? {
        ...currentWeek,
        stats: {
          total: currentWeek.activities.length,
          done: currentWeek.activities.filter((a) => a.status === "done").length,
          inProgress: currentWeek.activities.filter((a) => a.status === "in_progress").length,
          pending: currentWeek.activities.filter((a) => a.status === "pending").length,
        },
      }
    : null;

  return NextResponse.json({
    overview: {
      totalActivities,
      completedActivities,
      pendingActivities,
      completionRate: totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 100)
        : 0,
    },
    agents,
    currentWeek: currentWeekWithStats,
    recentRuns,
  });
}
