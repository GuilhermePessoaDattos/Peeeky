import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getExecutions,
  getExecutionStats,
} from "@/modules/gtm/execution-tracker";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;

  const agent = url.searchParams.get("agent") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const from = fromStr ? new Date(fromStr) : undefined;
  const to = toStr ? new Date(toStr) : undefined;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [executionResult, stats, conversionRaw] = await Promise.all([
    getExecutions({
      agentName: agent,
      status,
      from,
      to,
      limit,
      offset,
    }),
    getExecutionStats(30),
    computeConversionMetrics(thirtyDaysAgo),
  ]);

  return NextResponse.json({
    executions: executionResult.data,
    total: executionResult.total,
    stats,
    conversionMetrics: conversionRaw,
  });
}

async function computeConversionMetrics(since: Date) {
  const [
    emailsSent30d,
    blogPosts30d,
    linkedinPosts30d,
    redditComments30d,
    leadEmails,
  ] = await Promise.all([
    prisma.gtmExecution.count({
      where: {
        agentName: "cold-email",
        status: "success",
        actionType: "email_send",
        createdAt: { gte: since },
      },
    }),
    prisma.gtmExecution.count({
      where: {
        agentName: "blog-writer",
        status: "success",
        createdAt: { gte: since },
      },
    }),
    prisma.gtmExecution.count({
      where: {
        actionType: "linkedin_post",
        status: "success",
        createdAt: { gte: since },
      },
    }),
    prisma.gtmExecution.count({
      where: {
        actionType: "reddit_comment",
        status: "success",
        createdAt: { gte: since },
      },
    }),
    prisma.outboundLead.findMany({
      select: { email: true },
    }),
  ]);

  const leadEmailSet = new Set(leadEmails.map((l) => l.email));

  // Find users whose email exists in OutboundLead
  const usersFromLeads = leadEmailSet.size > 0
    ? await prisma.user.findMany({
        where: { email: { in: Array.from(leadEmailSet) } },
        select: { id: true },
      })
    : [];

  const signupsFromLeads = usersFromLeads.length;

  // Find how many of those users belong to a paid org
  let paidFromLeads = 0;
  if (usersFromLeads.length > 0) {
    const userIds = usersFromLeads.map((u) => u.id);
    const paidMemberships = await prisma.membership.findMany({
      where: {
        userId: { in: userIds },
        org: { plan: { not: "FREE" } },
      },
      select: { userId: true },
    });
    // Deduplicate by userId in case a user has multiple memberships
    const uniquePaidUsers = new Set(paidMemberships.map((m) => m.userId));
    paidFromLeads = uniquePaidUsers.size;
  }

  return {
    emailsSent30d,
    blogPosts30d,
    linkedinPosts30d,
    redditComments30d,
    signupsFromLeads,
    paidFromLeads,
  };
}
