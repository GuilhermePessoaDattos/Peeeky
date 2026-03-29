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
          folder: { select: { id: true, name: true } },
        },
      },
      folders: { orderBy: { order: "asc" } },
      org: { select: { name: true, logoUrl: true } },
    },
  });
}

// ─── Access Control ───────────────────────────────────

export async function setDataRoomAccess(
  dataRoomId: string,
  email: string,
  documentIds: string[]
) {
  return prisma.dataRoomAccess.upsert({
    where: { dataRoomId_email: { dataRoomId, email } },
    create: { dataRoomId, email, documentIds },
    update: { documentIds },
  });
}

export async function removeDataRoomAccess(dataRoomId: string, email: string) {
  return prisma.dataRoomAccess.delete({
    where: { dataRoomId_email: { dataRoomId, email } },
  });
}

export async function getDataRoomAccessRules(dataRoomId: string) {
  return prisma.dataRoomAccess.findMany({
    where: { dataRoomId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVisibleDocuments(
  dataRoomId: string,
  viewerEmail: string | null
) {
  const room = await prisma.dataRoom.findUnique({
    where: { id: dataRoomId },
    include: {
      documents: {
        include: { document: true },
        orderBy: { order: "asc" },
      },
      accessRules: true,
    },
  });

  if (!room) return null;

  // If no access rules exist, show all documents (backwards compatible)
  if (room.accessRules.length === 0) {
    return room.documents;
  }

  // If viewer has no email, show no restricted docs
  if (!viewerEmail) {
    return [];
  }

  // Find matching access rule
  const rule = room.accessRules.find(
    (r) => r.email.toLowerCase() === viewerEmail.toLowerCase()
  );

  if (!rule) return [];

  return room.documents.filter((d) =>
    rule.documentIds.includes(d.documentId)
  );
}
