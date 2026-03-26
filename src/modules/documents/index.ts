import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/r2";
import { nanoid } from "nanoid";

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

  // Upload to R2
  await uploadFile(key, buffer, file.type);

  // Create document record (READY immediately — text extraction is separate)
  const document = await prisma.document.create({
    data: {
      id,
      name: file.name.replace(/\.(pdf|pptx)$/i, ""),
      fileUrl: key,
      fileType,
      status: "READY",
      orgId,
      createdById: userId,
    },
  });

  // Try text extraction in background (non-blocking)
  if (fileType === "PDF") {
    extractTextInBackground(document.id, buffer).catch(console.error);
  }

  return document;
}

async function extractTextInBackground(documentId: string, buffer: Buffer) {
  try {
    const { extractAndStoreChunks } = await import("@/modules/ai");
    await extractAndStoreChunks(documentId, buffer);
  } catch (error) {
    console.error("Background text extraction failed:", error);
  }
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
