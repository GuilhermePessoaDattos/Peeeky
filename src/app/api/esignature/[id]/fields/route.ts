import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
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

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fieldId } = await req.json();
  await removeSignatureField(fieldId);
  return NextResponse.json({ ok: true });
}
