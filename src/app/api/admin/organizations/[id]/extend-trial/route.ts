import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { days } = await req.json();
  if (!days || days < 1) return NextResponse.json({ error: "Days required (min 1)" }, { status: 400 });

  const org = await prisma.organization.findUnique({ where: { id }, select: { trialEndsAt: true } });
  const base = org?.trialEndsAt && new Date(org.trialEndsAt) > new Date() ? new Date(org.trialEndsAt) : new Date();
  const newEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.organization.update({ where: { id }, data: { trialEndsAt: newEnd } });
  await prisma.adminAction.create({ data: { adminEmail: session?.user?.email || "admin", action: "EXTEND_TRIAL", targetType: "ORG", targetId: id, metadata: { days, newEnd: newEnd.toISOString() } } });

  return NextResponse.json({ ok: true, trialEndsAt: newEnd });
}
