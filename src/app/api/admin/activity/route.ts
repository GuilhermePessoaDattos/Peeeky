import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const actions = await prisma.adminAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(actions);
}
