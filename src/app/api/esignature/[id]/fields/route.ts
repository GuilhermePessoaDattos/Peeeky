import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { addSignatureField, removeSignatureField, getSignatureRequest } from "@/modules/esignature";

async function verifyOwnership(id: string, orgId: string) {
  const req = await getSignatureRequest(id);
  return req && req.orgId === orgId;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyOwnership(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyOwnership(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyOwnership(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { fieldId } = await req.json();
  await removeSignatureField(fieldId);
  return NextResponse.json({ ok: true });
}
