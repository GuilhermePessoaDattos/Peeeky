import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await prisma.org.findUnique({
      where: { id: session.user.orgId },
      select: { plan: true },
    });

    if (!org || org.plan !== "BUSINESS") {
      return NextResponse.json({ events: [], plan: org?.plan || "FREE" }, { status: 403 });
    }

    const events = await prisma.auditEvent.findMany({
      where: { orgId: session.user.orgId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ events, plan: org.plan });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
