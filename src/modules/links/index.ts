import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function createLink(orgId: string, documentId: string, name?: string) {
  // Verify document belongs to org
  const doc = await prisma.document.findFirst({
    where: { id: documentId, orgId },
  });
  if (!doc) throw new Error("Document not found");

  return prisma.link.create({
    data: {
      slug: nanoid(8),
      documentId,
      name: name || null,
    },
  });
}

export async function getLinks(orgId: string, documentId: string) {
  // Verify document belongs to org
  const doc = await prisma.document.findFirst({
    where: { id: documentId, orgId },
  });
  if (!doc) throw new Error("Document not found");

  return prisma.link.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { views: true } },
    },
  });
}

export async function toggleLink(orgId: string, linkId: string) {
  const link = await prisma.link.findFirst({
    where: { id: linkId, document: { orgId } },
  });
  if (!link) throw new Error("Link not found");

  return prisma.link.update({
    where: { id: linkId },
    data: { isActive: !link.isActive },
  });
}

export async function deleteLink(orgId: string, linkId: string) {
  const link = await prisma.link.findFirst({
    where: { id: linkId, document: { orgId } },
  });
  if (!link) throw new Error("Link not found");

  return prisma.link.delete({ where: { id: linkId } });
}

export async function getLinkBySlug(slug: string) {
  return prisma.link.findUnique({
    where: { slug },
    include: {
      document: {
        include: {
          org: { select: { name: true, logoUrl: true, brandColor: true, plan: true } },
        },
      },
    },
  });
}

export async function updateLink(
  orgId: string,
  linkId: string,
  data: {
    name?: string;
    password?: string | null;
    requireEmail?: boolean;
    allowDownload?: boolean;
    enableWatermark?: boolean;
    enableAIChat?: boolean;
    expiresAt?: Date | null;
    maxViews?: number | null;
  }
) {
  const link = await prisma.link.findFirst({
    where: { id: linkId, document: { orgId } },
  });
  if (!link) throw new Error("Link not found");

  // Hash password if provided
  let hashedPassword = undefined;
  if (data.password !== undefined) {
    if (data.password === null || data.password === "") {
      hashedPassword = null;
    } else {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(data.password, 12);
    }
  }

  return prisma.link.update({
    where: { id: linkId },
    data: {
      name: data.name,
      password: hashedPassword !== undefined ? hashedPassword : undefined,
      requireEmail: data.requireEmail,
      allowDownload: data.allowDownload,
      enableWatermark: data.enableWatermark,
      enableAIChat: data.enableAIChat,
      expiresAt: data.expiresAt,
      maxViews: data.maxViews,
    },
  });
}

export async function verifyLinkPassword(linkId: string, password: string): Promise<boolean> {
  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link?.password) return true;
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, link.password);
}
