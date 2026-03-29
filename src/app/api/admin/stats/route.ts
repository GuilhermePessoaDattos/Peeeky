import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalOrgs,
    totalDocs,
    totalViews,
    proOrgs,
    businessOrgs,
    signupsToday,
    docsToday,
    viewsToday,
    aiChatsMonth,
    sigRequests,
    sigCompleted,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.document.count(),
    prisma.view.count(),
    prisma.organization.count({ where: { plan: "PRO" } }),
    prisma.organization.count({ where: { plan: "BUSINESS" } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.document.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.view.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.chatMessage.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.signatureRequest.count(),
    prisma.signatureRequest.count({ where: { status: "COMPLETED" } }),
  ]);

  const mrr = proOrgs * 39 + businessOrgs * 129;

  // Signups last 30 days (grouped by day)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const signupsByDay: Record<string, number> = {};
  for (const u of recentUsers) {
    const day = u.createdAt.toISOString().slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  }

  // Plan distribution
  const freeOrgs = await prisma.organization.count({ where: { plan: "FREE" } });

  return NextResponse.json({
    totalUsers,
    totalOrgs,
    totalDocs,
    totalViews,
    mrr,
    arr: mrr * 12,
    proOrgs,
    businessOrgs,
    freeOrgs,
    signupsToday,
    docsToday,
    viewsToday,
    aiChatsMonth,
    sigRequests,
    sigCompleted,
    signupsByDay,
    conversionRate: totalOrgs > 0 ? ((proOrgs + businessOrgs) / totalOrgs * 100).toFixed(1) : "0",
  });
}
