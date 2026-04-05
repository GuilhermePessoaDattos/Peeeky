import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import {
  markRunning,
  markSuccess,
  markFailed,
  approveExecution,
  rejectExecution,
} from "@/modules/gtm/execution-tracker";
import { executeColdEmail } from "@/modules/gtm/cold-email-agent";
import { executeBlogWriter } from "@/modules/gtm/blog-writer-agent";
import { executeSocialMedia } from "@/modules/gtm/social-media-agent";

const resend = new Resend(process.env.RESEND_API_KEY);

type RouteContext = { params: Promise<{ id: string }> };

/* ------------------------------------------------------------------ */
/*  POST — Re-run a failed execution                                   */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  const execution = await prisma.gtmExecution.findUnique({ where: { id } });
  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  if (execution.status !== "failed") {
    return NextResponse.json(
      { error: "Only failed executions can be re-run" },
      { status: 400 },
    );
  }

  // Reset to pending then mark running
  await prisma.gtmExecution.update({
    where: { id },
    data: { status: "pending", error: null, output: null, completedAt: null, duration: null },
  });
  await markRunning(id);

  const start = Date.now();

  try {
    let result: { output: string; itemsCreated: number };

    switch (execution.agentName) {
      case "cold-email":
        result = await executeColdEmail(false);
        break;
      case "blog-writer":
        result = await executeBlogWriter(false);
        break;
      case "social-media":
        result = await executeSocialMedia(false);
        break;
      default:
        throw new Error(`Unknown agent: ${execution.agentName}`);
    }

    const duration = Date.now() - start;
    const updated = await markSuccess(id, result.output, duration);
    return NextResponse.json({ execution: updated });
  } catch (err) {
    const duration = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    const updated = await markFailed(id, errorMsg, duration);
    return NextResponse.json({ execution: updated, error: errorMsg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH — Update execution status or approve/reject                  */
/* ------------------------------------------------------------------ */

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  const execution = await prisma.gtmExecution.findUnique({ where: { id } });
  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  const body = await req.json();

  // Handle special actions
  if (body.action === "approve") {
    await approveExecution(id, "admin");
    await markRunning(id);
    const start = Date.now();

    try {
      // Parse metadata to get email content
      const meta = execution.metadata ? JSON.parse(execution.metadata) : null;

      if (execution.actionType?.includes("email") && meta?.to && meta?.subject && meta?.body) {
        // Send the email via Resend
        await resend.emails.send({
          from: meta.from || "Alex Moreira <alex@peeeky.com>",
          to: meta.to,
          bcc: "alex@peeeky.com",
          subject: meta.subject,
          text: meta.body,
        });

        // Update lead status
        if (meta.leadId) {
          await prisma.outboundLead.update({
            where: { id: meta.leadId },
            data: {
              status: execution.actionType === "email_followup" ? "followed_up" : "emailed",
              emailedAt: new Date(),
              emailSubject: meta.subject,
              emailBody: meta.body,
            },
          }).catch(() => {}); // Ignore if lead doesn't exist
        }

        const updated = await markSuccess(id, `Approved and sent to ${meta.to}`, Date.now() - start);
        return NextResponse.json({ execution: updated });
      }

      // Blog post: publish to GitHub
      if (execution.actionType === "blog_publish" && meta?.mdx && meta?.slug) {
        const ghToken = process.env.GITHUB_TOKEN;
        if (!ghToken) {
          const updated = await markFailed(id, "GITHUB_TOKEN not configured", Date.now() - start);
          return NextResponse.json({ execution: updated, error: "GITHUB_TOKEN not configured" }, { status: 500 });
        }

        const path = `content/blog/${meta.slug}.mdx`;
        const ghRes = await fetch(
          `https://api.github.com/repos/GuilhermePessoaDattos/Peeeky/contents/${path}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${ghToken}`,
              Accept: "application/vnd.github+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `blog: publish "${meta.title || meta.slug}"`,
              content: Buffer.from(meta.mdx).toString("base64"),
              branch: "main",
            }),
          }
        );

        if (!ghRes.ok) {
          const errText = await ghRes.text();
          const updated = await markFailed(id, `GitHub API ${ghRes.status}: ${errText.substring(0, 200)}`, Date.now() - start);
          return NextResponse.json({ execution: updated, error: errText }, { status: 500 });
        }

        // Trigger Vercel redeploy so blog post appears live
        const deployHook = process.env.VERCEL_DEPLOY_HOOK;
        if (deployHook) {
          await fetch(deployHook, { method: "POST" }).catch(() => {});
        }

        const updated = await markSuccess(id, `Published to blog: ${path} (redeploy triggered)`, Date.now() - start);
        return NextResponse.json({ execution: updated });
      }

      // Other executions: just mark approved
      const updated = await markSuccess(id, "Approved", Date.now() - start);
      return NextResponse.json({ execution: updated });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const updated = await markFailed(id, `Approval send failed: ${errorMsg}`, Date.now() - start);
      return NextResponse.json({ execution: updated, error: errorMsg }, { status: 500 });
    }
  }

  if (body.action === "reject") {
    const updated = await rejectExecution(id, body.rejectionNote ?? "");
    return NextResponse.json({ execution: updated });
  }

  // Generic field update
  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.output !== undefined) updateData.output = body.output;
  if (body.error !== undefined) updateData.error = body.error;
  if (body.executedAt !== undefined) updateData.executedAt = new Date(body.executedAt);
  if (body.completedAt !== undefined) updateData.completedAt = new Date(body.completedAt);
  if (body.duration !== undefined) updateData.duration = body.duration;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.gtmExecution.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ execution: updated });
}
