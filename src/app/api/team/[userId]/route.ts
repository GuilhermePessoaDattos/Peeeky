import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { removeMember, updateMemberRole } from "@/modules/orgs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { userId } = await params;
    const { role } = await req.json();
    const membership = await updateMemberRole(session.user.orgId, userId, role);
    return NextResponse.json({ success: true, membership });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Only owner can remove members" }, { status: 403 });
    }

    const { userId } = await params;
    await removeMember(session.user.orgId, userId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove member";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
