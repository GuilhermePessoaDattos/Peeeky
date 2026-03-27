import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { computeEngagementScore, getScoreColor, getScoreLabel } from "@/modules/tracking";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify data room belongs to org
  const room = await prisma.dataRoom.findFirst({
    where: { id, orgId: session.user.orgId },
    include: {
      documents: {
        include: {
          document: {
            select: { id: true, name: true, fileType: true, pageCount: true },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const documentIds = room.documents.map((d) => d.document.id);

  // Get all views for documents in this data room
  const views = await prisma.view.findMany({
    where: {
      link: {
        documentId: { in: documentIds },
      },
    },
    include: {
      link: { select: { documentId: true } },
      pageViews: { orderBy: { pageNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate by viewer (email or IP)
  const viewerMap = new Map<
    string,
    {
      email: string | null;
      ip: string | null;
      device: string | null;
      docsViewed: Set<string>;
      totalDuration: number;
      scores: number[];
      lastSeen: Date;
      viewCount: number;
    }
  >();

  for (const view of views) {
    const key = view.viewerEmail || view.ip || "unknown";
    const existing = viewerMap.get(key);
    const score = computeEngagementScore(view);

    if (existing) {
      existing.docsViewed.add(view.link.documentId);
      existing.totalDuration += view.duration;
      existing.scores.push(score);
      existing.viewCount++;
      if (view.createdAt > existing.lastSeen) {
        existing.lastSeen = view.createdAt;
      }
    } else {
      viewerMap.set(key, {
        email: view.viewerEmail,
        ip: view.ip,
        device: view.device,
        docsViewed: new Set([view.link.documentId]),
        totalDuration: view.duration,
        scores: [score],
        lastSeen: view.createdAt,
        viewCount: 1,
      });
    }
  }

  // Build viewer list
  const viewers = Array.from(viewerMap.entries()).map(([key, v]) => {
    const avgScore = Math.round(
      v.scores.reduce((a, b) => a + b, 0) / v.scores.length
    );
    return {
      viewer: v.email || v.ip || "Unknown",
      device: v.device,
      docsViewed: v.docsViewed.size,
      totalDocs: documentIds.length,
      totalDuration: v.totalDuration,
      avgScore,
      scoreColor: getScoreColor(avgScore),
      scoreLabel: getScoreLabel(avgScore),
      lastSeen: v.lastSeen,
      viewCount: v.viewCount,
    };
  });

  // Sort by avg score descending
  viewers.sort((a, b) => b.avgScore - a.avgScore);

  // Per-document breakdown
  const docBreakdown = room.documents.map((d) => {
    const docViews = views.filter((v) => v.link.documentId === d.document.id);
    const totalViews = docViews.length;
    const avgDuration =
      totalViews > 0
        ? Math.round(
            docViews.reduce((sum, v) => sum + v.duration, 0) / totalViews
          )
        : 0;
    const avgCompletion =
      totalViews > 0
        ? Math.round(
            (docViews.reduce((sum, v) => sum + v.completionRate, 0) /
              totalViews) *
              100
          )
        : 0;

    return {
      documentId: d.document.id,
      name: d.document.name,
      fileType: d.document.fileType,
      pageCount: d.document.pageCount,
      totalViews,
      avgDuration,
      avgCompletion,
    };
  });

  // Summary
  const uniqueViewers = viewerMap.size;
  const totalViews = views.length;
  const avgEngagement =
    viewers.length > 0
      ? Math.round(
          viewers.reduce((sum, v) => sum + v.avgScore, 0) / viewers.length
        )
      : 0;

  return NextResponse.json({
    uniqueViewers,
    totalViews,
    avgEngagement,
    viewers,
    docBreakdown,
  });
}
