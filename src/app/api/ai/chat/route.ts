import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithDocument } from "@/modules/ai";

// Public endpoint -- called from viewer
export async function POST(req: NextRequest) {
  try {
    const { linkId, question, conversationHistory } = await req.json();

    if (!linkId || !question) {
      return NextResponse.json({ error: "Missing linkId or question" }, { status: 400 });
    }

    if (typeof question !== "string" || question.length > 500) {
      return NextResponse.json({ error: "Question too long" }, { status: 400 });
    }

    // Verify link exists and is active
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { document: true },
    });

    if (!link || !link.isActive) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Check if document has chunks (AI-ready)
    const chunkCount = await prisma.documentEmbedding.count({
      where: { documentId: link.documentId },
    });

    if (chunkCount === 0) {
      return NextResponse.json(
        { error: "AI chat is not available for this document" },
        { status: 400 }
      );
    }

    const answer = await chatWithDocument(
      link.documentId,
      question,
      conversationHistory || []
    );

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "AI chat failed" }, { status: 500 });
  }
}
