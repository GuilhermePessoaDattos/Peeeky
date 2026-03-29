import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { getSignatureRequest, cancelSignatureRequest } from "@/modules/esignature";
import { getSignedViewUrl } from "@/lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const request = await getSignatureRequest(id);
  if (!request || request.orgId !== session.user.orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let pdfUrl = null;
  if (request.document?.fileUrl) {
    pdfUrl = await getSignedViewUrl(request.document.fileUrl);
  }

  return NextResponse.json({ ...request, pdfUrl });
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
  const request = await getSignatureRequest(id);
  if (!request || request.orgId !== session.user.orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await cancelSignatureRequest(id);
  return NextResponse.json({ ok: true });
}
