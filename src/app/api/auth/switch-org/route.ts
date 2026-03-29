import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Switch active organization — sets a cookie that the JWT callback reads
export async function POST(req: NextRequest) {
  const { orgId } = await req.json();
  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  // Set org preference cookie (JWT callback will pick this up on next token refresh)
  const cookieStore = await cookies();
  cookieStore.set("peeeky_org", orgId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}
