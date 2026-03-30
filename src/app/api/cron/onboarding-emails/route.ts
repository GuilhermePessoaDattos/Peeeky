import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { ONBOARDING_EMAILS } from "@/modules/emails/templates/onboarding";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;

  for (const template of ONBOARDING_EMAILS) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - template.day);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        memberships: {
          select: {
            org: {
              select: {
                plan: true,
                _count: {
                  select: {
                    documents: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    for (const user of users) {
      if (!user.email) continue;

      const sentKey = `onboarding:${user.id}:${template.id}`;
      const { redis } = await import("@/lib/redis");
      const alreadySent = await redis.get(sentKey);
      if (alreadySent) continue;

      const org = user.memberships[0]?.org;
      let body = template.body
        .replace(/\{\{name\}\}/g, user.name || "there")
        .replace(/\{\{docCount\}\}/g, String(org?._count?.documents || 0))
        .replace(/\{\{linkCount\}\}/g, "—")
        .replace(/\{\{viewCount\}\}/g, "—");

      if (org?.plan === "FREE") {
        body = body.replace(/\{\{#if isFreePlan\}\}([\s\S]*?)\{\{\/if\}\}/g, "$1");
      } else {
        body = body.replace(/\{\{#if isFreePlan\}\}[\s\S]*?\{\{\/if\}\}/g, "");
      }

      try {
        await resend.emails.send({
          from: template.from,
          to: user.email,
          subject: template.subject,
          text: body,
        });

        await redis.set(sentKey, "1", { ex: 60 * 60 * 24 * 60 });
        sent++;
      } catch (err) {
        console.error(`Failed to send ${template.id} to ${user.email}:`, err);
      }
    }
  }

  return NextResponse.json({ sent, timestamp: now.toISOString() });
}
