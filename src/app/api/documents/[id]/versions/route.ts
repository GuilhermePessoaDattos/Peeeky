import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { getDocumentVersions } from "@/modules/documents";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const versions = await getDocumentVersions(session.user.orgId, id);
    return NextResponse.json(versions);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
