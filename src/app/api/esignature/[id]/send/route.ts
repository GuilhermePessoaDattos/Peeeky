import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { sendSignatureRequest, getSignatureRequest } from "@/modules/esignature";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const check = await getSignatureRequest(id);
  if (!check || check.orgId !== session.user.orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const updated = await sendSignatureRequest(id);
    const request = await getSignatureRequest(id);

    if (request) {
      const signUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://peeeky.com"}/sign/${request.slug}`;

      await resend.emails.send({
        from: "Peeeky <notifications@peeeky.com>",
        to: request.signerEmail,
        subject: `Signature requested: ${request.title}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto;">
            <div style="padding: 24px; background: #1A1A2E; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 18px; color: white;">p<span style="color: #6C5CE7;">eee</span>ky</h1>
            </div>
            <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #0a0a0b;">Signature Requested</h2>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                You've been asked to sign <strong>"${request.title}"</strong>
              </p>
              ${request.message ? `<p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">${request.message}</p>` : ""}
              <p style="margin: 0 0 4px; font-size: 13px; color: #9ca3af;">Document: ${request.document.name}</p>
              <p style="margin: 0 0 20px; font-size: 13px; color: #9ca3af;">From: ${request.document.org?.name || "Unknown"}</p>
              <a href="${signUrl}" style="display: block; text-align: center; padding: 14px; background: #6C5CE7; color: white; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 600;">
                Review & Sign Document
              </a>
              <p style="margin: 16px 0 0; font-size: 11px; color: #9ca3af; text-align: center;">
                This signature request was sent via Peeeky. Your signature is legally binding.
              </p>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
