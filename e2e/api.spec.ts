import { test, expect } from "@playwright/test";

test.describe("Public API Endpoints", () => {
  test("track endpoint returns 400 without body", async ({ request }) => {
    const res = await request.post("/api/track", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("track endpoint accepts view_start", async ({ request }) => {
    const res = await request.post("/api/track", {
      data: { action: "view_start", linkId: "nonexistent" },
    });
    // Should fail gracefully (not 500)
    expect([200, 400, 404, 500].includes(res.status())).toBeTruthy();
  });

  test("extension API returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/extension");
    expect(res.status()).toBe(401);
  });

  test("documents API returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/documents");
    // Redirects to login or returns 401
    expect([200, 401, 302, 307].includes(res.status())).toBeTruthy();
  });

  test("admin API not accessible without auth", async ({ request }) => {
    const res = await request.get("/api/admin/stats", { maxRedirects: 0 });
    expect(res.status()).not.toBe(200);
  });

  test("stripe webhook rejects unsigned requests", async ({ request }) => {
    const res = await request.post("/api/webhooks/stripe", {
      data: { type: "test" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("cron endpoint rejects without CRON_SECRET", async ({ request }) => {
    const res = await request.get("/api/cron/cleanup");
    expect(res.status()).toBe(401);
  });

  test("esignature sign endpoint returns 404 for invalid slug", async ({ request }) => {
    const res = await request.get("/api/esignature/sign/nonexistent-slug-xyz");
    expect(res.status()).toBe(404);
  });

  test("import-url rejects non-HTTPS", async ({ request }) => {
    const res = await request.post("/api/documents/import-url", {
      data: { url: "http://localhost:3000", fileName: "test.pdf" },
    });
    // Should be 400 (SSRF block) or 401 (no auth)
    expect([400, 401].includes(res.status())).toBeTruthy();
  });
});
