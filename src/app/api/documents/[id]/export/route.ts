import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { computeEngagementScore } from "@/modules/tracking";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: documentId } = await params;

  const doc = await prisma.document.findFirst({
    where: { id: documentId, orgId: session.user.orgId },
    select: { name: true },
  });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const views = await prisma.view.findMany({
    where: { link: { documentId } },
    include: {
      link: { select: { slug: true } },
      pageViews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const headers = [
    "Viewer Email",
    "IP",
    "Link Slug",
    "Device",
    "Browser",
    "OS",
    "Country",
    "City",
    "Duration (s)",
    "Completion (%)",
    "Engagement Score",
    "Forwarded",
    "Pages Viewed",
    "Date",
  ];

  const rows = views.map((v) => {
    const score = computeEngagementScore(v);
    return [
      v.viewerEmail || "",
      v.ip || "",
      v.link.slug,
      v.device || "",
      v.browser || "",
      v.os || "",
      v.country || "",
      v.city || "",
      v.duration.toString(),
      Math.round(v.completionRate * 100).toString(),
      score.toString(),
      v.isForwarded ? "Yes" : "No",
      v.pageViews.length.toString(),
      v.createdAt.toISOString(),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const filename = `${doc.name.replace(/[^a-zA-Z0-9]/g, "_")}_visitors.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
