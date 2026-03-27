import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const events = await prisma.auditEvent.findMany({
      where: { orgId: session.user.orgId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
