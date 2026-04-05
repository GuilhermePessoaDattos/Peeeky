import { prisma } from "@/lib/prisma";

const HUNTER_BASE = "https://api.hunter.io/v2";

function getHunterKey(): string | undefined {
  return process.env.HUNTER_API_KEY;
}

interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  seniority: string | null;
  department: string | null;
}

interface HunterDomainResponse {
  data: {
    domain: string;
    organization: string;
    emails: HunterEmail[];
  };
}

interface HunterFinderResponse {
  data: {
    email: string;
    score: number;
    first_name: string;
    last_name: string;
    position: string | null;
  };
}

/**
 * Search for emails at a company domain.
 * Uses 1 credit per call. Returns executives/founders first.
 */
export async function searchByDomain(domain: string): Promise<HunterEmail[]> {
  if (!getHunterKey()) {
    console.warn("[hunter] HUNTER_API_KEY not set, skipping.");
    return [];
  }

  try {
    const url = `${HUNTER_BASE}/domain-search?domain=${encodeURIComponent(domain)}&api_key=${getHunterKey()}&limit=5`;
    const res = await fetch(url);

    if (!res.ok) {
      const err = await res.text();
      console.error(`[hunter] domain-search error ${res.status}:`, err.substring(0, 200));
      return [];
    }

    const data: HunterDomainResponse = await res.json();
    return data.data.emails || [];
  } catch (err) {
    console.error("[hunter] domain-search error:", err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Find a specific person's email by name + company domain.
 * Uses 1 credit per call. High accuracy.
 */
export async function findEmail(
  firstName: string,
  lastName: string,
  domain: string
): Promise<{ email: string; score: number } | null> {
  if (!getHunterKey()) return null;

  try {
    const url = `${HUNTER_BASE}/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${getHunterKey()}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    const data: HunterFinderResponse = await res.json();
    if (data.data.email && data.data.score > 50) {
      return { email: data.data.email, score: data.data.score };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate candidate domains from company name.
 * Tries multiple TLDs since startups often use .ai, .io, .co, etc.
 */
function guessDomains(company: string): string[] {
  const slug = company
    .toLowerCase()
    .replace(/\s*(inc\.?|llc|ltd|corp\.?|co\.?|gmbh|s\.a\.?|sa)\s*$/i, "")
    .replace(/[^a-z0-9]/g, "");

  return [
    `${slug}.com`,
    `${slug}.ai`,
    `${slug}.io`,
    `${slug}.co`,
    `get${slug}.com`,
    `${slug}app.com`,
  ];
}

/**
 * Enrich a single lead with Hunter.io data.
 * Tries multiple domain candidates until one returns emails.
 */
export async function enrichLead(leadId: string): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> {
  if (!getHunterKey()) {
    return { success: false, error: "HUNTER_API_KEY not set" };
  }

  const lead = await prisma.outboundLead.findUnique({ where: { id: leadId } });
  if (!lead) return { success: false, error: "Lead not found" };

  try {
    // Try multiple domain candidates
    const domains = guessDomains(lead.company);
    let emails: HunterEmail[] = [];
    let matchedDomain = "";

    for (const domain of domains) {
      emails = await searchByDomain(domain);
      if (emails.length > 0) {
        matchedDomain = domain;
        break;
      }
      // Small delay between attempts
      await new Promise(r => setTimeout(r, 500));
    }

    if (emails.length === 0) {
      return { success: false, error: `No emails found for ${lead.company} (tried: ${domains.slice(0, 3).join(", ")})` };
    }

    // Find the best match: prefer CEO/Founder/C-level
    const priorityRoles = /ceo|founder|co-founder|cto|coo|president|owner|head|director|vp/i;
    const bestMatch = emails.find(e => priorityRoles.test(e.position || "")) || emails[0];

    if (bestMatch?.value) {
      const fullName = [bestMatch.first_name, bestMatch.last_name].filter(Boolean).join(" ");

      await prisma.outboundLead.update({
        where: { id: leadId },
        data: {
          email: bestMatch.value,
          name: fullName || lead.name,
          role: bestMatch.position || lead.role || undefined,
          notes: lead.notes
            ? `${lead.notes}\n[Hunter.io enriched ${new Date().toISOString()} — ${matchedDomain}]`
            : `[Hunter.io enriched ${new Date().toISOString()} — ${matchedDomain}]`,
        },
      });

      return { success: true, email: bestMatch.value };
    }

    return { success: false, error: `No match found` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[hunter] enrichLead error: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Enrich pending leads that have placeholder emails (founder@slug.com).
 * Called by cold-email agent in Phase 1.5.
 */
export async function enrichPendingLeads(limit: number = 5): Promise<{
  enriched: number;
  failed: number;
  skipped: number;
}> {
  if (!getHunterKey()) {
    console.warn("[hunter] HUNTER_API_KEY not set, skipping enrichment.");
    return { enriched: 0, failed: 0, skipped: 0 };
  }

  // Find leads with placeholder emails
  const leads = await prisma.outboundLead.findMany({
    where: {
      status: "new",
      email: { startsWith: "founder@" },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  let enriched = 0;
  let failed = 0;
  let skipped = 0;

  for (const lead of leads) {
    const result = await enrichLead(lead.id);
    if (result.success) {
      enriched++;
      console.log(`[hunter] Enriched: ${lead.company} → ${result.email}`);
    } else {
      failed++;
      console.log(`[hunter] Failed: ${lead.company} — ${result.error}`);
    }

    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  return { enriched, failed, skipped };
}
