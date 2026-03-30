import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const agents = await prisma.gtmAgent.findMany({
    orderBy: { name: "asc" },
    include: {
      runs: {
        take: 5,
        orderBy: { startedAt: "desc" },
      },
    },
  });
  return NextResponse.json(agents);
}
