import { NextRequest, NextResponse } from "next/server";
import { getSignatureRequestBySlug, completeSignature } from "@/modules/esignature";

// Get signature request for signer (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const request = await getSignatureRequestBySlug(slug);

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (request.status === "COMPLETED") {
    return NextResponse.json({ error: "Already signed", status: "COMPLETED" }, { status: 400 });
  }

  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Not available for signing" }, { status: 400 });
  }

  if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 400 });
  }

  return NextResponse.json(request);
}

// Complete signature (public)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;

  try {
    const completion = await completeSignature(slug, {
      signerEmail: body.signerEmail,
      signerName: body.signerName,
      signerIp: ip,
      signatureImage: body.signatureImage,
      signatureMethod: body.signatureMethod,
      fieldValues: body.fieldValues || {},
    });

    return NextResponse.json({ success: true, completionId: completion.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
