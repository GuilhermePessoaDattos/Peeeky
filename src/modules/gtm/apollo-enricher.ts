import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Apollo.io People Enrichment                                        */
/*  Free tier: 50 credits/month                                        */
/* ------------------------------------------------------------------ */

const APOLLO_API_URL = "https://api.apollo.io/api/v1/people/match";

const NARROW_TITLES = "CEO,Founder,Co-Founder,CTO";
const BROAD_TITLES = "CEO,Founder,Co-Founder,CTO,Head of,VP,Director";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ApolloPerson {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  organization_name: string | null;
}

interface ApolloResponse {
  person: ApolloPerson | null;
}

interface EnrichResult {
  success: boolean;
  email?: string;
  error?: string;
}

interface PersonResult {
  name: string;
  email: string;
  title: string;
  company: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getApiKey(): string | undefined {
  return process.env.APOLLO_API_KEY;
}

async function apolloMatch(body: Record<string, string>): Promise<ApolloResponse | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const res = await fetch(APOLLO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    console.warn("[apollo-enricher] Rate limited by Apollo API. Skipping.");
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    console.error(`[apollo-enricher] API error ${res.status}: ${text}`);
    return null;
  }

  return (await res.json()) as ApolloResponse;
}

/* ------------------------------------------------------------------ */
/*  enrichLead                                                         */
/* ------------------------------------------------------------------ */

export async function enrichLead(leadId: string): Promise<EnrichResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[apollo-enricher] APOLLO_API_KEY not set. Skipping enrichment.");
    return { success: false, error: "APOLLO_API_KEY not configured" };
  }

  const lead = await prisma.outboundLead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return { success: false, error: `Lead ${leadId} not found` };
  }

  try {
    // Attempt 1: narrow titles
    let result = await apolloMatch({
      organization_name: lead.company,
      title: NARROW_TITLES,
    });

    // Attempt 2: broader titles if no match
    if (!result?.person?.email) {
      result = await apolloMatch({
        organization_name: lead.company,
        title: BROAD_TITLES,
      });
    }

    if (!result?.person?.email) {
      return { success: false, error: "No email found in Apollo" };
    }

    const person = result.person;
    const fullName = [person.first_name, person.last_name].filter(Boolean).join(" ") || lead.name;

    await prisma.outboundLead.update({
      where: { id: leadId },
      data: {
        email: person.email,
        name: fullName,
        role: person.title ?? lead.role,
        notes: lead.notes
          ? `${lead.notes}\n[Apollo enriched ${new Date().toISOString()}]`
          : `[Apollo enriched ${new Date().toISOString()}]`,
      },
    });

    return { success: true, email: person.email };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[apollo-enricher] enrichLead error: ${message}`);
    return { success: false, error: message };
  }
}

/* ------------------------------------------------------------------ */
/*  enrichPendingLeads                                                 */
/* ------------------------------------------------------------------ */

export async function enrichPendingLeads(limit: number = 5): Promise<number> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[apollo-enricher] APOLLO_API_KEY not set. Skipping batch enrichment.");
    return 0;
  }

  // Find leads with placeholder emails from techcrunch_rss that haven't been emailed yet
  const pendingLeads = await prisma.outboundLead.findMany({
    where: {
      email: { contains: "@" },
      source: "techcrunch_rss",
      status: "new",
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let enrichedCount = 0;

  for (const lead of pendingLeads) {
    const result = await enrichLead(lead.id);
    if (result.success) {
      enrichedCount++;
      console.log(`[apollo-enricher] Enriched ${lead.company}: ${result.email}`);
    } else {
      console.log(`[apollo-enricher] Could not enrich ${lead.company}: ${result.error}`);
    }
  }

  return enrichedCount;
}

/* ------------------------------------------------------------------ */
/*  searchPeople — generic Apollo search                               */
/* ------------------------------------------------------------------ */

export async function searchPeople(query: {
  company?: string;
  title?: string;
  domain?: string;
}): Promise<PersonResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[apollo-enricher] APOLLO_API_KEY not set. Skipping search.");
    return [];
  }

  const body: Record<string, string> = {};
  if (query.company) body.organization_name = query.company;
  if (query.title) body.title = query.title;
  if (query.domain) body.domain = query.domain;

  if (Object.keys(body).length === 0) {
    return [];
  }

  try {
    const result = await apolloMatch(body);
    if (!result?.person?.email) return [];

    const p = result.person;
    return [
      {
        name: [p.first_name, p.last_name].filter(Boolean).join(" "),
        email: p.email,
        title: p.title ?? "",
        company: p.organization_name ?? query.company ?? "",
      },
    ];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[apollo-enricher] searchPeople error: ${message}`);
    return [];
  }
}
