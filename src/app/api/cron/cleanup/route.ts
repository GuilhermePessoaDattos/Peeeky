import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

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

  // Process grace period downgrades (3-day delay after subscription cancelled)
  let downgrades = 0;
  const orgs = await prisma.organization.findMany({
    where: { plan: { not: "FREE" }, stripeSubId: null },
    select: { id: true },
  });
  for (const org of orgs) {
    const downgradeAt = await redis.get<string>(`downgrade:${org.id}`);
    if (downgradeAt && new Date(downgradeAt) <= now) {
      await prisma.organization.update({
        where: { id: org.id },
        data: { plan: "FREE" },
      });
      await redis.del(`downgrade:${org.id}`);
      downgrades++;
    }
  }

  // Expire trials
  let trialsExpired = 0;
  const expiredTrials = await prisma.organization.findMany({
    where: {
      trialEndsAt: { lt: now },
      plan: { not: "FREE" },
      stripeSubId: null,
    },
    select: { id: true },
  });
  for (const org of expiredTrials) {
    await prisma.organization.update({
      where: { id: org.id },
      data: { plan: "FREE" },
    });
    trialsExpired++;
  }

  return NextResponse.json({
    ok: true,
    expiredLinks: expiredLinks.count,
    orphanPageViews: orphanPageViews.count,
    orphanEmbeddings: orphanEmbeddings.count,
    downgrades,
    trialsExpired,
    timestamp: now.toISOString(),
  });
}
