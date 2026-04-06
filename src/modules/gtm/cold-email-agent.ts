import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { redis } from "@/lib/redis";
import { Resend } from "resend";

import { scrapeRecentFunding, saveLeads } from "./lead-scraper";
import { enrichPendingLeads } from "./hunter-enricher";
import {
  createExecution,
  markRunning,
  markSuccess,
  markFailed,
  markAwaitingApproval,
} from "./execution-tracker";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_NEW_EMAILS_PER_DAY = 10;
const MAX_FOLLOWUPS_PER_DAY = 5;
const FOLLOWUP_DELAY_DAYS = 3;

const SENDER_FROM = "Alex Moreira <alex@peeeky.com>";

const EMAIL_SYSTEM_PROMPT_STARTUP = `You are Alex Moreira, Head of Product at Peeeky (peeeky.com). Write a short personal cold email (under 100 words) to a startup founder. Be conversational, not salesy. Reference their recent funding if known. Position Peeeky as document tracking with AI chat for pitch decks and investor materials. End with a soft question. No emojis.

CRITICAL RULES:
- NEVER use placeholders like [Name], [Founder's Name], [Company], etc.
- If you don't know the person's name, start with "Hi there," or address the company team.
- Write the final email exactly as it should be sent — no brackets, no blanks, no template variables.`;

const EMAIL_SYSTEM_PROMPT_MA = `You are Alex Moreira, Head of Product at Peeeky (peeeky.com). Write a short personal cold email (under 100 words) to an M&A advisor or investment banker. Be professional and direct. Position Peeeky as a modern virtual data room alternative with per-page analytics, NDA gating, and AI chat — helping them know which buyers are seriously engaged. End with a soft question. No emojis.

CRITICAL RULES:
- NEVER use placeholders like [Name], [Founder's Name], [Company], etc.
- If you don't know the person's name, start with "Hi there," or address the company team.
- Write the final email exactly as it should be sent — no brackets, no blanks, no template variables.
- Reference their deal work, not fundraising.`;

function getEmailPrompt(source: string): string {
  return source === "hunter_ma" ? EMAIL_SYSTEM_PROMPT_MA : EMAIL_SYSTEM_PROMPT_STARTUP;
}

const FOLLOWUP_SYSTEM_PROMPT = `You are Alex Moreira, Head of Product at Peeeky (peeeky.com). Write a very short follow-up email (under 60 words) referencing the original email. Be friendly, not pushy. End with a simple question. No emojis.`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const resend = new Resend(process.env.RESEND_API_KEY);

function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `cold-email:sent:${yyyy}-${mm}-${dd}`;
}

interface DailyCounters {
  newEmails: number;
  followUps: number;
}

async function getDailyCounters(): Promise<DailyCounters> {
  const raw = await redis.get(todayKey());
  if (!raw) return { newEmails: 0, followUps: 0 };
  if (typeof raw === "string") return JSON.parse(raw) as DailyCounters;
  return raw as DailyCounters;
}

async function setDailyCounters(counters: DailyCounters): Promise<void> {
  // Expire at end of day (max 24 h)
  await redis.set(todayKey(), JSON.stringify(counters), { ex: 86400 });
}

/* ------------------------------------------------------------------ */
/*  OpenAI email generation                                            */
/* ------------------------------------------------------------------ */

interface EmailContent {
  subject: string;
  body: string;
}

async function generateEmail(
  leadName: string,
  company: string,
  fundingRound?: string | null,
  fundingAmount?: string | null,
  source?: string,
): Promise<EmailContent> {
  const isMA = source === "hunter_ma";
  const userPrompt = isMA
    ? `Write a cold email to ${leadName} at ${company}. They are an M&A advisory boutique. Focus on how Peeeky data rooms help track buyer engagement during deal processes. Return JSON with keys "subject" and "body".`
    : [
        `Write a cold email to ${leadName} at ${company}.`,
        fundingRound ? `They recently closed a ${fundingRound} round.` : null,
        fundingAmount ? `Amount: ${fundingAmount}.` : null,
        `Return JSON with keys "subject" and "body".`,
      ].filter(Boolean).join(" ");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: getEmailPrompt(source || "") },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const email = JSON.parse(content) as EmailContent;

  // Clean any unresolved placeholders
  email.body = email.body.replace(/\[.*?Name.*?\]/gi, "there").replace(/\[.*?\]/g, "");
  email.subject = email.subject.replace(/\[.*?\]/g, "");

  return email;
}

