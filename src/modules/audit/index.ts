import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function logAudit(
  orgId: string,
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditEvent.create({
      data: {
        orgId,
        userId,
        action,
        resourceType,
        resourceId,
        metadata: (metadata as Prisma.InputJsonValue) || undefined,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
