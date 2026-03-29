import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("unauthenticated user is redirected to login from dashboard", async ({ page }) => {
    await page.goto("/documents");
    await page.waitForURL(/\/login/);
    await expect(page.getByText("Continue with Google")).toBeVisible();
  });

  test("unauthenticated user is redirected from settings", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL(/\/login/);
  });

  test("unauthenticated user is redirected from esignature", async ({ page }) => {
    await page.goto("/esignature");
    await page.waitForURL(/\/login/);
  });

  test("unauthenticated user is redirected from datarooms", async ({ page }) => {
    await page.goto("/datarooms");
    await page.waitForURL(/\/login/);
  });

  test("unauthenticated user is redirected from admin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/);
  });

  test("login page has Google OAuth button", async ({ page }) => {
    await page.goto("/login");
    const googleBtn = page.getByText("Continue with Google");
    await expect(googleBtn).toBeVisible();
  });

  test("login page has magic link email input", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("blocked page is accessible", async ({ page }) => {
    await page.goto("/blocked");
    await expect(page.locator("h1")).toContainText("Blocked");
  });
});
