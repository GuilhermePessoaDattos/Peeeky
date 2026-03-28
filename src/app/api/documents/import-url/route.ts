import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/r2";
import { nanoid } from "nanoid";
import { checkPlanLimit } from "@/lib/plan-check";
import { logAudit } from "@/modules/audit";

export const maxDuration = 60;

// Import a document from an external URL (Google Drive export link, Dropbox, etc.)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, fileName } = await req.json();
    if (!url || !fileName) {
      return NextResponse.json({ error: "url and fileName required" }, { status: 400 });
    }

    // Check plan limit
    const canUpload = await checkPlanLimit(session.user.orgId, "documents");
    if (!canUpload) {
      return NextResponse.json({ error: "Document limit reached" }, { status: 403 });
    }

    // Download the file from the URL
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to download file from URL" }, { status: 400 });
    }

    const contentType = response.headers.get("content-type") || "application/pdf";
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    // Upload to R2
    const id = nanoid(12);
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${session.user.orgId}/${id}/${safeName}`;
    await uploadFile(key, buffer, contentType);

    const ext = safeName.split(".").pop()?.toLowerCase() || "pdf";
    const fileType = ext === "pptx" ? "PPTX" : "PDF";

    const doc = await prisma.document.create({
      data: {
        id,
        name: safeName.replace(/\.(pdf|pptx)$/i, ""),
        fileUrl: key,
        fileType,
        status: "READY",
        orgId: session.user.orgId,
        createdById: session.user.id,
      },
    });

    logAudit(session.user.orgId, session.user.id, "document.imported", "document", id);
    return NextResponse.json(doc);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
