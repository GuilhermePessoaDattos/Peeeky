import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";

// Returns documents with links for the Gmail extension
// Supports both cookie auth and API key auth
export async function GET(req: NextRequest) {
  // Try session auth first
  let orgId: string | null = null;
  let userId: string | null = null;

  const session = await auth();
  if (session?.user?.orgId) {
    orgId = session.user.orgId;
    userId = session.user.id;
  }

  // Fallback: API key auth via header
  if (!orgId) {
    const apiKey = req.headers.get("x-peeeky-key");
    if (apiKey) {
      const user = await prisma.user.findFirst({
        where: { referralCode: apiKey }, // Using referralCode as API key for now
        include: { memberships: { include: { org: true }, take: 1 } },
      });
      if (user?.memberships[0]) {
        orgId = user.memberships[0].orgId;
        userId = user.id;
      }
    }
  }

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { orgId, status: "READY" },
    include: {
      links: {
        where: { isActive: true },
        select: { id: true, slug: true, name: true, _count: { select: { views: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  // Add CORS headers for extension
  const response = NextResponse.json({
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      links: d.links.map((l) => ({
        slug: l.slug,
        name: l.name,
        views: l._count.views,
        url: `https://peeeky.com/view/${l.slug}`,
      })),
    })),
  });

  response.headers.set("Access-Control-Allow-Origin", "https://mail.google.com");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Headers", "x-peeeky-key");

  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "https://mail.google.com");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "x-peeeky-key");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}
