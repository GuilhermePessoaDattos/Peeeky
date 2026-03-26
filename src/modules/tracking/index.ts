import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function recordView(linkId: string, metadata: {
  viewerEmail?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  ip?: string;
}) {
  const view = await prisma.view.create({
    data: {
      id: nanoid(12),
      linkId,
      ...metadata,
    },
    include: { link: true },
  });

  // Increment document totalViews
  await prisma.document.update({
    where: { id: view.link.documentId },
    data: { totalViews: { increment: 1 } },
  });

  return view;
}

export async function recordPageView(viewId: string, pageNumber: number, duration: number) {
  // Upsert: update duration if already exists, create if not
  const existing = await prisma.pageView.findFirst({
    where: { viewId, pageNumber },
  });

  if (existing) {
    return prisma.pageView.update({
      where: { id: existing.id },
      data: { duration: existing.duration + duration },
    });
  }

  return prisma.pageView.create({
    data: {
      viewId,
      pageNumber,
      duration,
    },
  });
}

export async function updateViewDuration(viewId: string, duration: number, completionRate: number) {
  return prisma.view.update({
    where: { id: viewId },
    data: { duration, completionRate },
  });
}

export async function getDocumentAnalytics(orgId: string, documentId: string) {
  const views = await prisma.view.findMany({
    where: {
      link: {
        document: { id: documentId, orgId },
      },
    },
    include: {
      link: { select: { slug: true, name: true } },
      pageViews: { orderBy: { pageNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalViews = views.length;
  const uniqueViewers = new Set(views.map(v => v.viewerEmail || v.ip).filter(Boolean)).size;
  const avgDuration = totalViews > 0 ? views.reduce((sum, v) => sum + v.duration, 0) / totalViews : 0;
  const avgCompletion = totalViews > 0 ? views.reduce((sum, v) => sum + v.completionRate, 0) / totalViews : 0;

  return {
    totalViews,
    uniqueViewers,
    avgDuration: Math.round(avgDuration),
    avgCompletion: Math.round(avgCompletion * 100),
    views,
  };
}
