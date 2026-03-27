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
      view: null,
    },
  });

  // Delete embeddings for deleted documents
  const orphanEmbeddings = await prisma.documentEmbedding.deleteMany({
    where: {
      document: null,
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
