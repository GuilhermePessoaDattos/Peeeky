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
      document: true,
    },
  });
}
