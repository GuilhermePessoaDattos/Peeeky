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

    // SSRF protection: block internal/private URLs
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "[::1]"];
      const blockedPrefixes = ["10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.", "192.168."];
      if (blocked.includes(hostname) || blockedPrefixes.some(p => hostname.startsWith(p)) || !urlObj.protocol.startsWith("https")) {
        return NextResponse.json({ error: "Invalid URL. Only public HTTPS URLs are allowed." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
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
