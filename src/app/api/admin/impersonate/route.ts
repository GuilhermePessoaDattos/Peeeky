import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { isAdmin } from "@/config/admin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Start impersonation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cookieStore = await cookies();
  cookieStore.set("admin_impersonating", userId, { path: "/", maxAge: 60 * 60, httpOnly: true, sameSite: "lax" });

  await prisma.adminAction.create({ data: { adminEmail: session?.user?.email || "admin", action: "IMPERSONATE", targetType: "USER", targetId: userId } });

  return NextResponse.json({ ok: true, email: user.email });
}

// Stop impersonation
export async function DELETE() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cookieStore = await cookies();
  cookieStore.delete("admin_impersonating");

  return NextResponse.json({ ok: true });
}
