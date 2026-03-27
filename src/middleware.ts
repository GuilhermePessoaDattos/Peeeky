import NextAuth from "next-auth";
import { authConfig } from "@/modules/auth/auth.config";
import { NextResponse } from "next/server";

// Uses edge-safe config (no Prisma) for middleware
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Root path serves the landing page (auth check is in page.tsx)
  if (pathname === "/") {
    return NextResponse.next();
  }

  const publicPaths = ["/login", "/api/auth", "/api/health", "/api/debug-auth", "/api/track", "/api/links", "/api/webhooks", "/api/ai", "/view", "/vs", "/for"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
