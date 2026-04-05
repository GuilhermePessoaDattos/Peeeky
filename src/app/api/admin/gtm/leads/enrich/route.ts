import { NextRequest, NextResponse } from "next/server";
import { enrichLead, enrichPendingLeads } from "@/modules/gtm/hunter-enricher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { leadId, limit } = body as { leadId?: string; limit?: number };

    // Single lead enrichment
    if (leadId) {
      const result = await enrichLead(leadId);
      return NextResponse.json(result, {
        status: result.success ? 200 : 422,
      });
    }

    // Batch enrichment of pending leads
    const result = await enrichPendingLeads(limit ?? 5);

    return NextResponse.json({
      success: true,
      ...result,
      message: `Hunter.io: enriched ${result.enriched}, failed ${result.failed}`,
    });
  } catch (error) {
    console.error("POST /api/admin/gtm/leads/enrich error:", error);
    return NextResponse.json(
      { error: "Failed to enrich leads" },
      { status: 500 },
    );
  }
}
