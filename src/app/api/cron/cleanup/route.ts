import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Deactivate expired links
  const expiredLinks = await prisma.link.updateMany({
    where: {
      expiresAt: { lt: now },
      isActive: true,
    },
    data: { isActive: false },
  });

  // Delete orphan page views (no parent view)
  const orphanPageViews = await prisma.pageView.deleteMany({
    where: {
      view: { is: undefined },
      viewId: { not: { in: (await prisma.view.findMany({ select: { id: true } })).map(v => v.id) } },
    },
  });

  // Delete embeddings for deleted documents
  const orphanEmbeddings = await prisma.documentEmbedding.deleteMany({
    where: {
      documentId: { not: { in: (await prisma.document.findMany({ select: { id: true } })).map(d => d.id) } },
    },
  });

  return NextResponse.json({
    ok: true,
    expiredLinks: expiredLinks.count,
    orphanPageViews: orphanPageViews.count,
    orphanEmbeddings: orphanEmbeddings.count,
    timestamp: now.toISOString(),
  });
}
