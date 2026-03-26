import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { updateLink, toggleLink, deleteLink } from "@/modules/links";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action === "toggle") {
      const link = await toggleLink(session.user.orgId, id);
      return NextResponse.json({ success: true, link });
    }

    const link = await updateLink(session.user.orgId, id, {
      name: body.name,
      password: body.password,
      requireEmail: body.requireEmail,
      allowDownload: body.allowDownload,
      enableWatermark: body.enableWatermark,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : body.expiresAt === null ? null : undefined,
      maxViews: body.maxViews,
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error("Update link error:", error);
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteLink(session.user.orgId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete link error:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
