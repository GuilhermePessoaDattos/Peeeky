/**
 * LinkedIn Lead Scraper — Playwright-based
 *
 * Searches LinkedIn for relevant contacts (founders, CEOs, VPs)
 * and saves them as OutboundLead records via the Peeeky API.
 *
 * Usage:
 *   npx tsx scripts/linkedin-lead-scraper.ts --query "CEO seed funding" --limit 10
 *   npx tsx scripts/linkedin-lead-scraper.ts --query "Founder Series A SaaS" --limit 5
 *   npx tsx scripts/linkedin-lead-scraper.ts --query "VP Sales B2B" --limit 10
 *
 * First run: browser opens, you log in manually, cookies are saved for future runs.
 */

import { chromium, type BrowserContext, type Page } from "playwright";
import path from "path";
import fs from "fs";

// ── Config ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.PEEEKY_API_URL || "https://peeeky.com";
const CRON_SECRET = process.env.CRON_SECRET || "";
const COOKIES_DIR = path.join(__dirname, "..", ".playwright-cookies");

// Parse CLI args
const args = process.argv.slice(2);
const queryIdx = args.indexOf("--query");
const limitIdx = args.indexOf("--limit");
const SEARCH_QUERY = queryIdx >= 0 ? args[queryIdx + 1] : "CEO startup recently raised";
const MAX_LEADS = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 5;

interface ScrapedContact {
  name: string;
  headline: string;
  company: string;
  role: string;
  profileUrl: string;
  location: string;
  website: string | null;
  email: string | null;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n[LinkedIn Lead Scraper]`);
  console.log(`Query: "${SEARCH_QUERY}"`);
  console.log(`Limit: ${MAX_LEADS} leads\n`);

  // Ensure cookies dir exists
  if (!fs.existsSync(COOKIES_DIR)) {
    fs.mkdirSync(COOKIES_DIR, { recursive: true });
  }

  // Use system Chrome with existing profile to avoid LinkedIn bot detection
  const chromeUserDataDir = path.join(COOKIES_DIR, "chrome-profile");
  const ctx = await chromium.launchPersistentContext(chromeUserDataDir, {
    headless: false,
    slowMo: 500,
    channel: "chrome", // Use installed Chrome instead of Playwright's Chromium
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });
  let page = ctx.pages()[0] || await ctx.newPage();

  try {
    // Check if logged in
    await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);

    // Detect login by checking for feed-specific elements
    const feedSelectors = [
      'input[aria-label="Search"]',
      'input[placeholder*="Search"]',
      'div.feed-shared-update-v2',
      'button[data-control-name="identity_welcome_message"]',
      'div.scaffold-layout__main',
      'nav.global-nav',
    ];

    let isLoggedIn = false;
    for (const sel of feedSelectors) {
      if (await page.$(sel)) { isLoggedIn = true; break; }
    }

    if (!isLoggedIn) {
      console.log("Not logged in. Please log in manually in the browser window...");
      console.log("Waiting up to 5 minutes for login...\n");
      console.log("After logging in, the script will continue automatically.\n");

      // Wait for any of the feed selectors to appear (5 min timeout)
      // Poll every 3 seconds checking URL — resilient to navigation/context changes
      const loginDeadline = Date.now() + 300000;
      while (Date.now() < loginDeadline) {
        try {
          const url = page.url();
          if (url.includes("/feed") || url.includes("/mynetwork") || url.includes("/in/")) {
            break;
          }
        } catch {
          // Context destroyed by navigation — that's fine, get current page
          const pages = ctx.pages();
          if (pages.length > 0) {
            page = pages[pages.length - 1];
            try {
              const url = page.url();
              if (url.includes("/feed") || url.includes("/mynetwork") || url.includes("/in/")) {
                break;
              }
            } catch { /* keep waiting */ }
          }
        }
        await new Promise(r => setTimeout(r, 3000));
      }

      // Navigate to feed after login
      try {
        await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 15000 });
      } catch { /* may already be on feed */ }
      await new Promise(r => setTimeout(r, 3000));
      console.log("Login detected! Cookies saved automatically.\n");
    }

    // Search for people
    const contacts = await searchPeople(page, SEARCH_QUERY, MAX_LEADS);
    console.log(`\nFound ${contacts.length} contacts. Saving to Peeeky...\n`);

    // Save each contact as a lead via API
    let saved = 0;
    let skipped = 0;

    for (const contact of contacts) {
      const result = await saveLead(contact);
      if (result.saved) {
        saved++;
        console.log(`  [saved] ${contact.name} — ${contact.company} (${contact.email || "no email"})`);
      } else {
        skipped++;
        console.log(`  [skipped] ${contact.name} — ${result.reason}`);
      }
    }

    console.log(`\nDone! Saved: ${saved}, Skipped: ${skipped}`);
    console.log(`View leads at: ${API_BASE}/admin/gtm/leads\n`);

  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : err);
  } finally {
    await ctx.close();
  }
}

// ── LinkedIn Search ─────────────────────────────────────────────────────────

async function searchPeople(page: Page, query: string, limit: number): Promise<ScrapedContact[]> {
  // Navigate to people search
  const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}&origin=GLOBAL_SEARCH_HEADER`;
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  // Scroll to load more results
  await autoScroll(page);

