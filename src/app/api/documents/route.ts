import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { createDocument, getDocuments } from "@/modules/documents";

// Allow up to 60s for upload + text extraction
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "pptx"].includes(ext || "")) {
      return NextResponse.json(
        { error: "Only PDF and PPTX files are supported" },
        { status: 400 },
      );
    }

    const document = await createDocument(
      session.user.orgId,
      session.user.id,
      file,
    );

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await getDocuments(session.user.orgId);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 },
    );
  }
}
