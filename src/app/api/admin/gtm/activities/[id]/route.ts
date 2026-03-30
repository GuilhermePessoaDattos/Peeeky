import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === "done") data.completedAt = new Date();
    if (body.status === "pending") data.completedAt = null;
  }
  if (body.title !== undefined) data.title = body.title;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.output !== undefined) data.output = body.output;

  const activity = await prisma.gtmActivity.update({
    where: { id },
    data,
  });

  return NextResponse.json(activity);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.gtmActivity.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
