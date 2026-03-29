import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.user.update({ where: { id }, data: { blocked: false, blockedAt: null, blockReason: null } });
  await prisma.adminAction.create({ data: { adminEmail: session?.user?.email || "admin", action: "UNBLOCK_USER", targetType: "USER", targetId: id } });

  return NextResponse.json({ ok: true });
}
