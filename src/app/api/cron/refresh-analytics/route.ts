import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getDocumentAnalytics, computeEngagementScore, getScoreColor, getScoreLabel } from "@/modules/tracking";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find top 50 most-viewed documents in last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const hotDocs = await prisma.view.groupBy({
    by: ["linkId"],
    where: { createdAt: { gte: oneDayAgo } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 50,
  });

  // Get unique document IDs and their orgIds from hot links
  const linkIds = hotDocs.map((h) => h.linkId);
  const links = await prisma.link.findMany({
    where: { id: { in: linkIds } },
    select: { documentId: true, document: { select: { orgId: true } } },
  });

  const docMap = new Map<string, string>();
  for (const link of links) {
    docMap.set(link.documentId, link.document.orgId);
  }

  // Pre-compute and cache analytics for each hot document
  let cached = 0;
  for (const [docId, orgId] of docMap) {
    const analytics = await getDocumentAnalytics(orgId, docId);

    const views = analytics.views.map((view: any) => {
      const score = computeEngagementScore(view);
      return {
        ...view,
        score,
        scoreColor: getScoreColor(score),
        scoreLabel: getScoreLabel(score),
      };
    });

    const result = {
      totalViews: analytics.totalViews,
      uniqueViewers: analytics.uniqueViewers,
      avgDuration: analytics.avgDuration,
      avgCompletion: analytics.avgCompletion,
      views,
      pageAnalytics: [],
    };

    await redis.set(`analytics:${docId}`, JSON.stringify(result), { ex: 300 });
    cached++;
  }

  return NextResponse.json({
    ok: true,
    hotDocuments: docMap.size,
    cached,
    timestamp: new Date().toISOString(),
  });
}
