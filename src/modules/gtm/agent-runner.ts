import { prisma } from "@/lib/prisma";

type AgentExecutor = (config: string | null) => Promise<{
  output: string;
  itemsCreated: number;
}>;

const AGENT_EXECUTORS: Record<string, AgentExecutor> = {
  "content-writer": executeContentWriter,
  "social-manager": executeSocialManager,
  "community-rep": executeCommunityRep,
  "outbound-sales": executeOutboundSales,
  "github-maintainer": executeGithubMaintainer,
  "analytics-reporter": executeAnalyticsReporter,
};

export async function runAgent(agentName: string, runId?: string) {
  const agent = await prisma.gtmAgent.findUnique({ where: { name: agentName } });
  if (!agent || agent.status !== "active") {
    return { skipped: true, reason: agent ? "paused" : "not found" };
  }

  const run = runId
    ? await prisma.gtmAgentRun.findUnique({ where: { id: runId } })
    : await prisma.gtmAgentRun.create({
        data: { agentId: agent.id, status: "running" },
      });

  if (!run) return { skipped: true, reason: "run not found" };

  const startTime = Date.now();
  const executor = AGENT_EXECUTORS[agentName];

  if (!executor) {
    await prisma.gtmAgentRun.update({
      where: { id: run.id },
      data: { status: "error", error: "No executor found", completedAt: new Date() },
    });
    return { error: "No executor for agent: " + agentName };
  }

  try {
    const result = await executor(agent.config);
    const duration = Math.round((Date.now() - startTime) / 1000);

    await prisma.$transaction([
      prisma.gtmAgentRun.update({
        where: { id: run.id },
        data: {
          status: "success",
          completedAt: new Date(),
          duration,
          output: result.output,
          itemsCreated: result.itemsCreated,
        },
      }),
      prisma.gtmAgent.update({
        where: { id: agent.id },
        data: {
          lastRunAt: new Date(),
          lastRunStatus: "success",
          lastRunOutput: result.output,
          runsTotal: { increment: 1 },
          runsSuccess: { increment: 1 },
        },
      }),
    ]);

    return { success: true, output: result.output, itemsCreated: result.itemsCreated };
  } catch (err) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMsg = err instanceof Error ? err.message : String(err);

    await prisma.$transaction([
      prisma.gtmAgentRun.update({
        where: { id: run.id },
        data: { status: "error", completedAt: new Date(), duration, error: errorMsg },
      }),
      prisma.gtmAgent.update({
        where: { id: agent.id },
        data: {
          lastRunAt: new Date(),
          lastRunStatus: "error",
          lastRunOutput: errorMsg,
          runsTotal: { increment: 1 },
          runsFailed: { increment: 1 },
        },
      }),
    ]);

    return { error: errorMsg };
  }
}

// --- Agent Executors ---

async function executeContentWriter(_config: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    output: `Content writer triggered for ${today}. Claude Remote Trigger will generate drafts.`,
    itemsCreated: 0,
  };
}

async function executeSocialManager(_config: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    output: `Social manager triggered for ${today}. Claude Remote Trigger will generate posts.`,
    itemsCreated: 0,
  };
}

async function executeCommunityRep(_config: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    output: `Community rep triggered for ${today}. Scanning Reddit, IH, HN for relevant threads.`,
    itemsCreated: 0,
  };
}

async function executeOutboundSales(_config: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    output: `Outbound sales triggered for ${today}. Claude Remote Trigger will research leads and draft emails.`,
    itemsCreated: 0,
  };
}

async function executeGithubMaintainer(_config: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    output: `GitHub maintainer triggered for ${today}. Checking issues and PRs.`,
    itemsCreated: 0,
  };
}

async function executeAnalyticsReporter(_config: string | null) {
  const [users, docs, views, orgs] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.view.count(),
    prisma.organization.groupBy({
      by: ["plan"],
      _count: true,
    }),
  ]);

  const proOrgs = orgs.find((o) => o.plan === "PRO")?._count || 0;
  const bizOrgs = orgs.find((o) => o.plan === "BUSINESS")?._count || 0;
  const mrr = proOrgs * 39 + bizOrgs * 129;

  const report = `Weekly Report — ${new Date().toISOString().slice(0, 10)}
MRR: $${mrr} | Users: ${users} | Docs: ${docs} | Views: ${views}
Paying: ${proOrgs} Pro + ${bizOrgs} Business`;

  return { output: report, itemsCreated: 1 };
}
