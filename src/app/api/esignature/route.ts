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
  const { documentId, title, message, signerEmail, signerName, signers, expiresAt } = body;

  // Support both single signer (backward compat) and multiple signers
  const signerList = signers && Array.isArray(signers) && signers.length > 0
    ? signers
    : signerEmail
      ? [{ email: signerEmail, name: signerName }]
      : [];

  if (!documentId || !title || signerList.length === 0) {
    return NextResponse.json({ error: "documentId, title, and at least one signer required" }, { status: 400 });
  }

  const request = await createSignatureRequest(session.user.orgId, session.user.id, documentId, {
    title,
    message,
    signers: signerList,
    expiresAt,
  });

  return NextResponse.json(request);
}
