import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/r2";
import { nanoid } from "nanoid";

export const maxDuration = 60;

// List file requests (authenticated owner)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify document belongs to org
  const doc = await prisma.document.findFirst({
    where: { id, orgId: session.user.orgId },
  });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const requests = await prisma.fileRequest.findMany({
    where: { documentId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

// Submit a file request (public, from viewer)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const email = formData.get("email") as string | null;

  if (!file || !email) {
    return NextResponse.json({ error: "File and email required" }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { orgId: true },
  });
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Upload to R2
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileId = nanoid(12);
  const key = `${doc.orgId}/file-requests/${fileId}/${file.name}`;
  await uploadFile(key, buffer, file.type);

  const request = await prisma.fileRequest.create({
    data: {
      documentId,
      uploaderEmail: email,
      fileName: file.name,
      fileUrl: key,
    },
  });

  return NextResponse.json({ success: true, id: request.id });
}

// Update file request status (authenticated owner)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, status } = await req.json();
  if (!requestId || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify file request belongs to org
  const fileRequest = await prisma.fileRequest.findFirst({
    where: {
      id: requestId,
      document: { orgId: session.user.orgId },
    },
  });
  if (!fileRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.fileRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return NextResponse.json({ success: true });
}
