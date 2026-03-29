import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Privacy/);
    await expect(page.getByText("Information We Collect")).toBeVisible();
  });

  test("terms of service page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveTitle(/Terms/);
    await expect(page.getByText("Acceptance of Terms")).toBeVisible();
  });

  test("blog page loads with posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/);
    await expect(page.getByText("Introducing Peeeky")).toBeVisible();
  });

  test("blog post page loads", async ({ page }) => {
    await page.goto("/blog/introducing-peeeky");
    await expect(page).toHaveTitle(/Introducing Peeeky/);
  });

  test("comparison page vs DocSend loads", async ({ page }) => {
    await page.goto("/vs/docsend");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("comparison page vs Google Drive loads", async ({ page }) => {
    await page.goto("/vs/google-drive");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("comparison page vs WeTransfer loads", async ({ page }) => {
    await page.goto("/vs/wetransfer");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("use case fundraising page loads", async ({ page }) => {
    await page.goto("/for/fundraising");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("use case sales page loads", async ({ page }) => {
    await page.goto("/for/sales");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("use case M&A page loads", async ({ page }) => {
    await page.goto("/for/mna");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Continue with Google")).toBeVisible();
    await expect(page.getByText("Send magic link")).toBeVisible();
  });
});
