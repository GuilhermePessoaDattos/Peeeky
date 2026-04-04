import { prisma } from "@/lib/prisma";

interface ScrapedLead {
  name: string;
  company: string;
  email: string;
  fundingRound: string | null;
  fundingAmount: string | null;
  source: string;
}

const TECHCRUNCH_FEED_URL =
  "https://techcrunch.com/category/fundraise/feed/";

/**
 * Parse funding details from a TechCrunch RSS item title.
 * Typical patterns:
 *   "Acme raises $5M Series A"
 *   "FooBar raises $120M in a Series B round"
 *   "WidgetCo raises $2.5M Seed round"
 *   "StartupX raises $500K Pre-Seed"
 */
function parseFundingTitle(title: string): {
  company: string;
  fundingAmount: string | null;
  fundingRound: string | null;
} {
  const roundPattern =
    /(.+?)\s+raises?\s+(\$[\d.]+[MmBbKk]?)\s+(?:in\s+(?:a|an)\s+)?(?:(\bPre-Seed\b|\bSeed\b|\bSeries\s+[A-Z]\b))?/i;

  const match = title.match(roundPattern);

  if (match) {
    return {
      company: match[1].trim(),
      fundingAmount: match[2] || null,
      fundingRound: match[3] || null,
    };
  }

  // Fallback: try to extract just the company name (first segment before common verbs)
  const fallbackCompany = title.split(/\s+(raises?|secures?|closes?|gets?)\s+/i)[0]?.trim();
  return {
    company: fallbackCompany || title.trim(),
    fundingAmount: null,
    fundingRound: null,
  };
}

/**
 * Convert a company name into a URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract text content between XML tags (simple parser for RSS items).
 */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.+?)\\]\\]></${tag}>|<${tag}[^>]*>(.+?)</${tag}>`, "s");
  const match = xml.match(regex);
  return (match?.[1] ?? match?.[2] ?? "").trim();
}

/**
 * Scrape recent funding rounds from TechCrunch RSS feed.
 * Parses each item to extract company name, funding amount, and round type.
 */
export async function scrapeRecentFunding(): Promise<ScrapedLead[]> {
  try {
    const response = await fetch(TECHCRUNCH_FEED_URL, {
      headers: {
        "User-Agent": "MicroSaaS-LeadScraper/1.0",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TechCrunch RSS: ${response.status} ${response.statusText}`
      );
    }

    const xml = await response.text();

    // Split XML into individual <item> blocks
    const itemBlocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];

    if (itemBlocks.length === 0) {
      console.warn("[lead-scraper] No items found in TechCrunch RSS feed.");
      return [];
    }

    const leads: ScrapedLead[] = [];

    for (const block of itemBlocks) {
      const title = extractTag(block, "title");
      if (!title) continue;

      const { company, fundingAmount, fundingRound } =
        parseFundingTitle(title);

      if (!company) continue;

      const slug = slugify(company);
      const email = `founder@${slug}.com`;

      leads.push({
        name: company,
        company,
        email,
        fundingRound,
        fundingAmount,
        source: "techcrunch_rss",
      });
    }

    console.log(
      `[lead-scraper] Scraped ${leads.length} leads from TechCrunch RSS.`
    );
    return leads;
  } catch (error) {
    console.error("[lead-scraper] Error scraping TechCrunch RSS:", error);
    throw error;
  }
}

/**
 * Save scraped leads to the database as OutboundLead records.
 * Skips leads whose company already exists. Returns the count of newly saved leads.
 */
export async function saveLeads(leads: ScrapedLead[]): Promise<number> {
  let savedCount = 0;

  for (const lead of leads) {
    try {
      // Check if a lead with this company already exists
      const existing = await prisma.outboundLead.findFirst({
        where: { company: lead.company },
      });

      if (existing) {
        continue;
      }

      await prisma.outboundLead.create({
        data: {
          name: lead.name,
          email: lead.email,
          company: lead.company,
          source: lead.source,
          fundingRound: lead.fundingRound,
          fundingAmount: lead.fundingAmount,
          status: "new",
        },
      });

      savedCount++;
    } catch (error) {
      // If unique constraint violation on email, skip gracefully
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        console.warn(
          `[lead-scraper] Duplicate email for ${lead.company}, skipping.`
        );
        continue;
      }
      console.error(
        `[lead-scraper] Error saving lead for ${lead.company}:`,
        error
      );
    }
  }

  console.log(
    `[lead-scraper] Saved ${savedCount} new leads out of ${leads.length} scraped.`
  );
  return savedCount;
}
