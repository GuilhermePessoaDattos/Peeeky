import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import crypto from "crypto";

export async function createSignatureRequest(
  orgId: string,
  createdById: string,
  documentId: string,
  data: {
    title: string;
    message?: string;
    signerEmail: string;
    signerName?: string;
    expiresAt?: string;
  }
) {
  return prisma.signatureRequest.create({
    data: {
      orgId,
      createdById,
      documentId,
      title: data.title,
      message: data.message,
      signerEmail: data.signerEmail,
      signerName: data.signerName,
      slug: nanoid(12),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      status: "DRAFT",
    },
  });
}

export async function getSignatureRequests(orgId: string) {
  return prisma.signatureRequest.findMany({
    where: { orgId },
    include: {
      document: { select: { name: true } },
      _count: { select: { fields: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSignatureRequest(id: string) {
  return prisma.signatureRequest.findUnique({
    where: { id },
    include: {
      document: { select: { name: true, fileUrl: true, pageCount: true, org: { select: { name: true, logoUrl: true } } } },
      fields: { orderBy: { pageNumber: "asc" } },
      completion: true,
    },
  });
}

export async function getSignatureRequestBySlug(slug: string) {
  return prisma.signatureRequest.findUnique({
    where: { slug },
    include: {
      document: { select: { name: true, fileUrl: true, pageCount: true, org: { select: { name: true, logoUrl: true } } } },
      fields: { orderBy: { pageNumber: "asc" } },
      completion: true,
    },
  });
}

export async function addSignatureField(
  signatureRequestId: string,
  field: {
    type: string;
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    required?: boolean;
  }
) {
  return prisma.signatureField.create({
    data: {
      signatureRequestId,
      ...field,
      required: field.required ?? true,
    },
  });
}

export async function removeSignatureField(fieldId: string) {
  return prisma.signatureField.delete({ where: { id: fieldId } });
}

export async function sendSignatureRequest(id: string) {
  const req = await prisma.signatureRequest.findUnique({
    where: { id },
    include: { fields: true },
  });

  if (!req || req.fields.length === 0) {
    throw new Error("Add at least one signature field before sending");
  }

  return prisma.signatureRequest.update({
    where: { id },
    data: { status: "PENDING" },
  });
}

export async function completeSignature(
  slug: string,
  data: {
    signerEmail: string;
    signerName?: string;
    signerIp?: string;
    signatureImage: string;
    signatureMethod: string;
    fieldValues: Record<string, string>;
  }
) {
  const req = await prisma.signatureRequest.findUnique({
    where: { slug },
    include: { fields: true, document: true },
  });

  if (!req || req.status !== "PENDING") {
    throw new Error("Signature request not found or not pending");
  }

  if (req.expiresAt && new Date(req.expiresAt) < new Date()) {
    throw new Error("Signature request has expired");
  }

  // Update field values
  for (const field of req.fields) {
    const value = data.fieldValues[field.id];
    if (value) {
      await prisma.signatureField.update({
        where: { id: field.id },
        data: { value },
      });
    }
  }

  // Generate audit hash (tamper-proof record)
  const auditData = JSON.stringify({
    documentId: req.documentId,
    signerEmail: data.signerEmail,
    fields: data.fieldValues,
    timestamp: new Date().toISOString(),
    signatureMethod: data.signatureMethod,
  });
  const auditHash = crypto.createHash("sha256").update(auditData).digest("hex");

  // Create completion record
  const completion = await prisma.signatureCompletion.create({
    data: {
      signatureRequestId: req.id,
      signerEmail: data.signerEmail,
      signerName: data.signerName,
      signerIp: data.signerIp,
      signatureImage: data.signatureImage,
      signatureMethod: data.signatureMethod,
      auditHash,
    },
  });

  // Update request status
  await prisma.signatureRequest.update({
    where: { id: req.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  return completion;
}

export async function cancelSignatureRequest(id: string) {
  return prisma.signatureRequest.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}
