import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  setDataRoomAccess,
  removeDataRoomAccess,
  getDataRoomAccessRules,
} from "@/modules/datarooms";

async function verifyRoomOwnership(roomId: string, orgId: string) {
  const room = await prisma.dataRoom.findFirst({ where: { id: roomId, orgId } });
  return !!room;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyRoomOwnership(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rules = await getDataRoomAccessRules(id);
  return NextResponse.json(rules);
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
  if (!(await verifyRoomOwnership(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email, documentIds } = await req.json();
  if (!email || !Array.isArray(documentIds)) {
    return NextResponse.json({ error: "email and documentIds[] required" }, { status: 400 });
  }

  const rule = await setDataRoomAccess(id, email, documentIds);
  return NextResponse.json(rule);
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
  if (!(await verifyRoomOwnership(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  await removeDataRoomAccess(id, email);
  return NextResponse.json({ ok: true });
}