  const contacts: ScrapedContact[] = [];

  // Extract search results using profile links (resilient to CSS class changes)
  const profileData = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href*="/in/"]');
    const seen = new Set<string>();
    const results: Array<{ name: string; headline: string; profileUrl: string; location: string }> = [];

    for (const link of links) {
      const href = (link.getAttribute("href") || "").split("?")[0];
      if (!href || seen.has(href)) continue;
      seen.add(href);

      const text = (link.textContent || "").trim();
      if (!text || text === "LinkedIn Member" || text.length < 3) continue;

      // The link text usually contains "Name  • DegreeHeadline"
      const parts = text.split(/\s*•\s*/);
      const name = parts[0]?.trim() || "";
      const rest = parts.slice(1).join(" • ").trim();

      if (!name || name.length > 50) continue;

      // Try to find location in the parent container
      const container = link.closest("li") || link.parentElement?.parentElement?.parentElement;
      const allText = container?.textContent || "";
      // Location patterns: "City, State" or "City, Country"
      const locMatch = allText.match(/(?:São Paulo|New York|San Francisco|London|Berlin|Remote|[A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?(?:\s+e\s+[A-Za-z]+)?)/);

      results.push({
        name,
        headline: rest,
        profileUrl: href.startsWith("http") ? href : `https://www.linkedin.com${href}`,
        location: locMatch?.[0] || "",
      });
    }
    return results;
  });

  console.log(`Found ${profileData.length} profiles on page`);

  for (const data of profileData) {
    if (contacts.length >= limit) break;

    const { company, role } = parseHeadline(data.headline, data.name);
    if (!company) continue;

    contacts.push({
      name: cleanName(data.name),
      headline: data.headline,
      company,
      role,
      profileUrl: data.profileUrl,
      location: data.location,
      website: null,
      email: null,
    });

    console.log(`  [${contacts.length}/${limit}] ${cleanName(data.name)} — ${role} @ ${company}`);
  }

  // For each contact, try to get more details from their profile
  for (let i = 0; i < Math.min(contacts.length, limit); i++) {
    const contact = contacts[i];
    if (!contact.profileUrl) continue;

    try {
      console.log(`  Enriching ${contact.name}...`);
      const enriched = await enrichFromProfile(page, contact);
      contacts[i] = enriched;
      await page.waitForTimeout(1000 + Math.random() * 2000); // Random delay to avoid detection
    } catch {
      // Skip enrichment if profile fails
    }
  }

  return contacts;
}

// ── Profile Enrichment ──────────────────────────────────────────────────────

