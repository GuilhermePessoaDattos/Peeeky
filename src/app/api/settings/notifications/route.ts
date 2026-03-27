import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const webhookUrl = await redis.get<string>(`slack_webhook:${session.user.orgId}`);
    return NextResponse.json({ slackWebhookUrl: webhookUrl || "" });
  } catch (error) {
    console.error("Get notification settings error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slackWebhookUrl } = await req.json();

    if (slackWebhookUrl) {
      await redis.set(`slack_webhook:${session.user.orgId}`, slackWebhookUrl);
    } else {
      await redis.del(`slack_webhook:${session.user.orgId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notification settings error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
