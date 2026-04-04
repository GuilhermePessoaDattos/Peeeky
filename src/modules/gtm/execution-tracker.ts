import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CreateExecutionInput {
  agentName: string;
  actionType: string;
  title: string;
  scheduledAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ExecutionFilters {
  agentName?: string;
  status?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

/* ------------------------------------------------------------------ */
/*  Create                                                             */
/* ------------------------------------------------------------------ */

export async function createExecution(data: CreateExecutionInput) {
  return prisma.gtmExecution.create({
    data: {
      agentName: data.agentName,
      actionType: data.actionType,
      title: data.title,
      scheduledAt: data.scheduledAt,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Status transitions                                                 */
/* ------------------------------------------------------------------ */

export async function markRunning(id: string) {
  return prisma.gtmExecution.update({
    where: { id },
    data: {
      status: "running",
      executedAt: new Date(),
    },
  });
}

export async function markSuccess(id: string, output: string, duration: number) {
  return prisma.gtmExecution.update({
    where: { id },
    data: {
      status: "success",
      output,
      duration,
      completedAt: new Date(),
    },
  });
}

export async function markFailed(id: string, error: string, duration: number) {
  return prisma.gtmExecution.update({
    where: { id },
    data: {
      status: "failed",
      error,
      duration,
      completedAt: new Date(),
      retryCount: { increment: 1 },
    },
  });
}

export async function markAwaitingApproval(id: string) {
  return prisma.gtmExecution.update({
    where: { id },
    data: {
      status: "awaiting_approval",
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Approval / Rejection                                               */
/* ------------------------------------------------------------------ */

export async function approveExecution(id: string, approvedBy: string) {
  return prisma.gtmExecution.update({
    where: { id },
    data: {
      status: "approved",
      approvedAt: new Date(),
      approvedBy,
    },
  });
}

export async function rejectExecution(id: string, rejectionNote: string) {
  return prisma.gtmExecution.update({
    where: { id },
    data: {
      status: "rejected",
      rejectedAt: new Date(),
      rejectionNote,
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

export async function getPendingExecutions(agentName?: string) {
  return prisma.gtmExecution.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: new Date() },
      ...(agentName ? { agentName } : {}),
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getApprovedExecutions(agentName?: string) {
  return prisma.gtmExecution.findMany({
    where: {
      status: "approved",
      scheduledAt: { lte: new Date() },
      ...(agentName ? { agentName } : {}),
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getExecutions(filters: ExecutionFilters = {}) {
  const { agentName, status, from, to, limit = 50, offset = 0 } = filters;

  const where: Record<string, unknown> = {};
  if (agentName) where.agentName = agentName;
  if (status) where.status = status;
  if (from || to) {
    where.scheduledAt = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  const [data, total] = await Promise.all([
    prisma.gtmExecution.findMany({
      where,
      orderBy: { scheduledAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.gtmExecution.count({ where }),
  ]);

  return { data, total, limit, offset };
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

export async function getExecutionStats(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const executions = await prisma.gtmExecution.findMany({
    where: { createdAt: { gte: since } },
    select: { status: true, agentName: true },
  });

  const total = executions.length;
  const success = executions.filter((e) => e.status === "success").length;
  const failed = executions.filter((e) => e.status === "failed").length;
  const pending = executions.filter((e) => e.status === "pending").length;
  const awaitingApproval = executions.filter(
    (e) => e.status === "awaiting_approval",
  ).length;
  const successRate = total > 0 ? Math.round((success / total) * 10000) / 100 : 0;

  // Group counts by agent
  const byAgent: Record<string, { total: number; success: number; failed: number }> = {};
  for (const e of executions) {
    if (!byAgent[e.agentName]) {
      byAgent[e.agentName] = { total: 0, success: 0, failed: 0 };
    }
    byAgent[e.agentName].total++;
    if (e.status === "success") byAgent[e.agentName].success++;
    if (e.status === "failed") byAgent[e.agentName].failed++;
  }

  return {
    days,
    total,
    success,
    failed,
    pending,
    awaitingApproval,
    successRate,
    byAgent,
  };
}