async function generateFollowUp(
  leadName: string,
  company: string,
  originalSubject: string,
): Promise<EmailContent> {
  const userPrompt = `Write a follow-up email to ${leadName} at ${company}. The original email had subject "${originalSubject}". Return JSON with keys "subject" and "body".`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: FOLLOWUP_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as EmailContent;
}

/* ------------------------------------------------------------------ */
/*  Send email via Resend                                              */
/* ------------------------------------------------------------------ */

async function sendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: SENDER_FROM,
      to,
      bcc: "alex@peeeky.com",
      subject,
      text: body,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/* ------------------------------------------------------------------ */
/*  Main exported function                                             */
/* ------------------------------------------------------------------ */

export async function executeColdEmail(
  requiresApproval: boolean,
): Promise<{ output: string; itemsCreated: number }> {
  const logs: string[] = [];
  let itemsCreated = 0;

  // ── Daily limit check ──────────────────────────────────────────────
  const counters = await getDailyCounters();
  const newBudget = Math.max(0, MAX_NEW_EMAILS_PER_DAY - counters.newEmails);
  const followUpBudget = Math.max(0, MAX_FOLLOWUPS_PER_DAY - counters.followUps);

  if (newBudget === 0 && followUpBudget === 0) {
    logs.push("Daily email limit reached. Skipping run.");
    return { output: logs.join("\n"), itemsCreated: 0 };
  }

  // ── Phase 1: Scrape & save new leads ───────────────────────────────
  try {
    const rawLeads = await scrapeRecentFunding();
    const savedCount = await saveLeads(rawLeads);
    logs.push(`Phase 1: scraped ${rawLeads.length} leads, saved ${savedCount} new.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logs.push(`Phase 1 warning: lead scraping failed — ${message}`);
  }

  // ── Phase 1.5: Enrich leads via Hunter.io ──────────────────────────
  if (process.env.HUNTER_API_KEY) {
    try {
      const result = await enrichPendingLeads(5);
      logs.push(`Phase 1.5: Hunter.io enriched ${result.enriched} leads (${result.failed} failed).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`Phase 1.5 warning: Hunter enrichment failed — ${message}`);
    }
  } else {
    logs.push("Phase 1.5: skipped lead enrichment (HUNTER_API_KEY not set).");
  }

  // ── Phase 2: Cold emails to new leads ──────────────────────────────
  if (newBudget > 0) {
    const newLeads = await prisma.outboundLead.findMany({
      where: {
        status: "new",
        // Only email leads with real email addresses (skip placeholder founder@slug.com)
        NOT: { email: { startsWith: "founder@" } },
      },
      take: Math.min(newBudget, MAX_NEW_EMAILS_PER_DAY),
      orderBy: { createdAt: "asc" },
    });

    logs.push(`Phase 2: found ${newLeads.length} new leads to email.`);

    for (const lead of newLeads) {
      const startMs = Date.now();

      const execution = await createExecution({
        agentName: "cold-email",
        actionType: "email_send",
        title: `Cold email to ${lead.name} @ ${lead.company}`,
        scheduledAt: new Date(),
        metadata: { leadId: lead.id, leadEmail: lead.email, company: lead.company },
      });

      try {
        await markRunning(execution.id);

        const email = await generateEmail(
          lead.name,
          lead.company,
          lead.fundingRound,
          lead.fundingAmount,
          lead.source,
        );

        // Always save email content in metadata for preview
        const fullMetadata = {
          leadId: lead.id,
          from: SENDER_FROM,
          to: lead.email,
          company: lead.company,
          subject: email.subject,
          body: email.body,
        };
        await prisma.gtmExecution.update({
          where: { id: execution.id },
          data: { metadata: JSON.stringify(fullMetadata) },
        });

        if (requiresApproval) {
          await markAwaitingApproval(execution.id);
          logs.push(`  [awaiting_approval] ${lead.email} — "${email.subject}"`);
        } else {
          // Autonomous: send immediately
          const result = await sendEmail(lead.email, email.subject, email.body);
          const durationMs = Date.now() - startMs;

          if (result.success) {
            await markSuccess(execution.id, `Sent to ${lead.email}`, durationMs);
            await prisma.outboundLead.update({
              where: { id: lead.id },
              data: {
                status: "emailed",
                emailedAt: new Date(),
                emailSubject: email.subject,
                emailBody: email.body,
              },
            });
            counters.newEmails++;
            logs.push(`  [sent] ${lead.email} — "${email.subject}"`);
          } else {
            await markFailed(execution.id, result.error ?? "Unknown error", durationMs);
            logs.push(`  [failed] ${lead.email} — ${result.error}`);
          }
        }

        itemsCreated++;
      } catch (err) {
        const durationMs = Date.now() - startMs;
        const message = err instanceof Error ? err.message : String(err);
        await markFailed(execution.id, message, durationMs);
        logs.push(`  [error] ${lead.email} — ${message}`);
      }
    }
  }

  // ── Phase 3: Follow-ups ────────────────────────────────────────────
  if (followUpBudget > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - FOLLOWUP_DELAY_DAYS);

    const leadsToFollowUp = await prisma.outboundLead.findMany({
      where: {
        status: "emailed",
        emailedAt: { lte: cutoffDate },
        followedUpAt: null,
      },
      take: Math.min(followUpBudget, MAX_FOLLOWUPS_PER_DAY),
      orderBy: { emailedAt: "asc" },
    });

    logs.push(`Phase 3: found ${leadsToFollowUp.length} leads to follow up.`);

    for (const lead of leadsToFollowUp) {
      const startMs = Date.now();

      const execution = await createExecution({
        agentName: "cold-email",
        actionType: "email_followup",
        title: `Follow-up to ${lead.name} @ ${lead.company}`,
        scheduledAt: new Date(),
        metadata: { leadId: lead.id, leadEmail: lead.email, company: lead.company },
      });

      try {
        await markRunning(execution.id);

        const followUp = await generateFollowUp(
          lead.name,
          lead.company,
          lead.emailSubject ?? "Previous email",
        );

        // Always save content in metadata for preview
        const followUpMeta = {
          leadId: lead.id,
          from: SENDER_FROM,
          to: lead.email,
          company: lead.company,
          subject: followUp.subject,
          body: followUp.body,
        };
        await prisma.gtmExecution.update({
          where: { id: execution.id },
          data: { metadata: JSON.stringify(followUpMeta) },
        });

        if (requiresApproval) {
          await markAwaitingApproval(execution.id);
          logs.push(`  [awaiting_approval] follow-up ${lead.email} — "${followUp.subject}"`);
        } else {
          const result = await sendEmail(lead.email, followUp.subject, followUp.body);
          const durationMs = Date.now() - startMs;

          if (result.success) {
            await markSuccess(execution.id, `Follow-up sent to ${lead.email}`, durationMs);
            await prisma.outboundLead.update({
              where: { id: lead.id },
              data: {
                status: "followed_up",
                followedUpAt: new Date(),
                followUpBody: followUp.body,
              },
            });
            counters.followUps++;
            logs.push(`  [sent] follow-up ${lead.email} — "${followUp.subject}"`);
          } else {
            await markFailed(execution.id, result.error ?? "Unknown error", durationMs);
            logs.push(`  [failed] follow-up ${lead.email} — ${result.error}`);
          }
        }

        itemsCreated++;
      } catch (err) {
        const durationMs = Date.now() - startMs;
        const message = err instanceof Error ? err.message : String(err);
        await markFailed(execution.id, message, durationMs);
        logs.push(`  [error] follow-up ${lead.email} — ${message}`);
      }
    }
  }

  // ── Persist daily counters ─────────────────────────────────────────
  await setDailyCounters(counters);

  const summary = `Cold email run complete. ${itemsCreated} items processed.`;
  logs.push(summary);

  return { output: logs.join("\n"), itemsCreated };
}
