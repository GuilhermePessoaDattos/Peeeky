import { chromium, BrowserContext, Browser } from "playwright";
import path from "path";
import fs from "fs";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const API_BASE = (process.env.PEEEKY_API_URL || "https://peeeky.com").replace("://peeeky.com", "://www.peeeky.com");
const CRON_SECRET = process.env.CRON_SECRET || "";
const COOKIES_DIR = path.join(__dirname, "..", ".playwright-cookies");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PendingAction {
  id: string;
  channel: string;
  actionType: string;
  content: string;
  hashtags?: string[];
  metadata?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------
async function loadContext(
  browser: Browser,
  platform: string
): Promise<BrowserContext> {
  const cookiePath = path.join(COOKIES_DIR, `${platform}.json`);
  const ctx = await browser.newContext();

  if (fs.existsSync(cookiePath)) {
    const raw = fs.readFileSync(cookiePath, "utf-8");
    const cookies = JSON.parse(raw);
    await ctx.addCookies(cookies);
    console.log(`[${platform}] Loaded saved cookies.`);
  } else {
    console.log(`[${platform}] No saved cookies found — fresh session.`);
  }

  return ctx;
}

async function saveContext(
  ctx: BrowserContext,
  platform: string
): Promise<void> {
  if (!fs.existsSync(COOKIES_DIR)) {
    fs.mkdirSync(COOKIES_DIR, { recursive: true });
  }
  const cookies = await ctx.cookies();
  const cookiePath = path.join(COOKIES_DIR, `${platform}.json`);
  fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
  console.log(`[${platform}] Cookies saved.`);
}

// ---------------------------------------------------------------------------
// Status reporter
// ---------------------------------------------------------------------------
async function reportStatus(
  executionId: string,
  status: "completed" | "failed",
  output: string,
  startTime: Date,
  error?: string
): Promise<void> {
  const now = new Date();
  const duration = now.getTime() - startTime.getTime();

  const body: Record<string, any> = {
    executionId,
    status,
    output,
    executedAt: startTime.toISOString(),
    completedAt: now.toISOString(),
    duration,
  };
  if (error) body.error = error;

  try {
    const res = await fetch(
      `${API_BASE}/api/cron/social-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CRON_SECRET}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      console.error(
        `[reportStatus] Failed to report for ${executionId}: ${res.status} ${res.statusText}`
      );
    }
  } catch (err) {
    console.error(`[reportStatus] Network error for ${executionId}:`, err);
  }
}

// ---------------------------------------------------------------------------
// LinkedIn publisher
// ---------------------------------------------------------------------------
async function publishLinkedIn(
  ctx: BrowserContext,
  action: PendingAction
): Promise<void> {
  const startTime = new Date();
  const page = await ctx.newPage();

  try {
    console.log(`[linkedin] Publishing action ${action.id}...`);
    await page.goto("https://www.linkedin.com/feed", {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    // Check if logged in by looking for the "Start a post" button
    const startPostBtn = page.locator(
      'button:has-text("Start a post"), button:has-text("Começar publicação")'
    );
    const isLoggedIn = await startPostBtn
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (!isLoggedIn) {
      console.log(
        "[linkedin] Not logged in. Waiting up to 120s for manual login..."
      );
      await startPostBtn.first().waitFor({ state: "visible", timeout: 120_000 });
      console.log("[linkedin] Login detected!");
    }

    // Click "Start a post"
    await startPostBtn.first().click();
    await page.waitForTimeout(2_000);

    // Find the editor and type content
    const editor = page.locator(
      'div[role="textbox"], div.ql-editor, div[contenteditable="true"]'
    );
    await editor.first().waitFor({ state: "visible", timeout: 10_000 });

    const fullContent = action.hashtags?.length
      ? `${action.content}\n\n${action.hashtags.map((h) => `#${h}`).join(" ")}`
      : action.content;

    await editor.first().fill(fullContent);
    await page.waitForTimeout(1_000);

    // Click the Post button
    const postBtn = page.locator(
      'button:has-text("Post"), button:has-text("Publicar")'
    );
    await postBtn.first().click();
    await page.waitForTimeout(3_000);

    console.log(`[linkedin] Action ${action.id} published successfully.`);
    await reportStatus(
      action.id,
      "completed",
      "LinkedIn post published successfully.",
      startTime
    );
  } catch (err: any) {
    console.error(`[linkedin] Error publishing action ${action.id}:`, err.message);
    await reportStatus(
      action.id,
      "failed",
      "Failed to publish LinkedIn post.",
      startTime,
      err.message
    );
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// Reddit publisher
// ---------------------------------------------------------------------------
async function publishReddit(
  ctx: BrowserContext,
  action: PendingAction
): Promise<void> {
  const startTime = new Date();
  const page = await ctx.newPage();

  try {
    const threadUrl = action.metadata?.threadUrl || action.metadata?.url;
    if (!threadUrl) {
      throw new Error("No thread URL provided in action metadata.");
    }

    console.log(`[reddit] Publishing comment on ${threadUrl} (action ${action.id})...`);
    await page.goto(threadUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    // Find the comment box
    const commentBox = page.locator(
      'div[contenteditable="true"][data-placeholder], div[role="textbox"], textarea[name="comment"]'
    );
    await commentBox.first().waitFor({ state: "visible", timeout: 15_000 });
    await commentBox.first().click();
    await page.waitForTimeout(500);

    await commentBox.first().fill(action.content);
    await page.waitForTimeout(1_000);

    // Click Comment button
    const commentBtn = page.locator(
      'button:has-text("Comment"), button[type="submit"]:has-text("Comment")'
    );
    await commentBtn.first().click();
    await page.waitForTimeout(3_000);

    console.log(`[reddit] Action ${action.id} comment posted successfully.`);
    await reportStatus(
      action.id,
      "completed",
      "Reddit comment posted successfully.",
      startTime
    );
  } catch (err: any) {
    console.error(`[reddit] Error publishing action ${action.id}:`, err.message);
    await reportStatus(
      action.id,
      "failed",
      "Failed to post Reddit comment.",
      startTime,
      err.message
    );
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log(`[social-publisher] Starting at ${new Date().toISOString()}`);

  // 1. Fetch pending actions
  let actions: PendingAction[];
  try {
    const url = `${API_BASE}/api/cron/social-pending`;
    console.log(`Fetching: ${url}`);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
      redirect: "manual",
    });
    if (res.status >= 300 && res.status < 400) {
      // Follow redirect manually with auth header
      const location = res.headers.get("location") || "";
      console.log(`Redirected to: ${location}`);
      const res2 = await fetch(location, {
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      actions = (await res2.json()).actions || [];
    } else if (!res.ok) {
      console.error(`Failed to fetch pending actions: ${res.status} ${res.statusText}`);
      process.exit(1);
    } else {
      const json = await res.json();
      actions = json.actions || [];
    }
  } catch (err: any) {
    console.error("Network error fetching pending actions:", err.message);
    process.exit(1);
  }

  if (!actions || actions.length === 0) {
    console.log("[social-publisher] No pending actions. Exiting.");
    process.exit(0);
  }

  console.log(`[social-publisher] Found ${actions.length} pending action(s).`);

  // 2. Separate actions by platform
  const linkedInActions = actions.filter((a) => a.channel === "linkedin");
  const redditActions = actions.filter((a) => a.channel === "reddit");

  // 3. Launch browser (headless: false so the user can see and intervene if needed)
  const browser = await chromium.launch({ headless: false });

  try {
    // 4. Process LinkedIn actions
    if (linkedInActions.length > 0) {
      console.log(`[social-publisher] Processing ${linkedInActions.length} LinkedIn action(s)...`);
      const linkedInCtx = await loadContext(browser, "linkedin");
      for (const action of linkedInActions) {
        await publishLinkedIn(linkedInCtx, action);
      }
      await saveContext(linkedInCtx, "linkedin");
      await linkedInCtx.close();
    }

    // 5. Process Reddit actions
    if (redditActions.length > 0) {
      console.log(`[social-publisher] Processing ${redditActions.length} Reddit action(s)...`);
      const redditCtx = await loadContext(browser, "reddit");
      for (const action of redditActions) {
        await publishReddit(redditCtx, action);
      }
      await saveContext(redditCtx, "reddit");
      await redditCtx.close();
    }
  } finally {
    // 6. Close browser
    await browser.close();
  }

  console.log(`[social-publisher] Done at ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error("[social-publisher] Unhandled error:", err);
  process.exit(1);
});
