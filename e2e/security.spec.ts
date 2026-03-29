import { test, expect } from "@playwright/test";

test.describe("Security", () => {
  test("SSRF: import-url blocks internal IPs", async ({ request }) => {
    const internalUrls = [
      "http://169.254.169.254/latest/meta-data",
      "http://localhost:3000",
      "http://127.0.0.1:6379",
      "http://10.0.0.1",
      "http://192.168.1.1",
    ];

    for (const url of internalUrls) {
      const res = await request.post("/api/documents/import-url", {
        data: { url, fileName: "test.pdf" },
      });
      expect(res.status()).not.toBe(200);
    }
  });

  test("password verify rate limits after 5 attempts", async ({ request }) => {
    const responses = [];
    for (let i = 0; i < 7; i++) {
      const res = await request.post("/api/links/fake-link-id/verify", {
        data: { password: "wrong" },
      });
      responses.push(res.status());
    }
    expect(responses).toContain(429);
  });

  test("admin API not accessible without auth", async ({ request }) => {
    const res = await request.get("/api/admin/stats", { maxRedirects: 0 });
    // Should redirect or return error — never return stats data
    expect(res.status()).not.toBe(200);
  });

  test("webhook rejects without signature", async ({ request }) => {
    const res = await request.post("/api/webhooks/stripe", {
      data: JSON.stringify({ type: "checkout.session.completed" }),
      headers: { "Content-Type": "text/plain" },
    });
    expect(res.status()).toBe(400);
  });

  test("cron endpoints reject without secret", async ({ request }) => {
    const endpoints = ["/api/cron/cleanup", "/api/cron/refresh-analytics", "/api/cron/signature-reminders"];
    for (const endpoint of endpoints) {
      const res = await request.get(endpoint);
      expect(res.status()).toBe(401);
    }
  });
});
