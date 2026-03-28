import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { createSignatureRequest, getSignatureRequests } from "@/modules/esignature";

export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await getSignatureRequests(session.user.orgId);
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { documentId, title, message, signerEmail, signerName, expiresAt } = body;

  if (!documentId || !title || !signerEmail) {
    return NextResponse.json({ error: "documentId, title, and signerEmail required" }, { status: 400 });
  }

  const request = await createSignatureRequest(session.user.orgId, session.user.id, documentId, {
    title,
    message,
    signerEmail,
    signerName,
    expiresAt,
  });

  return NextResponse.json(request);
}
