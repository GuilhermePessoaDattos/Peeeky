import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { createReferral } from "@/modules/referrals";
import { sendWelcomeEmail } from "@/modules/notifications";
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
  events: {
    // Auto-create org when a new user is created by the adapter
    async createUser({ user }) {
      if (!user.id || !user.email) return;

      const slug = nanoid(8);
      const orgName = user.name
        ? `${user.name}'s Workspace`
        : "My Workspace";

      const newOrg = await prisma.organization.create({
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

      // Send welcome email (async, don't block)
      sendWelcomeEmail(user.email, user.name || null).catch(console.error);

      // Check for referral cookie and create referral record
      try {
        const cookieStore = await cookies();
        const refCode = cookieStore.get("peeeky_ref")?.value;
        if (refCode) {
          await createReferral(refCode, newOrg.id);
        }
      } catch {
        // cookies() may not be available in all contexts
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }

      // Fetch org info on every JWT creation/refresh when we have userId
      if (token.userId && !token.orgId) {
        const membership = await prisma.membership.findFirst({
          where: { userId: token.userId as string },
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
        session.user.orgId = (token.orgId as string) || "";
        session.user.orgSlug = (token.orgSlug as string) || "";
        session.user.role = (token.role as string) || "";
        session.user.plan = (token.plan as string) || "FREE";
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
