import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export async function chatWithDocument(
  documentId: string,
  question: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
) {
  // Always load all chunks — the document is small enough for context
  const allChunks = await prisma.documentEmbedding.findMany({
    where: { documentId },
    orderBy: { pageNumber: "asc" },
  });

  if (allChunks.length === 0) {
    return "AI chat is not available for this document.";
  }

  // Use all chunks as context (typical document is well within token limits)
  const context = allChunks.map(c => c.chunk).join("\n\n");

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: `You are a helpful assistant that answers questions about a specific document. Answer in the same language as the user's question.
Rules:
- Answer based on the provided document content below.
- If the answer is not clearly in the document, say so honestly.
- Summarize and explain concisely.
- Do not reproduce large blocks of text verbatim.
- Keep responses under 200 words.

Document content:
${context}`,
    },
    ...conversationHistory.slice(-6),
    { role: "user", content: question },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 500,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "I couldn't generate a response.";
}
