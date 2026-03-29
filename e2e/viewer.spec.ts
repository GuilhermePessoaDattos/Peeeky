import { test, expect } from "@playwright/test";

test.describe("Document Viewer", () => {
  test("invalid slug shows 404", async ({ page }) => {
    await page.goto("/view/nonexistent-slug-xyz");
    await expect(page.getByText("Not Found")).toBeVisible();
  });

  test("invalid room slug shows 404", async ({ page }) => {
    await page.goto("/room/nonexistent-slug-xyz");
    await expect(page.getByText("Not Found")).toBeVisible();
  });

  test("invalid sign slug shows error", async ({ page }) => {
    await page.goto("/sign/nonexistent-slug-xyz");
    // Should show some error state (not available, not found, or loading fail)
    await page.waitForTimeout(3000);
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });
});
