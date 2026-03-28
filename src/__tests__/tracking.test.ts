import { describe, it, expect } from "vitest";
import { computeEngagementScore, getScoreColor, getScoreLabel } from "@/modules/tracking";

describe("computeEngagementScore", () => {
  it("returns 0 for a view with no engagement", () => {
    const view = {
      duration: 0,
      completionRate: 0,
      pageViews: [],
    };
    expect(computeEngagementScore(view)).toBe(0);
  });

  it("returns 100 for perfect engagement", () => {
    const view = {
      duration: 120, // 2 minutes = max normalized time
      completionRate: 1, // 100% completion
      pageViews: [
        { pageNumber: 1, duration: 10 },
        { pageNumber: 2, duration: 10 },
        { pageNumber: 3, duration: 10 },
      ],
    };
    // completion: 1 * 40 = 40
    // time: min(120/120, 1) * 30 = 30
    // depth: 3/3 pages with >5s = 30
    expect(computeEngagementScore(view)).toBe(100);
  });

  it("handles partial engagement correctly", () => {
    const view = {
      duration: 60, // 1 minute = 50% of max time
      completionRate: 0.5,
      pageViews: [
        { pageNumber: 1, duration: 10 },
        { pageNumber: 2, duration: 2 }, // less than 5s, not deep
      ],
    };
    // completion: 0.5 * 40 = 20
    // time: min(60/120, 1) * 30 = 15
    // depth: 1/2 deep pages * 30 = 15
    expect(computeEngagementScore(view)).toBe(50);
  });

  it("caps time contribution at 30", () => {
    const view = {
      duration: 600, // 10 minutes, way over max
      completionRate: 0,
      pageViews: [],
    };
    // completion: 0
    // time: min(600/120, 1) * 30 = 30 (capped)
    // depth: 0
    expect(computeEngagementScore(view)).toBe(30);
  });

  it("handles empty pageViews for depth", () => {
    const view = {
      duration: 0,
      completionRate: 1,
      pageViews: [],
    };
    // completion: 40, time: 0, depth: 0/0 = 0
    expect(computeEngagementScore(view)).toBe(40);
  });
});

describe("getScoreColor", () => {
  it("returns green for high scores", () => {
    expect(getScoreColor(70)).toBe("#00B894");
    expect(getScoreColor(100)).toBe("#00B894");
  });

  it("returns yellow for medium scores", () => {
    expect(getScoreColor(30)).toBe("#FDCB6E");
    expect(getScoreColor(69)).toBe("#FDCB6E");
  });

  it("returns red for low scores", () => {
    expect(getScoreColor(0)).toBe("#E17055");
    expect(getScoreColor(29)).toBe("#E17055");
  });
});

describe("getScoreLabel", () => {
  it("returns correct labels", () => {
    expect(getScoreLabel(80)).toBe("High");
    expect(getScoreLabel(50)).toBe("Medium");
    expect(getScoreLabel(10)).toBe("Low");
  });
});
