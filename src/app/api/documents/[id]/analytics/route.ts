import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { getDocumentAnalytics, computeEngagementScore } from "@/modules/tracking";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const analytics = await getDocumentAnalytics(session.user.orgId, id);

    // Add engagement scores to views
    const viewsWithScores = analytics.views.map(view => ({
      ...view,
      engagementScore: computeEngagementScore(view),
    }));

    // Compute per-page aggregated time
    const pageTimeMap: Record<number, number> = {};
    for (const view of analytics.views) {
      for (const pv of view.pageViews) {
        pageTimeMap[pv.pageNumber] = (pageTimeMap[pv.pageNumber] || 0) + pv.duration;
      }
    }
    const pageAnalytics = Object.entries(pageTimeMap)
      .map(([page, duration]) => ({
        page: parseInt(page),
        totalDuration: duration,
        avgDuration: analytics.totalViews > 0 ? Math.round(duration / analytics.totalViews) : 0,
      }))
      .sort((a, b) => a.page - b.page);

    return NextResponse.json({
      ...analytics,
      views: viewsWithScores,
      pageAnalytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
