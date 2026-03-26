import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { getSignedViewUrl } from "@/lib/r2";
import { openai } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const doc = await prisma.document.findFirst({
      where: { id, orgId: session.user.orgId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check if already extracted
    const existing = await prisma.documentEmbedding.count({ where: { documentId: id } });
    if (existing > 0) {
      return NextResponse.json({ success: true, chunks: existing, message: "Already extracted" });
    }

    // Download PDF from R2
    const signedUrl = await getSignedViewUrl(doc.fileUrl);
    const response = await fetch(signedUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");

    // Extract text via OpenAI
    const extraction = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Extract ALL text content from this PDF document. Return the raw text organized by sections. Include every detail.",
        },
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: "document.pdf",
                file_data: `data:application/pdf;base64,${base64}`,
              },
            },
            {
              type: "text",
              text: "Extract all text from this PDF.",
            },
          ],
        },
      ],
      max_tokens: 16000,
    });

    const text = extraction.choices[0]?.message?.content;
    if (!text || text.length < 20) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    // Split into chunks
    const chunks = splitIntoChunks(text, 500);

    await prisma.documentEmbedding.deleteMany({ where: { documentId: id } });

    for (let i = 0; i < chunks.length; i++) {
      await prisma.documentEmbedding.create({
        data: {
          documentId: id,
          pageNumber: i + 1,
          chunk: chunks[i],
        },
      });
    }

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\s*\n/);

  let current = "";
  for (const para of paragraphs) {
    const cleaned = para.trim();
    if (!cleaned) continue;

    if (current.length + cleaned.length > maxLength && current.length > 0) {
      chunks.push(current.trim());
      current = cleaned;
    } else {
      current += (current ? "\n\n" : "") + cleaned;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}
