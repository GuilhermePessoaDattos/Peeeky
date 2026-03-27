import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { redis } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: documentId } = await params;
  const setKey = `viewing:${documentId}`;

  const viewerIds = (await redis.smembers(setKey)) as string[];

  let activeCount = 0;
  const expiredIds: string[] = [];

  for (const vid of viewerIds) {
    const alive = await redis.exists(`viewer:${documentId}:${vid}`);
    if (alive) {
      activeCount++;
    } else {
      expiredIds.push(vid);
    }
  }

  // Clean up expired entries
  if (expiredIds.length > 0) {
    await redis.srem(setKey, ...expiredIds);
  }

  return NextResponse.json({ count: activeCount });
}
