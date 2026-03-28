import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getOrgMembers(orgId: string) {
  return prisma.membership.findMany({
    where: { orgId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function inviteMember(orgId: string, email: string, role: "ADMIN" | "MEMBER", inviterName: string) {
  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Create user placeholder
    user = await prisma.user.create({
      data: { email },
    });
  }

  // Check if already a member
  const existing = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (existing) throw new Error("User is already a member");

  // Create membership
  const membership = await prisma.membership.create({
    data: {
      userId: user.id,
      orgId,
      role,
    },
  });

  // Get org name
  const org = await prisma.organization.findUnique({ where: { id: orgId } });

  // Send invite email
  try {
    await resend.emails.send({
      from: "Peeeky <notifications@peeeky.com>",
      to: email,
      subject: `You've been invited to ${org?.name || "a workspace"} on Peeeky`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="padding: 24px; background: #1A1A2E; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 18px; color: white;">p<span style="color: #6C5CE7;">eee</span>ky</h1>
          </div>
          <div style="padding: 24px; background: white; border: 1px solid #E8E8F0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="margin: 0 0 16px; font-size: 16px; color: #1A1A2E;">You've been invited!</h2>
            <p style="font-size: 14px; color: #4A4A68;">${inviterName} invited you to join <strong>${org?.name || "a workspace"}</strong> on Peeeky as ${role === "ADMIN" ? "an Admin" : "a Member"}.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/documents" style="display: block; text-align: center; padding: 12px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 16px;">
              Open Workspace
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send invite email:", error);
  }

  return membership;
}

export async function removeMember(orgId: string, userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });

  if (!membership) throw new Error("Membership not found");
  if (membership.role === "OWNER") throw new Error("Cannot remove the owner");

  return prisma.membership.delete({
    where: { userId_orgId: { userId, orgId } },
  });
}

export async function updateMemberRole(orgId: string, userId: string, role: "ADMIN" | "MEMBER") {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });

  if (!membership) throw new Error("Membership not found");
  if (membership.role === "OWNER") throw new Error("Cannot change owner role");

  return prisma.membership.update({
    where: { userId_orgId: { userId, orgId } },
    data: { role },
  });
}

export async function updateOrganization(orgId: string, data: { name?: string }) {
  return prisma.organization.update({
    where: { id: orgId },
    data,
  });
}
