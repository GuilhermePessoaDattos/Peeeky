import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/r2";
import { nanoid } from "nanoid";
import { extractAndStoreChunks } from "@/modules/ai";

export async function createDocument(
  orgId: string,
  userId: string,
  file: File,
) {
  const id = nanoid(12);
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const key = `${orgId}/${id}/${file.name}`;
  const fileType = ext === "pptx" ? "PPTX" : "PDF";

  await uploadFile(key, buffer, file.type);

  const document = await prisma.document.create({
    data: {
      id,
      name: file.name.replace(/\.(pdf|pptx)$/i, ""),
      fileUrl: key,
      fileType,
      status: "PROCESSING",
      orgId,
      createdById: userId,
    },
  });

  // Extract text chunks for AI chat (inline for MVP -- move to background job later)
  if (fileType === "PDF") {
    try {
      await extractAndStoreChunks(document.id, buffer);
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "READY" },
      });
    } catch (error) {
      console.error("Text extraction failed:", error);
      // Document is still usable, just without AI chat
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "READY" },
      });
    }
  } else {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "READY" },
    });
  }

  return document;
}

export async function getDocuments(orgId: string) {
  return prisma.document.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { links: true } },
    },
  });
}

export async function getDocument(orgId: string, documentId: string) {
  return prisma.document.findFirst({
    where: { id: documentId, orgId },
    include: {
      links: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { views: true } },
        },
      },
    },
  });
}

export async function deleteDocument(orgId: string, documentId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, orgId },
  });
  if (!doc) throw new Error("Document not found");

  await deleteFile(doc.fileUrl);
  await prisma.document.delete({ where: { id: documentId } });
}
