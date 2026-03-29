import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

async function verifyRoom(roomId: string, orgId: string) {
  return prisma.dataRoom.findFirst({ where: { id: roomId, orgId } });
}

// List folders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyRoom(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const folders = await prisma.dataRoomFolder.findMany({
    where: { dataRoomId: id },
    orderBy: { order: "asc" },
    include: {
      documents: {
        orderBy: { order: "asc" },
        include: { document: { select: { id: true, name: true, fileType: true, pageCount: true } } },
      },
    },
  });

  return NextResponse.json(folders);
}

// Create folder
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyRoom(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Folder name required" }, { status: 400 });
  }

  const count = await prisma.dataRoomFolder.count({ where: { dataRoomId: id } });

  const folder = await prisma.dataRoomFolder.create({
    data: {
      dataRoomId: id,
      name,
      order: count,
    },
  });

  return NextResponse.json(folder);
}

// Delete folder
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyRoom(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { folderId } = await req.json();

  // Unassign documents from folder first
  await prisma.dataRoomDocument.updateMany({
    where: { folderId },
    data: { folderId: null },
  });

  await prisma.dataRoomFolder.delete({ where: { id: folderId } });
  return NextResponse.json({ ok: true });
}

// Move document to folder
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyRoom(id, session.user.orgId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { documentId, folderId } = await req.json();

  await prisma.dataRoomDocument.updateMany({
    where: { dataRoomId: id, documentId },
    data: { folderId: folderId || null },
  });

  return NextResponse.json({ ok: true });
}
