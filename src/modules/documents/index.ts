import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/r2";
import { nanoid } from "nanoid";
import { convertPptxToPdf } from "@/lib/cloudconvert";

export async function createDocument(
  orgId: string,
  userId: string,
  file: File,
) {
  const id = nanoid(12);
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const isPptx = ext === "pptx";
  const key = `${orgId}/${id}/${file.name}`;
  const fileType = isPptx ? "PPTX" : "PDF";

  // Upload original file to R2
  await uploadFile(key, buffer, file.type);

  // Create document record (PROCESSING if PPTX, READY if PDF)
  const document = await prisma.document.create({
    data: {
      id,
      name: file.name.replace(/\.(pdf|pptx)$/i, ""),
      fileUrl: key,
      fileType,
      status: isPptx ? "PROCESSING" : "READY",
      orgId,
      createdById: userId,
    },
  });

  // Convert PPTX to PDF async (don't block response)
  if (isPptx) {
    convertPptxToPdf(buffer, file.name)
      .then(async (pdfBuffer) => {
        const pdfKey = `${orgId}/${id}/${file.name.replace(/\.pptx$/i, ".pdf")}`;
        await uploadFile(pdfKey, pdfBuffer, "application/pdf");
        await prisma.document.update({
          where: { id },
          data: { fileUrl: pdfKey, status: "READY" },
        });
      })
      .catch(async (error) => {
        console.error("PPTX conversion failed:", error);
        await prisma.document.update({
          where: { id },
          data: { status: "ERROR" },
        });
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

export async function replaceDocumentFile(
  orgId: string,
  documentId: string,
  userId: string,
  file: File
) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, orgId },
  });
  if (!doc) throw new Error("Document not found");

  // Save current version
  const versionCount = await prisma.documentVersion.count({ where: { documentId } });
  await prisma.documentVersion.create({
    data: {
      documentId,
      fileUrl: doc.fileUrl,
      version: versionCount + 1,
      uploadedBy: userId,
    },
  });

  // Upload new file
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${orgId}/${documentId}/${file.name}`;
  await uploadFile(key, buffer, file.type);

  // Update document record (all existing links now serve the new file)
  await prisma.document.update({
    where: { id: documentId },
    data: {
      fileUrl: key,
      status: "READY",
      updatedAt: new Date(),
    },
  });

  // Clear embeddings so AI chat reindexes
  await prisma.documentEmbedding.deleteMany({ where: { documentId } });

  return { version: versionCount + 2 };
}

export async function getDocumentVersions(orgId: string, documentId: string) {
  const doc = await prisma.document.findFirst({ where: { id: documentId, orgId } });
  if (!doc) throw new Error("Document not found");

  return prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { version: "desc" },
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
