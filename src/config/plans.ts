export const PLAN_LIMITS = {
  FREE: {
    documents: 5,
    linksPerDoc: 3,
    members: 1,
    aiChatsPerMonth: 0,
    dataRetentionDays: 30,
    customDomain: false,
    removeBadge: false,
  },
  PRO: {
    documents: -1,
    linksPerDoc: -1,
    members: 3,
    aiChatsPerMonth: 50,
    dataRetentionDays: 365,
    customDomain: false,
    removeBadge: true,
  },
  BUSINESS: {
    documents: -1,
    linksPerDoc: -1,
    members: 10,
    aiChatsPerMonth: -1,
    dataRetentionDays: -1,
    customDomain: true,
    removeBadge: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
