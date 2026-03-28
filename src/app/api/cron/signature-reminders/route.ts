import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com";

  // Find pending signature requests older than 3 days
  const pendingRequests = await prisma.signatureRequest.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: threeDaysAgo },
      // Don't remind if expired
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      document: { select: { name: true } },
      signers: {
        where: { status: "PENDING" },
      },
    },
  });

  let sent = 0;

  for (const request of pendingRequests) {
    for (const signer of request.signers) {
      const signUrl = `${appUrl}/sign/${request.slug}`;
      const daysPending = Math.floor((Date.now() - request.createdAt.getTime()) / (1000 * 60 * 60 * 24));

      try {
        await resend.emails.send({
          from: "Peeeky <notifications@peeeky.com>",
          to: signer.email,
          subject: `Reminder: Signature needed — ${request.title}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto;">
              <div style="padding: 24px; background: #1A1A2E; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 18px; color: white;">p<span style="color: #6C5CE7;">eee</span>ky</h1>
              </div>
              <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="margin: 0 0 12px; font-size: 18px; color: #0a0a0b;">&#9997;&#65039; Signature reminder</h2>
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">
                  You have a pending signature request for <strong>"${request.title}"</strong> that's been waiting for ${daysPending} days.
                </p>
                <p style="font-size: 13px; color: #9ca3af; margin: 0 0 20px;">
                  Document: ${request.document.name}
                </p>
                <a href="${signUrl}" style="display: block; text-align: center; padding: 14px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 600;">
                  Review & Sign Now
                </a>
                <p style="margin: 16px 0 0; font-size: 11px; color: #9ca3af; text-align: center;">
                  If you've already signed, please disregard this email.
                </p>
              </div>
            </div>
          `,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send reminder to ${signer.email}:`, error);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    pendingRequests: pendingRequests.length,
    remindersSent: sent,
    timestamp: new Date().toISOString(),
  });
}
