import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithDocument, ensureChunksExist } from "@/modules/ai";

export const maxDuration = 60;

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

    // Ensure text chunks exist (extract on-demand if needed)
    const ready = await ensureChunksExist(link.documentId);
    if (!ready) {
      return NextResponse.json(
        { error: "Could not process this document for AI chat. The PDF may not contain extractable text." },
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