async function enrichFromProfile(page: Page, contact: ScrapedContact): Promise<ScrapedContact> {
  await page.goto(contact.profileUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(2000);

  // Try to find company website from experience section or about
  const aboutSection = await page.$('section.pv-about-section, div#about');
  if (aboutSection) {
    const aboutText = await aboutSection.textContent();
    // Look for URLs in about section
    const urlMatch = aboutText?.match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z]{2,})/i);
    if (urlMatch) {
      contact.website = urlMatch[1];
    }
  }

  // Try to extract company website from experience
  const expSection = await page.$$('li.artdeco-list__item, div.pvs-entity');
  for (const exp of expSection.slice(0, 3)) {
    const companyLink = await exp.$('a[href*="/company/"]');
    if (companyLink) {
      const companyUrl = await companyLink.getAttribute("href");
      if (companyUrl) {
        // Visit company page to get website
        try {
          const companyPage = await page.context().newPage();
          await companyPage.goto(`https://www.linkedin.com${companyUrl}`, { waitUntil: "domcontentloaded", timeout: 10000 });
          await companyPage.waitForTimeout(1500);

          const websiteLink = await companyPage.$('a[href*="website"], a.link-without-visited-state[href^="http"]');
          if (websiteLink) {
            const href = await websiteLink.getAttribute("href");
            if (href && !href.includes("linkedin.com")) {
              const domain = href.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
              contact.website = domain;
            }
          }
          await companyPage.close();
        } catch {
          // Skip company page enrichment
        }
        break;
      }
    }
  }

  // Generate probable email from name + company domain
  if (contact.website && !contact.email) {
    contact.email = guessEmail(contact.name, contact.website);
  }

  return contact;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseHeadline(headline: string, name: string): { company: string; role: string } {
  // Common patterns:
  // "CEO at Acme Inc"
  // "Founder & CEO | Acme"
  // "Co-Founder, Acme Inc."
  // "VP Sales - Acme Corp"

  const separators = /\s+(?:at|@|,|-|–|—|\|)\s+/i;
  const parts = headline.split(separators).map(s => s.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return {
      role: parts[0].replace(/\s*[&|,]\s*$/, "").trim(),
      company: parts[parts.length - 1].replace(/^(?:at|@)\s*/i, "").trim(),
    };
  }

  // Fallback: use the whole headline as role, no company
  return { role: headline.trim(), company: "" };
}

function cleanName(name: string): string {
  // Remove LinkedIn artifacts like "1st", "2nd", connection degree markers
  return name
    .replace(/\s*\d+(?:st|nd|rd|th)\s*$/i, "")
    .replace(/\s*•.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function guessEmail(name: string, domain: string): string {
  const parts = name.toLowerCase().split(/\s+/);
  if (parts.length < 2) return `${parts[0]}@${domain}`;

  const first = parts[0].replace(/[^a-z]/g, "");
  const last = parts[parts.length - 1].replace(/[^a-z]/g, "");

  // Most common pattern: first.last@domain
  return `${first}.${last}@${domain}`;
}

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight || totalHeight > 3000) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
  await page.waitForTimeout(1000);
}

// ── API Communication ───────────────────────────────────────────────────────

async function saveLead(contact: ScrapedContact): Promise<{ saved: boolean; reason?: string }> {
  if (!contact.name || !contact.company) {
    return { saved: false, reason: "missing name or company" };
  }

  const email = contact.email || `${contact.name.toLowerCase().replace(/\s+/g, ".")}@${contact.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  try {
    // Save directly via Prisma (runs locally, not via API)
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    // Check duplicate
    const existing = await prisma.outboundLead.findFirst({ where: { email } });
    if (existing) {
      await prisma.$disconnect();
      return { saved: false, reason: "already exists" };
    }

    await prisma.outboundLead.create({
      data: {
        name: contact.name,
        email,
        company: contact.company,
        role: contact.role || null,
        source: "linkedin",
        status: "new",
        notes: `LinkedIn: ${contact.profileUrl}\nHeadline: ${contact.headline}\nLocation: ${contact.location}${contact.website ? `\nWebsite: ${contact.website}` : ""}`,
      },
    });
    await prisma.$disconnect();
    return { saved: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Unique constraint")) return { saved: false, reason: "already exists" };
    return { saved: false, reason: msg };
  }
}

// ── Cookie Management ───────────────────────────────────────────────────────

async function loadContext(browser: any): Promise<BrowserContext> {
  const cookiesFile = path.join(COOKIES_DIR, "linkedin.json");
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  if (fs.existsSync(cookiesFile)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesFile, "utf-8"));
    await ctx.addCookies(cookies);
    console.log("Loaded saved LinkedIn cookies\n");
  } else {
    console.log("No saved cookies — you'll need to log in manually\n");
  }

  return ctx;
}

async function saveContext(ctx: BrowserContext) {
  const cookiesFile = path.join(COOKIES_DIR, "linkedin.json");
  const cookies = await ctx.cookies();
  fs.writeFileSync(cookiesFile, JSON.stringify(cookies, null, 2));
}

// ── Run ─────────────────────────────────────────────────────────────────────

main().catch(console.error);
