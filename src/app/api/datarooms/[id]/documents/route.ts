import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { addDocumentToDataRoom, removeDocumentFromDataRoom } from "@/modules/datarooms";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const entry = await addDocumentToDataRoom(session.user.orgId, id, documentId);
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add document";
    console.error("Add document to data room error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "documentId query param is required" }, { status: 400 });
    }

    await removeDocumentFromDataRoom(session.user.orgId, id, documentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove document";
    console.error("Remove document from data room error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
