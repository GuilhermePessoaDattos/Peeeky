import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const doc = await prisma.document.findFirst({
    where: { id, orgId: session.user.orgId },
  });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.document.update({
    where: { id },
    data: { name: name.trim() },
  });

  return NextResponse.json({ ok: true });
}
