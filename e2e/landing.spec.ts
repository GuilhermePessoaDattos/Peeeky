import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads homepage with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Peeeky/);
  });

  test("shows hero section with headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Share documents");
  });

  test("shows navigation with links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav").getByText("Features")).toBeVisible();
    await expect(page.locator("nav").getByText("Pricing")).toBeVisible();
    await expect(page.locator("nav").getByText("FAQ")).toBeVisible();
  });

  test("shows pricing section with 3 plans", async ({ page }) => {
    await page.goto("/#pricing");
    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("$39")).toBeVisible();
    await expect(page.getByText("$129")).toBeVisible();
  });

  test("Get Started button links to login", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /get started/i }).first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toContain("/login");
  });

  test("footer has legal links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /privacy/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /terms/i })).toBeVisible();
  });
});
