import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const plan = req.nextUrl.searchParams.get("plan");
  const search = req.nextUrl.searchParams.get("search");

  const where: any = {};
  if (plan && plan !== "ALL") where.plan = plan;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const orgs = await prisma.organization.findMany({
    where,
    include: {
      _count: { select: { members: true, documents: true, dataRooms: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Get total views per org
  const orgsWithViews = await Promise.all(
    orgs.map(async (org) => {
      const viewSum = await prisma.document.aggregate({
        where: { orgId: org.id },
        _sum: { totalViews: true },
      });
      return {
        ...org,
        totalViews: viewSum._sum.totalViews || 0,
      };
    })
  );

  return NextResponse.json(orgsWithViews);
}
