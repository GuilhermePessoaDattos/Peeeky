import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { computeEngagementScore } from "@/modules/tracking";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendViewNotification(viewId: string) {
  const view = await prisma.view.findUnique({
    where: { id: viewId },
    include: {
      link: {
        include: {
          document: {
            include: {
              org: {
                include: {
                  members: {
                    where: { role: "OWNER" },
                    include: { user: true },
                  },
                },
              },
            },
          },
        },
      },
      pageViews: true,
    },
  });

  if (!view) return;

  const owner = view.link.document.org.members[0]?.user;
  if (!owner?.email) return;

  const score = computeEngagementScore(view);
  const docName = view.link.document.name;
  const viewerName = view.viewerEmail || view.ip || "Someone";
  const duration = view.duration;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Only send for meaningful views (score > 30 or duration > 30s)
  if (score < 30 && duration < 30) return;

  const isHighEngagement = score >= 70;

  const subject = isHighEngagement
    ? `🔥 High engagement on "${docName}"`
    : `👀 "${docName}" was viewed`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="padding: 24px; background: #1A1A2E; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 18px; color: white;">
          p<span style="color: #6C5CE7;">eee</span>ky
        </h1>
      </div>
      <div style="padding: 24px; background: white; border: 1px solid #E8E8F0; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 16px; font-size: 16px; color: #1A1A2E;">
          ${isHighEngagement ? "🔥 High engagement detected" : "👀 New view"}
        </h2>
        <p style="margin: 0 0 8px; font-size: 14px; color: #4A4A68;">
          <strong>${viewerName}</strong> viewed <strong>&quot;${docName}&quot;</strong>
        </p>
        <div style="margin: 16px 0; padding: 16px; background: #F8F9FC; border-radius: 8px;">
          <table style="width: 100%; font-size: 13px; color: #4A4A68;">
            <tr>
              <td style="padding: 4px 0;">Duration</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600;">${durationStr}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Completion</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600;">${Math.round(view.completionRate * 100)}%</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Engagement Score</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: ${score >= 70 ? "#00B894" : score >= 30 ? "#FDCB6E" : "#E17055"};">${score}/100</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Device</td>
              <td style="padding: 4px 0; text-align: right;">${view.device || "Unknown"}</td>
            </tr>
          </table>
        </div>
        ${
          isHighEngagement
            ? `
        <div style="margin: 16px 0; padding: 12px; background: #6C5CE7; border-radius: 8px; color: white; font-size: 13px;">
          <strong>💡 Suggested action:</strong> This viewer showed strong interest. Consider reaching out now while the document is fresh in their mind.
        </div>`
            : ""
        }
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/documents/${view.link.documentId}"
           style="display: block; text-align: center; padding: 12px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 16px;">
          View Analytics
        </a>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Peeeky <onboarding@resend.dev>",
      to: owner.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }

  // Send Slack notification if configured
  const slackUrl = await redis.get<string>(`slack_webhook:${view.link.document.orgId}`);
  if (slackUrl) {
    const slackMsg = `📄 *${viewerName}* viewed "${docName}" (${durationStr}, score: ${score}/100)`;
    await sendSlackNotification(slackUrl, slackMsg);
  }
}

export async function sendWelcomeEmail(email: string, name: string | null) {
  const firstName = name?.split(" ")[0] || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="padding: 24px; background: #1A1A2E; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 18px; color: white;">
          p<span style="color: #6C5CE7;">eee</span>ky
        </h1>
      </div>
      <div style="padding: 32px 24px; background: white; border: 1px solid #E8E8F0; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #1A1A2E;">
          Welcome to Peeeky, ${firstName}! 👋
        </h2>
        <p style="margin: 0 0 16px; font-size: 14px; color: #4A4A68; line-height: 1.6;">
          You just unlocked the ability to know <strong>exactly</strong> how people engage with your documents.
        </p>

        <div style="margin: 20px 0; padding: 20px; background: #F8F9FC; border-radius: 8px;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1A1A2E;">Get started in 3 steps:</p>
          <table style="width: 100%; font-size: 13px; color: #4A4A68;">
            <tr>
              <td style="padding: 6px 0; vertical-align: top;">
                <span style="display:inline-block; width:22px; height:22px; background:#6C5CE7; color:white; border-radius:50%; text-align:center; line-height:22px; font-size:12px; font-weight:600;">1</span>
              </td>
              <td style="padding: 6px 8px;"><strong>Upload a PDF</strong> &mdash; your pitch deck, proposal, or contract</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top;">
                <span style="display:inline-block; width:22px; height:22px; background:#6C5CE7; color:white; border-radius:50%; text-align:center; line-height:22px; font-size:12px; font-weight:600;">2</span>
              </td>
              <td style="padding: 6px 8px;"><strong>Create a link</strong> &mdash; set password, email gate, or expiry</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top;">
                <span style="display:inline-block; width:22px; height:22px; background:#6C5CE7; color:white; border-radius:50%; text-align:center; line-height:22px; font-size:12px; font-weight:600;">3</span>
              </td>
              <td style="padding: 6px 8px;"><strong>Share &amp; track</strong> &mdash; see who reads what, page by page</td>
            </tr>
          </table>
        </div>

        <p style="margin: 16px 0; font-size: 13px; color: #4A4A68; line-height: 1.6;">
          Your free plan includes <strong>5 documents</strong>, <strong>unlimited viewers</strong>, and <strong>full analytics</strong>. No credit card needed.
        </p>

        <a href="${appUrl}/documents"
           style="display: block; text-align: center; padding: 14px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 20px;">
          Upload Your First Document
        </a>

        <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF; text-align: center;">
          Questions? Reply to this email &mdash; we read every message.
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Peeeky <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Peeeky — track your first document",
      html,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

async function sendSlackNotification(webhookUrl: string, message: string) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    console.error("Slack notification failed:", error);
  }
}
