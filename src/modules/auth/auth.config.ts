import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Edge-safe config — NO Prisma, NO Node.js APIs
// Used by middleware for JWT verification only
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.orgId = token.orgId as string;
        session.user.orgSlug = token.orgSlug as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
};
