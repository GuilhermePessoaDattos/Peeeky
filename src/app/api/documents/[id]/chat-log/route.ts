import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify doc belongs to org
  const doc = await prisma.document.findFirst({
    where: { id, orgId: session.user.orgId },
  });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { documentId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(messages);
}
