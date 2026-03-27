import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { getDataRoom, deleteDataRoom } from "@/modules/datarooms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dataRoom = await getDataRoom(session.user.orgId, id);

    if (!dataRoom) {
      return NextResponse.json({ error: "Data room not found" }, { status: 404 });
    }

    return NextResponse.json({ dataRoom });
  } catch (error) {
    console.error("Get data room error:", error);
    return NextResponse.json({ error: "Failed to get data room" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteDataRoom(session.user.orgId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete data room error:", error);
    return NextResponse.json({ error: "Failed to delete data room" }, { status: 500 });
  }
}
