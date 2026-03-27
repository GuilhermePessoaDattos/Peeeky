import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { createDataRoom, getDataRooms } from "@/modules/datarooms";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataRooms = await getDataRooms(session.user.orgId);
    return NextResponse.json({ dataRooms });
  } catch (error) {
    console.error("List data rooms error:", error);
    return NextResponse.json({ error: "Failed to list data rooms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const dataRoom = await createDataRoom(
      session.user.orgId,
      session.user.id,
      name.trim(),
      description?.trim() || undefined,
    );

    return NextResponse.json({ success: true, dataRoom }, { status: 201 });
  } catch (error) {
    console.error("Create data room error:", error);
    return NextResponse.json({ error: "Failed to create data room" }, { status: 500 });
  }
}
