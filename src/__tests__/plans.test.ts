import { describe, it, expect } from "vitest";
import { PLAN_LIMITS } from "@/config/plans";

describe("PLAN_LIMITS", () => {
  it("FREE plan has strict limits", () => {
    expect(PLAN_LIMITS.FREE.documents).toBe(5);
    expect(PLAN_LIMITS.FREE.linksPerDoc).toBe(3);
    expect(PLAN_LIMITS.FREE.members).toBe(1);
    expect(PLAN_LIMITS.FREE.aiChatsPerMonth).toBe(0);
    expect(PLAN_LIMITS.FREE.customDomain).toBe(false);
    expect(PLAN_LIMITS.FREE.removeBadge).toBe(false);
  });

  it("PRO plan has higher limits", () => {
    expect(PLAN_LIMITS.PRO.documents).toBe(-1); // unlimited
    expect(PLAN_LIMITS.PRO.linksPerDoc).toBe(-1);
    expect(PLAN_LIMITS.PRO.members).toBe(3);
    expect(PLAN_LIMITS.PRO.aiChatsPerMonth).toBe(50);
    expect(PLAN_LIMITS.PRO.removeBadge).toBe(true);
  });

  it("BUSINESS plan is fully unlimited", () => {
    expect(PLAN_LIMITS.BUSINESS.documents).toBe(-1);
    expect(PLAN_LIMITS.BUSINESS.linksPerDoc).toBe(-1);
    expect(PLAN_LIMITS.BUSINESS.members).toBe(10);
    expect(PLAN_LIMITS.BUSINESS.aiChatsPerMonth).toBe(-1);
    expect(PLAN_LIMITS.BUSINESS.customDomain).toBe(true);
    expect(PLAN_LIMITS.BUSINESS.removeBadge).toBe(true);
  });

  it("each plan has all required fields", () => {
    const requiredFields = [
      "documents",
      "linksPerDoc",
      "members",
      "aiChatsPerMonth",
      "dataRetentionDays",
      "customDomain",
      "removeBadge",
    ];

    for (const plan of Object.values(PLAN_LIMITS)) {
      for (const field of requiredFields) {
        expect(plan).toHaveProperty(field);
      }
    }
  });
});
