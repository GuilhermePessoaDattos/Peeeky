import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const status = url.searchParams.get("status") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const where = status ? { status } : {};

  const [leads, total, funnelGroups] = await Promise.all([
    prisma.outboundLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.outboundLead.count({ where }),
    prisma.outboundLead.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  // Build funnel counts
  const funnelMap: Record<string, number> = {};
  for (const g of funnelGroups) {
    funnelMap[g.status] = g._count.id;
  }

  const funnel = {
    new: funnelMap["new"] || 0,
    emailed: funnelMap["emailed"] || 0,
    followed_up: funnelMap["followed_up"] || 0,
    replied: funnelMap["replied"] || 0,
    converted: funnelMap["converted"] || 0,
    unsubscribed: funnelMap["unsubscribed"] || 0,
  };

  // Conversion rates
  const emailedToReplied =
    funnel.emailed > 0
      ? Math.round((funnel.replied / funnel.emailed) * 100 * 10) / 10
      : 0;
  const repliedToConverted =
    funnel.replied > 0
      ? Math.round((funnel.converted / funnel.replied) * 100 * 10) / 10
      : 0;

  return NextResponse.json({
    leads,
    total,
    funnel,
    conversionRates: {
      emailedToReplied,
      repliedToConverted,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, role, fundingRound, fundingAmount, source, notes } = body;

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: "name, email, and company are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.outboundLead.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Lead with this email already exists" },
        { status: 409 }
      );
    }

    const lead = await prisma.outboundLead.create({
      data: {
        name,
        email,
        company,
        role: role || null,
        fundingRound: fundingRound || null,
        fundingAmount: fundingAmount || null,
        source: source || "manual",
        notes: notes || null,
        status: "new",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/gtm/leads error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
