import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      documents: {
        select: { id: true, name: true, status: true, totalViews: true, createdAt: true, _count: { select: { links: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      dataRooms: { select: { id: true, name: true, slug: true, _count: { select: { documents: true } } } },
      audits: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sigRequests = await prisma.signatureRequest.findMany({
    where: { orgId: id },
    select: { id: true, title: true, status: true, signerEmail: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ ...org, signatureRequests: sigRequests });
}

// Change org plan
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { plan } = await req.json();

  if (!["FREE", "PRO", "BUSINESS"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await prisma.organization.update({ where: { id }, data: { plan } });
  return NextResponse.json({ ok: true });
}
