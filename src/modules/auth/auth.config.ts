import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "Peeeky <onboarding@resend.dev>",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await prisma.membership.findFirst({
        where: { user: { email: user.email } },
      });

      if (!existing && user.id) {
        const slug = nanoid(8);
        const orgName = user.name
          ? `${user.name}'s Workspace`
          : "My Workspace";

        await prisma.organization.create({
          data: {
            name: orgName,
            slug,
            members: {
              create: {
                userId: user.id,
                role: "OWNER",
              },
            },
          },
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;

        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
          include: { org: true },
          orderBy: { createdAt: "asc" },
        });

        if (membership) {
          token.orgId = membership.orgId;
          token.orgSlug = membership.org.slug;
          token.role = membership.role;
          token.plan = membership.org.plan;
        }
      }
      return token;
    },

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
