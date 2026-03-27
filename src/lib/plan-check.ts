import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { PLAN_LIMITS, PlanType } from "@/config/plans";

interface PlanCheckResult {
  allowed: boolean;
  limit: number;
  current: number;
  message?: string;
}

export async function checkPlanLimit(
  orgId: string,
  feature: "documents" | "linksPerDoc" | "members" | "aiChatsPerMonth"
): Promise<PlanCheckResult> {
  // Cache plan in Redis (5 min TTL)
  const cacheKey = `plan:${orgId}`;
  let plan = await redis.get<string>(cacheKey);

  if (!plan) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });
    plan = org?.plan || "FREE";
    await redis.set(cacheKey, plan, { ex: 300 });
  }

  const limits = PLAN_LIMITS[plan as PlanType];
  const limit = limits[feature];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, current: 0 };
  }

  let current = 0;

  switch (feature) {
    case "documents":
      current = await prisma.document.count({ where: { orgId } });
      break;
    case "members":
      current = await prisma.membership.count({ where: { orgId } });
      break;
    case "aiChatsPerMonth": {
      // Track AI chats per month in Redis
      const monthKey = `ai_chats:${orgId}:${new Date().toISOString().slice(0, 7)}`;
      current = (await redis.get<number>(monthKey)) || 0;
      break;
    }
    case "linksPerDoc":
      // This needs documentId, handled separately
      return { allowed: true, limit, current: 0 };
  }

  const allowed = current < limit;
  return {
    allowed,
    limit,
    current,
    message: allowed
      ? undefined
      : `You've reached the limit of ${limit} ${feature} on the ${plan} plan. Upgrade for more.`,
  };
}

export async function checkLinksPerDoc(
  orgId: string,
  documentId: string
): Promise<PlanCheckResult> {
  const cacheKey = `plan:${orgId}`;
  let plan = await redis.get<string>(cacheKey);

  if (!plan) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });
    plan = org?.plan || "FREE";
    await redis.set(cacheKey, plan, { ex: 300 });
  }

  const limits = PLAN_LIMITS[plan as PlanType];
  const limit = limits.linksPerDoc;

  if (limit === -1) return { allowed: true, limit: -1, current: 0 };

  const current = await prisma.link.count({ where: { documentId } });
  const allowed = current < limit;

  return {
    allowed,
    limit,
    current,
    message: allowed
      ? undefined
      : `You've reached the limit of ${limit} links per document on the ${plan} plan.`,
  };
}

export async function incrementAIChat(orgId: string): Promise<void> {
  const monthKey = `ai_chats:${orgId}:${new Date().toISOString().slice(0, 7)}`;
  await redis.incr(monthKey);
  // Set expiry to end of month + 1 day
  await redis.expire(monthKey, 60 * 60 * 24 * 32);
}

export async function getOrgPlan(orgId: string): Promise<PlanType> {
  const cacheKey = `plan:${orgId}`;
  let plan = await redis.get<string>(cacheKey);
  if (!plan) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });
    plan = org?.plan || "FREE";
    await redis.set(cacheKey, plan, { ex: 300 });
  }
  return plan as PlanType;
}
