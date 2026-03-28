import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domains = await prisma.customDomain.findMany({
    where: { orgId: session.user.orgId },
  });

  return NextResponse.json(domains);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan
  const org = await prisma.organization.findUnique({
    where: { id: session.user.orgId },
    select: { plan: true },
  });
  if (org?.plan !== "BUSINESS") {
    return NextResponse.json({ error: "Business plan required" }, { status: 403 });
  }

  const { domain } = await req.json();
  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Domain required" }, { status: 400 });
  }

  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Check if already exists
  const existing = await prisma.customDomain.findUnique({ where: { domain: cleanDomain } });
  if (existing) {
    return NextResponse.json({ error: "Domain already registered" }, { status: 400 });
  }

  const record = await prisma.customDomain.create({
    data: {
      domain: cleanDomain,
      orgId: session.user.orgId,
      verified: false,
    },
  });

  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domainId } = await req.json();
  await prisma.customDomain.deleteMany({
    where: { id: domainId, orgId: session.user.orgId },
  });

  return NextResponse.json({ ok: true });
}
