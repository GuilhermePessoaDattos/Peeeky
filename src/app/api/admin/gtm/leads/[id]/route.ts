import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;

  // Auto-set timestamp fields based on status transitions
  if (body.status === "emailed") data.emailedAt = new Date();
  if (body.status === "followed_up") data.followedUpAt = new Date();
  if (body.status === "replied") data.repliedAt = new Date();

  const lead = await prisma.outboundLead.update({ where: { id }, data });
  return NextResponse.json(lead);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.outboundLead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
