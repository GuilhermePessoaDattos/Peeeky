import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithDocument } from "@/modules/ai";
import { checkPlanLimit, incrementAIChat } from "@/lib/plan-check";
import { aiChatRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const { success: rateLimitOk } = await aiChatRateLimit.limit(ip);
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const { linkId, question, conversationHistory } = await req.json();

    if (!linkId || !question) {
      return NextResponse.json({ error: "Missing linkId or question" }, { status: 400 });
    }

    if (typeof question !== "string" || question.length > 500) {
      return NextResponse.json({ error: "Question too long" }, { status: 400 });
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { document: true },
    });

    if (!link || !link.isActive) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Check AI chat plan limit
    const planCheck = await checkPlanLimit(link.document.orgId, "aiChatsPerMonth");
    if (!planCheck.allowed) {
      return NextResponse.json(
        { error: "AI chat limit reached for this month." },
        { status: 403 },
      );
    }

    const chunkCount = await prisma.documentEmbedding.count({
      where: { documentId: link.documentId },
    });

    if (chunkCount === 0) {
      return NextResponse.json(
        { error: "AI chat is being prepared. Please wait a moment and try again." },
        { status: 400 }
      );
    }

    const answer = await chatWithDocument(
      link.documentId,
      question,
      conversationHistory || []
    );

    // Increment AI chat counter after successful response
    await incrementAIChat(link.document.orgId);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "AI chat failed" }, { status: 500 });
  }
}
