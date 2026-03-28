import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: linkId } = await params;
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link || !link.requireNDA) {
    return NextResponse.json({ error: "NDA not required" }, { status: 400 });
  }

  // Check if already accepted
  const existing = await prisma.ndaAcceptance.findFirst({
    where: { linkId, email },
  });
  if (existing) {
    return NextResponse.json({ accepted: true, acceptedAt: existing.acceptedAt });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const acceptance = await prisma.ndaAcceptance.create({
    data: { linkId, email, ip },
  });

  return NextResponse.json({ accepted: true, acceptedAt: acceptance.acceptedAt });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: linkId } = await params;
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ accepted: false });
  }

  const existing = await prisma.ndaAcceptance.findFirst({
    where: { linkId, email },
  });

  return NextResponse.json({
    accepted: !!existing,
    acceptedAt: existing?.acceptedAt || null,
  });
}
