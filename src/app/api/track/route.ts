import { NextRequest, NextResponse } from "next/server";
import { recordView, recordPageView, updateViewDuration } from "@/modules/tracking";
import { sendViewNotification } from "@/modules/notifications";
import { trackRateLimit } from "@/lib/ratelimit";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required (viewers are anonymous)
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const { success: rateLimitOk } = await trackRateLimit.limit(ip);
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const { action, linkId, viewId, pageNumber, duration, completionRate, viewerEmail } = body;

    if (action === "view_start") {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "";
      const ua = req.headers.get("user-agent") || "";
      const country = req.headers.get("x-vercel-ip-country") || undefined;
      const city = req.headers.get("x-vercel-ip-city") || undefined;

      const view = await recordView(linkId, {
        viewerEmail,
        ip,
        device: /Mobile/i.test(ua) ? "Mobile" : "Desktop",
        browser: extractBrowser(ua),
        os: extractOS(ua),
        country,
        city,
      });

      return NextResponse.json({ viewId: view.id });
    }

    if (action === "page_view") {
      await recordPageView(viewId, pageNumber, duration);
      return NextResponse.json({ ok: true });
    }

    if (action === "view_end") {
      await updateViewDuration(viewId, duration, completionRate);

      // Invalidate analytics cache for this document
      const viewRecord = await prisma.view.findUnique({
        where: { id: viewId },
        select: { link: { select: { documentId: true } } },
      });
      if (viewRecord?.link?.documentId) {
        await redis.del(`analytics:${viewRecord.link.documentId}`);
      }

      // Send notification async (don't block the response)
      sendViewNotification(viewId).catch(console.error);

      return NextResponse.json({ ok: true });
    }

    if (action === "heartbeat") {
      if (!linkId || !viewId) {
        return NextResponse.json({ error: "Missing linkId or viewId" }, { status: 400 });
      }
      const heartbeatLink = await prisma.link.findUnique({
        where: { id: linkId },
        select: { documentId: true },
      });
      if (heartbeatLink) {
        await redis.sadd(`viewing:${heartbeatLink.documentId}`, viewId);
        await redis.set(`viewer:${heartbeatLink.documentId}:${viewId}`, "1", { ex: 30 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}

function extractBrowser(ua: string): string {
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  return "Other";
}

function extractOS(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Android")) return "Android";
  return "Other";
}
