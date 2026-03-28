import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { addSignatureField, removeSignatureField } from "@/modules/esignature";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const field = await addSignatureField(id, {
    type: body.type,
    pageNumber: body.pageNumber,
    x: body.x,
    y: body.y,
    width: body.width,
    height: body.height,
    label: body.label,
    required: body.required,
  });

  return NextResponse.json(field);
}

// Update field position (drag)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fieldId, x, y } = await req.json();
  if (!fieldId || x === undefined || y === undefined) {
    return NextResponse.json({ error: "fieldId, x, y required" }, { status: 400 });
  }

  await prisma.signatureField.update({
    where: { id: fieldId },
    data: { x, y },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fieldId } = await req.json();
  await removeSignatureField(fieldId);
  return NextResponse.json({ ok: true });
}
