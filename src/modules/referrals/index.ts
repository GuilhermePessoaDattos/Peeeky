import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) return user.referralCode;

  const code = nanoid(8);
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

export async function createReferral(
  referralCode: string,
  referredOrgId: string
) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });

  if (!referrer) return null;

  // Don't create duplicate referrals
  const existing = await prisma.referral.findUnique({
    where: { referredOrgId },
  });
  if (existing) return existing;

  return prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredOrgId,
      code: referralCode,
      status: "PENDING",
    },
  });
}

export async function activateReferral(referredOrgId: string) {
  return prisma.referral.updateMany({
    where: { referredOrgId, status: "PENDING" },
    data: { status: "ACTIVE" },
  });
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referredOrg: {
        select: { name: true, plan: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = referrals.length;
  const active = referrals.filter((r) => r.status === "ACTIVE").length;
  const pending = referrals.filter((r) => r.status === "PENDING").length;

  return { referrals, total, active, pending };
}
