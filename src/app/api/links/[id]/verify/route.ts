import { NextRequest, NextResponse } from "next/server";
import { verifyLinkPassword } from "@/modules/links";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await req.json();

    const valid = await verifyLinkPassword(id, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
