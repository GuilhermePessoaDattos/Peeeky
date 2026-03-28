import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { uploadFile, getSignedViewUrl } from "@/lib/r2";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Create & Manage ────────────────────────────────────

export async function createSignatureRequest(
  orgId: string,
  createdById: string,
  documentId: string,
  data: {
    title: string;
    message?: string;
    signers: { email: string; name?: string }[];
    expiresAt?: string;
  }
) {
  const primarySigner = data.signers[0];
  if (!primarySigner) throw new Error("At least one signer required");

  const request = await prisma.signatureRequest.create({
    data: {
      orgId,
      createdById,
      documentId,
      title: data.title,
      message: data.message,
      signerEmail: primarySigner.email,
      signerName: primarySigner.name,
      slug: nanoid(12),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      status: "DRAFT",
      signers: {
        create: data.signers.map((s, i) => ({
          email: s.email,
          name: s.name,
          order: i,
        })),
      },
    },
  });

  return request;
}

export async function getSignatureRequests(orgId: string) {
  return prisma.signatureRequest.findMany({
    where: { orgId },
    include: {
      document: { select: { name: true } },
      signers: { orderBy: { order: "asc" } },
      _count: { select: { fields: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSignatureRequest(id: string) {
  return prisma.signatureRequest.findUnique({
    where: { id },
    include: {
      document: {
        select: {
          name: true, fileUrl: true, pageCount: true,
          org: { select: { name: true, logoUrl: true, members: { where: { role: "OWNER" }, include: { user: { select: { email: true, name: true } } } } } },
        },
      },
      fields: { orderBy: { pageNumber: "asc" } },
      signers: { orderBy: { order: "asc" } },
      completion: true,
    },
  });
}

export async function getSignatureRequestBySlug(slug: string) {
  return prisma.signatureRequest.findUnique({
    where: { slug },
    include: {
      document: {
        select: {
          name: true, fileUrl: true, pageCount: true,
          org: { select: { name: true, logoUrl: true } },
        },
      },
      fields: { orderBy: { pageNumber: "asc" } },
      signers: { orderBy: { order: "asc" } },
      completion: true,
    },
  });
}

// ─── Fields ─────────────────────────────────────────────

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

// ─── Send ───────────────────────────────────────────────

export async function sendSignatureRequest(id: string) {
  const req = await prisma.signatureRequest.findUnique({
    where: { id },
    include: { fields: true, signers: true },
  });

  if (!req || req.fields.length === 0) {
    throw new Error("Add at least one signature field before sending");
  }

  return prisma.signatureRequest.update({
    where: { id },
    data: { status: "PENDING" },
  });
}

// ─── Complete Signature ─────────────────────────────────

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
    include: {
      fields: true,
      document: {
        include: {
          org: { include: { members: { where: { role: "OWNER" }, include: { user: true } } } },
        },
      },
      signers: { orderBy: { order: "asc" } },
    },
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

  // Update this signer's record
  await prisma.signatureSigner.updateMany({
    where: { signatureRequestId: req.id, email: data.signerEmail },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signatureImage: data.signatureImage,
      signatureMethod: data.signatureMethod,
      signerIp: data.signerIp,
    },
  });

  // Check if all signers have signed
  const updatedSigners = await prisma.signatureSigner.findMany({
    where: { signatureRequestId: req.id },
  });
  const allSigned = updatedSigners.every((s) => s.status === "SIGNED");

  // Generate audit hash
  const auditData = JSON.stringify({
    documentId: req.documentId,
    signerEmail: data.signerEmail,
    fields: data.fieldValues,
    timestamp: new Date().toISOString(),
    signatureMethod: data.signatureMethod,
  });
  const auditHash = crypto.createHash("sha256").update(auditData).digest("hex");

  // Create/update completion record
  const completion = await prisma.signatureCompletion.upsert({
    where: { signatureRequestId: req.id },
    create: {
      signatureRequestId: req.id,
      signerEmail: data.signerEmail,
      signerName: data.signerName,
      signerIp: data.signerIp,
      signatureImage: data.signatureImage,
      signatureMethod: data.signatureMethod,
      auditHash,
    },
    update: {
      signerEmail: data.signerEmail,
      signerName: data.signerName,
      auditHash,
    },
  });

  if (allSigned) {
    // All signers done — burn signatures into PDF and mark completed
    try {
      const signedFileUrl = await burnSignaturesIntoPdf(req);
      await prisma.signatureRequest.update({
        where: { id: req.id },
        data: { status: "COMPLETED", completedAt: new Date(), signedFileUrl },
      });
    } catch (err) {
      console.error("Failed to burn PDF:", err);
      await prisma.signatureRequest.update({
        where: { id: req.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }

    // Notify sender
    const owner = req.document.org?.members?.[0]?.user;
    if (owner?.email) {
      sendCompletionNotification(owner.email, owner.name || "", req.title, req.document.name, req.id).catch(console.error);
    }
  }

  return completion;
}

// ─── Burn Signatures into PDF ───────────────────────────

async function burnSignaturesIntoPdf(req: {
  id: string;
  documentId: string;
  document: { fileUrl: string; org: any };
  fields: { type: string; pageNumber: number; x: number; y: number; width: number; height: number; value: string | null }[];
  signers: { signatureImage: string | null; email: string; name: string | null }[];
}) {
  // Download the original PDF
  const pdfUrl = await getSignedViewUrl(req.document.fileUrl);
  const pdfResponse = await fetch(pdfUrl);
  const pdfBytes = await pdfResponse.arrayBuffer();

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const pages = pdfDoc.getPages();

  for (const field of req.fields) {
    const pageIndex = field.pageNumber - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const { width: pageW, height: pageH } = page.getSize();
    const x = (field.x / 100) * pageW;
    const y = pageH - (field.y / 100) * pageH - (field.height / 100) * pageH;
    const w = (field.width / 100) * pageW;
    const h = (field.height / 100) * pageH;

    if (field.type === "SIGNATURE" || field.type === "INITIALS") {
      // Find the signer's signature image
      const signer = req.signers.find((s) => s.signatureImage);
      if (signer?.signatureImage && signer.signatureImage.startsWith("data:image/png;base64,")) {
        const imageBytes = Buffer.from(signer.signatureImage.split(",")[1], "base64");
        const image = await pdfDoc.embedPng(imageBytes);
        page.drawImage(image, { x, y, width: w, height: h });
      } else if (field.value) {
        // Fallback: draw typed name
        page.drawText(field.value, {
          x: x + 4,
          y: y + h / 3,
          size: Math.min(h * 0.6, 24),
          font: italicFont,
          color: rgb(0.05, 0.05, 0.15),
        });
      }
    } else if (field.type === "DATE" && field.value) {
      page.drawText(field.value, {
        x: x + 4,
        y: y + h / 3,
        size: Math.min(h * 0.5, 12),
        font,
        color: rgb(0.2, 0.2, 0.3),
      });
    } else if (field.type === "TEXT" && field.value) {
      page.drawText(field.value, {
        x: x + 4,
        y: y + h / 3,
        size: Math.min(h * 0.5, 12),
        font,
        color: rgb(0.2, 0.2, 0.3),
      });
    } else if (field.type === "CHECKBOX" && field.value === "true") {
      page.drawText("✓", {
        x: x + w * 0.2,
        y: y + h * 0.15,
        size: Math.min(h * 0.8, 18),
        font,
        color: rgb(0.1, 0.5, 0.2),
      });
    }
  }

  // Add audit footer to last page
  const lastPage = pages[pages.length - 1];
  const { height: lh } = lastPage.getSize();
  const auditText = `Signed electronically via Peeeky | ${new Date().toISOString()} | All signatures verified`;
  lastPage.drawText(auditText, {
    x: 40,
    y: 20,
    size: 7,
    font,
    color: rgb(0.6, 0.6, 0.65),
  });

  const signedPdfBytes = await pdfDoc.save();

  // Upload signed PDF to R2
  const orgId = req.document.org?.id || "signed";
  const key = `${orgId}/signed/${req.id}.pdf`;
  await uploadFile(key, Buffer.from(signedPdfBytes), "application/pdf");

  return key;
}

// ─── Notifications ──────────────────────────────────────

async function sendCompletionNotification(
  ownerEmail: string,
  ownerName: string,
  title: string,
  docName: string,
  requestId: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com";

  await resend.emails.send({
    from: "Peeeky <onboarding@resend.dev>",
    to: ownerEmail,
    subject: `✅ Signature completed: ${title}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="padding: 24px; background: #1A1A2E; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 18px; color: white;">p<span style="color: #6C5CE7;">eee</span>ky</h1>
        </div>
        <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="margin: 0 0 12px; font-size: 18px; color: #0a0a0b;">&#9989; Signature Completed</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">
            Hi ${ownerName || "there"}, the signature request <strong>"${title}"</strong> has been completed.
          </p>
          <p style="font-size: 13px; color: #9ca3af; margin: 0 0 20px;">Document: ${docName}</p>
          <a href="${appUrl}/esignature/${requestId}" style="display: block; text-align: center; padding: 14px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 600;">
            View & Download Signed Document
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Download ───────────────────────────────────────────

export async function getSignedPdfUrl(requestId: string) {
  const req = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    select: { signedFileUrl: true, status: true },
  });

  if (!req?.signedFileUrl || req.status !== "COMPLETED") {
    return null;
  }

  return getSignedViewUrl(req.signedFileUrl);
}

export async function cancelSignatureRequest(id: string) {
  return prisma.signatureRequest.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}
