import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { getSignatureRequest, getSignedPdfUrl } from "@/modules/esignature";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const request = await getSignatureRequest(id);
  if (!request || request.orgId !== session.user.orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getSignedPdfUrl(id);
  if (!url) {
    return NextResponse.json({ error: "Signed PDF not available" }, { status: 404 });
  }

  return NextResponse.json({ url });
}
