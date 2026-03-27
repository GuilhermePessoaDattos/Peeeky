import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function createDataRoom(orgId: string, userId: string, name: string, description?: string) {
  return prisma.dataRoom.create({
    data: {
      name,
      description,
      slug: nanoid(10),
      orgId,
      createdById: userId,
    },
  });
}

export async function getDataRooms(orgId: string) {
  return prisma.dataRoom.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { documents: true } },
    },
  });
}

export async function getDataRoom(orgId: string, dataRoomId: string) {
  return prisma.dataRoom.findFirst({
    where: { id: dataRoomId, orgId },
    include: {
      documents: {
        orderBy: { order: "asc" },
        include: {
          document: {
            select: { id: true, name: true, fileType: true, pageCount: true, totalViews: true },
          },
        },
      },
    },
  });
}

export async function addDocumentToDataRoom(orgId: string, dataRoomId: string, documentId: string) {
  const room = await prisma.dataRoom.findFirst({ where: { id: dataRoomId, orgId } });
  if (!room) throw new Error("Data room not found");

  const doc = await prisma.document.findFirst({ where: { id: documentId, orgId } });
  if (!doc) throw new Error("Document not found");

  const count = await prisma.dataRoomDocument.count({ where: { dataRoomId } });

  return prisma.dataRoomDocument.create({
    data: { dataRoomId, documentId, order: count },
  });
}

export async function removeDocumentFromDataRoom(orgId: string, dataRoomId: string, documentId: string) {
  const room = await prisma.dataRoom.findFirst({ where: { id: dataRoomId, orgId } });
  if (!room) throw new Error("Data room not found");

  return prisma.dataRoomDocument.delete({
    where: { dataRoomId_documentId: { dataRoomId, documentId } },
  });
}

export async function deleteDataRoom(orgId: string, dataRoomId: string) {
  const room = await prisma.dataRoom.findFirst({ where: { id: dataRoomId, orgId } });
  if (!room) throw new Error("Data room not found");

  return prisma.dataRoom.delete({ where: { id: dataRoomId } });
}

export async function getDataRoomBySlug(slug: string) {
  return prisma.dataRoom.findUnique({
    where: { slug },
    include: {
      documents: {
        orderBy: { order: "asc" },
        include: {
          document: {
            select: { id: true, name: true, fileType: true, fileUrl: true, pageCount: true },
          },
        },
      },
      org: { select: { name: true, logoUrl: true } },
    },
  });
}
