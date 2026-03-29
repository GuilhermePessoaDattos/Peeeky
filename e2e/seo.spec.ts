import { test, expect } from "@playwright/test";

test.describe("SEO & Meta", () => {
  test("homepage has correct OG meta tags", async ({ page }) => {
    await page.goto("/");
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toContain("Peeeky");
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute("content");
    expect(ogDesc).toBeTruthy();
  });

  test("sitemap.xml is accessible", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("peeeky.com");
    expect(body).toContain("/privacy");
    expect(body).toContain("/terms");
    expect(body).toContain("/blog");
    expect(body).toContain("/vs/docsend");
  });

  test("robots.txt is accessible", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Sitemap");
  });

  test("blog post has article OG type", async ({ page }) => {
    await page.goto("/blog/introducing-peeeky");
    const ogType = await page.locator('meta[property="og:type"]').getAttribute("content");
    expect(ogType).toBe("article");
  });
});
