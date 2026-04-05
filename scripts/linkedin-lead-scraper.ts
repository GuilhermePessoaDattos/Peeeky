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

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await loadContext(browser);
  const page = await ctx.newPage();

  try {
    // Check if logged in
    await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);

    const isLoggedIn = await page.$('input[aria-label="Search"]') !== null ||
                       await page.$('input[placeholder*="Search"]') !== null;

    if (!isLoggedIn) {
      console.log("Not logged in. Please log in manually in the browser window...");
      console.log("Waiting up to 2 minutes for login...\n");
      await page.waitForSelector('input[aria-label="Search"]', { timeout: 120000 });
      console.log("Login detected! Saving cookies...\n");
      await saveContext(ctx);
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

    // Save cookies for next run
    await saveContext(ctx);
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : err);
  } finally {
    await browser.close();
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

  // Extract search results
  const resultCards = await page.$$('div.entity-result__item, li.reusable-search__result-container');
  console.log(`Found ${resultCards.length} result cards on page`);

  for (const card of resultCards) {
    if (contacts.length >= limit) break;

    try {
      // Extract name
      const nameEl = await card.$('span.entity-result__title-text a span[aria-hidden="true"], span.entity-result__title-text a span:first-child');
      const name = nameEl ? (await nameEl.textContent())?.trim() || "" : "";
      if (!name || name === "LinkedIn Member") continue;

      // Extract headline (contains role + company usually)
      const headlineEl = await card.$('div.entity-result__primary-subtitle, div.entity-result__summary');
      const headline = headlineEl ? (await headlineEl.textContent())?.trim() || "" : "";

      // Extract profile URL
      const linkEl = await card.$('a.app-aware-link[href*="/in/"]');
      const profileUrl = linkEl ? (await linkEl.getAttribute("href"))?.split("?")[0] || "" : "";

      // Extract location
      const locationEl = await card.$('div.entity-result__secondary-subtitle');
      const location = locationEl ? (await locationEl.textContent())?.trim() || "" : "";

      // Parse company and role from headline
      const { company, role } = parseHeadline(headline, name);

      if (!company) continue;

      contacts.push({
        name: cleanName(name),
        headline,
        company,
        role,
        profileUrl,
        location,
        website: null,
        email: null,
      });

      console.log(`  [${contacts.length}/${limit}] ${cleanName(name)} — ${role} @ ${company}`);
    } catch {
      continue;
    }
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
    const res = await fetch(`${API_BASE}/api/admin/gtm/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CRON_SECRET}`,
      },
      body: JSON.stringify({
        name: contact.name,
        email,
        company: contact.company,
        role: contact.role,
        source: "linkedin",
        notes: `LinkedIn: ${contact.profileUrl}\nHeadline: ${contact.headline}\nLocation: ${contact.location}${contact.website ? `\nWebsite: ${contact.website}` : ""}`,
      }),
    });

    if (res.status === 409) {
      return { saved: false, reason: "already exists" };
    }

    if (!res.ok) {
      const body = await res.text();
      return { saved: false, reason: `API error ${res.status}: ${body.substring(0, 100)}` };
    }

    return { saved: true };
  } catch (err) {
    return { saved: false, reason: err instanceof Error ? err.message : String(err) };
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
