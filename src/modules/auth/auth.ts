import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { authConfig } from "./auth.config";

// Full config — includes Prisma adapter and DB callbacks
// Used by API routes and server components (NOT middleware)
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
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
    ...authConfig.callbacks,

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
});

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireOrgId() {
  const session = await requireAuth();
  const orgId = session.user.orgId;
  if (!orgId) {
    throw new Error("No organization found");
  }
  return { session, orgId };
}
