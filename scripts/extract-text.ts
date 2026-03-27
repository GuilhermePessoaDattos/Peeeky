/**
 * CLI script to extract text from all documents that don't have chunks yet.
 * Run: npx tsx scripts/extract-text.ts
 *
 * This is needed because Vercel free tier has 10s timeout,
 * too short for PDF text extraction. When you upgrade to Vercel Pro ($20/mo),
 * the extraction will work automatically on upload.
 */

import { PrismaClient } from "@prisma/client";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const prisma = new PrismaClient();

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function extractAll() {
  // Find documents without chunks
  const docs = await prisma.document.findMany({
    where: {
      fileType: "PDF",
    },
    include: {
      _count: { select: { embeddings: true } },
    },
  });

  const pending = docs.filter((d) => d._count.embeddings === 0);

  if (pending.length === 0) {
    console.log("All documents already have text extracted.");
    return;
  }

  console.log(`Found ${pending.length} documents to process...\n`);

  for (const doc of pending) {
    console.log(`Processing: ${doc.name} (${doc.id})`);

    try {
      const url = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: doc.fileUrl,
        }),
        { expiresIn: 3600 }
      );

      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());

      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;

      await prisma.documentEmbedding.deleteMany({ where: { documentId: doc.id } });

      let total = 0;
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const tc = await page.getTextContent();
        const text = tc.items.map((item) => ("str" in item ? item.str : "")).join(" ").trim();
        if (text.length > 50) {
          for (let j = 0; j < text.length; j += 500) {
            total++;
            await prisma.documentEmbedding.create({
              data: {
                documentId: doc.id,
                pageNumber: i,
                chunk: `[Page ${i}] ${text.substring(j, j + 500).trim()}`,
              },
            });
          }
        }
      }

      await prisma.document.update({
        where: { id: doc.id },
        data: { pageCount: pdfDoc.numPages },
      });

      console.log(`  ✓ ${total} chunks from ${pdfDoc.numPages} pages\n`);
    } catch (error) {
      console.error(`  ✗ Failed: ${error}\n`);
    }
  }

  console.log("Done!");
}

extractAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
